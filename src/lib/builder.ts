import {
  AnimationConfig,
  AnimationMoveCursor,
  AnimationSeg,
  AnimationTypeWithAutocomplete,
  AnimationTypeWithError,
  MusesAnimation,
} from "./types";

class AnimationBuilder {
  #config: AnimationConfig;
  #segments: AnimationSeg[] = [];

  constructor(config: AnimationConfig) {
    this.#config = config;
  }

  type(text: string) {
    this.#segments.push({ kind: "type-text", text });
    return this;
  }

  typeWithAutoComplete(text: string, options: Omit<AnimationTypeWithAutocomplete, "kind" | "text">) {
    this.#segments.push({ kind: "type-autocomplete", text, ...options });
    return this;
  }

  typeWithError(text: string, options: Omit<AnimationTypeWithError, "kind" | "text">) {
    this.#segments.push({ kind: "type-error", text, ...options });
    return this;
  }

  moveCursor(options: Omit<AnimationMoveCursor, "kind">) {
    this.#segments.push({ kind: "move-cursor", ...options });
    return this;
  }
  clearErrors() {
    this.#segments.push({ kind: "clear-errors" });
    return this;
  }

  build(): MusesAnimation {
    return { segments: this.#segments, config: this.#config };
  }
}

export function createAnimation(config: AnimationConfig) {
  return new AnimationBuilder(config);
}
