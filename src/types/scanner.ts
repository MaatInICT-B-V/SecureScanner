import { Finding, FindingCategory, Severity } from './finding';

export interface IScannerRule {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: FindingCategory;
  pattern: RegExp;
  languages?: string[];
  filePatterns?: string[];
  cweId?: string;
  owaspId?: string;
  testEnvironmentSafe?: boolean;
  /**
   * Index of the capture group holding the candidate secret value. When set, the
   * engine applies placeholder/entropy heuristics to that group to suppress
   * noise (used by the generic, quote-optional credential rules).
   */
  secretGroup?: number;
  /** Minimum Shannon entropy (bits/char) required of the secretGroup value. */
  minEntropy?: number;
}

export interface ScanContext {
  filePath: string;
  content: string;
  languageId: string;
  isGitProject?: boolean;
  isTestEnvironment?: boolean;
}

export interface IScanner {
  readonly name: string;
  scan(context: ScanContext): Finding[];
}
