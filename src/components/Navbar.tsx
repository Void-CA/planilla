
import React, { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiChevronDown, FiDatabase } from "react-icons/fi";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cerrar el menú si se hace clic fuera
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
        <div className="text-2xl font-extrabold tracking-wide flex items-center gap-2 select-none">
          PlanillaApp
        </div>
        <div className="flex items-center gap-8 relative">
          {/* Botón de menú de datos */}
          <NavLink
            to="/planilla"
            className={({ isActive }) =>
              `px-6 py-2 rounded-lg text-lg font-bold transition shadow ${isActive ? "bg-white text-blue-700" : "bg-blue-900 hover:bg-blue-800 text-white"}`
            }
          >
            Planilla
          </NavLink>
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-800 transition text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <FiDatabase className="text-2xl" />
              Datos
              <FiChevronDown className={`ml-1 transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
            </button>
            {open && (
              <div className="absolute left-0 mt-2 w-48 bg-white text-blue-900 rounded-lg shadow-lg border border-blue-100 z-50 animate-fade-in">
                <button
                  className="w-full text-left px-6 py-3 hover:bg-blue-50 hover:text-blue-700 transition text-base font-medium rounded-t-lg"
                  onClick={() => { setOpen(false); navigate("/areas"); }}
                >
                  Áreas
                </button>
                <button
                  className="w-full text-left px-6 py-3 hover:bg-blue-50 hover:text-blue-700 transition text-base font-medium rounded-b-lg"
                  onClick={() => { setOpen(false); navigate("/trabajadores"); }}
                >
                  Trabajadores
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}
