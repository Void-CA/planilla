import { useEffect, useState } from "react";
import { getWorkerById } from "../services/workerService";
import { getPayrolls } from "../services/payrollService";
import { EntityTable } from "../components";
import type { Worker } from "../types/workers";
import type { Payroll } from "../types/payrolls";
import { useParams } from "react-router-dom";

export default function WorkerDetail() {
  const { id } = useParams<{ id: string }>();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const workerData = await getWorkerById(Number(id));
      setWorker(workerData);
      const allPayrolls = (await getPayrolls()) as Payroll[];
      // Cargar detalles para cada planilla
      const payrollsWithDetails: Payroll[] = await Promise.all(
        allPayrolls.map(async (p) => {
          const details = await import("../services/payrollService").then(mod => mod.getPayrollDetails(p.id)) as import("../types/payrolls").PayrollDetail[];
          return { ...p, details };
        })
      );
      // Filtrar planillas donde el trabajador aparece en los detalles
      const filteredPayrolls = payrollsWithDetails.filter((p) =>
        p.details && Array.isArray(p.details) && p.details.some((d) => d.worker_id === Number(id))
      );
      setPayrolls(filteredPayrolls);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-900">Detalle del Trabajador</h1>
      {worker ? (
        <div className="mb-8 bg-white rounded-xl shadow p-6 border">
          <div className="text-lg font-semibold text-gray-800">{worker.name}</div>
          <div className="text-gray-600">ID: {worker.id}</div>
          <div className="text-gray-600">Área: {worker.area_id}</div>
          <div className="text-gray-600">Tarifa por hora: ${worker.hourly_rate}</div>
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
          { key: "id", label: "ID" },
          { key: "start_date", label: "Inicio" },
          { key: "end_date", label: "Fin" },
          { key: "total", label: "Total" },
        ]}
      />
    </div>
  );
}
