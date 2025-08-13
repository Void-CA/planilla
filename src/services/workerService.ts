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