export type AnimationSeg =
  | AnimationTypeText
  | AnimationTypeWithAutocomplete
  | AnimationTypeWithError
  | AnimationMoveCursor
  | AnimationClearErrors;

export type AnimationTypeText = {
  readonly kind: "type-text";
  readonly text: string;
};

export type CompletionItem = string;

export type AnimationTypeWithAutocomplete = {
  readonly kind: "type-autocomplete";
  readonly text: string;
  readonly completions: readonly CompletionItem[];
  readonly selectAfter?: string;
};

export type AnimationTypeWithError = {
  readonly kind: "type-error";
  readonly text: string;
  readonly error: Error;
};

export type AnimationMoveCursor = {
  readonly kind: "move-cursor";
  readonly left?: number;
  readonly right?: number;
};

export type AnimationClearErrors = {
  readonly kind: "clear-errors";
};

export type Error = {
  readonly message: string;
};

export interface MusesAnimation {
  readonly config: AnimationConfig;
  readonly segments: AnimationSeg[];
}

export type AnimationConfig = {
  readonly height: number;
  readonly width: number;
};

export type Token = {
  types: string[];
  content: string;
  empty?: boolean;
};
