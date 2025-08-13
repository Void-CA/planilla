import sqlite3
import random
from faker import Faker

DB_PATH = "C:\\Users\\void\\AppData\\Roaming\\com.tauri.dev\\planilla.db"  # Ajusta la ruta si es necesario

def seed_data(num_payrolls=3):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    fake = Faker("es_ES")

    # Limpiar tablas (opcional)
    cursor.execute("DELETE FROM payroll_detail;")
    cursor.execute("DELETE FROM payrolls;")
    cursor.execute("DELETE FROM workers;")
    cursor.execute("DELETE FROM areas;")
    conn.commit()

    # Crear áreas
    areas = [
        ("Administración", "Gestión y administración de la empresa"),
        ("Producción", "Fabricación y control de calidad"),
        ("Ventas", "Comercialización y atención al cliente"),
        ("Logística", "Distribución y transporte"),
        ("Tecnología", "Soporte y desarrollo tecnológico"),
    ]
    cursor.executemany("INSERT INTO areas (name, description) VALUES (?, ?);", areas)
    conn.commit()

    # Obtener áreas con IDs
    cursor.execute("SELECT id FROM areas;")
    areas_db = [row[0] for row in cursor.fetchall()]

    # Crear trabajadores
    workers = []
    for _ in range(30):
        name = fake.name()
        area_id = random.choice(areas_db)
        workers.append((name, area_id))
    cursor.executemany("INSERT INTO workers (name, area_id) VALUES (?, ?);", workers)
    conn.commit()

    # Obtener trabajadores con IDs
    cursor.execute("SELECT id FROM workers;")
    workers_db = [row[0] for row in cursor.fetchall()]

    # Crear varias planillas y detalles
    for _ in range(num_payrolls):
        start_date = fake.date_between(start_date='-6M', end_date='-1M')
        end_date = fake.date_between(start_date=start_date, end_date='today')
        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")

        cursor.execute("INSERT INTO payrolls (start_date, end_date, total) VALUES (?, ?, 0);", (start_date_str, end_date_str))
        payroll_id = cursor.lastrowid

        total = 0
        for worker_id in workers_db:
            hours_worked = random.randint(20, 60)
            attendance_days = random.randint(5, 15)
            hourly_rate = round(random.uniform(10, 25), 2)
            calculated_payment = round(hours_worked * hourly_rate, 2)
            total += calculated_payment

            cursor.execute(
                """INSERT INTO payroll_detail 
                   (payroll_id, worker_id, hours_worked, attendance_days, hourly_rate, calculated_payment)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (payroll_id, worker_id, hours_worked, attendance_days, hourly_rate, calculated_payment)
            )
        cursor.execute("UPDATE payrolls SET total = ? WHERE id = ?;", (total, payroll_id))
        conn.commit()

    conn.close()
    print(f"{num_payrolls} planillas con detalles simulados creados con éxito.")

if __name__ == "__main__":
    seed_data()