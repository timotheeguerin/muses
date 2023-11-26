import clsx from "clsx";
import { CompletionItem } from "../../lib";
import style from "./editor.module.css";
import { getTopLeftForPos } from "./utils";

export type AutoCompleteBoxProps = {
  readonly selected?: CompletionItem;
  readonly filterText: string;
  readonly items: readonly CompletionItem[];
};
export type AutoCompleteOverlayProps = AutoCompleteBoxProps & {
  readonly text: string;
  readonly pos: number;
};

export const AutoCompleteOverlay = ({ text, pos, ...props }: AutoCompleteOverlayProps) => {
  const { top, left } = getTopLeftForPos(text, pos);
  return (
    <div className={style["autocomplete-overlay"]} style={{ top: top + 14, left }}>
      <AutoCompleteBox {...props} />
    </div>
  );
};
const AutoCompleteBox = ({ items, filterText, selected }: AutoCompleteBoxProps) => {
  selected = selected ?? items[0];

  return (
    <div className={style["autocomplete-box"]}>
      {items
        .filter((x) => x.includes(filterText))
        .map((x) => (
          <AutoCompleteItem key={x} item={x} selected={x === selected} />
        ))}
    </div>
  );
};

const AutoCompleteItem = ({ item, selected }: { item: CompletionItem; selected: boolean }) => {
  return (
    <div
      className={clsx(style["autocomplete-item"], {
        [style["autocomplete-item-selected"]]: selected,
      })}
    >
      {item}
    </div>
  );
};
