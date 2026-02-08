import { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  AttendanceReportRow,
  DetailedAttendanceRow,
  Department,
  Branch,
} from "../types";
import { format, subDays } from "date-fns";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  ChevronDown,
  BarChart3,
} from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState<"summary" | "detailed">(
    "summary",
  );
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [summaryReport, setSummaryReport] = useState<AttendanceReportRow[]>([]);
  const [detailedReport, setDetailedReport] = useState<DetailedAttendanceRow[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [depsData, branchesData] = await Promise.all([
        api.getDepartments(),
        api.getBranches(),
      ]);
      setDepartments(depsData);
      setBranches(branchesData);
    } catch (error) {
      console.error("Filtrlarni yuklashda xatolik:", error);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      if (reportType === "summary") {
        const data = await api.getSummaryReport(startDate, endDate, {
          department_id: filterDepartment || undefined,
          branch_id: filterBranch || undefined,
        });
        setSummaryReport(data);
        setDetailedReport([]);
      } else {
        const data = await api.getDetailedReport(startDate, endDate);
        setDetailedReport(data);
        setSummaryReport([]);
      }
    } catch (error) {
      console.error("Hisobotni yaratishda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcel = () => {
    const url = api.getExportUrl(startDate, endDate, reportType, {
      department_id: filterDepartment || undefined,
      branch_id: filterBranch || undefined,
    });
    window.open(url, "_blank");
  };

  // Calculate summary statistics
  const totalDaysPresent = summaryReport.reduce(
    (sum, r) => sum + r.days_present,
    0,
  );
  const totalLateDays = summaryReport.reduce((sum, r) => sum + r.late_count, 0);
  const totalLateMinutes = summaryReport.reduce(
    (sum, r) => sum + r.total_late_minutes,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hisobotlar</h1>
        <p className="text-gray-500">Hisobot yaratish</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Report type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hisobot turi
            </label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) =>
                  setReportType(e.target.value as "summary" | "detailed")
                }
                className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
              >
                <option value="summary">Umumiy hisobot</option>
                <option value="detailed">Batafsil hisobot</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Boshlanish sanasi
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* End date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tugash sanasi
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Department filter */}
          {reportType === "summary" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bo'lim
              </label>
              <div className="relative">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Hammasi</option>
                  {departments.map((dep) => (
                    <option key={dep._id} value={dep._id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Branch filter */}
          {reportType === "summary" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filial
              </label>
              <div className="relative">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Hammasi</option>
                  {branches.map((br) => (
                    <option key={br._id} value={br._id}>
                      {br.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Generate button */}
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <BarChart3 className="w-5 h-5" />
              Hisobot yaratish
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {reportType === "summary" && summaryReport.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Kelgan kunlar</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalDaysPresent}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Kechikishlar soni</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">
              {totalLateDays}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Jami kechikish (daqiqa)</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {totalLateMinutes}
            </p>
          </div>
        </div>
      )}

      {/* Report table */}
      {(summaryReport.length > 0 || detailedReport.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {reportType === "summary" ? "Umumiy hisobot" : "Batafsil hisobot"}
            </h2>
            <button
              onClick={downloadExcel}
              className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Excel yuklash
            </button>
          </div>

          <div className="overflow-x-auto">
            {reportType === "summary" ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ism
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bo'lim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Smena
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Kelgan kunlar
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Kechikishlar
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Jami kechikish (daq)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {summaryReport.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {row.first_name} {row.last_name}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {row.department_name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {row.shift_name || "-"}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900">
                        {row.days_present}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={
                            row.late_count > 0
                              ? "text-yellow-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {row.late_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={
                            row.total_late_minutes > 0
                              ? "text-red-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {row.total_late_minutes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ism
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sana
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Kelish
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Ketish
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Holat
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Kechikish (daq)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {detailedReport.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {row.first_name} {row.last_name}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format(new Date(row.date), "dd.MM.yyyy")}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900">
                        {row.clock_in || "-"}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900">
                        {row.clock_out || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.status === "late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {row.status === "late" ? "Kechikkan" : "O'z vaqtida"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={
                            row.late_minutes > 0
                              ? "text-red-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {row.late_minutes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading &&
        summaryReport.length === 0 &&
        detailedReport.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Hisobot yaratish
            </h3>
            <p className="text-gray-500">Ma'lumot topilmadi</p>
          </div>
        )}
    </div>
  );
}
