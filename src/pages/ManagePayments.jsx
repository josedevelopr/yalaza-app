import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../assets/styles/buy-tickets.css";

export default function ManagePayments() {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      // Consulta que une Pagos con Perfiles, Eventos y Tickets
      const { data, error } = await supabase
        .from("pagos")
        .select(`
          id,
          monto,
          evidencia_url,
          estado,
          created_at,
          perfiles (nombre, apellidos),
          eventos (titulo),
          tickets (qr_code, es_validado)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPagos(data || []);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateEstadoPago = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from("pagos")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;
      fetchPagos();
    } catch (error) {
      alert("Error al actualizar el estado del pago.");
    }
  };

  const pagosFiltrados = pagos.filter(p => 
    p.perfiles?.nombre.toLowerCase().includes(filter.toLowerCase()) ||
    p.eventos?.titulo.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <MainLayout><div className="loading-card">Cargando pagos...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="page" style={{ fontFamily: "system-ui" }}>
        <div className="wrap">
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "400", margin: 0 }}>Validación de Pagos</h1>
              <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>Revisa comprobantes y gestiona la emisión de tickets</p>
            </div>
            <button className="btn ghost" onClick={() => navigate("/dashboard")}>
              Volver al Dashboard
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input 
              type="text" 
              placeholder="Buscar por cliente o evento..." 
              className="input"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="glass-container" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)", textAlign: "left" }}>
                  <th style={{ padding: "15px" }}>Cliente / Evento</th>
                  <th>Monto</th>
                  <th>Comprobante</th>
                  <th>Estado Pago</th>
                  <th>Ticket Relacionado</th>
                  <th style={{ textAlign: "right", paddingRight: "15px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "500" }}>{pago.perfiles?.nombre} {pago.perfiles?.apellidos}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>{pago.eventos?.titulo}</div>
                    </td>
                    <td>S/ {Number(pago.monto).toFixed(2)}</td>
                    <td>
                      <a href={pago.evidencia_url} target="_blank" rel="noreferrer" style={{ color: "#0099ff", textDecoration: "none" }}>
                        Ver imagen ↗
                      </a>
                    </td>
                    <td>
                      <span className={`status-tag ${pago.estado.toLowerCase()}`}>
                        {pago.estado}
                      </span>
                    </td>
                    <td>
                      {pago.tickets && pago.tickets.length > 0 ? (
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#00ff88" }}>ID: {pago.tickets[0].qr_code.substring(0, 8)}...</div>
                          <div style={{ fontSize: "0.65rem", opacity: 0.5 }}>
                            {pago.tickets[0].es_validado ? "⚠️ Ya usado" : "✅ Por usar"}
                          </div>
                        </div>
                      ) : (
                        <span style={{ opacity: 0.3 }}>Sin ticket</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "15px" }}>
                      <select 
                        style={{ background: "rgba(0,0,0,0.3)", color: "#fff", border: "none", padding: "5px", borderRadius: "4px", fontSize: "0.8rem" }}
                        value={pago.estado}
                        onChange={(e) => updateEstadoPago(pago.id, e.target.value)}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="APROBADO">Aprobado</option>
                        <option value="RECHAZADO">Rechazado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          background: #ffff;
          border-radius: 8px;
        }
        .status-tag {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: bold;
        }
        .pendiente { background: rgba(255, 204, 0, 0.1); color: #ffcc00; }
        .aprobado { background: rgba(0, 255, 136, 0.1); color: #00ff88; }
        .rechazado { background: rgba(255, 68, 68, 0.1); color: #ff4444; }
      `}</style>
    </MainLayout>
  );
}