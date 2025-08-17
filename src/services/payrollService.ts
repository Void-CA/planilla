import { initDB } from "./db";
import type { PayrollDetail, Payroll } from "../types/payrolls";

export async function addPayroll({ start_date, end_date, details }: {
  start_date: string;
  end_date: string;
  details: PayrollDetail[];
}): Promise<Payroll> {
  const db = await initDB();

  // Calcular el total sumando los calculated_payment de todos los detalles
  const total = details.reduce((sum, d) => sum + (d.calculated_payment || 0), 0);

  // Insert payroll con total
  const result = await db.execute(
    "INSERT INTO payrolls (start_date, end_date, total) VALUES (?, ?, ?);",
    [start_date, end_date, total]
  );

  const payrollId = result.lastInsertId;
  if (!payrollId) throw new Error("No se pudo obtener el id de la planilla");

  // Insertar detalles
  for (const d of details) {
    await db.execute(
      `INSERT INTO payroll_detail (payroll_id, worker_id, hours_worked, attendance_days, hourly_rate, calculated_payment)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        payrollId,
        d.worker_id,
        d.hours_worked,
        d.attendance_days,
        d.hourly_rate,
        d.calculated_payment,
      ]
    );
  }

  // Return the created payroll object
  return {
    id: payrollId,
    start_date,
    end_date,
    total,
    details
  };
}


export async function getPayrolls() {
  const db = await initDB();
  return db.select("SELECT * FROM payrolls ORDER BY id DESC;");
}

export async function getPayrollDetails(payroll_id: number) {
  const db = await initDB();
  return db.select(
    "SELECT * FROM payroll_detail WHERE payroll_id = ?;",
    [payroll_id]
  );
}

export async function getPayrollById(id: number) {
  const db = await initDB();
  const payrolls = await db.select("SELECT * FROM payrolls WHERE id = ? LIMIT 1;", [id]);
  const payroll = Array.isArray(payrolls) && payrolls.length > 0 ? payrolls[0] : null;
  if (!payroll) throw new Error("No se encontró la planilla");
  (payroll as any).details = await getPayrollDetails(id);
  return payroll;
}

export async function getPayrollDetailsById(payroll_id: number) {
  const db = await initDB();
  return db.select(
    "SELECT * FROM payroll_detail WHERE payroll_id = ?;",
    [payroll_id]
  );
}

export async function getPayrollsForWorker(worker_id: number) {
  const db = await initDB();
  // JOIN payrolls y payroll_detail para obtener la info conjunta
  return db.select(`
    SELECT p.id as payroll_id, p.start_date, p.end_date, p.total,
           d.id as detail_id, d.hours_worked, d.attendance_days, d.hourly_rate, d.calculated_payment
    FROM payrolls p
    JOIN payroll_detail d ON p.id = d.payroll_id
    WHERE d.worker_id = ?
    ORDER BY p.id DESC;
  `, [worker_id]);
}