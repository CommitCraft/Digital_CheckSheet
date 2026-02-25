import React, { useMemo, useState } from "react";
// import Layout from "../components/Layout/Layout";

/**
 * Template Builder / Form Builder (No external libs)
 * - Left: Field palette (like your screenshot)
 * - Center: Canvas (drop here)
 * - Right: Properties panel
 * - Bottom: JSON export/import
 */

const FIELD_TYPES = [
  { type: "button", label: "Button" },
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "date", label: "Date" },
  { type: "list", label: "List" },
  { type: "datetime", label: "Date Time" },
  { type: "radio", label: "Radio" },
  { type: "temperature", label: "Temperature" },
  { type: "checkbox", label: "Checkbox" },
  { type: "image", label: "Image" },
  { type: "section", label: "Section" },
  { type: "group", label: "Group" }
];

function uid() {
  // reasonably unique for UI
  return "f_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function defaultField(type) {
  const base = {
    id: uid(),
    type,
    key: `${type}_${Math.random().toString(16).slice(2, 6)}`,
    label: type[0].toUpperCase() + type.slice(1),
    required: false,
    helpText: "",
    placeholder: ""
  };

  switch (type) {
    case "button":
      return { ...base, label: "Submit", variant: "primary" };
    case "list":
      return {
        ...base,
        label: "Select",
        options: ["Option 1", "Option 2"],
        defaultValue: ""
      };
    case "radio":
      return {
        ...base,
        label: "Choose one",
        options: ["Yes", "No"],
        defaultValue: ""
      };
    case "checkbox":
      return { ...base, label: "Accept", defaultValue: false };
    case "number":
      return { ...base, min: "", max: "", step: "1", defaultValue: "" };
    case "temperature":
      return { ...base, unit: "°C", min: "", max: "", defaultValue: "" };
    case "image":
      return { ...base, label: "Image", src: "", alt: "" };
    case "section":
      return { ...base, label: "Section Title", description: "" };
    case "group":
      return { ...base, label: "Group", columns: 2 };
    case "date":
    case "datetime":
    case "text":
    default:
      return { ...base, defaultValue: "" };
  }
}

function FieldIcon({ type }) {
  // very light icon style (no deps)
  const map = {
    button: "⭘",
    text: "T",
    number: "123",
    date: "📅",
    list: "▾",
    datetime: "🕘",
    radio: "◉",
    temperature: "🌡️",
    checkbox: "☑",
    image: "🖼️",
    section: "▦",
    group: "▧"
  };
  return (
    <span
      style={{
        display: "inline-flex",
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        background: "#f3f4f6",
        fontWeight: 700,
        fontSize: 12,
        color: "#111827"
      }}
      aria-hidden="true"
    >
      {map[type] ?? "•"}
    </span>
  );
}

