
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Navbar } from "./components/Navbar";
import { PayrollList } from "./pages/PayrollList";
import { PayrollPage } from "./pages/PayrollPage";
import { PayrollDetail } from "./pages/PayrollDetail"
import { WorkersPage } from "./pages/WorkersPage";
import { AreasPage } from "./pages/AreasPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <main className="flex-grow max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/planilla" replace />} />
            <Route path="/trabajadores" element={<WorkersPage />} />
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/planilla" element={<PayrollList />} />
            <Route path="/planilla/new" element={<PayrollPage />} />
            <Route path="/planilla/:id" element={<PayrollDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
