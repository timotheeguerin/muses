import { languages, tokenize } from "prismjs";
import { normalizeTokens } from "../../lib/normalize-tokens";
import style from "./editor.module.css";
import { memo } from "react";
import { CompletionItem, Token } from "../../lib";
import clsx from "clsx";
import { getTopLeftForPos } from "./utils";
import { AutoCompleteOverlay } from "./autocomplete-overlay";

export type EditorProps = {
  readonly text: string;
  readonly language: string;
  readonly cursorPos?: number;
  readonly errors?: Range[];
  readonly completions?: {
    readonly items: readonly CompletionItem[];
    readonly filterText: string;
    readonly selected?: CompletionItem;
  };
};
export type Range = {
  start: number;
  end: number;
};

export const Editor = (props: EditorProps) => {
  return (
    <div className={style["editor"]} style={{ height: 300, width: 600 }}>
      <EditorText {...props} />
      {props.cursorPos && <Cursor pos={props.cursorPos} text={props.text} />}
      {props.errors?.map((x, i) => <Squiggles key={i} range={x} text={props.text} />)}
      {props.completions && props.cursorPos && (
        <AutoCompleteOverlay {...props.completions} pos={props.cursorPos} text={props.text} />
      )}
    </div>
  );
};

const Cursor = ({ text, pos }: { text: string; pos: number }) => {
  const { top, left } = getTopLeftForPos(text, pos);
  return <div className={style["cursor"]} style={{ top, left }} />;
};

const Squiggles = ({ text, range: { start, end } }: { text: string; range: Range }) => {
  const { top: startTop, left: startLeft } = getTopLeftForPos(text, start);
  const { left: endLeft } = getTopLeftForPos(text, end);
  return (
    <div
      className={style["error-squiggles"]}
      style={{ top: startTop, left: startLeft, width: endLeft - startLeft, height: 18 }}
    ></div>
  );
};

const EditorText = memo(({ text, language }: EditorProps) => {
  const prismTokens = tokenize(text, languages[language]);
  const tokens = normalizeTokens(prismTokens);

  return (
    <div>
      {tokens.map((x, i) => {
        return (
          <div key={i} className={style["line"]}>
            {x.map((y, i) => {
              return <TokenEl key={i} token={y} />;
            })}
          </div>
        );
      })}
    </div>
  );
});

const TokenEl = ({ token }: { token: Token }) => {
  const cls = token.types.map((type) => style[`muses-tok-${type}`]);
  return <span className={clsx(cls)}>{token.content}</span>;
};
