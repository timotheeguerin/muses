import style from "./animation.module.css";
import { CompletionItem, MusesAnimation } from "./types";

export function animate(container: Element, animation: MusesAnimation) {
  runAnimation(container, animation);
}

async function runAnimation(container: Element, animation: MusesAnimation) {
  container.setAttribute("style", `height: ${animation.config.height}px; width: ${animation.config.width}px;`);
  container.classList.add(style["animation-container"]);

  const currentLine = document.createElement("div");
  currentLine.classList.add(style["animation-line"]);
  container.appendChild(currentLine);

  for (const segment of animation.segments) {
    switch (segment.kind) {
      case "type-text": {
        for (const char of segment.text) {
          currentLine.innerHTML = `${currentLine.innerHTML}${char}`;
          await delay(100);
        }

        break;
      }
      case "type-autocomplete": {
        const textSpan = document.createElement("span");
        currentLine.appendChild(textSpan);
        const autocompleteBoxContainer = document.createElement("div");
        currentLine.appendChild(autocompleteBoxContainer);

        autocompleteBoxContainer.classList.add(style["autocomplete-box-container"]);
        let currentText = "";

        autocompleteBoxContainer.appendChild(buildAutoCompleteBoxWithCurrentText(segment.completions, currentText));
        await delay(100);

        for (const char of segment.text) {
          currentText += char;
          textSpan.innerHTML = currentText;
          if (autocompleteBoxContainer.lastChild) {
            autocompleteBoxContainer.removeChild(autocompleteBoxContainer.lastChild);
          }
          autocompleteBoxContainer.appendChild(buildAutoCompleteBoxWithCurrentText(segment.completions, currentText));
          await delay(100);
        }

        if (segment.selectAfter) {
          const remaining = segment.completions.filter((completion) => completion.includes(currentText));
          for (let i = 0; i < remaining.indexOf(segment.selectAfter); i++) {
            if (autocompleteBoxContainer.lastChild) {
              autocompleteBoxContainer.removeChild(autocompleteBoxContainer.lastChild);
            }
            autocompleteBoxContainer.appendChild(
              buildAutoCompleteBoxWithCurrentText(segment.completions, currentText, remaining[i]),
            );
            await delay(100);
          }
          textSpan.innerHTML = segment.selectAfter;
        }
        currentLine.removeChild(autocompleteBoxContainer);

        break;
      }
    }
  }
}

function buildAutoCompleteBoxWithCurrentText(
  completions: readonly CompletionItem[],
  filter: string,
  selected?: string,
) {
  return buildAutoCompleteBox(
    completions.filter((completion) => completion.includes(filter)),
    selected,
  );
}
function buildAutoCompleteBox(completions: readonly CompletionItem[], selected?: string) {
  selected = selected ?? completions[0];
  const autocompleteBox = document.createElement("div");
  autocompleteBox.classList.add(style["autocomplete-box"]);
  for (const completion of completions) {
    const item = document.createElement("div");
    item.classList.add(style["autocomplete-item"]);
    if (completion === selected) {
      item.classList.add(style["autocomplete-item-selected"]);
    }
    item.innerHTML = completion;
    autocompleteBox.appendChild(item);
  }
  return autocompleteBox;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
