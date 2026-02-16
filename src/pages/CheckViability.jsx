import React, { useMemo, useState } from "react";
import MainLayout from '../layouts/MainLayout';
import '../assets/styles/check-viability.css';

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
        <MainLayout>
              <div className="page">
      <div className="wrap">
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
      <Footer />
      {loading && (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Calculando viabilidad...</p>
        </div>
      </div>
      )}
    </div>   
        </MainLayout>
  );    
}
