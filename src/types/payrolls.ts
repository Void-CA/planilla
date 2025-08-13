export interface PayrollDetail {
  worker_id: number;
  hours_worked: number;
  attendance_days: number;
  hourly_rate: number;
  calculated_payment: number;
}

export interface Payroll {
  id: number;
  start_date: string;
  end_date: string;
  total?: number;
  details: PayrollDetail[];
}