import React, { useMemo, useState } from "react";

/**
 * "BD" MOCK en el front
 * Luego la puedes reemplazar por un JSON descargado o data que cargues de tu backend.
 */
const EVENTOS_DB = [
  { id: 1, tipo: "Concierto", zona: "Barranco", horario: "Noche", precio: 30, aforo: 150, asistenciaPct: 78, fechaMes: 3 },
  { id: 2, tipo: "Taller", zona: "Miraflores", horario: "Tarde", precio: 45, aforo: 60, asistenciaPct: 64, fechaMes: 2 },
  { id: 3, tipo: "Fiesta", zona: "Centro de Lima", horario: "Noche", precio: 25, aforo: 200, asistenciaPct: 82, fechaMes: 4 },
  { id: 4, tipo: "Concierto", zona: "Miraflores", horario: "Noche", precio: 40, aforo: 120, asistenciaPct: 66, fechaMes: 3 },
  { id: 5, tipo: "Cultural", zona: "Surco", horario: "Tarde", precio: 15, aforo: 100, asistenciaPct: 58, fechaMes: 5 },
  { id: 6, tipo: "Fiesta", zona: "Barranco", horario: "Noche", precio: 35, aforo: 140, asistenciaPct: 74, fechaMes: 1 },
  { id: 7, tipo: "Taller", zona: "San Isidro", horario: "Mañana", precio: 55, aforo: 40, asistenciaPct: 61, fechaMes: 6 },
  { id: 8, tipo: "Concierto", zona: "Centro de Lima", horario: "Noche", precio: 20, aforo: 180, asistenciaPct: 80, fechaMes: 4 },
];

