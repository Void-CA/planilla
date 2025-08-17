import { useEffect, useState } from "react";
import { getWorkerById } from "../services/workerService";
import { getPayrollsForWorker } from "../services/payrollService";
import { EntityTable } from "../components";
import type { Worker } from "../types/workers";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function WorkerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [area, setArea] = useState<any | null>(null);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const workerData = await getWorkerById(Number(id));
      setWorker(workerData);
      if (workerData) {
        const areaData = await import("../services/areaService").then(mod => mod.getAreaById(workerData.area_id));
        setArea(areaData);
      }
      const joinedPayrolls = await getPayrollsForWorker(Number(id));
      setPayrolls(joinedPayrolls as any[]);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  console.log("WorkerDetail", worker, payrolls);
  return (
  <div className="w-full mx-auto p-6">
      <button
        className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold shadow hover:bg-blue-100 hover:text-blue-900 transition border border-blue-200"
        onClick={() => navigate('/trabajadores')}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Volver a la lista
      </button>
      <h1 className="text-2xl font-bold mb-4 text-blue-900">Detalle del Trabajador</h1>
      {worker ? (
        <div className="mb-8 bg-blue-50 rounded-xl shadow p-6 border flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 1 1 14 0H5Z"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-900 mb-1">{worker.name}</div>
            <div className="text-gray-600 mb-1">ID: <span className="font-mono text-blue-700">{worker.id}</span></div>
            <div className="text-gray-600 mb-1">Área: <span className="font-semibold text-blue-700">{area?.name ?? worker.area_id}</span></div>
            {area?.description && (
              <div className="text-gray-500 text-sm mb-1">{area.description}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Cargando trabajador...</div>
      )}
      <h2 className="text-xl font-bold mb-2 text-blue-800">Planillas en las que ha trabajado</h2>
      <EntityTable
        title="Planillas"
        data={payrolls}
        loading={loading}
        columns={[
            { key: "payroll_id", label: "ID" },
            { key: "start_date", label: "Inicio" },
            { key: "end_date", label: "Fin" },
            { key: "total", label: "Total" },
            { key: "hours_worked", label: "Horas trabajadas" },
            { key: "attendance_days", label: "Días de asistencia" },
            { key: "hourly_rate", label: "Tarifa/hora" },
            { key: "calculated_payment", label: "Pago calculado" }
        ]}
      />
    </div>
  );
}
