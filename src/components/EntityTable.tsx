import React, { useState } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

type ColumnDef<T> = {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
};

  type EntityTableProps<T extends { id: number }> = {
    data: T[];
    columns: ColumnDef<T>[];
    loading?: boolean;
    onEdit?: (row: T) => void;
    onDelete?: (id: number) => void;
    onAdd?: () => void;
    pageSize?: number;
    title?: string;
    addLabel?: string;
  };


export function EntityTable<T extends { id: number }>({
  data,
  columns,
  loading,
  onEdit,
  onDelete,
  onAdd,
  pageSize = 10,
  title = "List",
  addLabel = "Add",
}: EntityTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  // Funciones de humanización
  function humanize(key: string, value: any) {
    if (value == null) return "-";
    // Fechas
    if (key.toLowerCase().includes("date")) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" });
      }
    }
    // Dinero
    if (["total", "calculated_payment", "hourly_rate"].includes(key)) {
      return `$${Number(value).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;
    }
    // Números
    if (["hours_worked", "attendance_days"].includes(key)) {
      return Number(value).toLocaleString("es-ES");
    }
    return value;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {title}
        </h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
          >
            <FiPlus className="text-lg" />
            <span className="font-medium">{addLabel}</span>
          </button>
        )}
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-base">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={String(col.key)} className="px-4 py-2 border-b text-left font-semibold text-gray-700 tracking-wide text-center">
                    {col.label}
                  </th>
                ))}
                {(onEdit || onDelete) && <th className="px-4 py-2 border-b text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-6 text-gray-400">No data found.</td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50 transition">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-2 align-middle whitespace-nowrap text-center">
                        {col.render ? col.render(row[col.key], row) : humanize(String(col.key), row[col.key])}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-4 py-2 flex justify-center items-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                            title="Edit"
                          >
                            <FiEdit className="text-lg" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row.id)}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                            title="Delete"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2 text-base">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Prev
          </button>
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
