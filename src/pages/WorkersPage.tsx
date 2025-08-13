

import { useEffect, useState } from "react";
import { EntityTable } from "../components/EntityTable";
import { getWorkers, addWorker, updateWorker, deleteWorker } from "../services/workerService";
import { EntityForm } from "../components/EntityForm";
import { SelectBox } from "../components/SelectBox";
import { getAreas, addArea } from "../services/areaService";
import type { Worker } from "../types/workers";
import type { Area } from "../types/areas";
import { FiUser, FiEdit, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";



export function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Area[]>([]);
  const [modal, setModal] = useState<"none" | "worker" | "area">("none");
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [pendingAreaSelect, setPendingAreaSelect] = useState<((id: number) => void) | null>(null);

  useEffect(() => {
    loadWorkers();
    getAreas().then(setDepartments);
  }, []);

  async function loadWorkers() {
    setLoading(true);
    setWorkers(await getWorkers());
    setLoading(false);
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
                  getOptionLabel={d => d.name}
                  getOptionValue={d => d.id}
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2 text-blue-900">
        <FiUser size={28} /> Lista de Trabajadores
      </h1>
      <EntityTable
        title="Trabajadores"
        data={workers.map(w => ({
          ...w,
          area_name: departments.find(a => a.id === w.area_id)?.name ?? "-"
        }))}
        loading={loading}
        onAdd={() => { setEditingWorker(null); setModal("worker"); }}
        onEdit={worker => { setEditingWorker(worker); setModal("worker"); }}
        onDelete={handleDelete}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Nombre" },
          { key: "area_name", label: "Área" },
        ]}
      />

      {modal === "worker" && <WorkerFormModal />}
      {modal === "area" && <AreaFormModal />}
    </div>
  );
}
