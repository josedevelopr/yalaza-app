import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "../assets/styles/event-details.css";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import paymentQr from "../assets/img/yalaza-yape.jpeg";

// 1. Importaciones de Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para iconos de Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 2. Imágenes de stock
import defaultMetaImg from '../assets/img/event-venta-por-meta.png';
import defaultDirectImg from '../assets/img/event-venta-directa.png';

const EVENTOS_TABLE = "eventos";

// --- Helpers ---
function formatMoney(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("es-PE", { style: "currency", currency: "PEN" });
}

function formatDateTime(iso) {
  if (!iso) return "Por definir";
  const d = new Date(iso);
  return d.toLocaleString("es-PE", {
    weekday: "short", year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
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

function extractCoords(url) {
  if (!url) return null;
  try {
    const latMatch = url.match(/mlat=(-?\d+\.\d+)/);
    const lonMatch = url.match(/mlon=(-?\d+\.\d+)/);
    if (latMatch && lonMatch) return [parseFloat(latMatch[1]), parseFloat(lonMatch[1])];
    
    const pathMatch = url.match(/map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/);
    if (pathMatch) return [parseFloat(pathMatch[1]), parseFloat(pathMatch[2])];
  } catch (e) { console.error("Error parseando coordenadas", e); }
  return null;
}

// --- Componente Principal ---
export default function EventDetails() {
  const { user } = useAuth();
  const { eventoId } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [error, setError] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const loadEvento = async () => {
      try {
        setLoadingEvento(true);
        setError("");
        const { data, error: evErr } = await supabase
          .from(EVENTOS_TABLE)
          .select("*")
          .eq("id", eventoId)
          .single();

        if (evErr || !data) {
           setError("Evento no encontrado.");
        } else {
          setEvento(data);
          const defaultStock = data.tipo === 'POR_META' ? defaultMetaImg : defaultDirectImg;
          setImgSrc(data.banner_url || defaultStock);
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

  const handleImageError = () => {
    const defaultStock = evento?.tipo === 'POR_META' ? defaultMetaImg : defaultDirectImg;
    setImgSrc(defaultStock);
  };

  const handleComprar = () => {
    if (!user) {
      navigate("/login", { state: { redirectTo: `/evento/${evento.id}` } });
      return;
    }
    if(user.user_metadata.role !== 'ASISTENTE') {
      alert('Solo los asistentes pueden comprar entradas.');
      return;
    }
    setShowQr(true);
  };

  const handleYaYapee = () => navigate(`/cliente/comprar/${evento.id}`);

  const badge = useMemo(() => buildBadgeForEstado(evento?.estado), [evento?.estado]);

  const position = useMemo(() => {
    const coords = extractCoords(evento?.ubicacion_url);
    return coords || [-12.046374, -77.042793]; // Default a Lima
  }, [evento?.ubicacion_url]);

  const quorumPercent = useMemo(() => {
    const q = Number(evento?.min_quorum || 0);
    const a = Number(evento?.max_aforo || 0);
    if (!q || !a) return 0;
    return Math.max(0, Math.min(100, Math.round((q / a) * 100)));
  }, [evento]);

  if (loadingEvento) {
    return (
      <MainLayout>
        <div className="page"><div className="wrap"><h1 className="title">Cargando evento...</h1></div></div>
      </MainLayout>
    );
  }

  if (!evento) {
    return (
      <MainLayout>
        <div className="page"><div className="wrap"><h1 className="title">{error || "No encontrado"}</h1></div></div>
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
                {showQr ? "Escanea el QR para realizar el pago." : safeText(evento.descripcion)}
              </p>
            </div>
            <div className={`badge ${badge.cls}`}>{badge.text}</div>
          </div>

          <div  style={{marginTop: 14 +'px'}}>
            <div className="glass card">
              {!showQr ? (
                <>
                  <h2 className="section-title">Detalle del evento</h2>
                  <div className="banner">
                    <img src={imgSrc} alt="Banner" onError={handleImageError} />
                  </div>

                  {/* Mapa Interactivo Leaflet */}
                  <div className="map-wrapper" style={{ height: "250px", width: "100%", borderRadius: "12px", overflow: "hidden", margin: "15px 0" }}>
                    <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={position}>
                        <Popup><strong>{evento.titulo}</strong><br/>{evento.ubicacion}</Popup>
                      </Marker>
                    </MapContainer>
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
                      <a className="btn primary" href={evento.ubicacion_url} target="_blank" rel="noreferrer">Ver en Mapa Externo</a>
                    )}
                  </div>

                  {evento.tipo === "POR_META" && (
                    <div className="quorum">
                      <div className="quorum-title">Modo por meta ({quorumPercent}%)</div>
                      <div className="progress"><div className="progress-bar" style={{ width: `${quorumPercent}%` }} /></div>
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
                  <div className="qr-frame" style={{ background: "white", padding: "15px", borderRadius: "20px", display: "inline-block", margin: "20px 0" }}>
                    <img src={paymentQr} alt="QR de Pago" style={{ width: "260px" }} />
                  </div>
                  <div className="payment-info" style={{ marginBottom: 30 }}>
                    <p>Monto a pagar: <span style={{ fontWeight: "bold", color: "#742284" }}>{formatMoney(evento.precio)}</span></p>
                  </div>
                  <div className="actions" style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
                    <button className="btn success" onClick={handleYaYapee}>Ya yapeé, subir comprobante</button>
                    <button className="btn ghost" onClick={() => setShowQr(false)}>Cancelar</button>
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