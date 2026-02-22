import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "../assets/styles/event-details.css";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import paymentQr from "../assets/img/yalaza-yape.jpeg";

const EVENTOS_TABLE = "eventos";

function formatMoney(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("es-PE", { style: "currency", currency: "PEN" });
}

function formatDateTime(iso) {
  if (!iso) return "Por definir";
  const d = new Date(iso);
  return d.toLocaleString("es-PE", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildBadgeForEstado(estado) {
  const s = String(estado || "").toUpperCase();
  if (s === "CONFIRMADO") return { text: "Confirmado", cls: "ok" };
  if (s === "ACTIVO") return { text: "Activo", cls: "" };
  if (s === "CANCELADO") return { text: "Cancelado", cls: "danger" };
  return { text: "Borrador", cls: "ghost" };
}

function safeText(t) {
  const v = (t ?? "").toString().trim();
  return v.length ? v : "Por definir";
}

export default function EventDetails() {
  const { user } = useAuth();
  const { eventoId } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [error, setError] = useState("");
  // Estado para mostrar el QR antes de ir a la pantalla de carga de comprobante
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const loadEvento = async () => {
      try {
        setLoadingEvento(true);
        setError("");

        const { data, error: evErr } = await supabase
          .from(EVENTOS_TABLE)
          .select(
            "id, organizador_id, titulo, descripcion, tipo, estado, min_quorum, max_aforo, precio, fecha_evento, ubicacion, ubicacion_url, banner_url, created_at"
          )
          .eq("id", eventoId)
          .single();

        if (evErr || !data) {
           setError("Evento no encontrado.");
        } else {
          setEvento(data);
        }
      } catch (e) {
        setEvento(null);
        setError("No se pudo cargar el evento.");
      } finally {
        setLoadingEvento(false);
      }
    };

    loadEvento();
  }, [eventoId]);

  const handleComprar = () => {
    if (!user) {
        navigate("/login", {
          state: { redirectTo: `/evento/${evento.id}` }
        });
        return;
    }

    if(user.user_metadata.role !== 'ASISTENTE') {
        alert('Solo los usuarios con rol ASISTENTE pueden comprar entradas.');
        return;
    }

    // En lugar de navegar directo, mostramos el QR en esta misma vista
    setShowQr(true);
  };

  const handleYaYapee = () => {
    navigate(`/cliente/comprar/${evento.id}`);
  };

  const badge = useMemo(() => buildBadgeForEstado(evento?.estado), [evento?.estado]);

  const meta = useMemo(() => {
    const tipo = String(evento?.tipo || "").toUpperCase();
    const tipoLabel = tipo === "POR_META" ? "Por meta" : "Directo";
    const aforo = Number(evento?.max_aforo ?? 0);
    const quorum = Number(evento?.min_quorum ?? 0);

    return { tipoLabel, aforo, quorum };
  }, [evento]);

  const quorumPercent = useMemo(() => {
    const q = Number(meta.quorum || 0);
    const a = Number(meta.aforo || 0);
    if (!q || !a) return 0;
    const p = Math.round((q / a) * 100);
    return Math.max(0, Math.min(100, p));
  }, [meta]);

  if (loadingEvento) {
    return (
      <MainLayout>
        <div className="page">
          <div className="wrap">
            <div className="glass header">
              <div>
                <h1 className="title">Cargando evento</h1>
                <p className="subtitle">Un momento, YALAZA está preparando la info.</p>
              </div>
            </div>
            <div className="glass card" style={{ marginTop: 14 }}>
              <div className="skeleton-banner" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!evento) {
    return (
      <MainLayout>
        <div className="page"><div className="wrap"><h1 className="title">Evento no encontrado</h1></div></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page">
        <div className="wrap">
          <div className="glass header">
            <div>
              <h1 className="title">{safeText(evento.titulo)}</h1>
              <p className="subtitle">
                {showQr 
                  ? "Escanea el código QR para realizar el pago de tu entrada." 
                  : (safeText(evento.descripcion) || "Este evento aún no tiene descripción.")}
              </p>
            </div>
            <div className={`badge ${badge.cls}`}>{badge.text}</div>
          </div>

          <div className="grid details-grid">
            <div className="glass card">
              {!showQr ? (
                <>
                  <h2 className="section-title">Detalle del evento</h2>
                  <div className="banner">
                    {evento.banner_url ? (
                      <img src={evento.banner_url} alt="Banner del evento" />
                    ) : (
                      <div className="banner-fallback">🎟️</div>
                    )}
                  </div>

                  <div className="meta-cards">
                    <div className="mini">
                      <div className="mini-k">Fecha</div>
                      <div className="mini-v">{formatDateTime(evento.fecha_evento)}</div>
                    </div>
                    <div className="mini">
                      <div className="mini-k">Precio</div>
                      <div className="mini-v">{formatMoney(evento.precio)}</div>
                    </div>
                  </div>

                  <div className="place">
                    <div className="place-left">
                      <div className="place-k">Ubicación</div>
                      <div className="place-v">{safeText(evento.ubicacion)}</div>
                    </div>
                    {evento.ubicacion_url && (
                      <a className="btn primary" href={evento.ubicacion_url} target="_blank" rel="noreferrer">Ver mapa</a>
                    )}
                  </div>

                  {evento.tipo === "POR_META" && (
                    <div className="quorum">
                      <div className="quorum-head">
                        <div className="quorum-title">Modo por meta ({quorumPercent}%)</div>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${quorumPercent}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="actions" style={{ marginTop: 24 }}>
                    <button className="btn success" type="button" onClick={handleComprar} style={{ width: '100%' }}>
                      Comprar entradas
                    </button>
                  </div>
                </>
              ) : (
                <div className="payment-qr-container" style={{ textAlign: "center", padding: "20px 0" }}>
                  <h2 className="section-title">Pago con Yape</h2>
                  
                  <div className="qr-frame" style={{ 
                    background: "white", 
                    padding: "15px", 
                    borderRadius: "20px", 
                    display: "inline-block",
                    margin: "20px 0" 
                  }}>
                    <img src={paymentQr} alt="QR de Pago" style={{ width: "260px", display: "block" }} />
                  </div>

                  <div className="payment-info" style={{ marginBottom: 30 }}>
                    <p style={{ fontSize: "1.1rem", marginBottom: 10 }}>Monto a pagar:</p>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#742284" }}>{formatMoney(evento.precio)}</p>
                  </div>

                  <div className="actions" style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
                    <button className="btn success" onClick={handleYaYapee}>
                      Ya yapeé, subir comprobante
                    </button>
                    <button className="btn ghost" onClick={() => setShowQr(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}