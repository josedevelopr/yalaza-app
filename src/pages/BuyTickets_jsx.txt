import MainLayout from "../layouts/MainLayout";
import "../assets/styles/buy-tickets.css";
import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { supabase } from "../lib/supabase";

const BUCKET_EVIDENCIAS = "evidencias";

// Cambia si tu tabla tiene otro nombre
const EVENTOS_TABLE = "eventos";

// Para probar rápido si aún no tienes tabla eventos lista
const EVENTOS_MOCK = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    titulo: "Festival Indie Barranco",
    precio: 35,
    zona: "Barranco",
    fecha: "2026-03-10",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    titulo: "Concierto Rock Miraflores",
    precio: 50,
    zona: "Miraflores",
    fecha: "2026-04-05",
  },
];

export default function BuyTickets() {
  const { eventoId } = useParams();
  const navigate = useNavigate();

  // Si aún no tienes auth, deja un UUID real de tu tabla usuarios para probar inserts
  const usuarioId = "11111111-1111-1111-1111-111111111111"//"PON_AQUI_UN_UUID_REAL_DE_USUARIO";

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

        // 1) Intentar Supabase primero
        const { data, error: evErr } = await supabase
          .from(EVENTOS_TABLE)
          .select("id, titulo, precio, zona, fecha")
          .eq("id", eventoId)
          .single();

        debugger;
        if (evErr) {
          // 2) Fallback mock si no existe tabla o no hay data aún
          const mock = EVENTOS_MOCK.find((e) => String(e.id) === String(eventoId));
          if (!mock) {
            setEvento(null);
          } else {
            setEvento(mock);
            setMonto(Number(mock.precio ?? 0));
          }
        } else {
          setEvento(data);
          setMonto(Number(data?.precio ?? 0));
        }
      } catch (e) {
        setEvento(null);
      } finally {
        setLoadingEvento(false);
      }
    };

    loadEvento();
  }, [eventoId]);

  const disabled = useMemo(() => {
    return !evento?.id || !usuarioId || !archivo || !monto || monto <= 0;
  }, [evento?.id, usuarioId, archivo, monto]);

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
    const { data } = supabase.storage.from(BUCKET_EVIDENCIAS).getPublicUrl(path);
    return data?.publicUrl ?? "";
  };

  const uploadEvidence = async (file, eventoIdValue, userId) => {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${userId}/${eventoIdValue}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    /*
    const { error: upErr } = await supabase.storage
      .from(BUCKET_EVIDENCIAS)
      .upload(fileName, file, { upsert: false });

    if (upErr) throw new Error(`Error subiendo evidencia: ${upErr.message}`);

    return buildPublicUrl(fileName);
    */
    await new Promise((res) => setTimeout(res, 800));

    return URL.createObjectURL(file);
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleComprar = async () => {
    try {
      setError("");
      setLoading(true);
      setLoadingMsg("Subiendo evidencia...");

      await sleep(600);

      const evidenciaUrl = await uploadEvidence(archivo, evento.id, usuarioId);

      setLoadingMsg("Registrando pago...");
      await sleep(500);

      const { data: pagoIns, error: pagoErr } = await supabase
        .from("pagos")
        .insert([
          {
            usuario_id: usuarioId,
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
      await sleep(700);

      const qrValue = crypto.randomUUID();

      const { data: ticketIns, error: ticketErr } = await supabase
        .from("tickets")
        .insert([
          {
            evento_id: evento.id,
            usuario_id: usuarioId,
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

      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e?.message || "Ocurrió un error inesperado.");
    }
  };

  if (loadingEvento) {
    return (
      <MainLayout>
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          Cargando evento...
        </div>
      </MainLayout>
    );
  }

  if (!evento) {
    return (
      <MainLayout>
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          Evento no encontrado. Revisa el id en la URL.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page">
        <div className="wrap">
          <div className="glass topbar">
            <div className="brand">
              <span className="brand-dot" />
              YALAZA
            </div>
            <div className="top-actions">
              <button className="btn ghost" type="button" onClick={() => navigate(-1)}>
                Volver
              </button>
              <button className="btn primary" type="button" onClick={() => navigate(`/eventos/${evento.id}`)}>
                Ver evento
              </button>
            </div>
          </div>

          <div className="glass header">
            <div>
              <h1 className="title">Compra de entrada</h1>
              <p className="subtitle">
                Sube tu evidencia de pago y YALAZA generará tu ticket con QR.
              </p>
            </div>
            <div className="badge">Pago manual</div>
          </div>

          <div className="grid">
            <div className="glass card">
              <h2 className="section-title">Evento seleccionado</h2>

              <div className="evento">
                <div className="evento-left">
                  <div className="evento-name">{evento.titulo ?? "Evento"}</div>
                  <div className="evento-meta">
                    <span className="pill">Zona: {evento.zona ?? "Por definir"}</span>
                    <span className="pill">Fecha: {evento.fecha ?? "Por definir"}</span>
                  </div>
                </div>
                <div className="evento-right">
                  <div className="evento-price-label">Precio</div>
                  <div className="evento-price">S/. {Number(evento.precio ?? 0)}</div>
                </div>
              </div>

              <h2 className="section-title" style={{ marginTop: 14 }}>Datos de pago</h2>

              <div className="form-grid">
                <div className="field">
                  <label>Método</label>
                  <select className="select" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                    <option value="DEPOSITO">Depósito</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>

                <div className="field">
                  <label>Monto (S/.)</label>
                  <input
                    className="input"
                    type="number"
                    value={evento?.precio ?? 0}
                    disabled
                  />
                  {/* <div className="hint">Debe coincidir con el precio o lo acordado por el organizador.</div> */}
                </div>

                <div className="field full">
                  <label>Evidencia (foto del pago)</label>
                  <input className="file" type="file" accept="image/*" onChange={onFileChange} />
                  <div className="hint">Sube un screenshot claro. Evita fotos borrosas.</div>

                  {previewUrl && (
                    <div className="preview">
                      <img src={previewUrl} alt="Evidencia" />
                    </div>
                  )}
                </div>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="actions">
                <button className="btn ghost" type="button" onClick={() => window.location.reload()}>
                  Cancelar
                </button>
                <button
                  className={`btn ${disabled ? "disabled" : "success"}`}
                  type="button"
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
                  <div className="empty-title">Aún no se generó el QR</div>
                  <div className="empty-sub">
                    Completa el pago, sube evidencia y confirma para generar tu ticket.
                  </div>
                </div>
              ) : (
                <div className="ticket">
                  <div className="ticket-head">
                    <div>
                      <div className="ticket-title">Ticket generado</div>
                      <div className="ticket-sub">Presenta este QR en el ingreso.</div>
                    </div>
                    <div className="badge ok">Creado</div>
                  </div>

                  <div className="qr">
                    <img src={ticketCreado.qrDataUrl} alt="QR" />
                  </div>

                  <div className="kv">
                    <div className="kv-row">
                      <div className="kv-k">Ticket ID</div>
                      <div className="kv-v">{ticketCreado.ticketId}</div>
                    </div>
                    <div className="kv-row">
                      <div className="kv-k">Pago ID</div>
                      <div className="kv-v">{ticketCreado.pagoId}</div>
                    </div>
                    <div className="kv-row">
                      <div className="kv-k">QR code</div>
                      <div className="kv-v mono">{ticketCreado.qrValue}</div>
                    </div>
                  </div>

                  <div className="ticket-actions">
                    <a className="btn primary" href={ticketCreado.evidenciaUrl} target="_blank" rel="noreferrer">
                      Ver evidencia
                    </a>
                    <button className="btn warning" type="button" onClick={() => window.print()}>
                      Imprimir
                    </button>
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
              <div className="loading-sub">Un momento, YALAZA está procesando tu solicitud</div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}