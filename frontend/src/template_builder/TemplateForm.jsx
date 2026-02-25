import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { apiService, endpoints } from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import TemplateBuilder from "../template_builder/TemplateBuilder";

export default function TemplateForm() {

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("line");
  const [entityList, setEntityList] = useState([]);
  const [entityId, setEntityId] = useState("");
  const [schema, setSchema] = useState({});

  /* ===============================
     LOAD ENTITY LIST (LIKE LINES PAGE)
  ================================*/

  const loadEntities = async (type) => {

    try {

      setLoading(true);

      let res;

      if (type === "line") {
        res = await apiService.get(endpoints.lines.list);
      }

      if (type === "station") {
        res = await apiService.get(endpoints.stations.list);
      }

      if (type === "model") {
        res = await apiService.get(endpoints.models.list);
      }

      const data = res.data?.data || res.data;

      setEntityList(data?.lines || data?.stations || data?.models || data || []);

    } catch {

      toast.error("Failed to load data");
      setEntityList([]);

    } finally {
      setLoading(false);
    }
  };


  /* ===============================
     LOAD TEMPLATE (EDIT MODE)
  ================================*/

  const loadTemplate = async () => {

    try {

      setLoading(true);

      const res = await apiService.get(`/templates/${id}`);

      const data = res.data?.data || res.data;

      setName(data.name);
      setEntityType(data.entity_type);
      setEntityId(data.entity_id);

      setSchema(
        typeof data.schema_json === "string"
          ? JSON.parse(data.schema_json)
          : data.schema_json
      );

      await loadEntities(data.entity_type);

    } catch {

      toast.error("Failed to load template");
      navigate("/templates");

    } finally {
      setLoading(false);
    }
  };


  /* ===============================
     INITIAL LOAD
  ================================*/

  useEffect(() => {
    if (isEdit) {
      loadTemplate();
    } else {
      loadEntities(entityType);
    }
  }, []);


  /* ===============================
     ENTITY TYPE CHANGE
  ================================*/

  useEffect(() => {
    if (!isEdit) {
      loadEntities(entityType);
      setEntityId("");
    }
  }, [entityType]);


  /* ===============================
     SUBMIT (LIKE LINES PAGE STYLE)
  ================================*/

  const submit = async () => {

    if (!name.trim() || !entityId) {
      return toast.error("All fields required");
    }

    try {

      setLoading(true);

      const payload = {
        name,
        entity_type: entityType,
        entity_id: entityId,
        schema_json: schema
      };

      if (isEdit) {

        await apiService.put(
          endpoints.templates.update(id),
          payload
        );

        toast.success("Template updated");

      } else {

        await apiService.post(
          endpoints.templates.create,
          payload
        );

        toast.success("Template created");
      }

      navigate("/templates");

    } catch {

      toast.error("Save failed");

    } finally {
      setLoading(false);
    }
  };


  /* ===============================
     UI
  ================================*/

  return (
    <Layout>

      <div className="space-y-6">

        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Template" : "Create Template"}
        </h1>

        <div className="grid grid-cols-3 gap-4">

          <input
            placeholder="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded dark:bg-gray-700"
          />

          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="border px-3 py-2 rounded dark:bg-gray-700"
            disabled={isEdit}
          >
            <option value="line">Line</option>
            <option value="station">Station</option>
            <option value="model">Model</option>
          </select>

          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="border px-3 py-2 rounded dark:bg-gray-700"
            disabled={loading}
          >
            <option value="">Select {entityType}</option>

            {entityList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}

          </select>

        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <TemplateBuilder
            initialSchema={schema}
            onChange={setSchema}
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Template"}
        </button>

      </div>

    </Layout>
  );
}