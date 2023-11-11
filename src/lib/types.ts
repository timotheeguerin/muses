export type AnimationSeg = AnimationTypeText | AnimationTypeWithAutocomplete;

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

export interface MusesAnimation {
  readonly config: AnimationConfig;
  readonly segments: AnimationSeg[];
}

export type AnimationConfig = {
  readonly height: number;
  readonly width: number;
};
