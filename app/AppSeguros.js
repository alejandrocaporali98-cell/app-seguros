"use client";
import { useState, useCallback, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── FORMATO ──────────────────────────────────────────────────────────────────
const fmtUDI = (u) =>
  `${Number(u).toLocaleString("es-MX", { maximumFractionDigits: 0 })} UDIs`;
const fmtMXN = (n) =>
  Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const udiAMXN = (u, udi) => fmtMXN(u * udi);

// ─── COLORES CORPORATIVOS ────────────────────────────────────────────────────
const C = {
  navy:      "#0F1F45",
  navyMid:   "#1E3A6E",
  gold:      "#C9973A",
  goldLight: "#F0C96A",
  white:     "#FFFFFF",
  offWhite:  "#F7F8FC",
  gray:      "#5A6478",
  grayLight: "#E4E8F0",
  mint:      "#00A878",
  danger:    "#C0392B",
  warning:   "#B7791F",
  teal:      "#0077A8",
  whatsapp:  "#25D366",
};

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────
const POLIZAS = [
  { id:"smnyl_vida",        aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", nombre:"Realiza® — Vida Vitalicio",          icono:"🛡️", descripcion:"Seguro de vida vitalicio con componente de ahorro. Aportaciones adaptadas a tu ingreso en cada etapa.", beneficios:["Protección vitalicia por fallecimiento","Ahorro en UDIs, pesos o dólares","Exención de primas por invalidez total","Protección adicional por muerte accidental (opc.)","Coberturas extra contratables en cualquier momento"], desdeUDI:400,  plazo:"Vitalicio",               color:C.navyMid, ramo:"Vida" },
  { id:"smnyl_se_adapta",   aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", nombre:"Se Adapta® — Vida Temporal",          icono:"🔄", descripcion:"Protección por fallecimiento que crece contigo. Convertible a plan mayor sin exámenes médicos.",              beneficios:["Prima muy accesible desde inicio","Derecho a convertir a plan mayor","Suma asegurada ajustable","Cobertura por accidente opcional","Ideal para etapas productivas tempranas"],            desdeUDI:200,  plazo:"Temporal convertible",   color:"#0369A1", ramo:"Vida" },
  { id:"smnyl_gmm",         aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", nombre:"Alfa Medical Flex — GMM",             icono:"🏥", descripcion:"Gastos Médicos Mayores donde tú decides deducible y coaseguro. Red médica nacional completa.",              beneficios:["Deducible y coaseguro a tu medida","Red médica SMNYL nacional","Cobertura por enfermedad y accidente","Planes para familia completa","Póliza en dólares sin pérdida inflacionaria"],       desdeUDI:900,  plazo:"Anual renovable",         color:C.teal,    ramo:"Gastos Médicos" },
  { id:"smnyl_gmm_int",     aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", nombre:"Alfa Medical Internacional",          icono:"🌍", descripcion:"Gastos Médicos con cobertura mundial. Atención en cualquier país con los mejores especialistas.",           beneficios:["Cobertura en todo el mundo","Especialistas internacionales","Póliza en dólares","Reembolso en pesos mexicanos","Urgencias y tratamientos programados"],                              desdeUDI:1800, plazo:"Anual renovable",         color:"#0891B2", ramo:"Gastos Médicos" },
  { id:"smnyl_imagina",     aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", nombre:"Imagina Ser® — Retiro",              icono:"💰", descripcion:"Seguro de vida con ahorro para el retiro. Rendimientos garantizados y suma entregada al retirarse.",        beneficios:["Retiro a los 55, 60 o 65 años","Rendimientos en UDIs, pesos o dólares","Ingreso mensual vitalicio (Nuevo Plenitud®)","Protección por fallecimiento durante ahorro","Aportaciones adicionales disponibles"],desdeUDI:1100, plazo:"Hasta retiro elegido",    color:C.mint,    ramo:"Retiro" },
  { id:"gnp_privilegio",    aseguradora:"GNP Seguros",                     logo:"🔷", nombre:"Privilegio — Protección Temporal",   icono:"⚡", descripcion:"Alta protección en MXN o USD. Plazos de 1 a 30 años o hasta los 65 años.",                                  beneficios:["Desde $5,000,000 MXN o $500,000 USD","Plazos: 1, 5, 10, 15, 20, 30 años o a 65","Suma actualizada con inflación","Orientación médica 24/7 sin costo","Invalidez, muerte accidental, cobertura mujer (opc.)"],desdeUDI:350,  plazo:"1–30 años o a 65 años",  color:"#6D28D9", ramo:"Vida" },
  { id:"gnp_proyecta",      aseguradora:"GNP Seguros",                     logo:"🔷", nombre:"Proyecta® — Retiro Garantizado",     icono:"📈", descripcion:"Ahorro garantizado para retiro a los 55–70 años con deducibilidad fiscal ISR Art. 185.",                   beneficios:["Desde 20,000 USD o $400,000 MXN","Retiro a 55, 60, 65 o 70 años","Deducible ISR Art. 185 anualmente","Libre de impuestos a 60 años + 5 vigencia","Cobertura por fallecimiento incluida"],desdeUDI:1200, plazo:"10 o 15 años de pago",    color:"#B45309", ramo:"Retiro" },
  { id:"gnp_consolida",     aseguradora:"GNP Seguros",                     logo:"🔷", nombre:"Consolida Total® — PPR",             icono:"🏆", descripcion:"Ahorro flexible para retiro a 65 años con doble estrategia fiscal Art. 151 y Art. 185.",                   beneficios:["Ahorro garantizado a los 65 años","Doble estrategia fiscal LISR","Desde $400,000 MXN actualizable","Sin saldos mínimos ni comisiones","Edad: 18 a 55 años"],                          desdeUDI:1300, plazo:"Hasta los 65 años",       color:"#0F766E", ramo:"Retiro" },
  { id:"gnp_vida_inversion", aseguradora:"GNP Seguros",                    logo:"🔷", nombre:"Vida Inversión — Instrumento Financiero", icono:"💹", descripcion:"Seguro con rendimientos superiores a tasa bancaria, alta liquidez y aportaciones desde $1,000 MXN.",  beneficios:["Desde $400,000 MXN (actualizable)","Rendimientos superiores a banco","Perfil: conservador, moderado o audaz","Aportaciones desde $1,000 sin comisiones","Retiros libres en cualquier momento"],desdeUDI:800,  plazo:"A 65 años o vitalicio",  color:"#15803D", ramo:"Ahorro / Inversión" },
];

const RAMOS = ["Todos", "Vida", "Gastos Médicos", "Retiro", "Ahorro / Inversión"];

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const S = {
  btn:          { background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: C.navy, border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px", boxShadow: "0 2px 8px rgba(201,151,58,0.35)" },
  btnSec:       { background: "transparent", color: C.gold, border: `1.5px solid ${C.gold}`, borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnWA:        { background: "linear-gradient(135deg, #25D366, #128C7E)", color: "#fff", border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px", boxShadow: "0 2px 8px rgba(37,211,102,0.35)" },
  input:        { width: "100%", padding: "11px 14px", borderRadius: 7, fontSize: 14, border: `1.5px solid ${C.grayLight}`, outline: "none", boxSizing: "border-box", background: C.white, fontFamily: "inherit", color: C.navy },
  label:        { fontSize: 11, fontWeight: 700, color: C.gray, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.5px" },
  card:         { background: C.white, borderRadius: 12, padding: 20, boxShadow: "0 2px 16px rgba(15,31,69,0.07)", marginBottom: 12, border: `1px solid ${C.grayLight}` },
  header:       { background: `linear-gradient(150deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: "28px 24px 24px", borderBottom: `3px solid ${C.gold}` },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 },
  badge:        { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px" },
};

// ─── SESIÓN Y HISTORIAL (localStorage) ───────────────────────────────────────
const SESSION_KEY = "asegurate_session";
const HISTORY_KEY = "asegurate_historial";
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12 horas

const sessionValida = () => {
  try {
    const ts = localStorage.getItem(SESSION_KEY);
    return ts ? Date.now() - Number(ts) < SESSION_TTL : false;
  } catch { return false; }
};
const guardarSesion  = () => { try { localStorage.setItem(SESSION_KEY, String(Date.now())); } catch {} };
const borrarSesion   = () => { try { localStorage.removeItem(SESSION_KEY); } catch {} };
const cargarHistorial = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
const agregarAlHistorial = (entrada) => {
  try {
    const h = cargarHistorial();
    h.unshift(entrada);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
  } catch {}
};

// ─── NAV BUTTONS ─────────────────────────────────────────────────────────────
const NavButtons = ({ onBack, onNext, nextLabel = "Siguiente →", disabled = false }) => (
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, padding: "0 24px 28px" }}>
    {onBack ? <button style={S.btnSec} onClick={onBack}>← Anterior</button> : <div />}
    <button style={{ ...S.btn, opacity: disabled ? 0.5 : 1 }} onClick={onNext} disabled={disabled}>
      {nextLabel}
    </button>
  </div>
);

// ─── BARRA PROGRESO ───────────────────────────────────────────────────────────
const BarraProgreso = ({ pantalla, udi, udiSource, onLogout, onHistorial }) => (
  <div style={{ background: C.navy, padding: "14px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div>
        <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "1.5px" }}>ASEGÚRATE TU TRANQUILIDAD</div>
        <div style={{ fontSize: 10, color: udiSource === "banxico" ? C.mint : "rgba(255,255,255,0.3)", marginTop: 2 }}>
          {udiSource === "banxico" ? "🟢" : "🟡"} 1 UDI = ${udi.toFixed(6)} MXN {udiSource === "banxico" ? "(Banxico)" : "(estimado)"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onHistorial} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>
          📋
        </button>
        <button onClick={onLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
          Salir
        </button>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {["Perfil", "Protección", "Proyección", "Pólizas", "Cotización"].map((t, i) => (
        <div key={i} style={{ textAlign: "center", flex: 1 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", margin: "0 auto 4px", background: pantalla > i + 1 ? C.gold : pantalla === i + 1 ? C.gold : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: pantalla >= i + 1 ? C.navy : "rgba(255,255,255,0.3)" }}>
            {pantalla > i + 1 ? "✓" : i + 1}
          </div>
          <div style={{ fontSize: 9, color: pantalla === i + 1 ? C.gold : "rgba(255,255,255,0.3)", fontWeight: pantalla === i + 1 ? 700 : 400, paddingBottom: 8 }}>{t}</div>
        </div>
      ))}
    </div>
    <div style={{ height: 3, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ height: "100%", background: C.gold, width: `${((pantalla - 1) / 4) * 100}%`, transition: "width 0.4s" }} />
    </div>
  </div>
);

// ─── LOGIN (autenticación via API) ────────────────────────────────────────────
const PantallaLogin = ({ onLogin }) => {
  const [usuario, setUsuario]   = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrar, setMostrar]   = useState(false);

  const handleLogin = async () => {
    if (!usuario || !password) { setError("Ingresa usuario y contraseña."); return; }
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
      if (res.ok) {
        guardarSesion();
        onLogin();
      } else {
        const data = await res.json();
        setError(data.error || "Usuario o contraseña incorrectos.");
      }
    } catch {
      setError("Error de conexión. Verifica tu red e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 4px 24px rgba(201,151,58,0.4)" }}>🛡️</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: "0.3px" }}>Asegúrate Tu Tranquilidad</div>
        <div style={{ fontSize: 12, color: C.gold, marginTop: 4, fontWeight: 700, letterSpacing: "1.5px" }}>ASESORES EN SEGUROS</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Portal de Cotización · Uso interno</div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 22 }}>Iniciar sesión</div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ ...S.label, color: "rgba(255,255,255,0.4)" }}>Usuario</label>
          <input style={{ ...S.input, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: C.white }}
            placeholder="tu.usuario" value={usuario}
            onChange={e => { setUsuario(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoComplete="username" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ ...S.label, color: "rgba(255,255,255,0.4)" }}>Contraseña</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...S.input, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: C.white, paddingRight: 44 }}
              placeholder="••••••••" type={mostrar ? "text" : "password"} value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              autoComplete="current-password" />
            <button onClick={() => setMostrar(!mostrar)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.35)" }}>
              {mostrar ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.35)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#FF8A80", marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <button style={{ ...S.btn, width: "100%", opacity: cargando ? 0.7 : 1 }} onClick={handleLogin} disabled={cargando}>
          {cargando ? "Verificando…" : "Entrar al sistema"}
        </button>
      </div>

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 28 }}>SMNYL · GNP · Monterrey, N.L.</div>
    </div>
  );
};

// ─── PANTALLA 1 — PERFIL DEL CLIENTE ─────────────────────────────────────────
const Pantalla1 = ({ cliente, onChange, onNext }) => (
  <div>
    <div style={S.header}>
      <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 6 }}>NUEVA COTIZACIÓN</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Perfil del Cliente</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>Completa los datos para personalizar el análisis</div>
    </div>
    <div style={{ padding: "20px 20px 0" }}>
      <div style={S.card}>
        <div style={S.sectionTitle}>👤 Información Personal</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>Nombre completo</label>
            <input style={S.input} placeholder="Ej. Juan García López" value={cliente.nombre} onChange={e => onChange("nombre", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Edad</label>
            <input style={S.input} type="number" placeholder="35" value={cliente.edad} onChange={e => onChange("edad", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Estado civil</label>
            <select style={S.input} value={cliente.estadoCivil} onChange={e => onChange("estadoCivil", e.target.value)}>
              <option value="soltero">Soltero/a</option>
              <option value="casado">Casado/a</option>
              <option value="divorciado">Divorciado/a</option>
              <option value="union">Unión libre</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Número de hijos</label>
            <select style={S.input} value={cliente.hijos} onChange={e => onChange("hijos", e.target.value)}>
              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? "hijo" : "hijos"}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.sectionTitle}>💼 Situación Financiera</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={S.label}>Ingreso mensual neto</label>
            <input style={S.input} type="number" placeholder="25000" value={cliente.ingresoMensual} onChange={e => onChange("ingresoMensual", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Gastos mensuales</label>
            <input style={S.input} type="number" placeholder="18000" value={cliente.gastosMensuales} onChange={e => onChange("gastosMensuales", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>Deudas actuales</label>
            <input style={S.input} type="number" placeholder="150000" value={cliente.deudas} onChange={e => onChange("deudas", e.target.value)} />
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.sectionTitle}>📞 Datos de Contacto</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={S.label}>Teléfono / WhatsApp</label>
            <input style={S.input} type="tel" placeholder="81 1234 5678" value={cliente.telefono} onChange={e => onChange("telefono", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Correo electrónico</label>
            <input style={S.input} type="email" placeholder="correo@ejemplo.com" value={cliente.correo} onChange={e => onChange("correo", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
    <NavButtons onNext={onNext} nextLabel="Analizar situación →" disabled={!cliente.nombre || !cliente.edad || !cliente.ingresoMensual} />
  </div>
);

// ─── PANTALLA 2 — ANÁLISIS DE RIESGO ─────────────────────────────────────────
const Pantalla2 = ({ cliente, udi, onBack, onNext }) => {
  const gastos      = Number(cliente.gastosMensuales) || Number(cliente.ingresoMensual) * 0.7;
  const meses       = gastos > 0 ? Math.round((Number(cliente.ingresoMensual) * 3) / gastos) : 0;
  const sumaRec     = Number(cliente.ingresoMensual) * 12 * 7;
  const sumaRecUDI  = Math.round(sumaRec / udi);
  const nivel       = meses < 3 ? "Alto" : meses < 6 ? "Medio" : "Bajo";
  const colorRiesgo = meses < 3 ? C.danger : meses < 6 ? C.warning : C.mint;
  const bgRiesgo    = meses < 3 ? "#FFF0F0" : meses < 6 ? "#FFFBEB" : "#F0FFF8";

  return (
    <div>
      <div style={S.header}>
        <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>ANÁLISIS DE RIESGO</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>{cliente.nombre}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Simulador de Protección Familiar</div>
      </div>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ ...S.card, background: bgRiesgo, border: `1.5px solid ${colorRiesgo}30` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: C.gray, fontWeight: 700, letterSpacing: "0.5px" }}>NIVEL DE RIESGO</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: colorRiesgo, marginTop: 2 }}>{nivel}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{meses}</div>
              <div style={{ fontSize: 12, color: C.gray }}>meses de respaldo</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.6, background: "rgba(255,255,255,0.65)", borderRadius: 8, padding: "10px 12px" }}>
            Su familia podría sostenerse <strong>{meses} {meses === 1 ? "mes" : "meses"}</strong> sin sus ingresos en caso de fallecimiento o invalidez.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ ...S.card, textAlign: "center", marginBottom: 0 }}>
            <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 6 }}>DEUDAS ACTUALES</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.danger }}>{fmtMXN(cliente.deudas || 0)}</div>
            <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>heredaría su familia</div>
          </div>
          <div style={{ ...S.card, textAlign: "center", marginBottom: 0 }}>
            <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 6 }}>COBERTURA RECOMENDADA</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.mint }}>{fmtUDI(sumaRecUDI)}</div>
            <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{fmtMXN(sumaRec)}</div>
          </div>
        </div>

        <div style={{ ...S.card, background: "#FFFBEB", border: `1px solid ${C.gold}35` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>📊 ¿Por qué UDIs?</div>
          <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>
            Las UDIs se actualizan diariamente con la inflación (Banxico). Garantizan que el valor real de la cobertura no disminuya con el tiempo. <strong>1 UDI = ${udi.toFixed(4)} MXN hoy.</strong>
          </div>
        </div>

        {Number(cliente.hijos) > 0 && (
          <div style={{ ...S.card, background: "#EBF4FF", border: `1px solid ${C.teal}25` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>👨‍👩‍👧 Impacto en {cliente.hijos} {Number(cliente.hijos) === 1 ? "hijo" : "hijos"}</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 6, lineHeight: 1.6 }}>Sin protección, sus hijos dependerían de familiares o apoyos externos. Con la cobertura adecuada, su futuro y educación quedan garantizados.</div>
          </div>
        )}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Ver proyecciones →" />
    </div>
  );
};

// ─── PANTALLA 3 — PROYECCIÓN CON SLIDER ──────────────────────────────────────
const Pantalla3 = ({ cliente, udi, porcentaje, onPorcentaje, onBack, onNext }) => {
  const aportacion    = Math.round(Number(cliente.ingresoMensual) * porcentaje);
  const aportacionUDI = Math.round(aportacion / udi);
  const datos = Array.from({ length: 7 }, (_, i) => i * 5).map(año => ({
    año,
    sinSeguro: Math.round(aportacionUDI * año * 12),
    conSeguro: Math.round(aportacionUDI * año * 12 * Math.pow(1.06, año)),
  }));

  return (
    <div>
      <div style={S.header}>
        <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>PROYECCIÓN FINANCIERA</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>{cliente.nombre}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Plan de Ahorro en UDIs · Rendimiento real 6% anual</div>
      </div>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: C.gray, fontWeight: 700, letterSpacing: "0.5px" }}>APORTACIÓN SUGERIDA</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, marginTop: 2 }}>
                {fmtUDI(aportacionUDI)}<span style={{ fontSize: 13, color: C.gray, fontWeight: 400 }}>/mes</span>
              </div>
              <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{fmtMXN(aportacion)}/mes</div>
            </div>
            <div style={{ fontSize: 38 }}>📐</div>
          </div>

          {/* Slider de porcentaje */}
          <div style={{ background: C.offWhite, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: C.gray, fontWeight: 700 }}>% del ingreso destinado al ahorro</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{Math.round(porcentaje * 100)}%</span>
            </div>
            <input
              type="range" min={5} max={20} step={1}
              value={Math.round(porcentaje * 100)}
              onChange={e => onPorcentaje(Number(e.target.value) / 100)}
              style={{ width: "100%", accentColor: C.gold, cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: C.gray }}>5% mínimo</span>
              <span style={{ fontSize: 10, color: C.gray }}>20% máximo</span>
            </div>
          </div>
        </div>

        <div style={S.card}>
          <div style={{ ...S.sectionTitle, marginBottom: 16 }}>📈 Crecimiento patrimonial en UDIs</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={datos}>
              <defs>
                <linearGradient id="gradSeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.mint} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.mint} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grayLight} />
              <XAxis dataKey="año" tickFormatter={v => `${v}a`} tick={{ fontSize: 11, fill: C.gray }} />
              <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: C.gray }} />
              <Tooltip formatter={(v, n) => [fmtUDI(v), n === "conSeguro" ? "Con seguro" : "Sin seguro"]} labelFormatter={v => `Año ${v}`} />
              <Area type="monotone" dataKey="sinSeguro" stroke={C.grayLight} fill={C.grayLight} name="sinSeguro" strokeWidth={1.5} />
              <Area type="monotone" dataKey="conSeguro" stroke={C.mint} fill="url(#gradSeg)" name="conSeguro" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[10, 20, 30].map(años => {
            const d = datos.find(d => d.año === años) || datos[datos.length - 1];
            return (
              <div key={años} style={{ ...S.card, textAlign: "center", marginBottom: 0, padding: 14 }}>
                <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, letterSpacing: "0.3px" }}>A {años} AÑOS</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.mint, margin: "6px 0 2px" }}>{fmtUDI(d?.conSeguro || 0)}</div>
                <div style={{ fontSize: 10, color: C.gray }}>{udiAMXN(d?.conSeguro || 0, udi)}</div>
              </div>
            );
          })}
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Ver opciones →" />
    </div>
  );
};

// ─── PANTALLA 4 — COMPARADOR (hasta 2 pólizas) ───────────────────────────────
const Pantalla4 = ({ cliente, udi, polizasSeleccionadas, onSeleccionar, onBack, onNext }) => {
  const [filtroRamo, setFiltroRamo] = useState("Todos");
  const [expandida, setExpandida]   = useState(null);
  const polizasFiltradas = filtroRamo === "Todos" ? POLIZAS : POLIZAS.filter(p => p.ramo === filtroRamo);

  const togglePoliza = (id) => {
    if (polizasSeleccionadas.includes(id)) {
      onSeleccionar(polizasSeleccionadas.filter(p => p !== id));
    } else if (polizasSeleccionadas.length < 2) {
      onSeleccionar([...polizasSeleccionadas, id]);
    } else {
      // Reemplaza la primera seleccionada
      onSeleccionar([polizasSeleccionadas[1], id]);
    }
  };

  const nextLabel = polizasSeleccionadas.length === 2
    ? "Comparar pólizas ⚖️"
    : "Generar cotización →";

  return (
    <div>
      <div style={S.header}>
        <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>COMPARADOR DE PÓLIZAS</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>{cliente.nombre}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Selecciona 1 o 2 pólizas · SMNYL · GNP</div>
      </div>

      {/* Chips de ramo */}
      <div style={{ padding: "12px 20px 0", background: C.white, borderBottom: `1px solid ${C.grayLight}` }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10 }}>
          {RAMOS.map(r => (
            <button key={r} onClick={() => setFiltroRamo(r)} style={{ whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", background: filtroRamo === r ? C.navy : C.grayLight, color: filtroRamo === r ? C.gold : C.gray }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Indicador de selección */}
      {polizasSeleccionadas.length > 0 && (
        <div style={{ padding: "8px 20px", background: "#EBF4FF", borderBottom: `1px solid ${C.teal}20` }}>
          <div style={{ fontSize: 12, color: C.navy, fontWeight: 600 }}>
            {polizasSeleccionadas.length === 1
              ? "✅ 1 póliza seleccionada · puedes agregar 1 más para comparar"
              : "⚖️ 2 pólizas listas para comparar · toca una para deseleccionar"}
          </div>
        </div>
      )}

      <div style={{ padding: "14px 20px 0" }}>
        {polizasFiltradas.map(p => {
          const idx         = polizasSeleccionadas.indexOf(p.id);
          const seleccionada = idx !== -1;
          const abierta      = expandida === p.id;

          return (
            <div key={p.id} style={{ position: "relative", marginBottom: 12 }}>
              {/* Badge numérico de selección */}
              {seleccionada && (
                <div style={{ position: "absolute", top: -8, right: -6, zIndex: 1, width: 22, height: 22, borderRadius: "50%", background: p.color, color: C.white, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                  {idx + 1}
                </div>
              )}
              <div
                onClick={() => togglePoliza(p.id)}
                style={{ ...S.card, cursor: "pointer", marginBottom: 0, border: seleccionada ? `2px solid ${p.color}` : `1px solid ${C.grayLight}`, background: seleccionada ? `${p.color}08` : C.white, transition: "all 0.2s" }}
              >
                <div style={{ fontSize: 10, color: p.color, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 8 }}>{p.logo} {p.aseguradora.toUpperCase()}</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ fontSize: 26 }}>{p.icono}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.nombre}</div>
                    <div style={{ fontSize: 11, color: C.gray, marginTop: 2, lineHeight: 1.5 }}>{p.descripcion}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={{ ...S.badge, background: `${p.color}12`, color: p.color }}>{p.ramo}</span>
                      <span style={{ ...S.badge, background: C.grayLight, color: C.gray }}>{p.plazo}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: C.gray }}>desde</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: p.color }}>{p.desdeUDI}</div>
                    <div style={{ fontSize: 10, color: C.gray }}>UDIs/mes</div>
                    <div style={{ fontSize: 10, color: C.gray }}>{udiAMXN(p.desdeUDI, udi)}</div>
                  </div>
                </div>

                {/* Botón de expandir beneficios */}
                <div
                  onClick={e => { e.stopPropagation(); setExpandida(abierta ? null : p.id); }}
                  style={{ marginTop: 10, fontSize: 11, color: C.teal, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  {abierta ? "▲ Ocultar beneficios" : "▼ Ver beneficios"}
                </div>

                {abierta && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${p.color}20` }}>
                    {p.beneficios.map((b, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: C.white, flexShrink: 0, marginTop: 1 }}>✓</div>
                        <div style={{ fontSize: 12, color: C.gray }}>{b}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel={nextLabel} disabled={polizasSeleccionadas.length === 0} />
    </div>
  );
};

// ─── PANTALLA 5 — COTIZACIÓN + COMPARACIÓN + WHATSAPP ────────────────────────
const Pantalla5 = ({ cliente, polizasSeleccionadas, udi, onNuevaCita }) => {
  const polizas    = polizasSeleccionadas.map(id => POLIZAS.find(p => p.id === id)).filter(Boolean);
  const hoy        = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const gastos     = Number(cliente.gastosMensuales) || Number(cliente.ingresoMensual) * 0.7;
  const meses      = gastos > 0 ? Math.round((Number(cliente.ingresoMensual) * 3) / gastos) : 0;
  const sumaRec    = Number(cliente.ingresoMensual) * 12 * 7;
  const sumaRecUDI = Math.round(sumaRec / udi);

  const esComparacion = polizas.length === 2;

  const compartirWhatsApp = () => {
    const lineas = [
      `*Cotización — Asegúrate Tu Tranquilidad*`,
      ``,
      `👤 *${cliente.nombre}*  |  ${cliente.edad} años  |  ${cliente.estadoCivil}`,
      `💰 Ingreso mensual: ${fmtMXN(cliente.ingresoMensual)}`,
      ``,
      ...(esComparacion
        ? [`⚖️ *Comparativa de pólizas:*`,
           ``,
           ...polizas.map((p, i) => `${i + 1}. *${p.nombre}*\n   ${p.aseguradora}\n   Prima desde: ${p.desdeUDI} UDIs/mes (${udiAMXN(p.desdeUDI, udi)})`)]
        : polizas.map(p => [`🛡️ *${p.nombre}*`, `   ${p.aseguradora}`, `   Prima desde: ${p.desdeUDI} UDIs/mes (${udiAMXN(p.desdeUDI, udi)})`]).flat()),
      ``,
      `📊 Cobertura recomendada: ${fmtUDI(sumaRecUDI)}`,
      `    (${fmtMXN(sumaRec)})`,
      ``,
      `_Cotización informativa. Valores exactos al contratar._`,
      ``,
      `Antonio Caporali · Asegúrate Tu Tranquilidad`,
      `📧 antonio.caporali@gmail.com`,
      `📍 Monterrey, N.L.`,
    ];
    const msg = encodeURIComponent(lineas.join("\n"));
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div>
      <div style={S.header}>
        <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>
          {esComparacion ? "COMPARATIVA DE PÓLIZAS" : "COTIZACIÓN PERSONALIZADA"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>{cliente.nombre}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{hoy}</div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ ...S.card, borderTop: `4px solid ${C.gold}` }}>
          {/* Encabezado asesor */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${C.grayLight}` }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>Asegúrate Tu Tranquilidad</div>
              <div style={{ fontSize: 10, color: C.gray, marginTop: 2, fontWeight: 700, letterSpacing: "0.8px" }}>ASESORES EN SEGUROS · MONTERREY, N.L.</div>
              <div style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>antonio.caporali@gmail.com</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
          </div>

          {/* Datos del prospecto */}
          <div style={{ background: C.offWhite, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 10 }}>DATOS DEL PROSPECTO</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
              <div><span style={{ fontSize: 10, color: C.gray, display: "block" }}>Nombre</span><strong style={{ color: C.navy }}>{cliente.nombre}</strong></div>
              <div><span style={{ fontSize: 10, color: C.gray, display: "block" }}>Edad</span><strong style={{ color: C.navy }}>{cliente.edad} años</strong></div>
              <div><span style={{ fontSize: 10, color: C.gray, display: "block" }}>Estado civil</span><strong style={{ color: C.navy, textTransform: "capitalize" }}>{cliente.estadoCivil}</strong></div>
              <div><span style={{ fontSize: 10, color: C.gray, display: "block" }}>Hijos</span><strong style={{ color: C.navy }}>{cliente.hijos}</strong></div>
              <div><span style={{ fontSize: 10, color: C.gray, display: "block" }}>Ingreso mensual</span><strong style={{ color: C.navy }}>{fmtMXN(cliente.ingresoMensual)}</strong></div>
              <div><span style={{ fontSize: 10, color: C.gray, display: "block" }}>Fecha</span><strong style={{ color: C.navy }}>{hoy}</strong></div>
              {cliente.telefono && <div><span style={{ fontSize: 10, color: C.gray, display: "block" }}>Teléfono</span><strong style={{ color: C.navy }}>📱 {cliente.telefono}</strong></div>}
              {cliente.correo   && <div><span style={{ fontSize: 10, color: C.gray, display: "block" }}>Correo</span><strong style={{ color: C.navy }}>✉️ {cliente.correo}</strong></div>}
            </div>
          </div>

          {/* ── Modo COMPARACIÓN (2 pólizas) ── */}
          {esComparacion ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: C.navy, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 10 }}>⚖️ COMPARATIVA DE PÓLIZAS</div>
              {/* Tabla comparativa */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {polizas.map((p, i) => (
                  <div key={p.id} style={{ background: `${p.color}07`, border: `1.5px solid ${p.color}25`, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 9, color: p.color, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 4 }}>{p.logo} OPCIÓN {i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: p.color, lineHeight: 1.3 }}>{p.icono} {p.nombre}</div>
                    <div style={{ fontSize: 10, color: C.gray, marginTop: 4 }}>{p.aseguradora}</div>
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${p.color}20` }}>
                      <div style={{ fontSize: 10, color: C.gray }}>Prima desde</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: p.color }}>{p.desdeUDI} <span style={{ fontSize: 10 }}>UDIs/mes</span></div>
                      <div style={{ fontSize: 10, color: C.gray }}>{udiAMXN(p.desdeUDI, udi)}/mes</div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, color: C.gray }}><strong>Plazo:</strong> {p.plazo}</div>
                    <div style={{ fontSize: 10, color: C.gray }}><strong>Ramo:</strong> {p.ramo}</div>
                  </div>
                ))}
              </div>
              {/* Beneficios lado a lado */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {polizas.map((p) => (
                  <div key={p.id}>
                    <div style={{ fontSize: 10, color: p.color, fontWeight: 700, marginBottom: 6 }}>Beneficios</div>
                    {p.beneficios.map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                        <div style={{ width: 13, height: 13, borderRadius: "50%", background: p.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: C.white, marginTop: 1 }}>✓</div>
                        <div style={{ fontSize: 10, color: C.gray, lineHeight: 1.4 }}>{b}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Modo COTIZACIÓN SIMPLE (1 póliza) ── */
            polizas[0] && (
              <div style={{ background: `${polizas[0].color}07`, borderRadius: 10, padding: 16, border: `1.5px solid ${polizas[0].color}20`, marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: polizas[0].color, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 8 }}>{polizas[0].logo} {polizas[0].aseguradora.toUpperCase()} · PÓLIZA RECOMENDADA</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: polizas[0].color }}>{polizas[0].icono} {polizas[0].nombre}</div>
                <div style={{ fontSize: 12, color: C.gray, margin: "4px 0 12px", lineHeight: 1.5 }}>{polizas[0].descripcion}</div>
                {polizas[0].beneficios.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: polizas[0].color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: C.white, flexShrink: 0, marginTop: 1 }}>✓</div>
                    <div style={{ fontSize: 12, color: C.gray }}>{b}</div>
                  </div>
                ))}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${polizas[0].color}20`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontSize: 12, color: C.gray }}>Prima mensual desde</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: polizas[0].color, lineHeight: 1 }}>{polizas[0].desdeUDI} <span style={{ fontSize: 13 }}>UDIs/mes</span></div>
                    <div style={{ fontSize: 11, color: C.gray }}>{udiAMXN(polizas[0].desdeUDI, udi)}/mes hoy</div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Análisis de protección */}
          <div style={{ background: C.offWhite, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 10 }}>ANÁLISIS DE PROTECCIÓN</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.danger }}>{meses}</div>
                <div style={{ fontSize: 11, color: C.gray }}>meses sin protección</div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.mint }}>{fmtUDI(sumaRecUDI)}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{fmtMXN(sumaRec)}</div>
                <div style={{ fontSize: 10, color: C.gray }}>cobertura recomendada</div>
              </div>
            </div>
          </div>

          {/* Nota UDI */}
          <div style={{ background: "#FFFBEB", borderRadius: 8, padding: 10, marginBottom: 18, border: `1px solid ${C.gold}35` }}>
            <div style={{ fontSize: 11, color: C.gray, lineHeight: 1.5 }}>
              💡 <strong>Sobre las UDIs:</strong> Actualizadas diariamente por Banxico. Valor actual: <strong>${udi.toFixed(6)} MXN</strong>. Los valores exactos se determinan al contratar con el asesor.
            </div>
          </div>

          {/* Datos de contacto asesor */}
          <div style={{ background: C.navy, borderRadius: 10, padding: 16, marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "1px", marginBottom: 8 }}>AGENDAR CITA</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>Antonio Caporali</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>✉️ antonio.caporali@gmail.com</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>📍 Monterrey, N.L. · Por cita</div>
            <div style={{ fontSize: 10, color: C.gold, marginTop: 8, fontWeight: 600, letterSpacing: "0.5px" }}>Asegúrate Tu Tranquilidad Asesores · SMNYL & GNP</div>
          </div>

          <div style={{ fontSize: 10, color: C.gray, textAlign: "center", marginBottom: 16, lineHeight: 1.5 }}>Esta cotización es informativa. Los valores exactos se determinan en el proceso formal de contratación.</div>

          {/* Botones de acción */}
          <button style={{ ...S.btnWA, width: "100%", marginBottom: 10 }} onClick={compartirWhatsApp}>
            📱 Compartir por WhatsApp
          </button>
          <button style={{ ...S.btn, width: "100%", marginBottom: 10 }} onClick={() => window.print()}>
            🖨️ Imprimir / Guardar PDF
          </button>
          <button style={{ ...S.btnSec, width: "100%" }} onClick={onNuevaCita}>
            + Nueva cotización
          </button>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
};

// ─── MODAL HISTORIAL ──────────────────────────────────────────────────────────
const HistorialModal = ({ historial, onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
    <div style={{ background: C.white, borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 480, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.grayLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>📋 Historial de cotizaciones</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.gray, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {historial.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: C.gray }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No hay cotizaciones guardadas aún.</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Las próximas aparecerán aquí.</div>
          </div>
        ) : (
          historial.map((entry) => (
            <div key={entry.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.grayLight}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{entry.nombre}</div>
                <div style={{ fontSize: 11, color: C.gray, flexShrink: 0, marginLeft: 8 }}>{entry.fecha}</div>
              </div>
              <div style={{ fontSize: 12, color: C.teal, marginTop: 3 }}>{entry.polizas.join(" · ")}</div>
              <div style={{ fontSize: 12, color: C.mint, marginTop: 2 }}>Cobertura recomendada: {fmtUDI(entry.sumaRecUDI)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const CLIENTE_INICIAL = {
  nombre: "", edad: "", estadoCivil: "casado", hijos: "0",
  ingresoMensual: "", deudas: "", gastosMensuales: "", telefono: "", correo: "",
};

export default function AppSeguros() {
  const [autenticado,         setAutenticado]         = useState(false);
  const [pantalla,            setPantalla]            = useState(1);
  const [cliente,             setCliente]             = useState(CLIENTE_INICIAL);
  const [polizasSeleccionadas, setPolizasSeleccionadas] = useState([]);
  const [porcentaje,          setPorcentaje]          = useState(0.10);
  const [udi,                 setUdi]                 = useState(8.755145);
  const [udiSource,           setUdiSource]           = useState("fallback");
  const [historial,           setHistorial]           = useState([]);
  const [verHistorial,        setVerHistorial]        = useState(false);

  useEffect(() => {
    // Restaurar sesión si sigue vigente
    if (sessionValida()) setAutenticado(true);

    // Cargar historial
    setHistorial(cargarHistorial());

    // Obtener valor UDI desde API
    fetch("/api/udi")
      .then(r => r.json())
      .then(d => { setUdi(d.valor); setUdiSource(d.fuente); })
      .catch(() => setUdiSource("fallback"));
  }, []);

  const handleChange = useCallback((campo, valor) => {
    setCliente(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const irAPantalla5 = useCallback(() => {
    // Guardar en historial al generar cotización
    const polizas    = polizasSeleccionadas.map(id => POLIZAS.find(p => p.id === id)).filter(Boolean);
    const sumaRec    = Number(cliente.ingresoMensual) * 12 * 7;
    const sumaRecUDI = Math.round(sumaRec / udi);
    const entrada = {
      id:         Date.now(),
      fecha:      new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }),
      nombre:     cliente.nombre,
      polizas:    polizas.map(p => p.nombre),
      sumaRecUDI,
    };
    agregarAlHistorial(entrada);
    setHistorial(cargarHistorial());
    setPantalla(5);
  }, [cliente, polizasSeleccionadas, udi]);

  const nuevaCita = useCallback(() => {
    setPantalla(1);
    setPolizasSeleccionadas([]);
    setCliente(CLIENTE_INICIAL);
    setPorcentaje(0.10);
  }, []);

  const handleLogout = useCallback(() => {
    borrarSesion();
    setAutenticado(false);
    setPantalla(1);
    setPolizasSeleccionadas([]);
    setCliente(CLIENTE_INICIAL);
  }, []);

  if (!autenticado) return <PantallaLogin onLogin={() => setAutenticado(true)} />;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.offWhite, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <BarraProgreso pantalla={pantalla} udi={udi} udiSource={udiSource} onLogout={handleLogout} onHistorial={() => setVerHistorial(true)} />

      {pantalla === 1 && <Pantalla1 cliente={cliente} onChange={handleChange} onNext={() => setPantalla(2)} />}
      {pantalla === 2 && <Pantalla2 cliente={cliente} udi={udi} onBack={() => setPantalla(1)} onNext={() => setPantalla(3)} />}
      {pantalla === 3 && <Pantalla3 cliente={cliente} udi={udi} porcentaje={porcentaje} onPorcentaje={setPorcentaje} onBack={() => setPantalla(2)} onNext={() => setPantalla(4)} />}
      {pantalla === 4 && <Pantalla4 cliente={cliente} udi={udi} polizasSeleccionadas={polizasSeleccionadas} onSeleccionar={setPolizasSeleccionadas} onBack={() => setPantalla(3)} onNext={irAPantalla5} />}
      {pantalla === 5 && <Pantalla5 cliente={cliente} polizasSeleccionadas={polizasSeleccionadas} udi={udi} onNuevaCita={nuevaCita} />}

      {verHistorial && <HistorialModal historial={historial} onClose={() => setVerHistorial(false)} />}
    </div>
  );
}
