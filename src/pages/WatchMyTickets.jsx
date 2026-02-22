import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import "../assets/styles/buy-tickets.css"; 

export default function WatchMyTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const { data, error: tkError } = await supabase
          .from("tickets")
          .select(`
            id,
            qr_code,
            es_validado,
            created_at,
            eventos (
              id,
              titulo,
              fecha_evento,
              ubicacion,
              precio,
              banner_url
            ),
            pagos (
              id,
              estado,
              monto,
              evidencia_url
            )
          `)
          .eq("usuario_id", user.id)
          .order("created_at", { ascending: false });

        if (tkError) throw tkError;

        const ticketsWithQR = await Promise.all(
          data.map(async (tk) => {
            try {
              const qrDataUrl = await QRCode.toDataURL(tk.qr_code, {
                width: 220,
                margin: 2,
                color: { dark: "#000000", light: "#ffffff" }
              });
              return { ...tk, qrDataUrl };
            } catch (err) {
              return { ...tk, qrDataUrl: "" };
            }
          })
        );

        setTickets(ticketsWithQR);
      } catch (err) {
        console.error("Error al cargar tickets:", err);
        setError("Hubo un problema al obtener tus entradas. Inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  // Función para truncar el título a 40 caracteres
  const truncateTitle = (str) => {
    if (!str) return "Evento sin título";
    return str.length > 40 ? str.substring(0, 37) + "..." : str;
  };

  const formatFecha = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: 60, textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 20px" }} />
          <p style={{ color: "white" }}>Cargando tus entradas de Yalaza...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page">
        <div className="wrap">
          <div className="glass header" style={{ marginBottom: "2.5rem" }}>
            <div>
              <h1 className="title">Mis Entradas</h1>
              <p className="subtitle">Aquí tienes tus accesos confirmados y pendientes.</p>
            </div>
            <button className="btn success" onClick={() => navigate("/")}>
              Comprar más
            </button>
          </div>

          {error && <div className="error" style={{ marginBottom: 20 }}>{error}</div>}

          {tickets.length === 0 ? (
            <div className="glass card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <h2 className="section-title">No tienes tickets registrados</h2>
              <p style={{ opacity: 0.8, marginBottom: 25 }}>
                Parece que aún no has adquirido entradas para ningún evento.
              </p>
              <button className="btn primary" onClick={() => navigate("/")}>
                Ver eventos disponibles
              </button>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
              {tickets.map((ticket) => (
                <div key={ticket.id} className="glass card ticket-card-animation">
                  <div className="ticket-head">
                    <div style={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0 permite que el truncado funcione en flex */}
                      <h3 className="evento-name" title={ticket.eventos?.titulo}>
                        {truncateTitle(ticket.eventos?.titulo)}
                      </h3>
                      <div className="evento-meta" style={{ display: "block" }}>
                        <div style={{ fontSize: "0.85rem", marginBottom: 4 }}>
                            {formatFecha(ticket.eventos?.fecha_evento)}
                        </div>
                        <div style={{ fontSize: "0.85rem" }}>
                            {ticket.eventos?.ubicacion || "Ubicación por confirmar"}
                        </div>
                      </div>
                    </div>
                    <div className={`badge ${ticket.es_validado ? "disabled" : "ok"}`}>
                      {ticket.es_validado ? "VALIDADO" : "ACTIVO"}
                    </div>
                  </div>

                  <div className="qr-container">
                    {ticket.qrDataUrl ? (
                      <img src={ticket.qrDataUrl} alt="Ticket QR" style={{ display: "block", width: "180px" }} />
                    ) : (
                      <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", textAlign: "center", color: "#666" }}>
                        Error al generar QR
                      </div>
                    )}
                  </div>

                  <div className="kv" style={{paddingTop: "15px" }}>
                    <div className="kv-row">
                      <div className="kv-k">Estado Pago</div>
                      <div className={`kv-v status-${ticket.pagos?.estado?.toLowerCase()}`} style={{ fontWeight: "bold" }}>
                        {ticket.pagos?.estado}
                      </div>
                    </div>
                    <div className="kv-row">
                      <div className="kv-k">Monto</div>
                      <div className="kv-v">S/. {ticket.pagos?.monto}</div>
                    </div>
                    <div className="kv-row">
                      <div className="kv-k">ID Ticket</div>
                      <div className="kv-v mono" style={{ fontSize: "0.75rem" }}>
                        {ticket.id.split("-")[0].toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="actions" style={{ marginTop: "20px" }}>
                    <button 
                      className="btn ghost" 
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => window.print()}
                    >
                      Imprimir Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .kv, .kv-row {
          border: none !important;
        }

        .evento-name {
          font-size: 1.15rem;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          max-width: 100%;
        }

        .qr-container {
          background: white;
          padding: 12px;
          border-radius: 16px;
          margin: 20px auto;
          width: fit-content;
        }
        
        .ticket-card-animation {
          transition: all 0.3s ease;
        }
        .ticket-card-animation:hover {
          transform: translateY(-8px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .status-pendiente { color: #ffcc00; }
        .status-aprobado { color: #00ff88; }
        .status-rechazado { color: #ff4444; }
        
        @media print {
          .header, .actions, .success, .btn { display: none !important; }
          .page { background: white !important; padding: 0 !important; }
          .glass { border: 1px solid #ccc !important; box-shadow: none !important; color: black !important; }
          .qr-container { box-shadow: none !important; border: 1px solid #eee !important; }
        }
      `}</style>
    </MainLayout>
  );
}