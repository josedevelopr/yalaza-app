import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../assets/styles/buy-tickets.css";

export default function ManageEvents() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      // Consulta que incluye el nombre del organizador desde la tabla perfiles
      const { data, error } = await supabase
        .from("eventos")
        .select(`
          id,
          titulo,
          tipo,
          estado,
          precio,
          fecha_evento,
          max_aforo,
          perfiles (nombre, apellidos)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateEstado = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from("eventos")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;
      fetchEventos();
    } catch (error) {
      alert("Error al actualizar el estado del evento.");
    }
  };

  const eventosFiltrados = eventos.filter(e => 
    e.titulo.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <MainLayout><div className="loading-card">Cargando eventos...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="page" style={{ fontFamily: "system-ui" }}>
        <div className="wrap">
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "400", margin: 0 }}>Administración de Eventos</h1>
              <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>Control de disponibilidad y estados de la plataforma</p>
            </div>
            <button className="btn ghost" onClick={() => navigate("/admin/eventos/nuevo")}>
              + Crear Evento
            </button>
            <button className="btn ghost" onClick={() => navigate("/dashboard")}>
              Volver al Dashboard
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input 
              type="text" 
              placeholder="Buscar evento por título..." 
              className="input"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="glass-container" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)", textAlign: "left" }}>
                  <th style={{ padding: "15px" }}>Título</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th style={{ textAlign: "right", paddingRight: "15px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventosFiltrados.map((evento) => (
                  <tr key={evento.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "500" }}>{evento.titulo}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>Org: {evento.perfiles?.nombre}</div>
                    </td>
                    <td>{evento.tipo}</td>
                    <td>{new Date(evento.fecha_evento).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-tag ${evento.estado.toLowerCase()}`}>
                        {evento.estado}
                      </span>
                    </td>
                    <td>S/ {Number(evento.precio).toFixed(2)}</td>
                    <td style={{ textAlign: "right", paddingRight: "15px" }}>
                      <select 
                        style={{ background: "rgba(0,0,0,0.3)", color: "#fff", border: "none", padding: "5px", borderRadius: "4px", fontSize: "0.8rem" }}
                        value={evento.estado}
                        onChange={(e) => updateEstado(evento.id, e.target.value)}
                      >
                        <option value="BORRADOR">Borrador</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="CANCELADO">Cancelado</option>
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
        .activo { background: rgba(0, 255, 136, 0.1); color: #00ff88; }
        .confirmado { background: rgba(0, 153, 255, 0.1); color: #0099ff; }
        .borrador { background: rgba(255, 255, 255, 0.1); color: #aaa; }
        .cancelado { background: rgba(255, 68, 68, 0.1); color: #ff4444; }
      `}</style>
    </MainLayout>
  );
}