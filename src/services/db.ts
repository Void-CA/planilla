import Database from "@tauri-apps/plugin-sql";
let db: Database | null = null;

export async function initDB() {
  if (db) return db;
  db = await Database.load('sqlite:./planilla.db');


  // Create tables if they do not exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      area_id INTEGER NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (area_id) REFERENCES areas(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS payrolls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total REAL NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS payroll_detail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payroll_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      hours_worked REAL NOT NULL,
      attendance_days INTEGER NOT NULL,
      hourly_rate REAL NOT NULL,
      calculated_payment REAL NOT NULL,
      FOREIGN KEY (payroll_id) REFERENCES payrolls(id),
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );
  `);

  return db;
}
