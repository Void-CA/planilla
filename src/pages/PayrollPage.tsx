import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { getWorkers } from "../services/workerService";
import { addPayroll } from "../services/payrollService.ts";
import type { Worker } from "../types/workers";
import type { PayrollDetail } from "../types/payrolls";
import "../styles/tailwind.css";
import { FiUserPlus, FiSave, FiTrash2 } from "react-icons/fi";


export function PayrollPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [details, setDetails] = useState<PayrollDetail[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(0);

  useEffect(() => {
    getWorkers().then(ws => {
      setWorkers(ws);
      setLoading(false);
    });
  }, []);

  // Agregar fila vacía para un nuevo trabajador
  const handleAddWorker = () => {
    setDetails(details => [
      ...details,
      {
        worker_id: 0, // 0 indica que aún no se seleccionó trabajador
        hours_worked: 0,
        attendance_days: 0,
        hourly_rate: hourlyRate,
        calculated_payment: 0,
      },
    ]);
  };

  // Cambiar horas o días de un trabajador
  const handleChange = (id: number, field: keyof PayrollDetail, value: number) => {
    setDetails(details =>
      details.map(d =>
        d.worker_id === id
          ? {
              ...d,
              [field]: value,
              calculated_payment:
                field === "hours_worked"
                  ? value * d.hourly_rate
                  : d.hours_worked * d.hourly_rate,
            }
          : d
      )
    );
  };

  // Cambiar tarifa global y actualizar todos los detalles
  const handleHourlyRateChange = (rate: number) => {
    setHourlyRate(rate);
    setDetails(details =>
      details.map(d => ({
        ...d,
        hourly_rate: rate,
        calculated_payment: d.hours_worked * rate,
      }))
    );
  };

  const totalPayment = details.reduce((acc, d) => acc + d.calculated_payment, 0);

  const handleSave = async () => {
    await addPayroll({
      start_date: startDate,
      end_date: endDate,
      details,
    });
    toast.success("Planilla guardada correctamente.");
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2">
        <span className="text-blue-700"><FiUserPlus size={28} /></span>
        Planilla Quincenal
      </h1>
  <form className="flex flex-wrap gap-4 mb-8 bg-blue-50 p-4 rounded shadow">
        <div className="flex flex-col">
          <label className="block mb-1 font-semibold text-blue-900">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border-2 border-blue-200 rounded px-3 py-2 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="block mb-1 font-semibold text-blue-900">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border-2 border-blue-200 rounded px-3 py-2 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="block mb-1 font-semibold text-blue-900">Tarifa hora</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={hourlyRate === 0 ? "" : hourlyRate}
              onChange={e => {
                const val = e.target.value;
                handleHourlyRateChange(val === "" ? 0 : Number(val));
              }}
              className="border-2 border-blue-200 rounded px-3 py-2 focus:border-blue-500 outline-none"
            />
        </div>
      </form>

      {/* Agregar fila para nuevo trabajador */}
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={handleAddWorker}
          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow transition"
        >
          <FiUserPlus /> Agregar trabajador
        </button>
      </div>
      {loading ? (
        <p>Cargando trabajadores...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 mb-8 shadow-sm rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="border px-4 py-2">Trabajador</th>
              <th className="border px-4 py-2">Horas trabajadas</th>
              <th className="border px-4 py-2">Días asistencia</th>
              <th className="border px-4 py-2">Pago</th>
              <th className="border px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, idx) => {
              // Solo mostrar trabajadores no seleccionados en otras filas
              const usedIds = details.filter((_, i) => i !== idx).map(x => x.worker_id);
              return (
                <tr key={idx} className="text-center hover:bg-blue-50 transition">
                  <td className="border px-4 py-2 text-left">
                    <select
                      className="border rounded px-2 py-1"
                      value={d.worker_id || ""}
                      onChange={e => {
                        const newId = Number(e.target.value);
                        setDetails(details =>
                          details.map((row, i) =>
                            i === idx
                              ? { ...row, worker_id: newId }
                              : row
                          )
                        );
                      }}
                    >
                      <option value="">Seleccionar trabajador...</option>
                      {workers
                        .filter(w => !usedIds.includes(w.id))
                        .map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={d.hours_worked === 0 ? "" : d.hours_worked}
                      onChange={e => {
                        const val = e.target.value;
                        handleChange(
                          d.worker_id,
                          "hours_worked",
                          val === "" ? 0 : Number(val)
                        );
                      }}
                      className="w-20 text-center border rounded px-1 py-0.5"
                      disabled={!d.worker_id}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={d.attendance_days === 0 ? "" : d.attendance_days}
                      onChange={e => {
                        const val = e.target.value;
                        handleChange(
                          d.worker_id,
                          "attendance_days",
                          val === "" ? 0 : Number(val)
                        );
                      }}
                      className="w-16 text-center border rounded px-1 py-0.5"
                      disabled={!d.worker_id}
                    />
                  </td>
                  <td className="border px-4 py-2 font-semibold">
                    ${d.calculated_payment.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      type="button"
                      onClick={() => setDetails(details => details.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full"
                      title="Eliminar fila"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded shadow">
        <div className="text-xl font-bold text-blue-900">Total a pagar: ${totalPayment.toFixed(2)}</div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow transition"
        >
          <FiSave /> Guardar Planilla
        </button>
      </div>
    </div>
  );
}
