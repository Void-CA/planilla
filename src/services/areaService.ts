import type { Area } from "../types/areas";
import { initDB } from "./db";

export async function getAreas(): Promise<Area[]> {
  const db = await initDB();
  const areas = await db.select<Area[]>("SELECT * FROM areas");
  return areas;
}

export async function addArea(area: Omit<Area, "id">): Promise<number> {
  const db = await initDB();
  const result = await db.execute("INSERT INTO areas (name, description) VALUES (?, ?)", [area.name, area.description]);
  // @ts-ignore: Depending on your DB driver, result may have insertId
  return result.insertId; // Devuelve el ID del área recién insertada
}

export async function updateArea(area: Area): Promise<void> {
  const db = await initDB();
  await db.execute("UPDATE areas SET name = ?, description = ? WHERE id = ?", [area.name, area.description, area.id]);
}

export async function deleteArea(id: number): Promise<void> {
  const db = await initDB();
  await db.execute("DELETE FROM areas WHERE id = ?", [id]);
}

export async function getAreaById(id: number): Promise<Area | null> {
  const db = await initDB();
  const rows = await db.select<Area[]>("SELECT * FROM areas WHERE id = ?", [id]);
  return rows[0] || null;
}


export async function getMostWorkersArea(): Promise<{ name: string; count: number } | null> {
  const db = await initDB();
  const result = await db.select<{ name: string; count: number }[]>(`
    SELECT a.name, COUNT(w.id) as count
    FROM areas a
    LEFT JOIN workers w ON w.area_id = a.id
    GROUP BY a.id
    ORDER BY count DESC
    LIMIT 1
  `);
  return result[0] || null;
}

export async function getLastArea(): Promise<Area | null> {
  const db = await initDB();
  const result = await db.select<Area[]>(`SELECT * FROM areas ORDER BY id DESC LIMIT 1`);
  return result[0] || null;
}

export async function getAverageWorkers() {
  const db = await initDB();
  const result = await db.select<{ avg: number }[]>(`
    SELECT COUNT(*) * 1.0 / COUNT(DISTINCT area_id) as avg
    FROM workers
  `);
  return result[0]?.avg || 0;
}
