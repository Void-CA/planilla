import React, { useState, useEffect } from "react";

type FieldType = "text" | "number";
type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  validate?: (value: string) => string | null;
  renderInput?: (value: any, onChange: (v: any) => void) => React.ReactNode;
};

type EntityFormProps<T> = {
  fields: FieldDef[];
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void;
  onCancel: () => void;
};

export function EntityForm<T extends Record<string, any>>({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
}: EntityFormProps<T>) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
  setValues((prev) => {
    if (Object.keys(prev).length === 0) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        const val = initialValues[f.name];
        initial[f.name] = val !== undefined && val !== null ? String(val) : "";
      });
      return initial;
    }
    return prev;
  });
}, [initialValues, fields]);


  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      const v = values[f.name] ?? "";
      if (f.type === "number" && v && isNaN(Number(v))) newErrors[f.name] = `${f.label} must be a number`;
      if (f.validate) {
        const custom = f.validate(v);
        if (custom) newErrors[f.name] = custom;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string) => {
    setValues((old) => ({ ...old, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Parse numbers
    const parsed: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "number") parsed[f.name] = values[f.name] === "" ? null : Number(values[f.name]);
      else parsed[f.name] = values[f.name];
    });
    onSubmit(parsed as T);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="block font-medium mb-1">{f.label}</label>
          {f.renderInput
            ? f.renderInput(values[f.name], (v) => handleChange(f.name, v))
            : (
              <input
                id={f.name}
                type={f.type === "number" ? "text" : f.type}
                value={values[f.name] ?? ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className={`w-full border rounded px-3 py-2 ${errors[f.name] ? "border-red-500" : ""}`}
              />
            )}
          {errors[f.name] && <p className="text-red-600 text-sm mt-1">{errors[f.name]}</p>}
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}
