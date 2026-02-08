import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { Employee, MonthlyAttendance } from "../types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
} from "date-fns";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<MonthlyAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadAttendance();
    }
  }, [id, currentDate]);

  const loadEmployee = async () => {
    try {
      const data = await api.getEmployee(id!);
      setEmployee(data);
    } catch (error) {
      console.error("Xodimni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await api.getEmployeeAttendance(id!, year, month);
      setAttendance(data);
    } catch (error) {
      console.error("Davomatni yuklashda xatolik:", error);
    }
  };

  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding for first week
  const startPadding = getDay(monthStart);
  const paddingDays = Array.from({ length: startPadding }, () => null);

  // Map attendance by date
  const attendanceMap = new Map(attendance.map((a) => [a.date, a]));

  const dayNames = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

  const statusLabels: Record<string, string> = {
    active: "Faol",
    inactive: "Nofaol",
    terminated: "Bo'shatilgan",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ma'lumot topilmadi</p>
        <Link
          to="/employees"
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Xodimlar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/employees"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        Xodimlar
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-4">
                {employee.photoUrl ? (
                  <img
                    src={employee.photoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-gray-500">{employee.position?.name}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  employee.status === "active"
                    ? "bg-green-100 text-green-700"
                    : employee.status === "inactive"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {statusLabels[employee.status]}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Qurilma ID</p>
                  <p className="font-mono font-medium">{employee.deviceId}</p>
                </div>
              </div>

              {employee.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Telefon</p>
                    <p className="font-medium">{employee.phone}</p>
                  </div>
                </div>
              )}

              {employee.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bo'lim</p>
                  <p className="font-medium">
                    {employee.department?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Smena</p>
                  <p className="font-medium">
                    {employee.shift ? (
                      <>
                        {employee.shift.name}
                        <span className="text-gray-500 text-sm ml-1">
                          ({employee.shift.startTime} - {employee.shift.endTime}
                          )
                        </span>
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
              </div>

              {employee.hireDate && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ishga kirgan sana</p>
                    <p className="font-medium">
                      {format(new Date(employee.hireDate), "dd.MM.yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Davomat kalendari
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-gray-900 font-medium min-w-[140px] text-center">
                  {format(currentDate, "MMMM yyyy")}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map((_, index) => (
                <div key={`pad-${index}`} className="h-20" />
              ))}
              {calendarDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayAttendance = attendanceMap.get(dateStr);
                const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={dateStr}
                    className={`h-20 border rounded-lg p-2 ${
                      isToday
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-100"
                    } ${!isCurrentMonth ? "opacity-50" : ""}`}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {format(day, "d")}
                    </div>
                    {dayAttendance ? (
                      <div className="space-y-1">
                        <div
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            dayAttendance.status === "late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {dayAttendance.clock_in || "-"}
                        </div>
                        {dayAttendance.clock_out && (
                          <div className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            {dayAttendance.clock_out}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">-</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100" />
                <span className="text-sm text-gray-600">O'z vaqtida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100" />
                <span className="text-sm text-gray-600">Kechikkan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100" />
                <span className="text-sm text-gray-600">Ketish</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
