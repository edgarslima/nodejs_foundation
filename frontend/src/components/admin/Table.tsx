import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TableColumn<T> = {
  id: string;
  header: string;
  render: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
};

type TableProps<T> = {
  data: T[];
  columns: Array<TableColumn<T>>;
  caption?: string;
  emptyMessage?: string;
};

export const Table = <T,>({ data, columns, caption, emptyMessage = "No records found." }: TableProps<T>) => {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        {caption && <caption className="px-4 py-3 text-left text-sm text-slate-500">{caption}</caption>}
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    "px-4 py-3 text-sm text-slate-700",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.className
                  )}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};