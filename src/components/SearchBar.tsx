import { FiSearch, FiX } from "react-icons/fi";

export type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ value, onChange, placeholder = "Buscar...", className = "" }: SearchBarProps) {
  return (
    <div className={`flex items-center gap-2 bg-white border rounded px-3 py-2 shadow-sm ${className}`}>
      <FiSearch className="text-gray-400 text-lg" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 outline-none bg-transparent text-base"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-gray-400 hover:text-gray-700"
          title="Limpiar"
        >
          <FiX />
        </button>
      )}
    </div>
  );
}
