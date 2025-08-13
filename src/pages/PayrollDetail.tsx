import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPayrollById } from "../services/payrollService";
import { getWorkers } from "../services/workerService";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";
import type { Payroll, PayrollDetail } from "../types/payrolls";
import type { Worker } from "../types/workers";

export function PayrollDetail() {
  const { id } = useParams<{ id: string }>();
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    getWorkers().then(setWorkers);
  }, []);

  useEffect(() => {
    if (id) {
      getPayrollById(Number(id)).then(data => {
        setPayroll(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando planilla...</div>;
  if (!payroll) return <div className="p-8 text-center text-red-500">No se encontró la planilla.</div>;

  // Paginación de detalles
  const totalDetails = payroll.details?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalDetails / pageSize));
  const paginatedDetails = payroll.details?.slice((page - 1) * pageSize, page * pageSize) ?? [];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button
        className="flex items-center gap-2 mb-6 text-blue-700 hover:underline"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft /> Volver
      </button>
      <h1 className="text-2xl font-extrabold mb-2 flex items-center gap-2 text-blue-900">
        <FiCalendar /> Planilla #{payroll.id}
      </h1>
      <div className="mb-6 text-blue-800 font-semibold">
        {payroll.start_date} - {payroll.end_date}
      </div>
      <div className="mb-6 flex flex-wrap gap-8 bg-blue-50 p-4 rounded shadow">
        <div><span className="font-bold">Tarifa hora:</span> C${Intl.NumberFormat("es-NI", { minimumFractionDigits: 2 }).format(payroll.details?.[0]?.hourly_rate ?? 0)}</div>
        <div><span className="font-bold">Total a pagar:</span> C${Intl.NumberFormat("es-NI", { minimumFractionDigits: 2 }).format(payroll.details?.reduce((acc: number, d: PayrollDetail) => acc + d.calculated_payment, 0) ?? 0)}</div>
        <div><span className="font-bold">Trabajadores:</span> {payroll.details?.length ?? 0}</div>
      </div>
      <table className="w-full border-collapse border border-gray-300 mb-4 shadow-sm rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-blue-100 text-blue-900">
            <th className="border px-4 py-2">Trabajador</th>
            <th className="border px-4 py-2">Horas trabajadas</th>
            <th className="border px-4 py-2">Días asistencia</th>
            <th className="border px-4 py-2">Pago</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDetails.map((d: PayrollDetail, idx: number) => {
            const worker = workers.find(w => w.id === d.worker_id);
            return (
              <tr key={idx + (page - 1) * pageSize} className="text-center hover:bg-blue-50 transition">
                <td className="border px-4 py-2 text-left">{worker?.name ?? d.worker_id}</td>
                <td className="border px-4 py-2">{d.hours_worked}</td>
                <td className="border px-4 py-2">{d.attendance_days}</td>
                <td className="border px-4 py-2 font-semibold">C${Intl.NumberFormat("es-NI", { minimumFractionDigits: 2 }).format(d.calculated_payment)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >Anterior</button>
          <span className="text-blue-900 font-semibold">Página {page} de {totalPages}</span>
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Siguiente</button>
        </div>
      )}
    </div>
  );
}
