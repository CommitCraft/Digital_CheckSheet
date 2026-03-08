import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { apiService, endpoints } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Clock, Package, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function CreateAuditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [entityType, setEntityType] = useState("line");
  const [entityList, setEntityList] = useState([]);
  const [entityId, setEntityId] = useState("");

  const [reportType, setReportType] = useState("");
  const [slots, setSlots] = useState([]);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);

  const auditor = user?.name || user?.username || "Unknown";

  /* ===============================
     SYSTEM DATE TIME
  ==============================*/

  const getSystemDateTime = () => {
    const now = new Date();

    return {
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
    };
  };

  /* ===============================
     LOAD ENTITIES
  ==============================*/

  const loadEntities = async (type) => {
    try {
      const url =
        type === "line"
          ? endpoints.lines.list
          : type === "station"
            ? endpoints.stations.list
            : endpoints.models.list;

      const res = await apiService.get(url);

      const root = res?.data?.data ?? res?.data ?? {};
      const arr =
        root.items || root.lines || root.stations || root.models || root;

      setEntityList(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load entities");
    }
  };

  /* ===============================
     LOAD AUDIT CONFIG
  ==============================*/

  const loadAuditConfig = async (type, id) => {
    if (!id) return;

    try {
      setLoading(true);

      /* =========================
       TEMPLATE LOAD
    ========================= */

      const templateRes = await apiService.get(endpoints.templates.list, {
        params: { entity_type: type, entity_id: id },
      });

      const templates = templateRes?.data?.data?.templates || [];

      if (!templates.length) {
        setReportType("");
      } else {
        setReportType(templates[0].name);
      }

      /* =========================
       SYSTEM DATE TIME
    ========================= */

      const system = getSystemDateTime();

      setDate(system.date);
      setTime(system.time);

      /* =========================
       LOAD SLOTS
    ========================= */

      const slotRes = await apiService.get(endpoints.inspectionSlots.list);

      const allSlots = slotRes?.data?.data?.slots || [];

      /* =========================
       FILTER ACTIVE SLOTS
    ========================= */

      const activeSlots = allSlots.filter((s) =>
        ["OPEN", "GRACE"].includes(s.runtime_status),
      );

      setSlots(activeSlots);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load audit configuration");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     INITIAL LOAD
  ==============================*/

  useEffect(() => {
    loadEntities(entityType);

    setEntityId("");
    setReportType("");
    setSlots([]);
  }, [entityType]);

  /* ===============================
     NEXT STEP
  ==============================*/

  const handleNext = () => {
    if (!entityId) return toast.error("Select entity first");

    if (!reportType) return toast.error("Template not found");

    navigate("/audits/new/template", {
      state: {
        entityType,
        entityId,
        reportType,
        slots,
        date,
        time,
        auditor,
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER */}

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Start New Audit
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select entity type and entity to initialize audit
          </p>
        </div>

        {/* ENTITY SELECTION */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ENTITY TYPE */}

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <label className="text-xs font-extrabold text-gray-700 dark:text-gray-200">
              Entity Type
            </label>

            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="line">Line</option>
              <option value="station">Station</option>
              <option value="model">Model</option>
            </select>
          </div>

          {/* ENTITY */}

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <label className="text-xs font-extrabold text-gray-700 dark:text-gray-200">
              Select {entityType}
            </label>

            <select
              value={entityId}
              onChange={(e) => {
                const val = e.target.value;

                setEntityId(val);

                loadAuditConfig(entityType, val);
              }}
              className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select {entityType}</option>

              {entityList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || item.model_name || item.title}
                </option>
              ))}
            </select>

            <div className="mt-1 text-xs text-gray-500">
              {entityList.length} entities loaded
            </div>
          </div>
        </div>

        {/* AUDIT INFO */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <InfoCard
            icon={<Package size={14} />}
            label="Report Type"
            value={reportType}
          />

          <InfoCard icon={<User size={14} />} label="Auditor" value={auditor} />

          <InfoCard icon={<Calendar size={14} />} label="Date" value={date} />

          <InfoCard icon={<Clock size={14} />} label="Time" value={time} />
        </div>

        {/* SLOTS */}

        {slots.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs font-extrabold text-gray-700 dark:text-gray-200 mb-2">
              Active Slots
            </div>

            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <span
                  key={s.id}
                  className={`px-3 py-1 text-xs rounded-full
      ${
        s.runtime_status === "OPEN"
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700"
      }`}
                >
                  {s.slot_id} ({s.start_time.slice(0, 5)} -{" "}
                  {s.end_time.slice(0, 5)}) {s.runtime_status}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* NEXT */}

        <div className="flex justify-end">
          <button
            disabled={!reportType || loading}
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-extrabold disabled:opacity-60"
          >
            {loading ? "Loading..." : "Next"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

/* ===============================
   INFO CARD
===============================*/

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
      {icon}
      {label}
    </div>

    <div className="mt-1 font-semibold text-gray-900 dark:text-white">
      {value || "-"}
    </div>
  </div>
);
