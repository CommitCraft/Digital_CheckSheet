import React, { useState, useEffect, useCallback } from "react";

import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  RefreshCcw
} from "lucide-react";

import Layout from "../components/Layout/Layout";
import { apiService, endpoints } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";


/* ===============================
   MODAL
================================*/

const StationModal = ({ open, onClose, station, refresh }) => {

  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);


  useEffect(() => {

    if (station) {
      setName(station.name);
      setStatus(station.status);
    } else {
      setName("");
      setStatus("active");
    }

  }, [station, open]);


  const submit = async (e) => {

    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Station name required");
    }

    setLoading(true);

    try {

      if (station) {

        await apiService.put(
          endpoints.stations.update(station.id),
          { name, status }
        );

        toast.success("Station updated");

      } else {

        await apiService.post(
          endpoints.stations.create,
          { name, status }
        );

        toast.success("Station created");
      }

      refresh();
      onClose();

    } catch {

      toast.error("Save failed");

    } finally {
      setLoading(false);
    }
  };


  if (!open) return null;


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg p-6">

        <h2 className="text-lg font-bold mb-4">
          {station ? "Edit Station" : "Add Station"}
        </h2>


        <form onSubmit={submit} className="space-y-4">

          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Station name"
            className="w-full border px-3 py-2 rounded-md dark:bg-gray-700"
          />


          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border px-3 py-2 rounded-md dark:bg-gray-700"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>


          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};



/* ===============================
   MAIN PAGE
================================*/

const StationsPage = () => {

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const perPage = 10;


  /* ===============================
     LOAD
  ================================*/

  const load = useCallback(async () => {

    try {

      setLoading(true);

      const res = await apiService.get(
        endpoints.stations.list,
        {
          params: { search, page, limit: perPage }
        }
      );

      const data = res.data.data || res.data;

      setStations(data.stations || data || []);

      if (data.pagination) {
        setTotal(Math.ceil(data.pagination.total / perPage));
      }

    } catch {

      toast.error("Load failed");
      setStations([]);

    } finally {
      setLoading(false);
    }

  }, [search, page]);


  useEffect(() => {
    load();
  }, [load]);


  /* ===============================
     ACTIONS
  ================================*/

  const toggleStatus = async (station) => {

    const newStatus =
      station.status === "active"
        ? "inactive"
        : "active";

    try {

      await apiService.post(
        endpoints.stations.status(station.id),
        { status: newStatus }
      );

      toast.success("Status updated");
      load();

    } catch {

      toast.error("Status change failed");
    }
  };


  const deleteStation = async (id) => {

    if (!window.confirm("Delete permanently?")) return;

    try {

      await apiService.delete(
        endpoints.stations.delete(id)
      );

      toast.success("Deleted");
      load();

    } catch {

      toast.error("Delete failed");
    }
  };


  /* ===============================
     UI
  ================================*/

  const badge = (s) => {

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs
          ${s === "active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"}
        `}
      >
        {s}
      </span>
    );
  };


  return (
    <Layout>

      <div className="space-y-6">


        {/* Header */}
        <div className="flex justify-between items-center">

          <h1 className="text-3xl font-bold flex gap-2">
            <Settings />
            Stations
          </h1>

          <button
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
            className="px-5 py-2 bg-primary-600 text-white rounded flex gap-2"
          >
            <Plus size={18} />
            Add
          </button>

        </div>


        {/* Search */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border w-full rounded dark:bg-gray-700"
            />

          </div>

        </div>


        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded shadow">

          {loading ? (

            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>

          ) : (

            <>
              <table className="w-full">

                <thead className="bg-gray-100 dark:bg-gray-900">

                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {stations.length === 0 ? (

                    <tr>
                      <td colSpan="4" className="p-6 text-center text-gray-500">
                        No data
                      </td>
                    </tr>

                  ) : (

                    stations.map(s => (

                      <tr
                        key={s.id}
                        className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                      >

                        <td className="p-3 text-center">{s.id}</td>

                        <td className="p-3">{s.name}</td>

                        <td className="p-3 text-center">
                          {badge(s.status)}
                        </td>

                        <td className="p-3 text-right space-x-2">


                          {/* Status */}
                          <button
                            onClick={() => toggleStatus(s)}
                            className="text-yellow-600"
                          >
                            <RefreshCcw size={16} />
                          </button>


                          {/* Edit */}
                          <button
                            onClick={() => {
                              setSelected(s);
                              setOpen(true);
                            }}
                            className="text-blue-600"
                          >
                            <Edit size={16} />
                          </button>


                          {/* Delete */}
                          <button
                            onClick={() => deleteStation(s.id)}
                            className="text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>

                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>


              {/* Pagination */}
              {total > 1 && (

                <div className="flex justify-between p-4 border-t">

                  <span>
                    Page {page} / {total}
                  </span>

                  <div className="space-x-2">

                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft />
                    </button>

                    <button
                      disabled={page === total}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight />
                    </button>

                  </div>

                </div>
              )}

            </>
          )}

        </div>


        {/* Modal */}
        <StationModal
          open={open}
          onClose={() => setOpen(false)}
          station={selected}
          refresh={load}
        />

      </div>

    </Layout>
  );
};

export default StationsPage;