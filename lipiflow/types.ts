export interface TransliterationState {
  input: string;
  output: string;
  isLoading: boolean;
  error: string | null;
}

export enum CopyStatus {
  Idle = 'IDLE',
  Copied = 'COPIED',
}