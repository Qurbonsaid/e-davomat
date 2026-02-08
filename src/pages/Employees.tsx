import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Employee, Department, Branch, Position, Shift } from "../types";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  X,
  ChevronDown,
} from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    deviceId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    branch: string;
    department: string;
    position: string;
    shift: string;
    status: "active" | "inactive" | "terminated";
  }>({
    deviceId: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    branch: "",
    department: "",
    position: "",
    shift: "",
    status: "active" as const,
  });

  useEffect(() => {
    loadData();
  }, [searchTerm, filterDepartment]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [employeesData, depsData, branchesData, positionsData, shiftsData] =
        await Promise.all([
          api.getEmployees({
            search: searchTerm || undefined,
            department_id: filterDepartment || undefined,
          }),
          api.getDepartments(),
          api.getBranches(),
          api.getPositions(),
          api.getShifts(),
        ]);
      setEmployees(employeesData);
      setDepartments(depsData);
      setBranches(branchesData);
      setPositions(positionsData);
      setShifts(shiftsData);
    } catch (error) {
      console.error("Xodimlarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      deviceId: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      branch: branches[0]?._id || "",
      department: departments[0]?._id || "",
      position: positions[0]?._id || "",
      shift: shifts[0]?._id || "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      deviceId: employee.deviceId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone || "",
      email: employee.email || "",
      branch: employee.branch?._id || "",
      department: employee.department?._id || "",
      position: employee.position?._id || "",
      shift: employee.shift?._id || "",
      status: employee.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.updateEmployee(editingEmployee._id, {
          deviceId: formData.deviceId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          branch: formData.branch,
          department: formData.department,
          position: formData.position,
          shift: formData.shift,
          status: formData.status,
        } as unknown as Partial<Employee>);
      } else {
        await api.createEmployee({
          deviceId: formData.deviceId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          branch: formData.branch,
          department: formData.department,
          position: formData.position,
          shift: formData.shift,
          status: formData.status,
        } as unknown as Partial<Employee>);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Xodimni saqlashda xatolik:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteEmployee(id);
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error("Xodimni o'chirishda xatolik:", error);
    }
  };

  const statusLabels: Record<string, string> = {
    active: "Faol",
    inactive: "Nofaol",
    terminated: "Bo'shatilgan",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xodimlar</h1>
          <p className="text-gray-500">Xodimlar ro'yxati</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Xodim qo'shish
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="appearance-none w-full sm:w-48 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Barcha bo'limlar</option>
              {departments.map((dep) => (
                <option key={dep._id} value={dep._id}>
                  {dep.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Employee list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ism
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qurilma ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bo'lim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lavozim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Smena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-10 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/employees/${employee._id}`}
                        className="flex items-center gap-3 hover:text-primary-600"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {employee.photoUrl ? (
                            <img
                              src={employee.photoUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          {employee.phone && (
                            <p className="text-sm text-gray-500">
                              {employee.phone}
                            </p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {employee.deviceId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {employee.department?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {employee.position?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {employee.shift?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === "active"
                            ? "bg-green-100 text-green-700"
                            : employee.status === "inactive"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {statusLabels[employee.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(employee)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(employee._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowModal(false)}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEmployee ? "Xodimni tahrirlash" : "Xodim qo'shish"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ism *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Familiya *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qurilma ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.deviceId}
                    onChange={(e) =>
                      setFormData({ ...formData, deviceId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono"
                    placeholder="masalan, 12345"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filial
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) =>
                        setFormData({ ...formData, branch: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bo'lim
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      {departments.map((dep) => (
                        <option key={dep._id} value={dep._id}>
                          {dep.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lavozim
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      {positions.map((pos) => (
                        <option key={pos._id} value={pos._id}>
                          {pos.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Smena
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) =>
                        setFormData({ ...formData, shift: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      {shifts.map((shift) => (
                        <option key={shift._id} value={shift._id}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Holat
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "active"
                          | "inactive"
                          | "terminated",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                    <option value="terminated">Bo'shatilgan</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setDeleteConfirm(null)}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                O'chirishni tasdiqlaysizmi?
              </h3>
              <p className="text-gray-500 mb-6">Bu amal qaytarib bo'lmaydi.</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
