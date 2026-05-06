/**
 * Notebook — the vertical canvas of cells. Replaces the old grid-based
 * Dashboard. Width is bounded for readability (max 920px) just like Hex.
 */
import { Cell } from "./Cell";
import {
  BigNumberCellBody,
  ChartCellBody,
  SqlCellBody,
  TextCellBody,
} from "./CellBodies";
import type { Notebook } from "./types";

interface Props {
  notebook: Notebook;
}

export function NotebookView({ notebook }: Props) {
  return (
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "0 var(--space-3) var(--space-12)",
      }}
    >
      {notebook.cells.map((cell) => {
        switch (cell.type) {
          case "text":
            return (
              <Cell key={cell.id} cell={cell}>
                <TextCellBody cell={cell} />
              </Cell>
            );
          case "sql":
            return (
              <Cell
                key={cell.id}
                cell={cell}
                onRun={() => {
                  /* P1-01b will execute against a real connector */
                }}
              >
                <SqlCellBody cell={cell} />
              </Cell>
            );
          case "chart":
            return (
              <Cell
                key={cell.id}
                cell={cell}
                onRun={() => {
                  /* re-run the upstream SQL */
                }}
              >
                <ChartCellBody cell={cell} />
              </Cell>
            );
          case "big_number":
            return (
              <Cell key={cell.id} cell={cell}>
                <BigNumberCellBody cell={cell} />
              </Cell>
            );
        }
      })}
    </div>
  );
}
