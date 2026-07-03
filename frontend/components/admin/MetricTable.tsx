import type { ReactNode } from "react";

import { EmptyState } from "./EmptyState";

export interface Column<Row> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: Row) => ReactNode;
}

interface MetricTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  emptyMessage?: string;
}

const ALIGN: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/** Generic, strictly-typed data table reused by every dashboard page. */
export function MetricTable<Row>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No data available.",
}: MetricTableProps<Row>) {
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 font-semibold text-slate-500 ${ALIGN[col.align ?? "left"]}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)} className="hover:bg-slate-50/70">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-slate-700 ${ALIGN[col.align ?? "left"]}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
