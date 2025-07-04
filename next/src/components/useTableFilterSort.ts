import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc";

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  type?: "text" | "date";
  sortable?: boolean;
};

export type SortConfig<T> = {
  key: keyof T;
  direction: SortDirection;
} | null;

export function useTableFilterSort<T extends Record<string, unknown>>({
  data,
  columns,
  initialSort,
}: {
  data: T[];
  columns: TableColumn<T>[];
  initialSort?: SortConfig<T>;
}) {
  // Filter state for each column
  const [filters, setFilters] = useState<Record<string, string>>({});
  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort || null);

  // Handlers
  const setFilter = (key: keyof T, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (key: keyof T) => {
    const col = columns.find((col) => col.key === key);
    if (col && col.sortable === false) return;
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      columns.every((col) => {
        const filterValue = (filters[col.key as string] || "").toLowerCase();
        if (!filterValue) return true;
        const cellValue = row[col.key];
        if (col.type === "date" && cellValue) {
          // Format date as YYYY-MM-DD for filtering
          let dateStr = "";
          if (typeof cellValue === "string" || typeof cellValue === "number" || cellValue instanceof Date) {
            dateStr = new Date(cellValue).toISOString().slice(0, 10);
          }
          return dateStr.includes(filterValue);
        }
        return typeof cellValue === "string"
          ? cellValue.toLowerCase().includes(filterValue)
          : String(cellValue || "").toLowerCase().includes(filterValue);
      })
    );
  }, [data, columns, filters]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aRaw = a[sortConfig.key];
      const bRaw = b[sortConfig.key];
      const colType = columns.find((col) => col.key === sortConfig.key)?.type;
      let aValue: number | string = "";
      let bValue: number | string = "";
      if (colType === "date") {
        if (typeof aRaw === "string" || typeof aRaw === "number" || aRaw instanceof Date) {
          aValue = new Date(aRaw).getTime();
        } else {
          aValue = 0;
        }
        if (typeof bRaw === "string" || typeof bRaw === "number" || bRaw instanceof Date) {
          bValue = new Date(bRaw).getTime();
        } else {
          bValue = 0;
        }
      } else {
        aValue = typeof aRaw === "string" ? aRaw.toLowerCase() : String(aRaw || "").toLowerCase();
        bValue = typeof bRaw === "string" ? bRaw.toLowerCase() : String(bRaw || "").toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig, columns]);

  return {
    data: sortedData,
    filters,
    setFilter,
    sortConfig,
    handleSort,
  };
} 