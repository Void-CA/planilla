import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiCalendar, FiChevronRight, FiUsers } from "react-icons/fi";
import { getPayrolls } from "../services/payrollService";
import dayjs from "dayjs";
import "dayjs/locale/es"; 

dayjs.locale("es");

export function PayrollList() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPayrolls().then((data) => {
      setPayrolls(data as any[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-2 mr-20">
          <FiCalendar /> Historial de Planillas
        </h1>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition ml-10"
          onClick={() => navigate("/planilla/new")}
        >
          <FiPlus /> Agregar planilla
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando planillas...</p>
      ) : payrolls.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No hay planillas registradas.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {payrolls.map((p) => {
            const total = p.total || 0;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/planilla/${p.id}`)}
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-300 text-white px-6 py-3 flex items-center gap-3 text-lg font-semibold shadow-md rounded-t-lg">
                  <FiUsers className="text-2xl opacity-90" />
                  {dayjs(p.start_date).format("D [de] MMMM YYYY")} – {dayjs(p.end_date).format("D [de] MMMM YYYY")}
                </div>

                {/* Contenido */}
                <div className="p-6 flex justify-between items-center">
                  <div className="text-gray-700 text-lg">
                    Total:{" "}
                    <span className="font-bold text-green-600">
                      C${new Intl.NumberFormat("es-NI", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(total)}
                    </span>
                  </div>
                  <span className="text-blue-500 group-hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
                    Ver detalles <FiChevronRight />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
