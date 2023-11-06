import type { IAnalyzer } from './AnalysisService';

export class PHashService implements IAnalyzer {
  async setup(): Promise<void> {
    // do nothing
    return;
  }
  recognize(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
