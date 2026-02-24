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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-lg p-6">

        <h2 className="text-xl font-bold mb-4">
          {model ? "Edit Model" : "Add Model"}
        </h2>


        <form onSubmit={submit} className="space-y-4">


          {/* Brand */}
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg dark:bg-gray-700"
          >
            <option value="">Select Brand</option>

            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>


          {/* Name */}
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Model name"
            className="w-full border px-3 py-2 rounded-lg dark:bg-gray-700"
          />


          {/* Status */}
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg dark:bg-gray-700"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>


          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
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
      className={`px-2 py-1 rounded-full text-xs font-medium
        ${s === "active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"}
      `}
    >
      {s}
    </span>
  );


  return (
    <Layout>

      <div className="space-y-6">


        {/* Header */}
        <div className="flex justify-between items-center">

          <h1 className="text-3xl font-bold flex gap-2">
            <Settings />
            Model Master
          </h1>

          <button
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg flex gap-2"
          >
            <Plus size={18} />
            Add Model
          </button>

        </div>


        {/* Search */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search model..."
              className="pl-10 pr-4 py-2 border w-full rounded-lg dark:bg-gray-700"
            />

          </div>

        </div>


        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">


          {loading ? (

            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>

          ) : (

            <>

              <table className="w-full">

                <thead className="bg-gray-100 dark:bg-gray-900">

                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3 text-left">Brand</th>
                    <th className="p-3 text-left">Model</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {models.length === 0 ? (

                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No models found
                      </td>
                    </tr>

                  ) : (

                    models.map(m => (

                      <tr
                        key={m.id}
                        className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                      >

                        <td className="p-3 text-center">{m.id}</td>

                        <td className="p-3">{m.brand_name}</td>

                        <td className="p-3 font-medium">{m.name}</td>

                        <td className="p-3 text-center">
                          {badge(m.status)}
                        </td>

                        <td className="p-3 text-right space-x-2">

                          <button
                            onClick={() => {
                              setSelected(m);
                              setOpen(true);
                            }}
                            className="text-blue-600"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => remove(m.id)}
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