function safeParseJson(text) {
  try {
    const v = JSON.parse(text);
    return { ok: true, value: v };
  } catch (e) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

export default function TemplateBuilder() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [jsonBox, setJsonBox] = useState("");
  const selected = useMemo(() => items.find((x) => x.id === selectedId) || null, [items, selectedId]);

  function onDragStartPalette(e, type) {
    e.dataTransfer.setData("application/x-field-type", type);
    e.dataTransfer.effectAllowed = "copy";
  }

  function onDragOverCanvas(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function onDropCanvas(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/x-field-type");
    if (!type) return;
    const newField = defaultField(type);
    setItems((prev) => [...prev, newField]);
    setSelectedId(newField.id);
  }

  function updateSelected(patch) {
    if (!selected) return;
    setItems((prev) => prev.map((x) => (x.id === selected.id ? { ...x, ...patch } : x)));
  }

  function removeSelected() {
    if (!selected) return;
    setItems((prev) => prev.filter((x) => x.id !== selected.id));
    setSelectedId(null);
  }

  function moveSelected(dir) {
    if (!selected) return;
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === selected.id);
      if (idx === -1) return prev;
      const next = [...prev];
      const to = dir === "up" ? idx - 1 : idx + 1;
      if (to < 0 || to >= next.length) return prev;
      const tmp = next[idx];
      next[idx] = next[to];
      next[to] = tmp;
      return next;
    });
  }

  function exportJson() {
    const payload = {
      version: 1,
      createdAt: new Date().toISOString(),
      template: {
        name: "Untitled Template",
        fields: items
      }
    };
    setJsonBox(JSON.stringify(payload, null, 2));
  }

  function importJson() {
    const parsed = safeParseJson(jsonBox);
    if (!parsed.ok) {
      alert("Invalid JSON: " + parsed.error);
      return;
    }
    const fields = parsed.value?.template?.fields;
    if (!Array.isArray(fields)) {
      alert("JSON format mismatch: template.fields array not found");
      return;
    }
    // Basic sanitize: ensure id exists
    const normalized = fields.map((f) => ({
      ...f,
      id: f.id || uid(),
      key: f.key || `${f.type || "field"}_${Math.random().toString(16).slice(2, 6)}`
    }));
    setItems(normalized);
    setSelectedId(normalized[0]?.id ?? null);
  }

  // ---- UI ----
  return (
    // <Layout>
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>Template Builder</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Drag fields from left → drop on canvas → edit properties on right
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btn} onClick={exportJson}>Export JSON</button>
          <button
            style={{ ...styles.btn, background: "#111827", color: "white", borderColor: "#111827" }}
            onClick={() => {
              setItems([]);
              setSelectedId(null);
              setJsonBox("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {/* LEFT: Palette */}
        <aside style={styles.panel}>
          <div style={styles.panelTitle}>
            <span style={{ fontWeight: 800 }}>Basic Fields</span>
          </div>

          <div style={styles.paletteGrid}>
            {FIELD_TYPES.map((f) => (
              <div
                key={f.type}
                draggable
                onDragStart={(e) => onDragStartPalette(e, f.type)}
                style={styles.paletteItem}
                title="Drag to canvas"
              >
                <FieldIcon type={f.type} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{f.label}</div>
              </div>
            ))}
          </div>

          <div style={styles.hintBox}>
            Tip: Canvas par drop karne ke baad right side me label/options edit kar sakte ho.
          </div>
        </aside>

        {/* CENTER: Canvas */}
        <main style={styles.canvasWrap}>
          <div style={styles.canvasTitle}>Canvas</div>

          <div
            style={styles.canvas}
            onDragOver={onDragOverCanvas}
            onDrop={onDropCanvas}
            role="region"
            aria-label="Canvas"
          >
            {items.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>Drop fields here</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Left palette se drag karke yahan drop karo.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((it, idx) => {
                  const active = it.id === selectedId;
                  return (
                    <div
                      key={it.id}
                      onClick={() => setSelectedId(it.id)}
                      style={{
                        ...styles.card,
                        borderColor: active ? "#2563eb" : "#e5e7eb",
                        boxShadow: active ? "0 10px 25px rgba(37,99,235,0.15)" : "0 8px 18px rgba(0,0,0,0.06)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <FieldIcon type={it.type} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                            <div style={{ fontWeight: 800, color: "#111827" }}>{it.label || "(no label)"}</div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{it.type}</div>
                            {it.required && (
                              <span style={styles.badge}>required</span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            key: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{it.key}</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={styles.iconBtn} onClick={(e) => { e.stopPropagation(); moveSelected("up"); }} disabled={idx === 0}>
                            ↑
                          </button>
                          <button style={styles.iconBtn} onClick={(e) => { e.stopPropagation(); moveSelected("down"); }} disabled={idx === items.length - 1}>
                            ↓
                          </button>
                        </div>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <FieldPreview field={it} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* JSON box */}
          <div style={styles.jsonWrap}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontWeight: 800, color: "#111827" }}>Template JSON</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.btn} onClick={importJson}>Import JSON</button>
                <button style={styles.btn} onClick={() => navigator.clipboard?.writeText(jsonBox || "")}>Copy</button>
              </div>
            </div>
            <textarea
              value={jsonBox}
              onChange={(e) => setJsonBox(e.target.value)}
              placeholder="Export JSON to see output here…"
              style={styles.textarea}
            />
          </div>
        </main>

        {/* RIGHT: Properties */}
        <aside style={styles.panel}>
          <div style={styles.panelTitle}>
            <span style={{ fontWeight: 800 }}>Properties</span>
          </div>

          {!selected ? (
            <div style={styles.hintBox}>Canvas se koi field select karo.</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button style={{ ...styles.btn, flex: 1 }} onClick={removeSelected}>
                  Delete
                </button>
                <button
                  style={{ ...styles.btn, flex: 1 }}
                  onClick={() => {
                    // duplicate
                    const clone = { ...selected, id: uid(), key: selected.key + "_copy" };
                    setItems((prev) => {
                      const idx = prev.findIndex((x) => x.id === selected.id);
                      const next = [...prev];
                      next.splice(idx + 1, 0, clone);
                      return next;
                    });
                    setSelectedId(clone.id);
                  }}
                >
                  Duplicate
                </button>
              </div>

              <FieldProperties field={selected} onChange={updateSelected} />
            </>
          )}
        </aside>
      </div>
    </div>
    // </Layout>
  );
}

function FieldPreview({ field }) {
  const common = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    outline: "none"
  };

  const labelRow = (
    <div style={{ marginBottom: 6, display: "flex", gap: 8, alignItems: "baseline" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{field.label}</div>
      {field.required && <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>*</span>}
      {field.helpText ? <div style={{ fontSize: 12, color: "#6b7280" }}>{field.helpText}</div> : null}
    </div>
  );

  switch (field.type) {
    case "section":
      return (
        <div style={{ padding: 14, borderRadius: 14, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>{field.label}</div>
          {field.description ? <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>{field.description}</div> : null}
        </div>
      );

    case "group":
      return (
        <div style={{ padding: 14, borderRadius: 14, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>{field.label}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Group container (columns: {field.columns || 2})
          </div>
        </div>
      );

    case "button":
      return (
        <button
          type="button"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #111827",
            background: field.variant === "primary" ? "#111827" : "white",
            color: field.variant === "primary" ? "white" : "#111827",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          {field.label || "Button"}
        </button>
      );

    case "radio":
      return (
        <div>
          {labelRow}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(field.options || []).map((o, i) => (
              <label key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                <input type="radio" name={field.id} disabled />
                {o}
              </label>
            ))}
          </div>
        </div>
      );

    case "checkbox":
      return (
        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" disabled />
          <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{field.label}</span>
        </label>
      );

    case "list":
      return (
        <div>
          {labelRow}
          <select style={common} disabled>
            <option value="">{field.placeholder || "Select..."}</option>
            {(field.options || []).map((o, i) => (
              <option key={i} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );

    case "image":
      return (
        <div>
          {labelRow}
          <div
            style={{
              height: 140,
              borderRadius: 14,
              border: "1px dashed #d1d5db",
              background: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: 13,
              fontWeight: 700
            }}
          >
            {field.src ? "Image set" : "Image placeholder"}
          </div>
        </div>
      );

    case "date":
    case "datetime":
    case "number":
    case "temperature":
    case "text":
    default: {
      const type =
        field.type === "datetime" ? "datetime-local" : field.type === "temperature" ? "number" : field.type;
      return (
        <div>
          {labelRow}
          <input
            type={type}
            placeholder={field.placeholder || ""}
            style={common}
            disabled
          />
          {field.type === "temperature" ? (
            <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>Unit: {field.unit || "°C"}</div>
          ) : null}
        </div>
      );
    }
  }
}

function FieldProperties({ field, onChange }) {
  const input = (value) => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    background: "white",
    fontSize: 13
  });

  const row = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 };
  const label = { fontSize: 12, color: "#374151", fontWeight: 800 };

  function setOptionsFromText(text) {
    const arr = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({ options: arr });
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ ...row }}>
        <div style={label}>Type</div>
        <div style={{ fontSize: 13, color: "#111827", fontWeight: 800 }}>{field.type}</div>
      </div>

      <div style={row}>
        <div style={label}>Label</div>
        <input style={input()} value={field.label || ""} onChange={(e) => onChange({ label: e.target.value })} />
      </div>

      <div style={row}>
        <div style={label}>Key (API field name)</div>
        <input style={input()} value={field.key || ""} onChange={(e) => onChange({ key: e.target.value })} />
      </div>

      <div style={row}>
        <div style={label}>Help Text</div>
        <input style={input()} value={field.helpText || ""} onChange={(e) => onChange({ helpText: e.target.value })} />
      </div>

      {field.type !== "checkbox" && field.type !== "button" && field.type !== "section" && field.type !== "group" && (
        <div style={row}>
          <div style={label}>Placeholder</div>
          <input style={input()} value={field.placeholder || ""} onChange={(e) => onChange({ placeholder: e.target.value })} />
        </div>
      )}

      <div style={{ ...row, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <input
          type="checkbox"
          checked={!!field.required}
          onChange={(e) => onChange({ required: e.target.checked })}
        />
        <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>Required</div>
      </div>

      {/* Type specific */}
      {field.type === "button" && (
        <div style={row}>
          <div style={label}>Variant</div>
          <select
            style={input()}
            value={field.variant || "primary"}
            onChange={(e) => onChange({ variant: e.target.value })}
          >
            <option value="primary">Primary</option>
            <option value="outline">Outline</option>
          </select>
        </div>
      )}

      {(field.type === "list" || field.type === "radio") && (
        <div style={row}>
          <div style={label}>Options (one per line)</div>
          <textarea
            style={{ ...input(), minHeight: 120, resize: "vertical", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            value={(field.options || []).join("\n")}
            onChange={(e) => setOptionsFromText(e.target.value)}
          />
        </div>
      )}

      {field.type === "number" && (
        <>
          <div style={row}>
            <div style={label}>Min</div>
            <input style={input()} value={field.min ?? ""} onChange={(e) => onChange({ min: e.target.value })} />
          </div>
          <div style={row}>
            <div style={label}>Max</div>
            <input style={input()} value={field.max ?? ""} onChange={(e) => onChange({ max: e.target.value })} />
          </div>
          <div style={row}>
            <div style={label}>Step</div>
            <input style={input()} value={field.step ?? "1"} onChange={(e) => onChange({ step: e.target.value })} />
          </div>
        </>
      )}

      {field.type === "temperature" && (
        <>
          <div style={row}>
            <div style={label}>Unit</div>
            <select style={input()} value={field.unit || "°C"} onChange={(e) => onChange({ unit: e.target.value })}>
              <option value="°C">°C</option>
              <option value="°F">°F</option>
              <option value="K">K</option>
            </select>
          </div>
          <div style={row}>
            <div style={label}>Min</div>
            <input style={input()} value={field.min ?? ""} onChange={(e) => onChange({ min: e.target.value })} />
          </div>
          <div style={row}>
            <div style={label}>Max</div>
            <input style={input()} value={field.max ?? ""} onChange={(e) => onChange({ max: e.target.value })} />
          </div>
        </>
      )}

      {field.type === "image" && (
        <>
          <div style={row}>
            <div style={label}>Image URL (src)</div>
            <input style={input()} value={field.src || ""} onChange={(e) => onChange({ src: e.target.value })} />
          </div>
          <div style={row}>
            <div style={label}>Alt Text</div>
            <input style={input()} value={field.alt || ""} onChange={(e) => onChange({ alt: e.target.value })} />
          </div>
        </>
      )}

      {field.type === "section" && (
        <div style={row}>
          <div style={label}>Description</div>
          <textarea
            style={{ ...input(), minHeight: 90, resize: "vertical" }}
            value={field.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      )}

      {field.type === "group" && (
        <div style={row}>
          <div style={label}>Columns</div>
          <input
            style={input()}
            type="number"
            min="1"
            max="6"
            value={field.columns ?? 2}
            onChange={(e) => onChange({ columns: Number(e.target.value || 2) })}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)",
    padding: 14,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"'
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    background: "rgba(255,255,255,0.85)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    marginBottom: 12,
    backdropFilter: "blur(8px)"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr 340px",
    gap: 12
  },
  panel: {
    borderRadius: 16,
    background: "rgba(255,255,255,0.85)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    overflow: "hidden",
    backdropFilter: "blur(8px)",
    height: "calc(100vh - 110px)"
  },
  panelTitle: {
    padding: "12px 14px",
    borderBottom: "1px solid #e5e7eb",
    background: "rgba(249,250,251,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  paletteGrid: {
    padding: 12,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  },
  paletteItem: {
    border: "1px dashed #d1d5db",
    borderRadius: 14,
    background: "white",
    padding: 10,
    display: "flex",
    gap: 10,
    alignItems: "center",
    cursor: "grab",
    userSelect: "none"
  },
  hintBox: {
    margin: 12,
    padding: 12,
    borderRadius: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 1.4
  },
  canvasWrap: {
    borderRadius: 16,
    background: "rgba(255,255,255,0.85)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    overflow: "hidden",
    backdropFilter: "blur(8px)",
    height: "calc(100vh - 110px)",
    display: "flex",
    flexDirection: "column"
  },
  canvasTitle: {
    padding: "12px 14px",
    borderBottom: "1px solid #e5e7eb",
    background: "rgba(249,250,251,0.8)",
    fontWeight: 800
  },
  canvas: {
    padding: 12,
    overflow: "auto",
    flex: 1
  },
  emptyState: {
    height: 220,
    borderRadius: 16,
    border: "2px dashed #d1d5db",
    background: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 6
  },
  card: {
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "white",
    padding: 12,
    cursor: "pointer"
  },
  badge: {
    fontSize: 11,
    fontWeight: 800,
    color: "#2563eb",
    background: "#dbeafe",
    padding: "2px 8px",
    borderRadius: 999
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 800,
    color: "#111827"
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 900
  },
  jsonWrap: {
    borderTop: "1px solid #e5e7eb",
    padding: 12,
    background: "rgba(249,250,251,0.8)"
  },
  textarea: {
    width: "100%",
    minHeight: 140,
    resize: "vertical",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    padding: 12,
    fontSize: 12,
    outline: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    background: "white"
  }
};