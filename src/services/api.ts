import {
  Employee,
  AttendanceLog,
  DashboardStats,
  Shift,
  Branch,
  Department,
  Position,
  AuthorizedDevice,
  AttendanceReportRow,
  DetailedAttendanceRow,
  MonthlyAttendance,
  User,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Check if response is JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response;
}

export const api = {
  // Auth
  async login(
    username: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    return fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  async logout(): Promise<void> {
    localStorage.removeItem("token");
  },

  async getMe(): Promise<{ user: User }> {
    return fetchWithAuth("/auth/me");
  },

  // Dashboard
  async getDashboardStats(date?: string): Promise<DashboardStats> {
    const params = date ? `?date=${date}` : "";
    return fetchWithAuth(`/dashboard/stats${params}`);
  },

  async getRecentAttendance(limit = 20): Promise<AttendanceLog[]> {
    return fetchWithAuth(`/dashboard/recent?limit=${limit}`);
  },

  // Employees
  async getEmployees(filters?: {
    branch_id?: string;
    department_id?: string;
    status?: string;
    search?: string;
  }): Promise<Employee[]> {
    const params = new URLSearchParams();
    if (filters?.branch_id) params.append("branch_id", filters.branch_id);
    if (filters?.department_id)
      params.append("department_id", filters.department_id);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);

    const query = params.toString();
    return fetchWithAuth(`/employees${query ? `?${query}` : ""}`);
  },

  async getEmployee(id: string): Promise<Employee> {
    return fetchWithAuth(`/employees/${id}`);
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    return fetchWithAuth("/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    return fetchWithAuth(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteEmployee(id: string): Promise<void> {
    return fetchWithAuth(`/employees/${id}`, { method: "DELETE" });
  },

  async getEmployeeAttendance(
    id: string,
    year: number,
    month: number,
  ): Promise<MonthlyAttendance[]> {
    return fetchWithAuth(
      `/employees/${id}/attendance?year=${year}&month=${month}`,
    );
  },

  // Attendance
  async getAttendance(filters?: {
    employee_id?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    limit?: number;
  }): Promise<AttendanceLog[]> {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.date) params.append("date", filters.date);
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const query = params.toString();
    return fetchWithAuth(`/attendance${query ? `?${query}` : ""}`);
  },

  // Shifts
  async getShifts(): Promise<Shift[]> {
    return fetchWithAuth("/shifts");
  },

  async getShift(id: string): Promise<Shift> {
    return fetchWithAuth(`/shifts/${id}`);
  },

  async createShift(data: Partial<Shift>): Promise<Shift> {
    return fetchWithAuth("/shifts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateShift(id: string, data: Partial<Shift>): Promise<Shift> {
    return fetchWithAuth(`/shifts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteShift(id: string): Promise<void> {
    return fetchWithAuth(`/shifts/${id}`, { method: "DELETE" });
  },

  // Branches
  async getBranches(): Promise<Branch[]> {
    return fetchWithAuth("/branches");
  },

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    return fetchWithAuth("/branches", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateBranch(id: string, data: Partial<Branch>): Promise<void> {
    return fetchWithAuth(`/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteBranch(id: string): Promise<void> {
    return fetchWithAuth(`/branches/${id}`, { method: "DELETE" });
  },

  // Departments
  async getDepartments(branchId?: string): Promise<Department[]> {
    const query = branchId ? `?branch_id=${branchId}` : "";
    return fetchWithAuth(`/departments${query}`);
  },

  async createDepartment(
    data: Partial<Department> & { branch_id?: string },
  ): Promise<Department> {
    return fetchWithAuth("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateDepartment(
    id: string,
    data: Partial<Department> & { branch_id?: string },
  ): Promise<void> {
    return fetchWithAuth(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteDepartment(id: string): Promise<void> {
    return fetchWithAuth(`/departments/${id}`, { method: "DELETE" });
  },

  // Positions
  async getPositions(): Promise<Position[]> {
    return fetchWithAuth("/positions");
  },

  async createPosition(data: Partial<Position>): Promise<Position> {
    return fetchWithAuth("/positions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updatePosition(id: string, data: Partial<Position>): Promise<void> {
    return fetchWithAuth(`/positions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deletePosition(id: string): Promise<void> {
    return fetchWithAuth(`/positions/${id}`, { method: "DELETE" });
  },

  // Devices
  async getDevices(): Promise<AuthorizedDevice[]> {
    return fetchWithAuth("/devices");
  },

  async createDevice(
    data: Partial<AuthorizedDevice>,
  ): Promise<AuthorizedDevice> {
    return fetchWithAuth("/devices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateDevice(
    id: string,
    data: Partial<AuthorizedDevice>,
  ): Promise<void> {
    return fetchWithAuth(`/devices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteDevice(id: string): Promise<void> {
    return fetchWithAuth(`/devices/${id}`, { method: "DELETE" });
  },

  // Reports
  async getSummaryReport(
    startDate: string,
    endDate: string,
    filters?: {
      department_id?: string;
      branch_id?: string;
    },
  ): Promise<AttendanceReportRow[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    if (filters?.department_id)
      params.append("department_id", filters.department_id);
    if (filters?.branch_id) params.append("branch_id", filters.branch_id);

    return fetchWithAuth(`/reports/summary?${params.toString()}`);
  },

  async getDetailedReport(
    startDate: string,
    endDate: string,
    employeeId?: string,
  ): Promise<DetailedAttendanceRow[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    if (employeeId) params.append("employee_id", employeeId);

    return fetchWithAuth(`/reports/detailed?${params.toString()}`);
  },

  getExportUrl(
    startDate: string,
    endDate: string,
    type: "summary" | "detailed",
    filters?: {
      department_id?: string;
      branch_id?: string;
    },
  ): string {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      type,
    });
    if (filters?.department_id)
      params.append("department_id", filters.department_id);
    if (filters?.branch_id) params.append("branch_id", filters.branch_id);

    return `${BASE_URL}/reports/export?${params.toString()}`;
  },
};
