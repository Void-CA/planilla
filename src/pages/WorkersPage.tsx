import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EntityTable } from "../components/EntityTable";
import { SearchBar } from "../components/SearchBar";
import { getWorkers, addWorker, updateWorker, deleteWorker, getWorkersStats } from "../services/workerService";
import { EntityForm } from "../components/EntityForm";
import { SelectBox } from "../components/SelectBox";
import { getAreas, addArea } from "../services/areaService";
import type { Worker } from "../types/workers";
import type { Area } from "../types/areas";
import { FiUser, FiEdit, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { StatsCard } from "../components";
import dayjs from "dayjs";



export function WorkersPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Area[]>([]);
  const [modal, setModal] = useState<"none" | "worker" | "area">("none");
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [pendingAreaSelect, setPendingAreaSelect] = useState<((id: number) => void) | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    avgHours: number;
    mostWorkersArea: { id: number; name: string; count: number } | null;
    lastWorker: { id: number; name: string; added_at: Date } | null;
    avgAttendance: number;
    topWorker: { id: number; name: string; hours_worked?: number; added_at?: Date } | null;
  } | null>(null);

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadWorkers();
    getAreas().then(setDepartments);
    loadStats();
  }, []);

  async function loadWorkers() {
    setLoading(true);
    setWorkers(await getWorkers());
    setLoading(false);
  }

  async function loadStats() {
    setLoadingStats(true);
    const data = await getWorkersStats();
    setStats({
      ...data,
      lastWorker: data.lastWorker
        ? {
            ...data.lastWorker,
            added_at: data.lastWorker.added_at ?? new Date(),
          }
        : null,
      topWorker: data.topWorker
        ? {
            ...data.topWorker,
            added_at: data.topWorker.added_at,
          }
        : null,
    });
    setLoadingStats(false);
  }

  async function handleAdd(worker: Omit<Worker, "id">) {
    setLoading(true);
    try {
      await addWorker(worker);
      await loadWorkers();
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(worker: Worker) {
    await updateWorker(worker);
    await loadWorkers();
  }

  async function handleDelete(id: number) {
    await deleteWorker(id);
    await loadWorkers();
  }

  // Formularios extraídos como componentes internos
  function WorkerFormModal() {
    return (
      <Modal onClose={() => setModal("none")}> 
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-800">
          <FiEdit /> {editingWorker ? "Editar Trabajador" : "Agregar Trabajador"}
        </h2>
        <EntityForm
          fields={[
            { name: "name", label: "Nombre", type: "text" },
            {
              name: "area_id",
              label: "Área",
              type: "number",
              renderInput: (value, onChange) => (
                <SelectBox
                  options={departments}
                  value={value}
                  onChange={onChange}
                  getOptionLabel={d => d?.name || "N/A"}
                  getOptionValue={d => d?.id || 0}
                  placeholder="Seleccionar área"
                  onCreateNew={() => {
                    setModal("area");
                    setPendingAreaSelect(onChange);
                  }}
                />
              ),
            },
          ]}
          initialValues={editingWorker ?? undefined}
          onSubmit={async (workerData: Omit<Worker, "id">) => {
            if (editingWorker) {
              await handleUpdate({ id: editingWorker.id, ...workerData });
            } else {
              await handleAdd(workerData);
            }
            toast.success("Operación exitosa");
            setModal("none");
          }}
          onCancel={() => setModal("none")}
        />
      </Modal>
    );
  }

  function AreaFormModal() {
    return (
      <Modal onClose={() => setModal("none")}> 
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-800">
          <FiPlus /> Agregar Área
        </h2>
        <EntityForm
          fields={[
            { name: "name", label: "Nombre del Área", type: "text" },
            { name: "description", label: "Descripción", type: "text" },
          ]}
          onSubmit={async (areaData: Omit<Area, "id">) => {
            const newId = await addArea(areaData);
            await getAreas().then(setDepartments);
            setModal("none");
            if (pendingAreaSelect) {
              pendingAreaSelect(newId);
              setPendingAreaSelect(null);
            }
            toast.success("Área agregada exitosamente");
          }}
          onCancel={() => setModal("none")}
        />
      </Modal>
    );
  }

  // Modal genérico reutilizable
  function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
        <div className="bg-white rounded shadow p-6 w-96" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  }

  // Filtrar trabajadores por búsqueda
  const filteredWorkers = workers.filter(w => {
    const areaName = departments.find(a => a.id === w.area_id)?.name ?? "";
    return (
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      areaName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2 text-blue-900">
        <FiUser size={28} /> Lista de Trabajadores
      </h1>
      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar trabajador o área..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <EntityTable
          title="Trabajadores"
          data={filteredWorkers.map(w => ({
            ...w,
            area_name: departments.find(a => a.id === w.area_id)?.name ?? "-"
          }))}
          loading={loading}
          onAdd={() => { setEditingWorker(null); setModal("worker"); }}
          onEdit={worker => { setEditingWorker(worker); setModal("worker"); }}
          onDelete={handleDelete}
          columns={[
            { key: "id", label: "ID" },
            {
              key: "name",
              label: "Nombre",
              render: (value, row) => (
                <button
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold shadow hover:bg-blue-100 hover:text-blue-900 transition border border-blue-200"
                  onClick={() => navigate(`/trabajadores/${row.id}`)}
                  title="Ver detalle"
                >
                  <FiUser className="text-blue-400" />
                  {value}
                </button>
              ),
            },
            { key: "area_name", label: "Área" },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingStats ? (
            <div className="col-span-3 text-center text-gray-400 py-8">Cargando estadísticas...</div>
          ) : (
            <>
              <StatsCard title="Total de Trabajadores" value={stats?.total || 0} />
              <StatsCard title="Promedio de Horas" value={stats?.avgHours !== undefined ? stats.avgHours.toFixed(1) : "0.0"} description="Horas trabajadas promedio" />
              <StatsCard
                title="Área con más Trabajadores"
                value={stats?.mostWorkersArea?.name || "N/A"}
                description={`${stats?.mostWorkersArea?.count || 0} trabajadores`}
                valueClassName="text-lg"
              />
              <StatsCard
                title="Último Trabajador"
                value={stats?.lastWorker?.name || "N/A"}
                valueClassName="text-lg"
                description={`Creada el ${dayjs(stats?.lastWorker?.added_at).format("DD [de] MMMM [de] YYYY") || "N/A"}`}

              />
              <StatsCard
                title="Promedio de Asistencia"
                value={stats?.avgAttendance !== undefined ? stats.avgAttendance.toFixed(1) : "0.0"}
                description="Días trabajados promedio"
              />
              <StatsCard
                title="Mayor Horas Trabajadas"
                value={stats?.topWorker?.name || "N/A"}
                description={`${stats?.topWorker?.hours_worked || 0} horas`}
                valueClassName="text-lg"  
              />
            </>
          )}
        </div>
      </div>

      {modal === "worker" && <WorkerFormModal />}
      {modal === "area" && <AreaFormModal />}
    </div>
  );
}
