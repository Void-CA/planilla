import { initDB } from "./db";
import type { Worker } from "../types/workers";

export async function getWorkers(): Promise<Worker[]> {
  const db = await initDB();
  const rows = await db.select<Worker[]>("SELECT * FROM workers;");
  return rows;
}

export async function addWorker(worker: Omit<Worker, "id">): Promise<void> {
  const db = await initDB();
  await db.execute(
    "INSERT INTO workers (name, area_id) VALUES (?, ?);",
    [worker.name, worker.area_id]
  );
}

export async function updateWorker(worker: Worker): Promise<void> {
  const db = await initDB();
  await db.execute(
    "UPDATE workers SET name = ?, area_id = ? WHERE id = ?;",
    [worker.name, worker.area_id, worker.id]
  );
}

export async function deleteWorker(id: number): Promise<void> {
  const db = await initDB();
  await db.execute("DELETE FROM workers WHERE id = ?;", [id]);
}

export async function getWorkerById(id: number): Promise<Worker | null> {
  const db = await initDB();
  const rows = await db.select<Worker[]>("SELECT * FROM workers WHERE id = ?;", [id]);
  return rows[0] || null;
}

interface TotalResult { total: number; }
interface AvgHoursResult { avgHours: number; }
interface AreaCountResult { id: number; name: string; count: number; }
interface WorkerSimple { id: number; name: string; hours_worked?: number; added_at?: Date; }
interface AvgAttendanceResult { avgAttendance: number; }

export async function getWorkersStats() {
  const db = await initDB();

  const total = (await db.select<TotalResult[]>("SELECT COUNT(*) as total FROM workers"))[0];
  const avgHours = (await db.select<AvgHoursResult[]>("SELECT AVG(hours_worked) as avgHours FROM workers JOIN payroll_detail ON workers.id = payroll_detail.worker_id"))[0];
  const mostWorkersArea = (await db.select<AreaCountResult[]>(`
    SELECT a.id, a.name, COUNT(w.id) as count
    FROM workers w
    JOIN areas a ON w.area_id = a.id
    GROUP BY a.id, a.name
    ORDER BY count DESC
    LIMIT 1
  `))[0];
  const lastWorker = (await db.select<WorkerSimple[]>("SELECT id, name, added_at FROM workers ORDER BY id DESC LIMIT 1"))[0];
  const avgAttendance = (await db.select<AvgAttendanceResult[]>("SELECT AVG(attendance_days) as avgAttendance FROM workers JOIN payroll_detail ON workers.id = payroll_detail.worker_id"))[0];
  const topWorker = (await db.select<WorkerSimple[]>("SELECT workers.id, name, hours_worked FROM workers JOIN payroll_detail ON workers.id = payroll_detail.worker_id ORDER BY hours_worked DESC LIMIT 1"))[0];

  return {
    total: total?.total || 0,
    avgHours: avgHours?.avgHours || 0,
    mostWorkersArea: mostWorkersArea || null,
    lastWorker: lastWorker || null,
    avgAttendance: avgAttendance?.avgAttendance || 0,
    topWorker: topWorker || null
  };
}
