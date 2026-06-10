export enum Severity {
  Critical = 0,
  High = 1,
  Medium = 2,
  Low = 3,
  Info = 4,
}

export enum FindingCategory {
  Credential = 'credential',
  OWASP = 'owasp',
  Dependency = 'dependency',
  Misconfiguration = 'misconfiguration',
  FileHygiene = 'filehygiene',
}

export interface FindingLocation {
  filePath: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: Severity;
  title: string;
  description: string;
  location: FindingLocation;
  matchedText?: string;
  cweId?: string;
  owaspId?: string;
  /** Stable hash used to suppress this finding via the baseline. */
  fingerprint?: string;
}
