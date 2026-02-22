import MainLayout from "../layouts/MainLayout";
import "../assets/styles/buy-tickets.css";
import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

// Bucket actualizado para integración con pagos
const BUCKET_PAGOS = "pagos_tickets";
const EVENTOS_TABLE = "eventos";

export default function BuyTickets() {
  const { eventoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [loadingEvento, setLoadingEvento] = useState(true);

  const [monto, setMonto] = useState(0);
  const [metodo, setMetodo] = useState("YAPE");
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Procesando...");
  const [error, setError] = useState("");
  const [ticketCreado, setTicketCreado] = useState(null);

  useEffect(() => {
    const loadEvento = async () => {
      try {
        setLoadingEvento(true);
        setError("");

        const { data, error: evErr } = await supabase
          .from(EVENTOS_TABLE)
          .select("id, titulo, precio, ubicacion, fecha_evento")
          .eq("id", eventoId)
          .single();
        
        if (evErr) throw evErr;

        setEvento(data);
        setMonto(Number(data?.precio ?? 0));
      } catch (e) {
        console.error("Error cargando evento:", e);
        setEvento(null);
      } finally {
        setLoadingEvento(false);
      }
    };

    loadEvento();
  }, [eventoId]);

  const disabled = useMemo(() => {
    return (
      !evento?.id ||
      !user?.id ||
      !archivo ||
      !monto ||
      monto <= 0 ||
      ticketCreado
    );
  }, [evento?.id, user?.id, archivo, monto, ticketCreado]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setError("Solo se permiten imágenes (jpg, png, webp).");
      return;
    }

    setError("");
    setArchivo(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const buildPublicUrl = (path) => {
    const { data } = supabase.storage.from(BUCKET_PAGOS).getPublicUrl(path);
    return data?.publicUrl ?? "";
  };

  const uploadEvidence = async (file, eventoIdValue, userId) => {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${userId}/${eventoIdValue}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    // Integración real con el bucket pagos_tickets
    const { error: upErr } = await supabase.storage
      .from(BUCKET_PAGOS)
      .upload(fileName, file, { 
        upsert: false,
        contentType: file.type 
      });

    if (upErr) throw new Error(`Error subiendo evidencia: ${upErr.message}`);

    return buildPublicUrl(fileName);
  };

  const handleComprar = async () => {
    try {
      if (!user) throw new Error("Debes iniciar sesión para comprar.");

      setError("");
      setLoading(true);
      setLoadingMsg("Subiendo evidencia...");

      // Subida al bucket pagos_tickets
      const evidenciaUrl = await uploadEvidence(archivo, evento.id, user.id);

      setLoadingMsg("Registrando pago...");
      const { data: pagoIns, error: pagoErr } = await supabase
        .from("pagos")
        .insert([
          {
            usuario_id: user.id,
            evento_id: evento.id,
            pre_reservacion_id: null,
            monto: monto,
            evidencia_url: evidenciaUrl,
            estado: "PENDIENTE",
          },
        ])
        .select("id")
        .single();

      if (pagoErr) throw new Error(`Error insertando pago: ${pagoErr.message}`);

      setLoadingMsg("Generando ticket y QR...");
      const qrValue = crypto.randomUUID();

      const { data: ticketIns, error: ticketErr } = await supabase
        .from("tickets")
        .insert([
          {
            evento_id: evento.id,
            usuario_id: user.id,
            pago_id: pagoIns.id,
            qr_code: qrValue,
            es_validado: false,
          },
        ])
        .select("id")
        .single();

      if (ticketErr) throw new Error(`Error insertando ticket: ${ticketErr.message}`);

      const qrDataUrl = await QRCode.toDataURL(qrValue, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240,
      });

      setTicketCreado({
        pagoId: pagoIns.id,
        ticketId: ticketIns.id,
        qrValue,
        qrDataUrl,
        evidenciaUrl,
      });

    } catch (e) {
      console.error(e);
      setError(e?.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvento) {
    return (
      <MainLayout>
        <div style={{ padding: 24, textAlign: "center" }}>Cargando evento...</div>
      </MainLayout>
    );
  }

  if (!evento) {
    return (
      <MainLayout>
        <div style={{ padding: 24, textAlign: "center" }}>Evento no encontrado.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page">
        <div className="wrap">
          <div className="glass header">
            <div>
              <h1 className="title">Compra de entrada</h1>
              <p className="subtitle">Sube tu evidencia de pago para generar tu ticket.</p>
            </div>
            <div className="badge">Pago manual</div>
          </div>

          <div className="grid">
            <div className="glass card">
              <h2 className="section-title">Evento seleccionado</h2>
              <div className="evento">
                <div className="evento-left">
                  <div className="evento-name">{evento.titulo}</div>
                  <div className="evento-meta">
                    <span className="pill">{evento.ubicacion || "Lima"}</span>
                    <span className="pill">{evento.fecha_evento}</span>
                  </div>
                </div>
                <div className="evento-right">
                  <div className="evento-price-label">Precio</div>
                  <div className="evento-price">S/. {monto}</div>
                </div>
              </div>

              <h2 className="section-title" style={{ marginTop: 20 }}>Datos de pago</h2>
              <div className="form-grid">
                <div className="field full ">
                  <label>Monto (S/.)</label>
                  <input className="input" type="number" value={monto} disabled />
                </div>

                <div className="field full">
                  <label>Evidencia (captura de pantalla)</label>
                  <input className="file" type="file" accept="image/*" onChange={onFileChange} />
                  {previewUrl && (
                    <div className="preview">
                      <img src={previewUrl} alt="Vista previa" />
                    </div>
                  )}
                </div>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="actions">
                <button className="btn ghost" onClick={() => navigate(-1)}>Regresar</button>
                <button
                  className={`btn ${disabled ? "disabled" : "success"}`}
                  disabled={disabled}
                  onClick={handleComprar}
                >
                  Confirmar compra
                </button>
              </div>
            </div>

            <div className="glass card">
              <h2 className="section-title">Tu ticket</h2>
              {!ticketCreado ? (
                <div className="empty">
                  <div className="empty-title">QR pendiente</div>
                  <div className="empty-sub">El ticket aparecerá aquí después de validar tu pago.</div>
                </div>
              ) : (
                <div className="ticket">
                  <div className="ticket-head">
                    <div>
                      <div className="ticket-title">¡Ticket generado!</div>
                      <div className="ticket-sub">Escanea esto en puerta.</div>
                    </div>
                    <div className="badge ok">Listo</div>
                  </div>
                  <div className="qr">
                    <img src={ticketCreado.qrDataUrl} alt="Código QR" />
                  </div>
                  <div className="kv">
                    <div className="kv-row">
                      <div className="kv-k">Ticket ID</div>
                      <div className="kv-v">{ticketCreado.ticketId}</div>
                    </div>
                  </div>
                  <div className="ticket-actions">
                    <button className="btn warning" onClick={() => window.print()}>Imprimir</button>
                    <button className="btn ghost" onClick={() => navigate("/")}>Ir al inicio</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-card">
              <div className="spinner" />
              <div className="loading-title">{loadingMsg}</div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}