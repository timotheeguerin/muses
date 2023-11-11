import style from "./animation.module.css";
export type AnimationSeg = AnimationTypeText;

export type AnimationTypeText = {
  kind: "type-text";
  text: string;
};
export interface Animation {
  config: AnimationConfig;
  segments: AnimationSeg[];
}

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

  build(): Animation {
    return { segments: this.#segments, config: this.#config };
  }
}

export type AnimationConfig=  {
  height: number;
  width: number;
}

export function createAnimation(config: AnimationConfig) {
  return new AnimationBuilder(config);
}

export function animate(container: Element, animation: Animation) {
  runAnimation(container, animation);
}

async function runAnimation(container: Element, animation: Animation) {
  container.setAttribute("style", `height: ${animation.config.height}px; width: ${animation.config.width}px;`);
  container.setAttribute("class", style["animation-container"]);
  const currentLine =  document.createElement("div");
  container.appendChild(currentLine);

  for(const segment of animation.segments) {
    switch(segment.kind) {
      case "type-text": {
        for(const char of segment.text) {
          currentLine.innerHTML = `${currentLine.innerHTML}${char}`
          await delay(100);
        }
        
        break;
      }
    }
  }
}


async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}