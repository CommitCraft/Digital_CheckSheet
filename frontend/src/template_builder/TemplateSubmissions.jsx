import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout/Layout";
import { apiService, endpoints } from "../utils/api";
import { useParams } from "react-router-dom";
import { Database } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

function parseResponseJson(val) {
  if (!val) return null;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

export default function TemplateSubmissions() {

  const { id } = useParams(); // template_id
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get(
        endpoints.submissions.byTemplate(id)
      );
      // API returns a direct array
      const arr = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data ?? []);
      setData(Array.isArray(arr) ? arr : []);
    } catch (err) {
      toast.error("Failed to load submissions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Database />
          <h1 className="text-2xl font-bold">
            Template Submissions
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded shadow">

          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (

            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3">Submitted By</th>
                  <th className="p-3">Response</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>

                {data.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  data.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-3">{s.id}</td>

                      <td className="p-3 text-center">
                        {s.submitted_by || "-"}
                      </td>

                      <td className="p-3">
                        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(
                            parseResponseJson(s.response_json),
                            null,
                            2
                          )}
                        </pre>
                      </td>

                      <td className="p-3 text-center">
                        {new Date(s.created_at).toLocaleString()}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          )}

        </div>

      </div>
    </Layout>
  );
}