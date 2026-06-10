import * as https from 'https';

const OSV_HOST = 'api.osv.dev';
// OSV allows up to 1000 queries per batch request.
const BATCH_LIMIT = 1000;
// Limit concurrent detail fetches so a project with many advisories does not
// open hundreds of sockets at once.
const DETAIL_CONCURRENCY = 8;

export interface OsvQuery {
  name: string;
  ecosystem: string;
  version: string;
}

interface OsvRange {
  type: string;
  events: Array<{ introduced?: string; fixed?: string; last_affected?: string }>;
}

export interface OsvVulnDetail {
  id: string;
  summary?: string;
  details?: string;
  severity?: Array<{ type: string; score: string }>;
  affected?: Array<{
    package?: { name: string; ecosystem: string };
    ranges?: OsvRange[];
  }>;
  database_specific?: { severity?: string };
}

function request(method: 'GET' | 'POST', path: string, body?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string | number> = { 'Content-Type': 'application/json' };
    if (body !== undefined) {
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    const options: https.RequestOptions = {
      hostname: OSV_HOST,
      path,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`OSV HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('OSV request timeout'));
    });
    if (body !== undefined) {
      req.write(body);
    }
    req.end();
  });
}

/**
 * Query OSV.dev for the given (package, version) pairs. OSV performs the range
 * matching server-side, so the result for each query is simply the list of
 * vulnerability IDs that affect that exact version. The returned array is index
 * aligned with the input queries.
 */
export async function osvQueryBatch(queries: OsvQuery[]): Promise<string[][]> {
  const out: string[][] = [];

  for (let offset = 0; offset < queries.length; offset += BATCH_LIMIT) {
    const chunk = queries.slice(offset, offset + BATCH_LIMIT);
    const body = JSON.stringify({
      queries: chunk.map((q) => ({
        version: q.version,
        package: { name: q.name, ecosystem: q.ecosystem },
      })),
    });

    const response = await request('POST', '/v1/querybatch', body);
    const parsed = JSON.parse(response) as {
      results?: Array<{ vulns?: Array<{ id: string }> }>;
    };
    const results = parsed.results || [];

    for (let i = 0; i < chunk.length; i++) {
      const vulns = results[i]?.vulns || [];
      out.push(vulns.map((v) => v.id));
    }
  }

  return out;
}

/** Fetch the full record for a single vulnerability ID. */
export async function osvGetVuln(id: string): Promise<OsvVulnDetail> {
  const response = await request('GET', `/v1/vulns/${encodeURIComponent(id)}`);
  return JSON.parse(response) as OsvVulnDetail;
}

/** Fetch full records for many IDs with bounded concurrency, skipping failures. */
export async function osvGetVulns(ids: string[]): Promise<Map<string, OsvVulnDetail>> {
  const unique = [...new Set(ids)];
  const map = new Map<string, OsvVulnDetail>();
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < unique.length) {
      const id = unique[cursor++];
      try {
        map.set(id, await osvGetVuln(id));
      } catch {
        // Skip vulnerabilities whose detail fetch fails; the ID is still known.
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(DETAIL_CONCURRENCY, unique.length) },
    () => worker()
  );
  await Promise.all(workers);
  return map;
}

/** Map an OSV record to one of our severity buckets. */
export function osvSeverity(vuln: OsvVulnDetail): 'critical' | 'high' | 'medium' | 'low' {
  if (vuln.severity) {
    for (const s of vuln.severity) {
      const score = parseFloat(s.score);
      if (!isNaN(score)) {
        if (score >= 9.0) { return 'critical'; }
        if (score >= 7.0) { return 'high'; }
        if (score >= 4.0) { return 'medium'; }
        return 'low';
      }
    }
  }
  const dbSeverity = vuln.database_specific?.severity?.toLowerCase();
  if (dbSeverity === 'critical') { return 'critical'; }
  if (dbSeverity === 'high') { return 'high'; }
  if (dbSeverity === 'moderate' || dbSeverity === 'medium') { return 'medium'; }
  if (dbSeverity === 'low') { return 'low'; }
  return 'medium';
}

/**
 * Best-effort extraction of the first fixed version for a package, used only for
 * the human-readable message. Detection itself is done server-side by OSV, so an
 * empty result here does not affect whether something is flagged.
 */
export function osvFixedVersion(vuln: OsvVulnDetail, name: string, ecosystem: string): string {
  if (!vuln.affected) { return ''; }
  for (const affected of vuln.affected) {
    if (
      !affected.package ||
      affected.package.name.toLowerCase() !== name.toLowerCase() ||
      affected.package.ecosystem.toLowerCase() !== ecosystem.toLowerCase()
    ) {
      continue;
    }
    for (const range of affected.ranges || []) {
      if (range.type === 'GIT') { continue; }
      for (const event of range.events) {
        if (event.fixed) { return event.fixed; }
      }
    }
  }
  return '';
}
