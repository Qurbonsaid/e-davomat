export interface Branch {
  _id: string;
  name: string;
  address?: string;
  createdAt: string;
}

export interface Department {
  _id: string;
  branch?: Branch;
  branch_id?: string;
  name: string;
  createdAt: string;
}

export interface AuthorizedDevice {
  _id: string;
  serialNumber: string;
  name?: string;
  ipAddress?: string;
  branch?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Position {
  _id: string;
  name: string;
  createdAt: string;
}

export interface WorkDay {
  dayOfWeek: number;
  isWorkingDay: boolean;
}

export interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  breakStart?: string;
  breakEnd?: string;
  workDays: WorkDay[];
  createdAt: string;
}

export interface Employee {
  _id: string;
  deviceId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  branch?: Branch;
  department?: Department;
  position?: Position;
  shift?: Shift;
  hireDate?: string;
  status: "active" | "inactive" | "terminated";
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceLog {
  _id: string;
  employee: Employee;
  deviceId: string;
  deviceSerial?: string;
  eventTime: string;
  direction: "in" | "out";
  status: "on_time" | "late" | "early";
  lateMinutes: number;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  arrived: number;
  on_time: number;
  late: number;
  absent: number;
  arrived_percent: number;
  late_percent: number;
  absent_percent: number;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: "admin" | "superadmin" | "viewer";
}

export interface AttendanceReportRow {
  employee_id: string;
  device_id: string;
  first_name: string;
  last_name: string;
  department_name?: string;
  position_name?: string;
  shift_name?: string;
  shift_start?: string;
  shift_end?: string;
  days_present: number;
  late_count: number;
  total_late_minutes: number;
}

export interface DetailedAttendanceRow {
  employee_id: string;
  first_name: string;
  last_name: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: string;
  late_minutes: number;
}

export interface MonthlyAttendance {
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: string;
  total_late_minutes: number;
}

export interface WebSocketMessage {
  type: "attendance" | "connected" | "pong";
  data?: AttendanceEventData;
  timestamp?: string;
}

export interface AttendanceEventData {
  id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    department?: { name: string };
    position?: { name: string };
  };
  eventTime: string;
  direction: "in" | "out";
  status: string;
  lateMinutes: number;
  shift?: string;
}
