import { useState, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { api } from "../services/api";
import { DashboardStats, AttendanceLog } from "../types";
import { format } from "date-fns";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
} from "lucide-react";

export default function Dashboard() {
  const { isConnected, events } = useWebSocket();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, logsData] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentAttendance(20),
      ]);
      setStats(statsData);
      setRecentLogs(logsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge WebSocket events with recent logs
  const allLogs = [
    ...events.map(
      (e) =>
        ({
          _id: e.id,
          employee: {
            _id: e.employee._id,
            firstName: e.employee.firstName,
            lastName: e.employee.lastName,
            photoUrl: e.employee.photoUrl,
            department: e.employee.department,
          },
          eventTime: e.eventTime,
          direction: e.direction,
          status: e.status,
          lateMinutes: e.lateMinutes,
        }) as AttendanceLog,
    ),
    ...recentLogs,
  ].slice(0, 20);

  const statCards = stats
    ? [
        {
          label: "Jami xodimlar",
          value: stats.total,
          icon: Users,
          color: "bg-blue-500",
          bgColor: "bg-blue-50",
        },
        {
          label: "Kelganlar",
          value: stats.arrived,
          percent: stats.arrived_percent,
          icon: UserCheck,
          color: "bg-green-500",
          bgColor: "bg-green-50",
        },
        {
          label: "Kechikkanlar",
          value: stats.late,
          percent: stats.late_percent,
          icon: Clock,
          color: "bg-yellow-500",
          bgColor: "bg-yellow-50",
        },
        {
          label: "Yo'qlar",
          value: stats.absent,
          percent: stats.absent_percent,
          icon: UserX,
          color: "bg-red-500",
          bgColor: "bg-red-50",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boshqaruv paneli</h1>
          <p className="text-gray-500">Bugungi statistika</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isConnected
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isConnected ? "Ulangan" : "Uzilgan"}
            </span>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
                <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            ))
          : statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <div
                    className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon
                      className={`w-6 h-6 ${card.color.replace("bg-", "text-")}`}
                    />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </p>
                      <p className="text-gray-500 text-sm">{card.label}</p>
                    </div>
                    {card.percent !== undefined && (
                      <span
                        className={`text-sm font-medium ${card.color.replace("bg-", "text-")}`}
                      >
                        {card.percent}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Live attendance feed */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Jonli davomat
            </h2>
            {isConnected && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">JONLI</span>
              </span>
            )}
          </div>
        </div>

        <div className="divide-y max-h-[500px] overflow-y-auto">
          {allLogs.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Ma'lumot topilmadi
            </div>
          ) : (
            allLogs.map((log, index) => (
              <div
                key={log._id || index}
                className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  index === 0 && events.length > 0 ? "live-entry" : ""
                }`}
              >
                {/* Employee photo */}
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {log.employee?.photoUrl ? (
                    <img
                      src={log.employee.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Employee info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {log.employee?.firstName} {log.employee?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {log.employee?.department?.name || "-"}
                  </p>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.direction === "in"
                        ? log.status === "late"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {log.direction === "in"
                      ? log.status === "late"
                        ? "Kechikkan"
                        : "O'z vaqtida"
                      : "Ketish"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(log.eventTime), "HH:mm")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
