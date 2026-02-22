import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    totalVentas: 0, 
    pagosPendientes: 0, 
    totalEventos: 0, 
    ticketsVendidos: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Consultas basadas en yalaza.sql
      const { data: pagos } = await supabase.from("pagos").select("monto, estado");
      const { count: eventosCount } = await supabase.from("eventos").select("*", { count: 'exact', head: true });
      const { count: ticketsCount } = await supabase.from("tickets").select("*", { count: 'exact', head: true });

      const ventas = pagos?.filter(p => p.estado === 'APROBADO').reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;
      const pendientesCount = pagos?.filter(p => p.estado === 'PENDIENTE').length || 0;

      setStats({
        totalVentas: ventas,
        pagosPendientes: pendientesCount,
        totalEventos: eventosCount || 0,
        ticketsVendidos: ticketsCount || 0
      });

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><div className="loading-card">Cargando...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="page" style={{ fontFamily: "system-ui" }}>
        <div className="wrap">
          
          {/* Header Minimalista */}
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "400", margin: 0 }}>Panel de Control</h1>
            <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>Administración central de Yalaza</p>
          </div>

          {/* Métricas Principales (Sin bordes ni colores de fondo pesados) */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
            gap: "20px",
            marginBottom: "50px" 
          }}>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "15px" }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.5, textTransform: "uppercase" }}>Eventos Activos</div>
              <div style={{ fontSize: "1.8rem" }}>{stats.totalEventos}</div>
            </div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "15px" }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.5, textTransform: "uppercase" }}>Pagos por Validar</div>
              <div style={{ fontSize: "1.8rem" }}>{stats.pagosPendientes}</div>
            </div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "15px" }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.5, textTransform: "uppercase" }}>Tickets Vendidos</div>
              <div style={{ fontSize: "1.8rem" }}>{stats.ticketsVendidos}</div>
            </div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "15px" }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.5, textTransform: "uppercase" }}>Recaudación Total</div>
              <div style={{ fontSize: "1.8rem" }}>S/ {stats.totalVentas.toLocaleString()}</div>
            </div>
          </div>

          {/* Menú de Opciones de Administración */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            
            {/* Sección: Operaciones */}
            <section>
              <h2 style={{ fontSize: "0.85rem", opacity: 0.5, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>Gestión de Operaciones</h2>
              <div className="glass-nav">
                <div className="nav-item" onClick={() => navigate("/admin/eventos")}>Administrar Eventos</div>
                <div className="nav-item" onClick={() => navigate("/admin/pagos")}>Validar Pagos Pendientes</div>
                <div className="nav-item" onClick={() => navigate("/admin/tickets")}>Listado de Tickets</div>
              </div>
            </section>

            {/* Sección: Usuarios */}
            <section>
              <h2 style={{ fontSize: "0.85rem", opacity: 0.5, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>Configuración y Usuarios</h2>
              <div className="glass-nav">
                <div className="nav-item" onClick={() => navigate("/admin/usuarios")}>Administración de Usuarios</div>
                <div className="nav-item" onClick={() => navigate("/admin/roles")}>Roles y Permisos</div>
                <div className="nav-item" onClick={() => navigate("/admin/reportes")}>Exportar Reportes</div>
              </div>
            </section>

          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-nav {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
        }
        .nav-item {
          padding: 18px 20px;
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nav-item:last-child {
          border-bottom: none;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          padding-left: 25px;
        }
        .loading-card {
          padding: 40px;
          text-align: center;
          color: rgba(255,255,255,0.5);
        }
        .page {
          background: #ffff;
          border-radius: 8px;
        }
      `}</style>
    </MainLayout>
  );
}