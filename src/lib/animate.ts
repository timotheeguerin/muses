import { languages, tokenize } from "prismjs";
import style from "./animation.module.css";
import {
  AnimationClearErrors,
  AnimationMoveCursor,
  AnimationTypeText,
  AnimationTypeWithAutocomplete,
  AnimationTypeWithError,
  CompletionItem,
  MusesAnimation,
  Token,
} from "./types";
import { normalizeTokens } from "./normalize-tokens";

export function animate(container: Element, animation: MusesAnimation) {
  runAnimation(container, animation);
}

const delays = {
  typeText: 100,
  afterBlank: 200,
  selectAutocomplete: 200,
  moveCursor: 200,
};

async function runAnimation(container: Element, animation: MusesAnimation) {
  container.setAttribute("style", `height: ${animation.config.height}px; width: ${animation.config.width}px;`);
  container.classList.add(style["animation-container"]);

  const errorEls: Element[] = [];
  const cursorEl = document.createElement("div");
  cursorEl.classList.add(style["cursor"]);
  container.appendChild(cursorEl);

  const contentContainer = document.createElement("div");
  contentContainer.classList.add(style["content"]);
  container.appendChild(contentContainer);

  let currentText = "";
  let cursorPos = 0;

  for (const segment of animation.segments) {
    switch (segment.kind) {
      case "type-text": {
        await type(segment);
        break;
      }
      case "type-autocomplete":
        await typeWithAutocomplete(segment);
        break;
      case "type-error":
        await typeWithError(segment);
        break;
      case "move-cursor":
        await moveCursor(segment);
        break;
      case "clear-errors":
        await clearErrors(segment);
        break;
    }
  }

  function addChar(char: string) {
    if (cursorPos === currentText.length) {
      currentText += char;
    } else {
      currentText = currentText.slice(0, cursorPos) + char + currentText.slice(cursorPos);
    }
    cursorPos++;
    updateCursorPos();
    highlight();
  }

  async function type(segment: AnimationTypeText) {
    for (const char of segment.text) {
      addChar(char);
      const delayMs = char === "\n" || char === " " ? delays.afterBlank : delays.typeText;
      await delay(delayMs);
    }
  }

  async function typeText(text: string) {
    for (const char of text) {
      addChar(char);
      const delayMs = char === "\n" || char === " " ? delays.afterBlank : delays.typeText;
      await delay(delayMs);
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
    await delay(delays.typeText);

    for (const char of segment.text) {
      currentAutocompleteText += char;
      addChar(char);
      if (autocompleteBoxContainer.lastChild) {
        autocompleteBoxContainer.removeChild(autocompleteBoxContainer.lastChild);
      }
      autocompleteBoxContainer.appendChild(
        buildAutoCompleteBoxWithCurrentText(segment.completions, currentAutocompleteText),
      );
      await delay(delays.typeText);
    }

    if (segment.selectAfter) {
      const remaining = segment.completions.filter((completion) => completion.includes(currentAutocompleteText));
      for (let i = 0; i <= remaining.indexOf(segment.selectAfter); i++) {
        if (autocompleteBoxContainer.lastChild) {
          autocompleteBoxContainer.removeChild(autocompleteBoxContainer.lastChild);
        }
        autocompleteBoxContainer.appendChild(
          buildAutoCompleteBoxWithCurrentText(segment.completions, currentAutocompleteText, remaining[i]),
        );
        await delay(delays.selectAutocomplete);
      }
      currentText = currentText.slice(0, currentText.length - currentAutocompleteText.length) + segment.selectAfter;
      cursorPos = currentText.length;
      highlight();
      updateCursorPos();
    }
    cursorEl.removeChild(autocompleteBoxContainer);
  }

  async function typeWithError(segment: AnimationTypeWithError) {
    await typeText(segment.text);
    addError(currentText.length - segment.text.length, currentText.length);
  }

  async function moveCursor(segment: AnimationMoveCursor) {
    if (segment.left) {
      cursorPos -= segment.left;
      updateCursorPos();
      await delay(delays.moveCursor);
    }
    if (segment.right) {
      cursorPos += segment.right;
      await delay(delays.moveCursor);
    }
    updateCursorPos();
  }

  function highlight() {
    const prismTokens = tokenize(currentText, languages.javascript);
    const tokens = normalizeTokens(prismTokens);
    const lines = document.createElement("div");
    for (const lineTokens of tokens) {
      const line = document.createElement("div");
      line.classList.add(style["line"]);
      const els = lineTokens.flatMap(tokenToEl);
      for (const el of els) {
        line.appendChild(el);
      }
      lines.appendChild(line);
    }

    contentContainer.lastChild?.remove();
    contentContainer.appendChild(lines);
  }

  function addError(start: number, end: number) {
    const { top: startTop, left: startLeft } = getTopLeftForPos(start);
    const { left: endLeft } = getTopLeftForPos(end);
    const errorEl = document.createElement("div");
    errorEl.classList.add(style["error-squiggles"]);
    errorEl.style.top = startTop + "px";
    errorEl.style.left = startLeft + "px";
    errorEl.style.width = endLeft - startLeft + "px";
    errorEl.style.height = "18px";
    container.appendChild(errorEl);
    errorEls.push(errorEl);
  }

  function clearErrors(_: AnimationClearErrors) {
    for (const el of errorEls) {
      el.remove();
    }
  }

  function updateCursorPos() {
    const { top, left } = getTopLeftForPos(cursorPos);
    cursorEl.style.left = `${left}px`;
    cursorEl.style.top = `${top}px`;
  }

  function getRowAndColForPos(pos: number): { row: number; col: number } {
    let count = 0;
    let lastLineCol = 0;
    for (let i = 0; i < pos; i++) {
      lastLineCol++;
      if (currentText[i] === "\n") {
        count++;
        lastLineCol = 0;
      }
    }

    return { row: count, col: lastLineCol };
  }

  function getTopLeftForPos(pos: number): { top: number; left: number } {
    const { row, col } = getRowAndColForPos(pos);
    const left = col * 7.225;
    const top = row * 18;

    return { top, left };
  }

  function tokenToEl(token: string | Token) {
    const el = document.createElement("span");
    if (typeof token === "string") {
      el.textContent = token;
    } else {
      el.textContent = token.content as string; // todo need to flatten this
      for (const type of token.types) {
        el.classList.add(style[`muses-tok-${type}`]);
      }
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
