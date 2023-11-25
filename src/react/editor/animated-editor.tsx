import { useEffect, useState } from "react";
import { Editor, EditorProps, Range } from "./editor";
import {
  AnimationMoveCursor,
  AnimationTypeText,
  AnimationTypeWithAutocomplete,
  AnimationTypeWithError,
  MusesAnimation,
} from "../../lib";

const delays = {
  typeText: 100,
  afterBlank: 200,
  selectAutocomplete: 200,
  moveCursor: 200,
};

export type AnimatedEditorProps = {
  readonly language: string;
  readonly animation: MusesAnimation;
};
export const AnimatedEditor = ({ language, animation }: AnimatedEditorProps) => {
  const props = useEditorAnimation(language, animation);
  return <Editor {...props} />;
};

function useEditorAnimation(language: string, animation: MusesAnimation): EditorProps {
  const [data, setData] = useState<EditorProps>({
    language,
    text: "",
    cursorPos: 0,
  });
  useEffect(() => {
    void runAnimation(language, animation, setData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}

async function runAnimation(language: string, animation: MusesAnimation, setData: (_: EditorProps) => void) {
  let currentText = "";
  let errors: Range[] | undefined = undefined;
  let cursorPos = 0;
  let completions: EditorProps["completions"] | undefined = undefined;

  function updateData() {
    setData({ text: currentText, errors, cursorPos, completions, language });
  }
  for (const segment of animation.segments) {
    console.log("Run", segment);
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
        errors = undefined;
        updateData();
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
    updateData();
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
    let currentAutocompleteText = "";

    await delay(delays.typeText);

    completions = { items: segment.completions, filterText: currentAutocompleteText };
    for (const char of segment.text) {
      currentAutocompleteText += char;
      addChar(char);
      completions = { items: segment.completions, filterText: currentAutocompleteText };
      await delay(delays.typeText);
    }

    if (segment.selectAfter) {
      const remaining = segment.completions.filter((completion) => completion.includes(currentAutocompleteText));
      for (let i = 0; i <= remaining.indexOf(segment.selectAfter); i++) {
        completions = {
          items: segment.completions,
          filterText: currentAutocompleteText,
          selected: remaining[i],
        };
        await delay(delays.selectAutocomplete);
      }
      currentText = currentText.slice(0, currentText.length - currentAutocompleteText.length) + segment.selectAfter;
      cursorPos = currentText.length;
      completions = undefined;
      updateData();
    }
  }

  async function typeWithError(segment: AnimationTypeWithError) {
    await typeText(segment.text);
    errors = [{ start: currentText.length - segment.text.length, end: currentText.length }];
  }

  async function moveCursor(segment: AnimationMoveCursor) {
    if (segment.left) {
      cursorPos -= segment.left;
      updateData();
      await delay(delays.moveCursor);
    }
    if (segment.right) {
      cursorPos += segment.right;
      await delay(delays.moveCursor);
    }
    updateData();
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