export default function ViabilidadEvento() {
  const [form, setForm] = useState({
    tipo: "Concierto",
    zona: "Miraflores",
    fecha: "",
    horario: "Noche (7pm a 12am)",
    aforo: 120,
    precio: 35,
    presupuesto: 2500,
    objetivoGanancia: 800,
    notas: "",
  });

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState({
    status: "Riesgoso",
    demanda: "Media",
    probLlenado: 62,
    equilibrioEntradas: 83,
    gananciaEstimada: 420,
    similares: [],
    recomendaciones: [
      "Completa el formulario y presiona Calcular para ver el resultado.",
    ],
    debug: { nSimilares: 0, score: 0 },
  });

  const statusClass = useMemo(() => {
    if (result.status === "Viable") return "badge-ok";
    if (result.status === "No viable") return "badge-bad";
    return "badge-warn";
  }, [result.status]);

  const handleChange = (key) => (e) => {
    const v = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((p) => ({ ...p, [key]: v }));
  };

  const normalizeHorario = (h) => (h.includes("Noche") ? "Noche" : h.includes("Tarde") ? "Tarde" : "Mañana");

  const parseMes = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const m = d.getMonth() + 1;
    return Number.isFinite(m) ? m : null;
  };

  /**
   * Peso de similitud (0..1) entre el evento del usuario y un evento de la "BD"
   * Ajustable. Lo importante: simple y que tenga sentido.
   */
  const similarityWeight = (user, ev) => {
    let w = 0;

    const userHorario = normalizeHorario(user.horario);
    const userMes = parseMes(user.fecha);

    // Tipo pesa fuerte
    w += (user.tipo === ev.tipo) ? 0.45 : 0;

    // Zona pesa fuerte
    w += (user.zona === ev.zona) ? 0.30 : 0;

    // Horario suma algo
    w += (userHorario === ev.horario) ? 0.15 : 0;

    // Mes / estacionalidad (si existe fecha)
    if (userMes) {
      const diff = Math.abs(userMes - ev.fechaMes);
      // 0 dif = 0.10, 1 dif = 0.07, 2 dif = 0.04, >=3 = 0
      w += diff === 0 ? 0.10 : diff === 1 ? 0.07 : diff === 2 ? 0.04 : 0;
    } else {
      // si no hay fecha, no penalizar, solo no sumas
      w += 0;
    }

    return Math.min(1, w);
  };

  /**
   * Score de viabilidad (0..100)
   * - Llenado esperado (basado en similares)
   * - Punto de equilibrio vs aforo
   * - Precio vs precio promedio de similares
   * - Penalización si objetivo de ganancia es muy alto para la realidad
   */
  const computeViability = (user, similares) => {
    const aforo = Math.max(1, Number(user.aforo) || 1);
    const precio = Math.max(0, Number(user.precio) || 0);
    const presupuesto = Math.max(0, Number(user.presupuesto) || 0);
    const objetivo = Math.max(0, Number(user.objetivoGanancia) || 0);

    // Promedios ponderados por similitud
    let sumW = 0;
    let asistenciaPond = 0;
    let precioPond = 0;

    for (const s of similares) {
      sumW += s.weight;
      asistenciaPond += s.asistenciaPct * s.weight;
      precioPond += s.precio * s.weight;
    }

    const asistenciaMedia = sumW > 0 ? asistenciaPond / sumW : 55; // fallback
    const precioMedio = sumW > 0 ? precioPond / sumW : 30;

    // Probabilidad de llenado aproximada
    // Si tu precio está por encima del promedio, baja un poco la probabilidad.
    const deltaPrecio = precioMedio > 0 ? (precio - precioMedio) / precioMedio : 0;
    const penalPrecio = Math.max(0, Math.min(12, deltaPrecio * 18)); // hasta 12 puntos
    const probLlenado = Math.round(Math.max(10, Math.min(95, asistenciaMedia - penalPrecio)));

    // Equilibrio: entradas para cubrir presupuesto
    const equilibrio = precio > 0 ? Math.ceil(presupuesto / precio) : Math.ceil(presupuesto / 1);

    // Asistencia probable (en entradas)
    const asistenciaProbable = Math.min(aforo, Math.round((probLlenado / 100) * aforo));
    const ingresoEstimado = asistenciaProbable * precio;
    const gananciaEstimada = Math.round(ingresoEstimado - presupuesto);

    // Score:
    // 1) base por probLlenado
    let score = probLlenado;

    // 2) penalización por equilibrio alto vs aforo
    const ratioEq = equilibrio / aforo; // 1 = necesitas llenar al 100% para cubrir
    if (ratioEq > 1) score -= 30;
    else if (ratioEq > 0.9) score -= 18;
    else if (ratioEq > 0.8) score -= 10;

    // 3) penalización si objetivo es muy alto
    if (gananciaEstimada < objetivo) score -= 10;

    // 4) bonus si hay muchos similares (más certeza)
    score += Math.min(8, similares.length * 1.5);

    score = Math.round(Math.max(0, Math.min(100, score)));

    // status
    let status = "Riesgoso";
    if (score >= 70 && gananciaEstimada >= 0) status = "Viable";
    if (score < 45 || gananciaEstimada < 0) status = "No viable";

    const demanda = score >= 75 ? "Alta" : score >= 55 ? "Media" : "Baja";

    // recomendaciones
    const recs = [];
    if (status === "Viable") {
      recs.push("Buen escenario. Activa pre-reservas para confirmar intención y acelerar la venta.");
      recs.push("Usa una preventa corta para subir el porcentaje de llenado rápido.");
    } else {
      if (equilibrio > Math.round(aforo * 0.85)) recs.push("Tu punto de equilibrio es alto para el aforo. Reduce costos o ajusta precio con más valor percibido.");
      if (precio > precioMedio * 1.15) recs.push("Estás por encima del precio promedio de eventos similares. Considera preventa o promo.");
      if (probLlenado < 60) recs.push("La demanda estimada no es alta. Activa pre-reservas antes de invertir en publicidad.");
      if (recs.length === 0) recs.push("Ajusta una variable (precio, aforo o presupuesto) y vuelve a calcular.");
    }

    return {
      score,
      status,
      demanda,
      probLlenado,
      equilibrioEntradas: equilibrio,
      gananciaEstimada,
      precioMedio: Math.round(precioMedio),
      asistenciaMedia: Math.round(asistenciaMedia),
    };
  };

  const handleCalculate = () => {
    setLoading(true);

    // simulamos que "piensa"
    setTimeout(() => {
      const user = { ...form };
      const userHorario = normalizeHorario(user.horario);

      // Construimos similares: tipo y zona obligatorios, y agregamos peso
      const candidates = EVENTOS_DB
        .map((ev) => {
          const w = similarityWeight(user, ev);
          return { ...ev, weight: w };
        })
        // que tengan al menos algo de similitud (umbral)
        .filter((ev) => ev.weight >= 0.45)
        // ordena por peso y luego por asistencia
        .sort((a, b) => (b.weight - a.weight) || (b.asistenciaPct - a.asistenciaPct))
        .slice(0, 6);

      const metrics = computeViability(user, candidates);

      // Armamos tabla de similares bonita
      const similaresView = candidates.map((c) => ({
        evento: `${c.tipo} similar #${c.id}`,
        zona: c.zona,
        precio: c.precio,
        asistencia: c.asistenciaPct,
        weight: c.weight,
      }));

      setResult({
        status: metrics.status,
        demanda: metrics.demanda,
        probLlenado: metrics.probLlenado,
        equilibrioEntradas: metrics.equilibrioEntradas,
        gananciaEstimada: metrics.gananciaEstimada,
        similares: similaresView,
        recomendaciones: [
          `Promedio en similares: ${metrics.asistenciaMedia}% de asistencia y precio S/. ${metrics.precioMedio}.`,
          ...(metrics.status === "Viable"
            ? ["Tu evento está bien posicionado. Asegura un buen banner y arranca con preventa para subir conversión."]
            : []),
          ...(metrics.status !== "Viable"
            ? ["Ajusta precio, aforo o presupuesto y recalcula. La pantalla está hecha para iterar rápido."]
            : []),
        ].slice(0, 4),
        debug: { nSimilares: candidates.length, score: metrics.score, userHorario },
      });

      setLoading(false);
    }, 1200);
  };


  const handleClear = () => {
    setForm({
      tipo: "Concierto",
      zona: "Miraflores",
      fecha: "",
      horario: "Noche (7pm a 12am)",
      aforo: 120,
      precio: 35,
      presupuesto: 2500,
      objetivoGanancia: 800,
      notas: "",
    });
    setResult({
      status: "Riesgoso",
      demanda: "Media",
      probLlenado: 62,
      equilibrioEntradas: 83,
      gananciaEstimada: 420,
      similares: [],
      recomendaciones: ["Completa el formulario y presiona Calcular para ver el resultado."],
      debug: { nSimilares: 0, score: 0 },
    });
  };

  return (
    <div className="page">
      <style>{css}</style>

      <div className="wrap">
        <div className="glass">
          <div className="topbar">
            <div className="brand">
              <span className="brand-dot" />
              YALAZA
            </div>
            <div className="top-actions">
              <a className="btn ghost" href="#">Volver</a>
              <a className="btn primary" href="#">Crear evento</a>
              <a className="btn success" href="#">Mis eventos</a>
            </div>
          </div>
        </div>

        <div className="glass page-head">
          <div>
            <h1 className="page-title">Cálculo de viabilidad</h1>
            <p className="page-subtitle">
              Esta versión calcula usando eventos similares cargados en Yalaza.
            </p>
          </div>
          <div className="badge">Valida demanda</div>
        </div>

        <div className="grid">
          <div className="glass card">
            <h2 className="section-title">Datos del evento</h2>
            <p className="small">Cambia valores y recalcula. La idea es iterar rápido.</p>

            <div className="form-grid">
              <div className="field">
                <label>Tipo de evento</label>
                <select className="select" value={form.tipo} onChange={handleChange("tipo")}>
                  <option>Concierto</option>
                  <option>Fiesta</option>
                  <option>Taller</option>
                  <option>Cultural</option>
                  <option>Deportivo</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="field">
                <label>Zona</label>
                <select className="select" value={form.zona} onChange={handleChange("zona")}>
                  <option>Miraflores</option>
                  <option>Barranco</option>
                  <option>San Isidro</option>
                  <option>Centro de Lima</option>
                  <option>Surco</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="field">
                <label>Fecha</label>
                <input className="input" type="date" value={form.fecha} onChange={handleChange("fecha")} />
              </div>

              <div className="field">
                <label>Horario</label>
                <select className="select" value={form.horario} onChange={handleChange("horario")}>
                  <option>Noche (7pm a 12am)</option>
                  <option>Tarde (2pm a 7pm)</option>
                  <option>Mañana (8am a 1pm)</option>
                </select>
              </div>

              <div className="field">
                <label>Aforo</label>
                <input className="input" type="number" min="1" value={form.aforo} onChange={handleChange("aforo")} />
                <div className="hint">Capacidad del local o cupos disponibles.</div>
              </div>

              <div className="field">
                <label>Precio (S/.)</label>
                <input className="input" type="number" min="0" step="0.1" value={form.precio} onChange={handleChange("precio")} />
                <div className="hint">Si es gratis, coloca 0.</div>
              </div>

              <div className="field">
                <label>Presupuesto total (S/.)</label>
                <input className="input" type="number" min="0" step="0.1" value={form.presupuesto} onChange={handleChange("presupuesto")} />
                <div className="hint">Local, sonido, personal, publicidad, etc.</div>
              </div>

              <div className="field">
                <label>Objetivo de ganancia (S/.)</label>
                <input className="input" type="number" min="0" step="0.1" value={form.objetivoGanancia} onChange={handleChange("objetivoGanancia")} />
              </div>

              <div className="field full">
                <label>Notas opcionales</label>
                <textarea
                  className="textarea"
                  value={form.notas}
                  onChange={handleChange("notas")}
                  placeholder="Ej. Artista invitado, promoción 2x1, incluye bebida, etc."
                />
              </div>
            </div>

            <div className="row">
              <div className="pills">
                <span className="pill"><span className="dot" />Comparación con eventos similares</span>
                <span className="pill"><span className="dot dot-green" />Estimación de demanda</span>
                <span className="pill"><span className="dot dot-yellow" />Riesgo</span>
              </div>

              <div className="actions">
                <button className="btn ghost" type="button" onClick={handleClear}>Limpiar</button>
                <button className="btn primary" type="button" onClick={handleCalculate}>Calcular viabilidad</button>
              </div>
            </div>

            <div className="hint" style={{ marginTop: 10 }}>
              Debug: score {result.debug.score} | similares {result.debug.nSimilares}
            </div>
          </div>

          <div className="glass card result">
            <h2 className="section-title">Resultado</h2>

            <div className="status">
              <div className="status-left">
                <div className="status-title">Estado estimado</div>
                <div className="status-sub">Calculado con eventos similares.</div>
              </div>
              <div className={`badge-status ${statusClass}`}>{result.status}</div>
            </div>

            <div className="kpis">
              <div className="kpi">
                <div className="kpi-title">Demanda estimada</div>
                <div className="kpi-value">{result.demanda}</div>
                <div className="bar"><span style={{ width: `${Math.max(10, Math.min(95, result.probLlenado))}%` }} /></div>
              </div>

              <div className="kpi">
                <div className="kpi-title">Probabilidad de llenado</div>
                <div className="kpi-value">{result.probLlenado}%</div>
                <div className="bar"><span style={{ width: `${result.probLlenado}%` }} /></div>
              </div>

              <div className="kpi">
                <div className="kpi-title">Punto de equilibrio</div>
                <div className="kpi-value">{result.equilibrioEntradas} entradas</div>
                <div className="hint">Entradas necesarias para cubrir costos.</div>
              </div>

              <div className="kpi">
                <div className="kpi-title">Ganancia estimada</div>
                <div className="kpi-value">S/. {result.gananciaEstimada}</div>
                <div className="hint">Estimación con asistencia probable.</div>
              </div>
            </div>

            <div className="rec">
              <div className="section-title small-title">Recomendaciones</div>
              <ul>
                {result.recomendaciones.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            <div>
              <div className="section-title small-title" style={{ marginBottom: 8 }}>Eventos similares en YALAZA</div>
              {result.similares.length === 0 ? (
                <div className="hint">Aún no hay similares suficientes con el filtro actual. Igual se calcula con un fallback.</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Zona</th>
                      <th>Precio</th>
                      <th>Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.similares.map((s, i) => (
                      <tr key={i}>
                        <td>{s.evento}</td>
                        <td>{s.zona}</td>
                        <td>S/. {s.precio}</td>
                        <td>{s.asistencia}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="footer-actions">
              <button className="btn warning" type="button">Abrir pre-reservas</button>
              <button className="btn success" type="button">Crear evento con estos datos</button>
            </div>
          </div>
        </div>
      </div>
      {loading && (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="spinner"></div>
        <p>Calculando viabilidad...</p>
      </div>
    </div>
  )}
    </div>   
 
  );    
}

const css = `
:root{
  --bg1:#ffffff;
  --bg2:#f3f5f8;
  --glass: rgba(255,255,255,.88);
  --glass2: rgba(255,255,255,.70);
  --stroke2: rgba(0,0,0,.05);
  --text: #0f172a;
  --muted: #475569;
  --shadow: 0 12px 32px rgba(0,0,0,.10);
  --blur: 16px;
  --radius: 18px;
  --primary: #7C4DFF;
}
*{ box-sizing:border-box; }
.page{
  min-height:100vh;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
  color: var(--text);
  background:
    radial-gradient(900px 500px at 10% 15%, rgba(124,77,255,.12), transparent 65%),
    radial-gradient(800px 500px at 85% 20%, rgba(255,90,200,.10), transparent 65%),
    radial-gradient(900px 600px at 50% 90%, rgba(56,189,248,.12), transparent 60%),
    radial-gradient(600px 400px at 30% 60%, rgba(46,213,115,.08), transparent 65%),
    linear-gradient(160deg, var(--bg1), var(--bg2));
}
.wrap{ max-width:1100px; margin:0 auto; padding:24px 16px 60px; }

.glass{
  background: linear-gradient(180deg, var(--glass), var(--glass2));
  border: 1px solid var(--stroke2);
  border-top: 1px solid rgba(255,255,255,.9);
  border-left: 1px solid rgba(255,255,255,.85);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow:hidden;
}
.topbar{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 18px; }
.brand{ display:flex; align-items:center; gap:10px; font-weight:900; letter-spacing:.5px; font-size:18px; }
.brand-dot{
  width:10px; height:10px; border-radius:999px;
  background: linear-gradient(180deg, #8b5cff, #6b2dff);
  box-shadow: 0 8px 18px rgba(124,77,255,.25);
}
.top-actions{ display:flex; gap:10px; flex-wrap:wrap; }

.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:10px 14px; border-radius:14px; border:none;
  color:#fff; text-decoration:none; font-weight:900;
  box-shadow: 0 6px 16px rgba(0,0,0,.12);
  transition: transform .15s ease, filter .15s ease;
  cursor:pointer; white-space:nowrap;
}
.btn:hover{ transform: translateY(-1px); filter: brightness(1.05); }
.btn.primary{ background: linear-gradient(180deg, #8b5cff, #6b2dff); }
.btn.success{ background: linear-gradient(180deg, #2dd46a, #16a34a); }
.btn.warning{ background: linear-gradient(180deg, #ffc83d, #f59e0b); }
.btn.ghost{
  background: rgba(255,255,255,.75);
  color:#111827;
  border:1px solid rgba(0,0,0,.06);
  box-shadow: 0 6px 16px rgba(0,0,0,.06);
}

.page-head{
  margin-top:16px; padding:18px;
  display:flex; align-items:flex-start; justify-content:space-between;
  gap:14px; flex-wrap:wrap;
}
.page-title{ margin:0; font-size:22px; font-weight:900; }
.page-subtitle{ margin:6px 0 0; color: var(--muted); font-size:14px; max-width:820px; }
.badge{
  display:inline-flex; align-items:center; gap:8px;
  padding:8px 10px; border-radius:999px;
  background: rgba(124,77,255,.10);
  border: 1px solid rgba(124,77,255,.18);
  color:#3b2fb8; font-weight:900; font-size:12px;
}

.grid{ margin-top:14px; display:grid; grid-template-columns: 1.15fr .85fr; gap:14px; }
.card{ padding:18px; }
.section-title{ margin:0 0 8px; font-size:16px; font-weight:900; }
.small{ margin:0; color: var(--muted); font-size:13px; line-height:1.5; }
.small-title{ font-size:14px; }

.form-grid{ display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-top:12px; }
.field{ display:flex; flex-direction:column; gap:6px; }
label{ font-size:13px; color:#334155; font-weight:900; }

.input, .select, .textarea{
  width:100%; padding:12px 12px;
  border-radius:14px; border:1px solid rgba(0,0,0,.08);
  background: rgba(255,255,255,.90);
  color: var(--text); outline:none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.textarea{ min-height:92px; resize: vertical; }
.input:focus, .select:focus, .textarea:focus{
  border-color: rgba(124,77,255,.55);
  box-shadow: 0 0 0 4px rgba(124,77,255,.14);
}
.hint{ font-size:12px; color: var(--muted); }
.full{ grid-column: 1 / -1; }

.row{ display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap; margin-top:14px; }
.actions{ display:flex; gap:10px; flex-wrap:wrap; }

.pills{ display:flex; gap:8px; flex-wrap:wrap; }
.pill{
  display:inline-flex; align-items:center;
  padding:8px 10px; border-radius:999px;
  border:1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.78);
  color:#111827; font-size:12px; font-weight:900;
}
.pill .dot{ width:8px; height:8px; border-radius:999px; margin-right:8px;
  background: linear-gradient(180deg, #8b5cff, #6b2dff);
}
.dot-green{ background: linear-gradient(180deg, #2dd46a, #16a34a) !important; }
.dot-yellow{ background: linear-gradient(180deg, #ffc83d, #f59e0b) !important; }

.result{ display:flex; flex-direction:column; gap:12px; }

.status{
  display:flex; align-items:center; justify-content:space-between;
  gap:10px; padding:14px; border-radius:16px;
  border:1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.78);
}
.status-left{ display:flex; flex-direction:column; gap:4px; }
.status-title{ font-size:14px; font-weight:900; }
.status-sub{ font-size:13px; color: var(--muted); }

.badge-status{
  padding:8px 12px; border-radius:999px;
  font-weight:900; font-size:12px; color:#fff;
}
.badge-ok{ background: linear-gradient(180deg, #2dd46a, #16a34a); }
.badge-warn{ background: linear-gradient(180deg, #ffc83d, #f59e0b); }
.badge-bad{ background: linear-gradient(180deg, #ff6b6b, #ff3b3b); }

.kpis{ display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; }
.kpi{
  padding:12px; border-radius:16px;
  border:1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.78);
}
.kpi-title{ font-size:12px; color: var(--muted); font-weight:900; margin-bottom:6px; }
.kpi-value{ font-size:18px; font-weight:900; }

.bar{ height:10px; border-radius:999px; background: rgba(0,0,0,.06); overflow:hidden; margin-top:8px; }
.bar > span{
  display:block; height:100%; border-radius:999px;
  background: linear-gradient(90deg, #8b5cff, #38bdf8);
}

.table{
  width:100%; border-collapse: collapse;
  overflow:hidden; border-radius:16px;
  border:1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.78);
}
.table th, .table td{
  padding:10px 10px; text-align:left;
  font-size:13px; border-bottom:1px solid rgba(0,0,0,.06);
}
.table th{
  font-weight:900; color:#334155;
  background: rgba(124,77,255,.07);
}
.table tr:last-child td{ border-bottom:none; }

.rec{
  padding:12px; border-radius:16px;
  border:1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.78);
}
.rec ul{ margin:8px 0 0; padding-left:18px; color: var(--muted); font-size:13px; line-height:1.5; }

.footer-actions{ display:flex; gap:10px; flex-wrap:wrap; }

@media (max-width: 980px){
  .grid{ grid-template-columns: 1fr; }
  .form-grid{ grid-template-columns: 1fr; }
  .kpis{ grid-template-columns: 1fr; }
}
.loading-overlay{
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,.55);
  backdrop-filter: blur(8px);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:999;
}

.loading-card{
  background: rgba(255,255,255,.85);
  border: 1px solid rgba(0,0,0,.06);
  padding: 26px 32px;
  border-radius: 18px;
  text-align:center;
  box-shadow: 0 20px 50px rgba(0,0,0,.12);
  backdrop-filter: blur(14px);
}

.loading-card p{
  margin-top: 12px;
  font-weight: 700;
  color:#334155;
}

.spinner{
  width:42px;
  height:42px;
  border-radius:50%;
  border:4px solid rgba(124,77,255,.15);
  border-top:4px solid #7C4DFF;
  animation: spin 0.9s linear infinite;
  margin:auto;
}

@keyframes spin{
  to{ transform: rotate(360deg); }
}


`;
