import { useEffect, useState } from "react";
import type { Area } from "../types/areas";
import { getAreas, addArea, updateArea, deleteArea, getMostWorkersArea, getLastArea, getAverageWorkers } from "../services/areaService";
import {EntityForm, EntityTable, StatsCard } from "../components"
import { FiBarChart2, FiClock, FiMap, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import dayjs from "dayjs";

dayjs.locale("es");

export function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [mostWorkersArea, setMostWorkersArea] = useState<{ name: string; count: number } | null>(null);
  const [lastArea, setLastArea] = useState<Area | null>(null);
  const [avgWorkers, setAvgWorkers] = useState(0);

  useEffect(() => {
    loadAreas();
    loadMetrics();
  }, []);

  async function loadAreas() {
    setLoading(true);
    const data = await getAreas();
    setAreas(data);
    setLoading(false);
  }

  async function loadMetrics() {
    const [most, last, avg] = await Promise.all([
      getMostWorkersArea(),
      getLastArea(),
      getAverageWorkers(),
    ]);
    setMostWorkersArea(most);
    setLastArea(last);
    setAvgWorkers(avg);
  }

  const openAddForm = () => {
    setEditingArea(null);
    setShowForm(true);
  };

  const openEditForm = (area: Area) => {
    setEditingArea(area);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  // Nuevo submit handler para EntityForm
  const onFormSubmit = async (areaData: Omit<Area, "id">) => {
    if (editingArea) {
      await updateArea({ id: editingArea.id, ...areaData });
    } else {
      await addArea(areaData);
    }
    toast.success("Operación exitosa");
    await loadAreas();
    await loadMetrics();
    setShowForm(false);
  };


  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta área?")) return;
    await deleteArea(id);
    await loadAreas();
    await loadMetrics();
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2 text-blue-900">
              <FiMap size={28} /> Lista de Áreas
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <EntityTable
        title="Áreas"
        data={areas}
        loading={loading}
        onAdd={openAddForm}
        onEdit={openEditForm}
        onDelete={handleDelete}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Area Name" },
          { key: "description", label: "Description" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Total de Áreas"
          value={areas.length}
          icon={<FiMap />}
          description="Cantidad de áreas registradas."
        />
        <StatsCard
          title="Área con más trabajadores"
          value={mostWorkersArea?.name || "N/A"}
          icon={<FiUsers />}
          description={`${mostWorkersArea?.count || 0} trabajadores`}
        />
        <StatsCard
          title="Última área creada"
          value={lastArea?.name || "N/A"}
          icon={<FiClock />}
          description={`Creada el ${dayjs(lastArea?.created_at).format("DD [de] MMMM [de] YYYY") || "N/A"}`}
        />
        <StatsCard
          title="Promedio de trabajadores"
          value={avgWorkers.toFixed(1)}
          icon={<FiBarChart2 />}
          description="Por cada área"
        />
      </div>

      

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <EntityForm
              fields={[{ name: "name", label: "Area Name", type: "text"},
                { name: "description", label: "Description", type: "text"},
              ]}
              initialValues={editingArea ?? undefined}
              onSubmit={onFormSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
    </div>
    
  );
}
