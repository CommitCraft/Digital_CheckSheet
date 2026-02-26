// src/pages/TemplatesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout/Layout";
import { apiService, endpoints } from "../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeTemplates = (res) => {
    // possible shapes:
    // {success, data:{templates:[...]}} OR {data:{templates:[...]}} OR direct array
    const root = res?.data?.data ?? res?.data ?? {};
    const arr = root.templates || root.items || root.data || root;
    return Array.isArray(arr) ? arr : [];
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get(endpoints.templates.list);
      setTemplates(normalizeTemplates(res));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete template "${t.name}"?`)) return;
    try {
      await apiService.delete(endpoints.templates.softDelete(t.id));
      toast.success("Template deleted");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete template");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
          <button
            onClick={() => navigate("/templates/create")}
            className="px-5 py-2 rounded-lg bg-primary-600 text-white font-semibold"
          >
            Create
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">No templates found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Entity</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-3 text-gray-900 dark:text-white">{t.name}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {t.entity_type} #{t.entity_id}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/templates/edit/${t.id}`)}
                        className="px-3 py-1 rounded border dark:border-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/templates/${t.id}/submissions`)}
                        className="px-3 py-1 rounded border dark:border-gray-700"
                      >
                        Submissions
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="px-3 py-1 rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}