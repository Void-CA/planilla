

import { useState, useRef, useEffect } from "react";
import { FiPlus, FiChevronDown } from "react-icons/fi";


type SelectBoxProps<T> = {

  options: T[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};


export function SelectBox<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  label,
  placeholder = "Select...",
  disabled = false,
  onCreateNew,
}: SelectBoxProps<T> & { onCreateNew?: () => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Filtrar opciones según búsqueda
  const filtered = options.filter(option =>
    getOptionLabel(option).toLowerCase().includes(search.toLowerCase())
  );
  // const selectedLabel = value ? getOptionLabel(options.find(option => getOptionValue(option) === value)!) : "";

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={boxRef} className="relative">
      {label && <label className="block font-medium mb-1">{label}</label>}
      <button
        type="button"
        className={`w-full border rounded px-3 py-2 flex items-center justify-between bg-white text-left ${disabled ? "opacity-60" : ""}`}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        tabIndex={0}
      >
        <span className={value ? "" : "text-gray-400"}>
          {value ? getOptionLabel(options.find(option => getOptionValue(option) === value)!) : placeholder}
        </span>
        <FiChevronDown className="ml-2" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto animate-fade-in">
          <div className="p-2">
            <input
              ref={inputRef}
              className="w-full border px-2 py-1 rounded focus:outline-none focus:ring"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul>
            {filtered.length === 0 && (
              <li className="px-4 py-2 text-gray-400">Sin resultados</li>
            )}
            {filtered.map(option => (
              <li
                key={getOptionValue(option)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${getOptionValue(option) === value ? "bg-blue-50 font-semibold" : ""}`}
                onClick={() => {
                  onChange(getOptionValue(option));
                  setOpen(false);
                  setSearch("");
                }}
              >
                {getOptionLabel(option)}
              </li>
            ))}
            {onCreateNew && (
              <li
                className="px-4 py-2 cursor-pointer text-blue-700 hover:bg-blue-50 flex items-center gap-2 border-t mt-1"
                onClick={() => {
                  setOpen(false);
                  setSearch("");
                  onCreateNew();
                }}
              >
                <FiPlus /> Crear nuevo...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}