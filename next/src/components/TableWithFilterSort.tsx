import React from "react";
import { useTableFilterSort, TableColumn, SortConfig } from "./useTableFilterSort";

export type TableWithFilterSortProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  initialSort?: SortConfig<T>;
  renderRow?: (row: T) => React.ReactNode;
  tableStyle?: React.CSSProperties;
};

export function TableWithFilterSort<T extends Record<string, unknown>>({
  columns,
  data,
  initialSort,
  renderRow,
  tableStyle,
}: TableWithFilterSortProps<T>) {
  const {
    data: tableData,
    filters,
    setFilter,
    sortConfig,
    handleSort,
  } = useTableFilterSort({ data, columns, initialSort });

  return (
    <table className="min-w-full border-collapse border border-gray-300" style={tableStyle}>
      <thead className="bg-gray-100">
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.key)}
              className="border-b border-gray-300 px-6 py-3 text-left text-gray-600 font-semibold uppercase tracking-wider cursor-pointer select-none"
              onClick={() => handleSort(col.key)}
              title={`Sort by ${col.label}`}
            >
              {col.label}
              {sortConfig?.key === col.key && (sortConfig.direction === "asc" ? "↑" : "↓")}
              <input
                type={col.type === "date" ? "date" : "text"}
                placeholder={`Filter by ${col.label}`}
                value={filters[col.key as string] || ""}
                onChange={e => setFilter(col.key, e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                onClick={e => e.stopPropagation()}
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="p-6 text-center text-gray-500">
              No data found
            </td>
          </tr>
        ) : renderRow ? (
          tableData.map((row) => renderRow(row))
        ) : (
          tableData.map((row, idx) => (
            <tr key={`row-${idx}`} className="even:bg-gray-50 hover:bg-gray-100 transition">
              {columns.map((col) => (
                <td key={String(col.key)} className="border px-4 py-2">
                  {col.type === "date" && row[col.key]
                    ? new Date(row[col.key] as string).toLocaleString()
                    : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
} 