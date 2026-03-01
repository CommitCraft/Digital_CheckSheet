import React, { useState, useMemo, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { FileDown, LucideArrowBigDown, RefreshCcw } from "lucide-react";

const ManageReportsPage = () => {
  // ---------------- STATE ----------------
  const [search, setSearch] = useState("");
  const [line, setLine] = useState("");
  const [station, setStation] = useState("");
  const [model, setModel] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const itemsPerPage = 10;

  // ---------------- DATA ----------------
 const linesList = ["Line 1", "Line 2", "Line 3"];
const stationsList = ["Station A", "Station B", "Station C"];
const modelsList = ["Model X", "Model Y", "Model Z"];
const slotsList = ["Morning", "Evening", "Night"];
const usersList = ["Rajnish", "Amit", "Sonal", "Ravi", "Neha"];
const statusList = ["completed", "pending", "missed", "upcoming"];

const reports = Array.from({ length: 50 }, (_, i) => {
  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  return {
    id: `RPT-${String(i + 1).padStart(3, "0")}`,
    date: `2026-03-${String((i % 28) + 1).padStart(2, "0")}T0${i % 9}:00`,
    line: random(linesList),
    station: random(stationsList),
    model: random(modelsList),
    slot: random(slotsList),
    submittedBy: random(usersList),
    status: random(statusList),
  };
});

  // ---------------- DROPDOWNS ----------------
  const lines = [...new Set(reports.map((r) => r.line))];
  const stations = [...new Set(reports.filter((r) => !line || r.line === line).map((r) => r.station))];
  const models = [...new Set(
    reports
      .filter((r) => (!line || r.line === line) && (!station || r.station === station))
      .map((r) => r.model)
  )];

  // ---------------- FILTER ----------------
  const filtered = useMemo(() => {
    return reports.filter(
      (r) =>
        (search === "" || r.id.toLowerCase().includes(search.toLowerCase())) &&
        (!line || r.line === line) &&
        (!station || r.station === station) &&
        (!model || r.model === model) &&
        (!fromDate || new Date(r.date) >= new Date(fromDate)) &&
        (!toDate || new Date(r.date) <= new Date(toDate))
    );
  }, [search, line, station, model, fromDate, toDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, line, station, model, fromDate, toDate]);

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearch("");
    setLine("");
    setStation("");
    setModel("");
    setFromDate("");
    setToDate("");
  };

  // ---------------- EXPORT ----------------
  const handleExport = () => {
    if (!exportFrom || !exportTo) {
      alert("Please select From and To date & time");
      return;
    }

    const exportData = filtered.filter((r) => {
      const d = new Date(r.date);
      return d >= new Date(exportFrom) && d <= new Date(exportTo);
    });

    const headers = [
      "Ref","Date","Line","Station","Model",
      "Slot","Submitted By","Status"
    ];

    const rows = exportData.map((r) => [
      r.id,
      r.date,
      r.line,
      r.station,
      r.model,
      r.slot,
      r.submittedBy,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "manufacturing_reports_export.csv";
    link.click();

    setShowExportModal(false);
  };

  // ---------------- UI ----------------
  return (
    <Layout>
      <div className="min-h-screen p-6 space-y-6 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200 transition-colors duration-300">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
            <LucideArrowBigDown className="h-8 w-8 text-blue-600" />
            Manage Report
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage Report Log
          </p>
        </div>

        {/* KPI */}
        <div className="grid md:grid-cols-4 gap-4">
          <KPI title="Total" value={filtered.length} />
          <KPI title="Completed" value={filtered.filter(r=>r.status==="completed").length} color="green" />
          <KPI title="Pending" value={filtered.filter(r=>r.status==="pending").length} color="yellow" />
          <KPI title="Missed" value={filtered.filter(r=>r.status==="missed").length} color="red" />
        </div>

        {/* FILTER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 grid md:grid-cols-8 gap-4 shadow-sm dark:shadow-inner">

          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Ref..." />

          <Select value={line} onChange={e=>{setLine(e.target.value); setStation(""); setModel("");}}>
            <option value="">All Lines</option>
            {lines.map(l=><option key={l}>{l}</option>)}
          </Select>

          <Select value={station} onChange={e=>{setStation(e.target.value); setModel("");}}>
            <option value="">All Stations</option>
            {stations.map(s=><option key={s}>{s}</option>)}
          </Select>

          <Select value={model} onChange={e=>setModel(e.target.value)}>
            <option value="">All Models</option>
            {models.map(m=><option key={m}>{m}</option>)}
          </Select>

          <Input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
          <Input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />

          <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">
            <RefreshCcw size={16}/> Reset
          </button>

          <button onClick={()=>setShowExportModal(true)} className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white">
            <FileDown size={16}/> Export
          </button>
        </div>

        {/* TABLE */}
        <Table
          paginated={paginated}
          onView={(report)=>{
            setSelectedReport(report);
            setShowViewModal(true);
          }}
        />

        {/* PAGINATION */}
        <div className="flex justify-center gap-3">
          {Array.from({length: totalPages}, (_,i)=>(
            <button
              key={i}
              onClick={()=>setCurrentPage(i+1)}
              className={`px-3 py-1 rounded transition ${
                currentPage===i+1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {i+1}
            </button>
          ))}
        </div>

        {/* EXPORT MODAL */}
        {showExportModal && (
          <ExportModal
            exportFrom={exportFrom}
            exportTo={exportTo}
            setExportFrom={setExportFrom}
            setExportTo={setExportTo}
            onCancel={()=>setShowExportModal(false)}
            onConfirm={handleExport}
          />
        )}

        {/* VIEW MODAL */}
        {showViewModal && (
          <ViewSubmissionModal
            report={selectedReport}
            onClose={()=>{
              setShowViewModal(false);
              setSelectedReport(null);
            }}
          />
        )}

      </div>
    </Layout>
  );
};

export default ManageReportsPage;

/* ---------- COMPONENTS ---------- */

const Input = ({ type="text", ...props }) => (
  <input
    type={type}
    {...props}
    className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition"
  >
    {children}
  </select>
);

const Table = ({ paginated, onView }) => (
  <div className="overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-lg">
    <table className="min-w-full text-sm text-gray-900 dark:text-gray-200">
      <thead className="bg-gray-100 dark:bg-gray-800">
        <tr>
          {["Ref","Date","Line","Station","Model","Slot","Submitted By","Status","View"].map(h=>(
            <th key={h} className="px-4 py-3 text-left">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {paginated.map(r=>(
          <tr key={r.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <td className="px-4 py-3">{r.id}</td>
            <td className="px-4 py-3">{r.date}</td>
            <td className="px-4 py-3">{r.line}</td>
            <td className="px-4 py-3">{r.station}</td>
            <td className="px-4 py-3">{r.model}</td>
            <td className="px-4 py-3">{r.slot}</td>
            <td className="px-4 py-3">{r.submittedBy}</td>
            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3">
              <button
                onClick={()=>onView(r)}
                className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500 dark:text-black",
    missed: "bg-red-100 text-red-700 dark:bg-red-600 dark:text-white animate-pulse",
    upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
  };
  return <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${styles[status]}`}>{status}</span>;
};

const KPI = ({title,value,color}) => (
  <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-lg">
    <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    <div className={`text-2xl font-bold mt-1 ${
      color==="green"
        ? "text-green-600 dark:text-green-400"
        : color==="yellow"
        ? "text-yellow-600 dark:text-yellow-400"
        : color==="red"
        ? "text-red-600 dark:text-red-400 animate-pulse"
        : "text-blue-600 dark:text-blue-400"
    }`}>
      {value}
    </div>
  </div>
);

const ExportModal = ({exportFrom, exportTo, setExportFrom, setExportTo, onCancel, onConfirm}) => (
  <div className="fixed inset-0 bg-black/40 dark:bg-black/70 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-xl w-96 shadow-xl text-gray-900 dark:text-gray-200">
      <h2 className="text-lg font-bold mb-4 uppercase">Export Report</h2>
      <input type="datetime-local" value={exportFrom} onChange={e=>setExportFrom(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
      <input type="datetime-local" value={exportTo} onChange={e=>setExportTo(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded bg-green-600 text-white">Confirm Export</button>
      </div>
    </div>
  </div>
);

const ViewSubmissionModal = ({ report, onClose }) => {
  if (!report) return null;
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-xl w-[500px] shadow-xl text-gray-900 dark:text-gray-200">
        <h2 className="text-xl font-bold mb-4">Submission Details</h2>
        <div className="space-y-2 text-sm">
          {Object.entries(report).map(([key,value])=>(
            <div key={key} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium capitalize">{key}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};