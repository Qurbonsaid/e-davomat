import { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Shift,
  Branch,
  Department,
  Position,
  AuthorizedDevice,
} from "../types";
import {
  Building2,
  Clock,
  Users,
  Briefcase,
  Fingerprint,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

type SettingsTab =
  | "shifts"
  | "branches"
  | "departments"
  | "positions"
  | "devices";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("shifts");

  const tabs = [
    { id: "shifts" as const, label: "Smenalar", icon: Clock },
    { id: "branches" as const, label: "Filiallar", icon: Building2 },
    { id: "departments" as const, label: "Bo'limlar", icon: Users },
    { id: "positions" as const, label: "Lavozimlar", icon: Briefcase },
    { id: "devices" as const, label: "Qurilmalar", icon: Fingerprint },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "shifts" && <ShiftsSettings />}
          {activeTab === "branches" && <BranchesSettings />}
          {activeTab === "departments" && <DepartmentsSettings />}
          {activeTab === "positions" && <PositionsSettings />}
          {activeTab === "devices" && <DevicesSettings />}
        </div>
      </div>
    </div>
  );
}

// Shifts Settings
function ShiftsSettings() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "18:00",
    gracePeriodMinutes: 15,
  });

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const data = await api.getShifts();
      setShifts(data);
    } catch (error) {
      console.error("Smenalarni yuklashda xatolik:", error);
    }
  };

  const openModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        gracePeriodMinutes: shift.gracePeriodMinutes,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: "",
        startTime: "09:00",
        endTime: "18:00",
        gracePeriodMinutes: 15,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShift) {
        await api.updateShift(editingShift._id, formData);
      } else {
        await api.createShift(formData);
      }
      setIsModalOpen(false);
      loadShifts();
    } catch (error) {
      console.error("Smenani saqlashda xatolik:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("O'chirishni tasdiqlaysizmi?")) {
      try {
        await api.deleteShift(id);
        loadShifts();
      } catch (error) {
        console.error("Smenani o'chirishda xatolik:", error);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Smenalar</h3>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Qo'shish
        </button>
      </div>

      <div className="space-y-2">
        {shifts.map((shift) => (
          <div
            key={shift._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">{shift.name}</p>
              <p className="text-sm text-gray-500">
                {shift.startTime} - {shift.endTime} • Kechikish:{" "}
                {shift.gracePeriodMinutes} daq
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal(shift)}
                className="p-2 text-gray-500 hover:text-primary-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(shift._id)}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingShift ? "Tahrirlash" : "Qo'shish"} — smenalar
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Boshlanish vaqti
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tugash vaqti
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kechikish chegarasi (daq)
                </label>
                <input
                  type="number"
                  value={formData.gracePeriodMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gracePeriodMinutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Branches Settings
function BranchesSettings() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "" });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await api.getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Filiallarni yuklashda xatolik:", error);
    }
  };

  const openModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({ name: branch.name, address: branch.address || "" });
    } else {
      setEditingBranch(null);
      setFormData({ name: "", address: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch._id, formData);
      } else {
        await api.createBranch(formData);
      }
      setIsModalOpen(false);
      loadBranches();
    } catch (error) {
      console.error("Filialni saqlashda xatolik:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("O'chirishni tasdiqlaysizmi?")) {
      try {
        await api.deleteBranch(id);
        loadBranches();
      } catch (error) {
        console.error("Filialni o'chirishda xatolik:", error);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filiallar</h3>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Qo'shish
        </button>
      </div>

      <div className="space-y-2">
        {branches.map((branch) => (
          <div
            key={branch._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">{branch.name}</p>
              {branch.address && (
                <p className="text-sm text-gray-500">{branch.address}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal(branch)}
                className="p-2 text-gray-500 hover:text-primary-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(branch._id)}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingBranch ? "Tahrirlash" : "Qo'shish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manzil
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Departments Settings
function DepartmentsSettings() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDep, setEditingDep] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "", branch_id: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [depsData, branchesData] = await Promise.all([
        api.getDepartments(),
        api.getBranches(),
      ]);
      setDepartments(depsData);
      setBranches(branchesData);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    }
  };

  const openModal = (dep?: Department) => {
    if (dep) {
      setEditingDep(dep);
      setFormData({ name: dep.name, branch_id: dep.branch_id || "" });
    } else {
      setEditingDep(null);
      setFormData({ name: "", branch_id: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDep) {
        await api.updateDepartment(editingDep._id, formData);
      } else {
        await api.createDepartment(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Bo'limni saqlashda xatolik:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("O'chirishni tasdiqlaysizmi?")) {
      try {
        await api.deleteDepartment(id);
        loadData();
      } catch (error) {
        console.error("Bo'limni o'chirishda xatolik:", error);
      }
    }
  };

  const getBranchName = (branchId?: string) => {
    const branch = branches.find((b) => b._id === branchId);
    return branch?.name || "-";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bo'limlar</h3>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Qo'shish
        </button>
      </div>

      <div className="space-y-2">
        {departments.map((dep) => (
          <div
            key={dep._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">{dep.name}</p>
              <p className="text-sm text-gray-500">
                {getBranchName(dep.branch_id)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal(dep)}
                className="p-2 text-gray-500 hover:text-primary-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(dep._id)}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingDep ? "Tahrirlash" : "Qo'shish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filial
                </label>
                <select
                  value={formData.branch_id}
                  onChange={(e) =>
                    setFormData({ ...formData, branch_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="">-</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Positions Settings
function PositionsSettings() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const data = await api.getPositions();
      setPositions(data);
    } catch (error) {
      console.error("Lavozimlarni yuklashda xatolik:", error);
    }
  };

  const openModal = (pos?: Position) => {
    if (pos) {
      setEditingPos(pos);
      setFormData({ name: pos.name });
    } else {
      setEditingPos(null);
      setFormData({ name: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPos) {
        await api.updatePosition(editingPos._id, formData);
      } else {
        await api.createPosition(formData);
      }
      setIsModalOpen(false);
      loadPositions();
    } catch (error) {
      console.error("Lavozimni saqlashda xatolik:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("O'chirishni tasdiqlaysizmi?")) {
      try {
        await api.deletePosition(id);
        loadPositions();
      } catch (error) {
        console.error("Lavozimni o'chirishda xatolik:", error);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lavozimlar</h3>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Qo'shish
        </button>
      </div>

      <div className="space-y-2">
        {positions.map((pos) => (
          <div
            key={pos._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <p className="font-medium text-gray-900">{pos.name}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal(pos)}
                className="p-2 text-gray-500 hover:text-primary-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(pos._id)}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingPos ? "Tahrirlash" : "Qo'shish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Devices Settings
function DevicesSettings() {
  const [devices, setDevices] = useState<AuthorizedDevice[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<AuthorizedDevice | null>(
    null,
  );
  const [formData, setFormData] = useState({
    serialNumber: "",
    name: "",
    ipAddress: "",
    branch: "",
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devicesData, branchesData] = await Promise.all([
        api.getDevices(),
        api.getBranches(),
      ]);
      setDevices(devicesData);
      setBranches(branchesData);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    }
  };

  const openModal = (device?: AuthorizedDevice) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        serialNumber: device.serialNumber,
        name: device.name || "",
        ipAddress: device.ipAddress || "",
        branch: device.branch || "",
        isActive: device.isActive,
      });
    } else {
      setEditingDevice(null);
      setFormData({
        serialNumber: "",
        name: "",
        ipAddress: "",
        branch: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDevice) {
        await api.updateDevice(editingDevice._id, formData);
      } else {
        await api.createDevice(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Qurilmani saqlashda xatolik:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("O'chirishni tasdiqlaysizmi?")) {
      try {
        await api.deleteDevice(id);
        loadData();
      } catch (error) {
        console.error("Qurilmani o'chirishda xatolik:", error);
      }
    }
  };

  const getBranchName = (branchId?: string) => {
    const branch = branches.find((b) => b._id === branchId);
    return branch?.name || "-";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Qurilmalar</h3>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Qo'shish
        </button>
      </div>

      <div className="space-y-2">
        {devices.map((device) => (
          <div
            key={device._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${device.isActive ? "bg-green-500" : "bg-gray-400"}`}
              />
              <div>
                <p className="font-medium text-gray-900">
                  {device.name || device.serialNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {device.ipAddress || "IP yo'q"} • {getBranchName(device.branch)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal(device)}
                className="p-2 text-gray-500 hover:text-primary-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(device._id)}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingDevice ? "Tahrirlash" : "Qo'shish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qurilma seriya raqami
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qurilma nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP manzil
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, ipAddress: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filial
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="">-</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Faol
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
