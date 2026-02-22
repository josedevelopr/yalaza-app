import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/buy-tickets.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalVentas: 0, pagosPendientes: 0, totalEventos: 0 });
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener estadísticas generales
      const { data: pagos } = await supabase.from("pagos").select("monto, estado");
      const { count: eventosCount } = await supabase.from("eventos").select("*", { count: 'exact', head: true });

      const ventas = pagos?.filter(p => p.estado === 'APROBADO').reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;
      const pendientesCount = pagos?.filter(p => p.estado === 'PENDIENTE').length || 0;

      setStats({
        totalVentas: ventas,
        pagosPendientes: pendientesCount,
        totalEventos: eventosCount || 0
      });

      // 2. Obtener lista de pagos pendientes para validación (Admin/Soporte)
      const { data: listaPendientes } = await supabase
        .from("pagos")
        .select(`
          id,
          monto,
          evidencia_url,
          estado,
          created_at,
          perfiles (nombre, apellidos),
          eventos (titulo)
        `)
        .eq("estado", "PENDIENTE")
        .order("created_at", { ascending: true });

      setPendientes(listaPendientes || []);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const gestionarPago = async (pagoId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from("pagos")
        .update({ estado: nuevoEstado })
        .eq("id", pagoId);

      if (error) throw error;
      
      // Si se aprueba, el sistema debería generar el ticket (esto suele hacerse vía Trigger en BD o Edge Function)
      alert(`Pago ${nuevoEstado.toLowerCase()} con éxito`);
      fetchDashboardData();
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  if (loading) return <MainLayout><div className="loading-card">Cargando panel...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="page">
        <div className="wrap">
          <div className="glass header">
            <div>
              <h1 className="title">Panel Administrativo</h1>
              <p className="subtitle">Gestión de ingresos y validación de pagos de Yalaza.</p>
            </div>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 30 }}>
            <div className="glass card mini-stat">
              <div className="mini-k">Recaudación Total</div>
              <div className="mini-v" style={{ color: "#00ff88" }}>S/. {stats.totalVentas.toFixed(2)}</div>
            </div>
            <div className="glass card mini-stat">
              <div className="mini-k">Pagos por Validar</div>
              <div className="mini-v" style={{ color: "#ffcc00" }}>{stats.pagosPendientes}</div>
            </div>
            <div className="glass card mini-stat">
              <div className="mini-k">Eventos Activos</div>
              <div className="mini-v">{stats.totalEventos}</div>
            </div>
          </div>

          <h2 className="section-title">Validación de Comprobantes</h2>
          
          <div className="glass card" style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "12px" }}>Usuario</th>
                  <th>Evento</th>
                  <th>Monto</th>
                  <th>Evidencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px" }}>{p.perfiles?.nombre} {p.perfiles?.apellidos}</td>
                    <td>{p.eventos?.titulo}</td>
                    <td>S/. {p.monto}</td>
                    <td>
                      <a href={p.evidencia_url} target="_blank" rel="noreferrer" className="pill" style={{ background: "#742284" }}>
                        Ver Imagen
                      </a>
                    </td>
                    <td style={{ display: "flex", gap: "10px", padding: "12px" }}>
                      <button className="btn success" onClick={() => gestionarPago(p.id, "APROBADO")}>✓</button>
                      <button className="btn danger" onClick={() => gestionarPago(p.id, "RECHAZADO")}>✕</button>
                    </td>
                  </tr>
                ))}
                {pendientes.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No hay pagos pendientes por revisar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mini-stat { text-align: center; padding: 20px; }
        .admin-table th { color: rgba(255,255,255,0.6); font-size: 0.85rem; }
        .admin-table td { font-size: 0.9rem; padding: 15px 12px; }
        .btn.danger { background: #ff4444; border: none; padding: 5px 15px; border-radius: 8px; cursor: pointer; color: white; }
      `}</style>
    </MainLayout>
  );
}