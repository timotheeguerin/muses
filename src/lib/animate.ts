import { Token, languages, tokenize } from "prismjs";
import style from "./animation.module.css";
import { AnimationTypeText, AnimationTypeWithAutocomplete, CompletionItem, MusesAnimation } from "./types";

export function animate(container: Element, animation: MusesAnimation) {
  runAnimation(container, animation);
}

async function runAnimation(container: Element, animation: MusesAnimation) {
  const defaultDelay = 100;
  container.setAttribute("style", `height: ${animation.config.height}px; width: ${animation.config.width}px;`);
  container.classList.add(style["animation-container"]);

  const cursorEl = document.createElement("div");
  cursorEl.classList.add(style["cursor"]);
  container.appendChild(cursorEl);

  const contentContainer = document.createElement("div");
  contentContainer.classList.add(style["content"]);
  container.appendChild(contentContainer);

  let currentText = "";

  for (const segment of animation.segments) {
    switch (segment.kind) {
      case "type-text": {
        await type(segment);
        break;
      }
      case "type-autocomplete":
        await typeWithAutocomplete(segment);
        break;
    }
  }

  function addChar(char: string) {
    currentText += char;
    updateCursorPos();
    highlight();
  }
  async function type(segment: AnimationTypeText) {
    for (const char of segment.text) {
      // currentLine.innerHTML = `${currentLine.innerHTML}${char}`;
      addChar(char);
      await delay(defaultDelay);
    }
  }
  async function typeWithAutocomplete(segment: AnimationTypeWithAutocomplete) {
    const autocompleteBoxContainer = document.createElement("div");
    cursorEl.appendChild(autocompleteBoxContainer);

    autocompleteBoxContainer.classList.add(style["autocomplete-box-container"]);
    let currentAutocompleteText = "";

    autocompleteBoxContainer.appendChild(
      buildAutoCompleteBoxWithCurrentText(segment.completions, currentAutocompleteText),
    );
    await delay(defaultDelay);

    for (const char of segment.text) {
      currentAutocompleteText += char;
      addChar(char);
      if (autocompleteBoxContainer.lastChild) {
        autocompleteBoxContainer.removeChild(autocompleteBoxContainer.lastChild);
      }
      autocompleteBoxContainer.appendChild(
        buildAutoCompleteBoxWithCurrentText(segment.completions, currentAutocompleteText),
      );
      await delay(defaultDelay);
    }

    if (segment.selectAfter) {
      const remaining = segment.completions.filter((completion) => completion.includes(currentAutocompleteText));
      for (let i = 0; i < remaining.indexOf(segment.selectAfter); i++) {
        if (autocompleteBoxContainer.lastChild) {
          autocompleteBoxContainer.removeChild(autocompleteBoxContainer.lastChild);
        }
        autocompleteBoxContainer.appendChild(
          buildAutoCompleteBoxWithCurrentText(segment.completions, currentAutocompleteText, remaining[i]),
        );
        await delay(defaultDelay);
      }
      currentText = currentText.slice(0, currentText.length - currentAutocompleteText.length) + segment.selectAfter;
      highlight();
      updateCursorPos();
    }
    cursorEl.removeChild(autocompleteBoxContainer);
  }

  function highlight() {
    const tokens = tokenize(currentText, languages.javascript);

    const line = document.createElement("div");
    line.classList.add(style["line"]);
    const els = tokens.map((x) => tokenToEl(x));
    for (const el of els) {
      line.appendChild(el);
    }

    contentContainer.lastChild?.remove();
    contentContainer.appendChild(line);
  }

  function updateCursorPos() {
    const left = currentText.length * 7.225;
    cursorEl.style.left = `${left}px`;
  }

  function tokenToEl(token: string | Token) {
    const el = document.createElement("span");
    if (typeof token === "string") {
      el.textContent = token;
    } else {
      el.textContent = token.content as string; // todo need to flatten this
      el.classList.add(style[`muses-tok-${token.type}`]);
    }
    return el;
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
