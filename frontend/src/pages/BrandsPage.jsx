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

const BrandModal = ({ open, onClose, brand, refresh }) => {

  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);


  useEffect(() => {

    if (brand) {
      setName(brand.name);
      setStatus(brand.status);
    } else {
      setName("");
      setStatus("active");
    }

  }, [brand, open]);


  const submit = async (e) => {

    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Brand name required");
    }

    setLoading(true);

    try {

      if (brand) {

        await apiService.put(
          endpoints.brands.update(brand.id),
          { name, status }
        );

        toast.success("Brand updated");

      } else {

        await apiService.post(
          endpoints.brands.create,
          { name, status }
        );

        toast.success("Brand created");
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
          {brand ? "Edit Brand" : "Add Brand"}
        </h2>


        <form onSubmit={submit} className="space-y-4">


          {/* Name */}
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Brand name"
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

const BrandsPage = () => {

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

      const res = await apiService.get(
        endpoints.brands.list,
        {
          params: { search, page, limit: perPage }
        }
      );

      const data = res.data.data || res.data;

      setBrands(data.brands || data || []);

      if (data.pagination) {
        setTotal(Math.ceil(data.pagination.total / perPage));
      }

    } catch {

      toast.error("Load failed");
      setBrands([]);

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

    if (!window.confirm("Delete brand permanently?")) return;

    try {

      await apiService.delete(
        endpoints.brands.delete(id)
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
            Brand Master
          </h1>

          <button
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg flex gap-2"
          >
            <Plus size={18} />
            Add Brand
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
              placeholder="Search brand..."
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
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {brands.length === 0 ? (

                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                        No brands found
                      </td>
                    </tr>

                  ) : (

                    brands.map(b => (

                      <tr
                        key={b.id}
                        className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                      >

                        <td className="p-3 text-center">{b.id}</td>

                        <td className="p-3 font-medium">{b.name}</td>

                        <td className="p-3 text-center">
                          {badge(b.status)}
                        </td>

                        <td className="p-3 text-right space-x-2">

                          <button
                            onClick={() => {
                              setSelected(b);
                              setOpen(true);
                            }}
                            className="text-blue-600"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => remove(b.id)}
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
        <BrandModal
          open={open}
          onClose={() => setOpen(false)}
          brand={selected}
          refresh={load}
        />

      </div>

    </Layout>
  );
};

export default BrandsPage;