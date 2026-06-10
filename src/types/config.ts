import { FindingCategory, Severity } from './finding';

export type ProjectType = 'auto' | 'git' | 'local';

export interface SecureScannerConfig {
  enableOnSave: boolean;
  enableOnOpen: boolean;
  severityThreshold: Severity;
  ignorePaths: string[];
  enabledCategories: FindingCategory[];
  maxFileSizeKB: number;
  projectType: ProjectType;
  isTestEnvironment: boolean;
  excludeFolders: string;
  pipIndexUrl: string;
  enableOsvOnlineScan: boolean;
}
