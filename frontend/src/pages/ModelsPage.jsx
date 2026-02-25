import React, { useState, useEffect, useCallback } from "react";

import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";

import Layout from "../components/Layout/Layout";
import { apiService, endpoints } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";


/* ===============================
   MODAL
================================*/

const ModelModal = ({ open, onClose, model, brands, refresh }) => {

  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);


  useEffect(() => {

    if (model) {
      setName(model.name);
      setBrandId(model.brand_id);
      setStatus(model.status);
    } else {
      setName("");
      setBrandId("");
      setStatus("active");
    }

  }, [model, open]);


  const submit = async (e) => {

    e.preventDefault();

    if (!name.trim() || !brandId) {
      return toast.error("Brand & Model required");
    }

    setLoading(true);

    try {

      if (model) {

        await apiService.put(
          endpoints.models.update(model.id),
          { name, brand_id: brandId, status }
        );

        toast.success("Model updated");

      } else {

        await apiService.post(
          endpoints.models.create,
          { name, brand_id: brandId, status }
        );

        toast.success("Model created");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {model ? "Edit Model" : "Add Model"}
          </h2>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Brand
            </label>
            <select
              value={brandId}
              onChange={e => setBrandId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Brand</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter model name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

const ModelsPage = () => {

  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);

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

      const [modelRes, brandRes] = await Promise.all([

        apiService.get(
          endpoints.models.list,
          { params: { search, page, limit: perPage } }
        ),

        apiService.get(endpoints.brands.list)
      ]);


      const data = modelRes.data.data || modelRes.data;

      setModels(data.models || data || []);
      setBrands(brandRes.data.data || []);

      if (data.pagination) {
        setTotal(Math.ceil(data.pagination.total / perPage));
      }

    } catch {

      toast.error("Load failed");
      setModels([]);

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

  const remove = async (id) => {

    if (!window.confirm("Delete model permanently?")) return;

    try {

      await apiService.delete(
        endpoints.models.delete(id)
      );

      toast.success("Deleted");
      load();

    } catch {

      toast.error("Delete failed");
    }
  };


  const badge = (s) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        s === 'active'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );


  return (
    <Layout>

      <div className="space-y-6">


        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="h-7 w-7 text-primary-600" />
              Model Master
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage product models</p>
          </div>

          <button
            onClick={() => { setSelected(null); setOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus size={16} />
            Add Model
          </button>
        </div>


        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search models..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>


        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">


          {loading ? (

            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>

          ) : (

            <>

              <table className="w-full">

                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {models.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <Settings className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium">No models found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    models.map(m => (
                      <tr
                        key={m.id}
                        className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400 font-mono">{m.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{m.brand_name}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{m.name}</td>
                        <td className="px-4 py-3 text-center">{badge(m.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelected(m); setOpen(true); }}
                              title="Edit"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => remove(m.id)}
                              title="Delete"
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}

                </tbody>

              </table>


              {/* Pagination */}
              {total > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      disabled={page === total}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </>
          )}

        </div>


        {/* Modal */}
        <ModelModal
          open={open}
          onClose={() => setOpen(false)}
          model={selected}
          brands={brands}
          refresh={load}
        />

      </div>

    </Layout>
  );
};

export default ModelsPage;