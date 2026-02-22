import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "../assets/styles/event-details.css";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const EVENTOS_TABLE = "eventos";

// Mock para etapa UI/UX sin BD
const EVENTOS_MOCK = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    organizador_id: "99999999-9999-9999-9999-999999999999",
    titulo: "Festival Indie Barranco",
    descripcion:
      "Un evento chill con bandas locales, visuales y una vibra bonita. Cupos limitados, llega temprano para buena ubicación.",
    tipo: "POR_META",
    estado: "ACTIVO",
    min_quorum: 60,
    max_aforo: 120,
    precio: 35.0,
    fecha_evento: "2026-03-10T20:00:00.000Z",
    ubicacion: "Barranco, Lima",
    ubicacion_url: "https://maps.google.com/?q=Barranco%2C%20Lima",
    banner_url:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=60",
    created_at: "2026-02-01T12:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    organizador_id: "99999999-9999-9999-9999-999999999999",
    titulo: "Concierto Rock Miraflores",
    descripcion:
      "Rock en vivo con set potente, merch y zona de fotos. Ideal para ir en mancha.",
    tipo: "DIRECTO",
    estado: "CONFIRMADO",
    min_quorum: 0,
    max_aforo: 180,
    precio: 50.0,
    fecha_evento: "2026-04-05T01:00:00.000Z",
    ubicacion: "Miraflores, Lima",
    ubicacion_url: "https://maps.google.com/?q=Miraflores%2C%20Lima",
    banner_url:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=60",
    created_at: "2026-02-05T12:00:00.000Z",
  },
];

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
          const mock = EVENTOS_MOCK.find((e) => String(e.id) === String(eventoId));
          if (!mock) {
            setEvento(null);
            setError("Evento no encontrado. Revisa el id en la URL.");
          } else {
            setEvento(mock);
          }
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
    console.log(user);
    if (!user) {
        navigate("/login", {
        state: { redirectTo: `/cliente/comprar/${evento.id}` }
        });
        return;
    }

    if(user.user_metadata.role != 'ASISTENTE')
    {
        alert('Tipo de usuario incorrecto.')
        return;
    }

    navigate(`/cliente/comprar/${evento.id}`);
    };

  const badge = useMemo(() => buildBadgeForEstado(evento?.estado), [evento?.estado]);

  const meta = useMemo(() => {
    const tipo = String(evento?.tipo || "").toUpperCase();
    const tipoLabel = tipo === "POR_META" ? "Por meta" : "Directo";
    const aforo = Number(evento?.max_aforo ?? 0);
    const quorum = Number(evento?.min_quorum ?? 0);

    return {
      tipoLabel,
      aforo,
      quorum,
    };
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
              <div className="badge">Evento</div>
            </div>

            <div className="glass card" style={{ marginTop: 14 }}>
              <div className="skeleton-banner" />
              <div className="skeleton-lines">
                <div className="skeleton-line w70" />
                <div className="skeleton-line w55" />
                <div className="skeleton-line w80" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!evento) {
    return (
      <MainLayout>
        <div className="page">
          <div className="wrap">
           

            <div className="glass header">
              <div>
                <h1 className="title">Evento no encontrado</h1>
                <p className="subtitle">{error || "Revisa el id en la URL."}</p>
              </div>
              <div className="badge danger">Error</div>
            </div>

            <div className="glass card" style={{ marginTop: 14 }}>
              <div className="empty">
                <div className="empty-title">No hay datos para mostrar</div>
                <div className="actions" style={{ marginTop: 14 }}>
                  <button className="btn primary" type="button" onClick={() => navigate("/")}>
                    Ir al inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const banner = evento.banner_url || "";

  return (
    <MainLayout>
      <div className="page">
        <div className="wrap">
       

          <div className="glass header">
            <div>
              <h1 className="title">{safeText(evento.titulo)}</h1>
              <p className="subtitle">
                {safeText(evento.descripcion) || "Este evento aún no tiene descripción."}
              </p>
            </div>

            <div className={`badge ${badge.cls}`}>{badge.text}</div>
          </div>

          <div className="grid details-grid">
            <div className="glass card">
              <h2 className="section-title">Detalle del evento</h2>

              <div className="banner">
                {banner ? (
                  <img src={banner} alt="Banner del evento" />
                ) : (
                  <div className="banner-fallback">
                    <div className="banner-icon">🎟️</div>
                    <div className="banner-text">Banner no disponible</div>
                  </div>
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
                <div className="mini">
                  <div className="mini-k">Tipo</div>
                  <div className="mini-v">{meta.tipoLabel}</div>
                </div>
              </div>

              <div className="place">
                <div className="place-left">
                  <div className="place-k">Ubicación</div>
                  <div className="place-v">{safeText(evento.ubicacion)}</div>
                </div>

                {evento.ubicacion_url ? (
                  <a className="btn primary" href={evento.ubicacion_url} target="_blank" rel="noreferrer">
                    Ver mapa
                  </a>
                ) : (
                  <button className="btn disabled" type="button" disabled>
                    Ver mapa
                  </button>
                )}
              </div>

              <div className="pills-row">
                <span className="pill">Aforo: {meta.aforo || 0}</span>
                <span className="pill">Quórum mínimo: {meta.quorum || 0}</span>
                {/* <span className="pill">Creado: {formatDateTime(evento.created_at)}</span> */}
              </div>

              {String(evento.tipo || "").toUpperCase() === "POR_META" && (
                <div className="quorum">
                  <div className="quorum-head">
                    <div>
                      <div className="quorum-title">Modo por meta</div>
                      <div className="quorum-sub">
                        Este evento busca llegar al quórum mínimo antes de confirmarse.
                      </div>
                    </div>
                    <div className="badge ghost">{quorumPercent}%</div>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${quorumPercent}%` }} />
                  </div>
                  {/* <div className="hint">
                    Referencia rápida: quórum dividido entre aforo total.
                  </div> */}
                </div>
              )}

              <div className="actions">
                {/* <button className="btn ghost" type="button" onClick={() => navigate(`/eventos/${evento.id}/viabilidad`)}>
                  Ver viabilidad
                </button> */}
                <button className="btn success" type="button" onClick={handleComprar} >
                  Comprar entradas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}