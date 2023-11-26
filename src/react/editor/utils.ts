export function getTopLeftForPos(text: string, pos: number): { top: number; left: number } {
  const { row, col } = getRowAndColForPos(text, pos);
  const left = col * 7.225;
  const top = row * 18;

  return { top, left };
}

function getRowAndColForPos(text: string, pos: number): { row: number; col: number } {
  let count = 0;
  let lastLineCol = 0;
  for (let i = 0; i < pos; i++) {
    lastLineCol++;
    if (text[i] === "\n") {
      count++;
      lastLineCol = 0;
    }
  }

  return { row: count, col: lastLineCol };
}
