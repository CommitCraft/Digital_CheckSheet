import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { apiService, endpoints } from "../utils/api";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function TemplatesPage() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const res = await apiService.get(endpoints.templates.list);
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const softDelete = async (id) => {
    await apiService.patch(endpoints.templates.softDelete(id));
    toast.success("Soft deleted");
    load();
  };

  return (
    <Layout>
      <div className="space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Templates</h1>
          <button
            onClick={() => navigate("/templates/create")}
            className="bg-primary-600 text-white px-4 py-2 rounded flex gap-2"
          >
            <Plus size={16} />
            Create
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded shadow">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Version</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3 text-center">
                    {t.entity_type} #{t.entity_id}
                  </td>
                  <td className="p-3 text-center">{t.version}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/templates/edit/${t.id}`)}
                      className="text-blue-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => softDelete(t.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
}