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

// ─── COLORES DE MARCA ────────────────────────────────────────────────────────
const C = {
  navy:        "#0D2E6B",
  navyMid:     "#1B55A6",
  brandBlue:   "#1B55A6",
  silver:      "#A0AAB8",
  silverLight: "#C8D0DA",
  white:       "#FFFFFF",
  offWhite:    "#F4F7FB",
  gray:        "#5A6478",
  grayLight:   "#E0E6EF",
  mint:        "#00A878",
  danger:      "#C0392B",
  warning:     "#B7791F",
  teal:        "#0077A8",
  whatsapp:    "#25D366",
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = ({ size = 64, style = {} }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `linear-gradient(135deg, ${C.navyMid}, ${C.navy})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", flexShrink: 0,
    boxShadow: "0 4px 20px rgba(27,85,166,0.4)",
    ...style
  }}>
    <img
      src="/logo.png"
      alt="Asegúrate Tu Tranquilidad"
      style={{ width: "85%", height: "85%", objectFit: "contain" }}
      onError={e => {
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "flex";
      }}
    />
    <span style={{ display: "none", fontSize: size * 0.45, color: C.white, fontWeight: 900 }}>A</span>
  </div>
);

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────
const POLIZAS = [
  // ── SMNYL · VIDA ─────────────────────────────────────────────────────────
  {
    id:"smnyl_realiza", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Vida",
    nombre:"Realiza® — Vida Vitalicio", icono:"🛡️", color:C.navyMid,
    plazo:"Vitalicio",
    descripcion:"Seguro de vida individual vitalicio con componente de ahorro. Protege a tus beneficiarios y construye patrimonio con aportaciones adicionales en UDIs, pesos o dólares.",
    beneficios:["Suma asegurada entregada a beneficiarios por fallecimiento","Ahorro acumulable con aportaciones adicionales (excedentes)","Moneda a elegir: UDIs, pesos mexicanos o dólares","Exención del pago de primas por invalidez total permanente","Cobertura adicional por muerte accidental (opcional)","Coberturas complementarias contratables en cualquier momento"],
    desdeUDI:400,
  },
  {
    id:"smnyl_se_adapta", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Vida",
    nombre:"Se Adapta® — Vida Temporal", icono:"🔄", color:"#0369A1",
    plazo:"Renovable cada 5 años hasta 65",
    descripcion:"Seguro de vida temporal de bajo costo que se renueva automáticamente cada 5 años hasta los 65 años. Convertible a plan mayor sin exámenes médicos entre el 3er y 10mo año.",
    beneficios:["Prima muy accesible, solo ofrece protección por fallecimiento","Renovación automática cada 5 años hasta los 65 años","Conversión a Orvi®, Realiza®, Imagina Ser® u Objetivo Vida® sin exámenes","Anticipo del 25% de la suma asegurada por enfermedad terminal (hasta $700,000 MXN)","Opción de coberturas complementarias adicionales","Ideal para etapas tempranas de vida productiva"],
    desdeUDI:200,
  },
  {
    id:"smnyl_orvi", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Vida",
    nombre:"Orvi® — Vida Vitalicio 99", icono:"♾️", color:"#1B55A6",
    plazo:"Hasta los 99 años",
    descripcion:"Seguro de vida individual de protección vitalicia hasta los 99 años. Protege a tu familia de por vida con la suma asegurada que elijas.",
    beneficios:["Protección vitalicia por fallecimiento hasta los 99 años","Suma asegurada en UDIs, pesos o dólares","Anticipo del 25% de la suma por enfermedad terminal (hasta $700,000 MXN)","Exención de primas por invalidez total y permanente (opcional)","Cobertura por muerte accidental adicional (opcional)","Conversión desde Se Adapta® sin exámenes médicos"],
    desdeUDI:450,
  },
  {
    id:"smnyl_vida_mujer", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Vida",
    nombre:"Vida Mujer® — Protección y Ahorro Femenino", icono:"👩", color:"#BE185D",
    plazo:"20 años",
    descripcion:"Seguro de vida individual exclusivo para mujeres con plan de ahorro programado a 20 años. Recibe anticipos de tu suma asegurada desde el 5° año y recuperas el 115% al final del plazo.",
    beneficios:["Plan de ahorro: recibe el 5% cada 2 años a partir del año 5 (años 5, 7, 9, 11, 13, 15, 17)","Al vencimiento en el año 20 recibes el 80% restante (total: 115% de la suma asegurada)","Protección por fallecimiento durante toda la vigencia","Protección por muerte accidental incluida sin costo extra","Protección por viudez: apoyo si fallece tu cónyuge","Exención de pago de primas por invalidez total y permanente","Cobertura adicional por Cáncer Femenino (opcional)","Cobertura por complicaciones del embarazo y padecimientos femeninos (opcional)","Renta por pérdida de ingreso por invalidez total y temporal (opcional)","Edad de contratación: 18 a 55 años"],
    desdeUDI:500,
  },
  {
    id:"smnyl_star_temporal", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Vida",
    nombre:"Star Temporal® — Protección Flexible", icono:"⭐", color:"#0369A1",
    plazo:"Plazo elegido con renovación automática",
    descripcion:"Seguro de vida temporal donde tú eliges el plazo y la forma de pago. Se renueva automáticamente al término del período contratado.",
    beneficios:["Elige el plazo de protección que mejor se adapte a ti","Pago mensual, semestral o anual según tus posibilidades","Renovación automática al término del período","Suma asegurada entregada a beneficiarios por fallecimiento","Anticipo del 25% de la suma por enfermedad terminal (hasta $700,000 MXN)","Coberturas adicionales contratables"],
    desdeUDI:180,
  },
  {
    id:"smnyl_objetivo_vida", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Vida",
    nombre:"Objetivo Vida® — Vida Vitalicio con Inversión", icono:"🎯", color:"#1D4ED8",
    plazo:"Vitalicio",
    descripcion:"Seguro de vida vitalicio con componente de inversión ligado al mercado. Tú decides cuánto y por cuánto tiempo ahorras, con la flexibilidad de elegir el destino del beneficio para tus seres queridos.",
    beneficios:["Protección vitalicia por fallecimiento desde la contratación","Componente de ahorro con rendimientos según el mercado y perfil de riesgo elegido","Elige: beneficiarios reciben Suma Asegurada + Ahorro, o solo Suma Asegurada","Anticipo del 25% de la suma asegurada por enfermedad terminal (hasta $700,000 MXN)","Asesoría para segunda opinión médica en EE.UU. sin costo","Aportaciones adicionales en cualquier momento","Ahorro en dólares o UDIs","Edad de contratación: 18 a 55 años"],
    desdeUDI:500,
  },
  // ── SMNYL · AHORRO / INVERSIÓN ────────────────────────────────────────────
  {
    id:"smnyl_mio", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Ahorro / Inversión",
    nombre:"Mío® — Ahorro por Metas", icono:"🎯", color:"#0F766E",
    plazo:"3 a 10 años por meta",
    descripcion:"Seguro de vida individual de ahorro a largo plazo con hasta 4 metas financieras simultáneas. Suma asegurada en UDIs que protege contra la inflación.",
    beneficios:["Define entre 1 y 4 metas de ahorro con plazos de 3 a 10 años","Suma asegurada en UDIs: mantiene el valor real contra la inflación","Al cumplir cada meta recibes el monto contratado más rendimientos","Protección por invalidez total y permanente (cubre el pago de primas)","Beneficiarios reciben la suma asegurada en caso de fallecimiento","Anticipo del 25% por infarto, ACV, insuficiencia renal o cáncer","Retiros parciales de metas permitidos","Edad de contratación: 18 a 55 años"],
    desdeUDI:350,
  },
  {
    id:"smnyl_star_dotal", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Ahorro / Inversión",
    nombre:"Star Dotal® — Ahorro con Protección", icono:"⭐", color:"#B45309",
    plazo:"5, 10, 15 o 20 años",
    descripcion:"Seguro de vida que genera ahorro durante los años que dure el plan. Al vencimiento recibes el dinero acumulado para cumplir tus metas y sueños.",
    beneficios:["Elige la duración: 5, 10, 15 o 20 años","Moneda a elegir: dólares o UDIs según el plazo","Al vencimiento recibes la suma asegurada más rendimientos generados","En caso de fallecimiento, beneficiarios reciben la suma contratada","Invalidez total: dejas de pagar y recibes el ahorro al final","Opción de beneficio adicional por invalidez permanente"],
    desdeUDI:600,
  },
  {
    id:"smnyl_legado", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Ahorro / Inversión",
    nombre:"Legado® — Patrimonio Heredable", icono:"🏰", color:"#7C3AED",
    plazo:"Vitalicio",
    descripcion:"Seguro de vida individual diseñado para construir y dejar un patrimonio mayor a tu familia. Ahorro a largo plazo en dólares o pesos con rendimiento mínimo garantizado.",
    beneficios:["Suma asegurada libre de impuestos para beneficiarios por fallecimiento","Ahorro en dólares con rendimiento mínimo garantizado del 1%","Ahorro en pesos con rendimiento mínimo garantizado del 3%","Aportaciones adicionales permitidas en cualquier momento","Anticipo del 25% de la suma asegurada por enfermedad terminal (hasta $700,000 MXN o equivalente)","Asesoría para segunda opinión médica en EE.UU.","Las primas no son deducibles de ISR (producto patrimonial)","Edad de contratación: 18 a 65 años"],
    desdeUDI:600,
  },
  {
    id:"smnyl_segubeca", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Ahorro / Inversión",
    nombre:"SeguBeca® — Seguro Educativo", icono:"🎓", color:"#0891B2",
    plazo:"Hasta los 18 años del hijo",
    descripcion:"Seguro de vida individual que asegura la educación universitaria de tus hijos desde su nacimiento hasta los 13 años. Ahorro en dólares o UDIs con protección de orfandad.",
    beneficios:["Fondo de ahorro universitario en dólares o UDIs con rendimientos garantizados","A los 18 años del hijo empieza a recibir mensualidades del fondo acumulado","Si falleces, las primas quedan exentas y el plan continúa sin costo","Anticipo del 15% de la suma asegurada al beneficiario en caso de fallecimiento del asegurado","Exención de primas por invalidez total y permanente del contratante","Opción de conversión a nuevo seguro de vida individual sin exámenes médicos (entre año 3 y 10)","Cobertura adicional por muerte accidental (opcional)","El asegurado (papá/mamá) debe tener entre 18 y 55 años; hijo entre 0 y 13 años"],
    desdeUDI:450,
  },
  // ── SMNYL · RETIRO ────────────────────────────────────────────────────────
  {
    id:"smnyl_imagina", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Retiro",
    nombre:"Imagina Ser® — Retiro con Estímulo Fiscal", icono:"💰", color:C.mint,
    plazo:"Hasta el retiro (60 años+)",
    descripcion:"Seguro de vida individual con ahorro para el retiro, sujeto a estímulos fiscales (PPR). Rendimiento mínimo garantizado y opciones de ingreso mensual vitalicio.",
    beneficios:["Rendimiento mínimo garantizado sobre el ahorro acumulado","Retiro del fondo a partir de los 60 años (mínimo 5 años de vigencia)","Deducible de ISR sobre aportaciones anuales (Art. 151 LISR)","Retiro libre de impuestos al cumplir requisitos fiscales","Ingreso mensual vitalicio con Nuevo Plenitud® al jubilarte","Protección por fallecimiento durante el período de ahorro","Aportaciones adicionales en cualquier momento","El contratante y asegurado deben ser la misma persona (PPR)"],
    desdeUDI:1100,
  },
  {
    id:"smnyl_imagina_pl", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Retiro",
    nombre:"Imagina Ser Pagos Limitados® — PPR Plazo Fijo", icono:"🏦", color:"#0D6E64",
    plazo:"Pagas 10 o 15 años, disfrutas toda la vida",
    descripcion:"Plan de ahorro para el retiro con estímulos fiscales (PPR) en el que terminas de pagar en 10 o 15 años y tu dinero sigue creciendo hasta la jubilación. Ahorra en dólares o UDIs.",
    beneficios:["Pagas primas solo 10 años (18–55 años) o 15 años (18–50 años)","Rendimiento mínimo garantizado en dólares (1%) o UDIs (3%)","Deducible de ISR sobre aportaciones (Art. 151 LISR)","Retiro a partir de los 60 años (mínimo 5 años de vigencia)","Cobro en un solo pago o como renta mensual vitalicia","Anticipo del 25% de la suma asegurada por enfermedad terminal","Cobertura adicional por muerte accidental","El contratante y el asegurado deben ser la misma persona (PPR)"],
    desdeUDI:1200,
  },
  {
    id:"smnyl_nuevo_plenitud", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Retiro",
    nombre:"Nuevo Plenitud® — Renta Vitalicia Garantizada", icono:"🌅", color:"#EA580C",
    plazo:"Renta vitalicia desde la jubilación",
    descripcion:"Seguro de vida con renta mensual vitalicia garantizada para la etapa de retiro. Complementa tu AFORE y asegura ingresos mensuales de por vida en dólares o UDIs.",
    beneficios:["Renta mensual vitalicia garantizada en dólares o UDIs","Aguinaldo de retiro en diciembre durante los primeros 5 años (equivale a una mensualidad)","Opción de retiro anticipado: solicita un pago equivalente a 6 mensualidades en cualquier momento","Anticipo del 25% de la suma asegurada por enfermedad terminal (hasta $700,000 MXN)","Protección por fallecimiento antes del inicio de la renta","Ideal como complemento a Imagina Ser® al llegar al retiro"],
    desdeUDI:1500,
  },
  // ── SMNYL · GASTOS MÉDICOS ────────────────────────────────────────────────
  {
    id:"smnyl_alfa_medical", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Gastos Médicos",
    nombre:"Alfa Medical® — GMM Nacional", icono:"🏥", color:C.teal,
    plazo:"Anual renovable",
    descripcion:"Seguro de Gastos Médicos Mayores individual con amplia red médica nacional. Cubre enfermedades, accidentes, cirugías, hospitalizaciones y medicamentos.",
    beneficios:["Coaseguro a elegir: 10%, 15%, 20% o 25% con tope máximo","Red médica SMNYL en todo México","Cobertura materna desde el 5to mes de embarazo","Consulta médica a domicilio (primera consulta sin costo)","Asesoría médica virtual, psicológica y nutricional","Cobertura de medicamentos con descuento en farmacias afiliadas","Protección por enfermedades graves y accidentes","Vigencia anual con renovación garantizada"],
    desdeUDI:900,
  },
  {
    id:"smnyl_alfa_flex", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Gastos Médicos",
    nombre:"Alfa Medical Flex® — GMM Adaptable", icono:"💊", color:"#0077A8",
    plazo:"Anual renovable",
    descripcion:"Gastos Médicos Mayores flexible que se adapta a tu presupuesto. Acceso a hospitales en México con beneficios adicionales por accidente y cobertura internacional.",
    beneficios:["Deducible reducido a la mitad en caso de accidente","50% de descuento en copago en la primera hospitalización","Cobertura internacional de emergencia hasta 12 meses continuos","Sin coaseguro en el extranjero, solo pagas el deducible","Protección funeraria incluida (traslado de restos +100 km)","Anticipo del 50% de la suma asegurada por enfermedad terminal","Cobertura de bebé con condiciones congénitas o complicaciones de parto","Apoyo económico por maternidad desde el 5to mes"],
    desdeUDI:950,
  },
  {
    id:"smnyl_alfa_int", aseguradora:"Seguros Monterrey New York Life", logo:"🏛️", ramo:"Gastos Médicos",
    nombre:"Alfa Medical Internacional® — Cobertura Mundial", icono:"🌍", color:"#0891B2",
    plazo:"Anual renovable",
    descripcion:"Seguro de Gastos Médicos con cobertura en cualquier parte del mundo. Atención con los mejores especialistas internacionales en hospitales de primer nivel.",
    beneficios:["Cobertura médica en todo el mundo sin restricciones de red","Cuarto semiprivado hasta $500 USD/día; UCI hasta $1,000 USD/día","Póliza en dólares americanos sin pérdida por inflación","Urgencias y tratamientos programados en el extranjero","Repatriación sanitaria incluida","Cobertura de medicamentos y honorarios médicos internacionales","Acceso a especialistas de clase mundial","Residencia en México requerida; edad 18-64 años"],
    desdeUDI:1800,
  },
  // ── GNP · VIDA ────────────────────────────────────────────────────────────
  {
    id:"gnp_privilegio", aseguradora:"GNP Seguros", logo:"🔷", ramo:"Vida",
    nombre:"Privilegio® — Protección Temporal", icono:"⚡", color:"#6D28D9",
    plazo:"1 a 30 años o hasta los 65",
    descripcion:"Seguro de vida temporal de alta protección en pesos o dólares. Plazos flexibles de 1 a 30 años con suma asegurada actualizable con la inflación.",
    beneficios:["Suma asegurada desde $5,000,000 MXN o $500,000 USD","Plazos: 1, 5, 10, 15, 20, 30 años o a los 65 años","Suma actualizada con inflación (en pesos)","Orientación médica telefónica 24/7 sin costo adicional","Cobertura adicional por invalidez total (opcional)","Cobertura adicional por muerte accidental (opcional)","Cobertura mujer: enfermedades femeninas (opcional)","Prima muy accesible con alta suma asegurada"],
    desdeUDI:350,
  },
  // ── GNP · RETIRO ──────────────────────────────────────────────────────────
  {
    id:"gnp_proyecta", aseguradora:"GNP Seguros", logo:"🔷", ramo:"Retiro",
    nombre:"Proyecta® — Retiro Garantizado", icono:"📈", color:"#B45309",
    plazo:"10 o 15 años de pago",
    descripcion:"Plan de ahorro garantizado para el retiro a los 55–70 años con deducibilidad fiscal ISR Art. 185. Ideal para quienes buscan certeza en su futuro financiero.",
    beneficios:["Ahorro garantizado en dólares o pesos (desde $20,000 USD o $400,000 MXN)","Retiro a los 55, 60, 65 o 70 años","Deducible de ISR Art. 185 cada año que aportas","Libre de impuestos al cumplir 60 años con 5 años de vigencia","Cobertura por fallecimiento durante el período de ahorro","Aportaciones extraordinarias permitidas","Crecimiento garantizado sin riesgo de mercado"],
    desdeUDI:1200,
  },
  {
    id:"gnp_consolida", aseguradora:"GNP Seguros", logo:"🔷", ramo:"Retiro",
    nombre:"Consolida Total® — PPR Doble Fiscal", icono:"🏆", color:"#0F766E",
    plazo:"Hasta los 65 años",
    descripcion:"Plan de ahorro flexible para retiro a los 65 años con doble estrategia fiscal: Art. 151 y Art. 185. Máxima deducibilidad para optimizar tu carga fiscal.",
    beneficios:["Doble estrategia fiscal: Art. 151 y Art. 185 LISR","Ahorro garantizado a los 65 años desde $400,000 MXN","Sin saldos mínimos requeridos ni comisiones","Aportaciones flexibles según tu capacidad en cada etapa","Cobertura por fallecimiento incluida durante el plan","Edad de contratación: 18 a 55 años","Sin penalización por ajustar aportaciones"],
    desdeUDI:1300,
  },
  // ── GNP · AHORRO ─────────────────────────────────────────────────────────
  {
    id:"gnp_vida_inversion", aseguradora:"GNP Seguros", logo:"🔷", ramo:"Ahorro / Inversión",
    nombre:"Vida Inversión® — Instrumento Financiero", icono:"💹", color:"#15803D",
    plazo:"A 65 años o vitalicio",
    descripcion:"Seguro de vida con rendimientos superiores a tasa bancaria, alta liquidez y aportaciones desde $1,000 MXN. Perfil de inversión a tu medida.",
    beneficios:["Rendimientos superiores a los de instituciones bancarias","Aportaciones adicionales desde $1,000 MXN sin comisiones","Retiros parciales libres en cualquier momento","Perfil de inversión: conservador, moderado o audaz","Suma asegurada desde $400,000 MXN (actualizable)","Sin penalización por retiro anticipado","Protección por fallecimiento incluida durante la vigencia"],
    desdeUDI:800,
  },
];

const RAMOS = ["Todos", "Vida", "Gastos Médicos", "Retiro", "Ahorro / Inversión"];

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const S = {
  btn:          { background: `linear-gradient(135deg, ${C.navyMid}, #2468C0)`, color: C.white, border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px", boxShadow: "0 2px 12px rgba(27,85,166,0.4)" },
  btnSilver:    { background: `linear-gradient(135deg, ${C.silver}, ${C.silverLight})`, color: C.navy, border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px", boxShadow: "0 2px 8px rgba(160,170,184,0.35)" },
  btnSec:       { background: "transparent", color: C.navyMid, border: `1.5px solid ${C.navyMid}`, borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnWA:        { background: "linear-gradient(135deg, #25D366, #128C7E)", color: C.white, border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px", boxShadow: "0 2px 8px rgba(37,211,102,0.35)" },
  input:        { width: "100%", padding: "11px 14px", borderRadius: 7, fontSize: 14, border: `1.5px solid ${C.grayLight}`, outline: "none", boxSizing: "border-box", background: C.white, fontFamily: "inherit", color: C.navy },
  label:        { fontSize: 11, fontWeight: 700, color: C.gray, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.5px" },
  card:         { background: C.white, borderRadius: 12, padding: 20, boxShadow: "0 2px 16px rgba(13,46,107,0.07)", marginBottom: 12, border: `1px solid ${C.grayLight}` },
  header:       { background: `linear-gradient(150deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: "28px 24px 24px", borderBottom: `3px solid ${C.silver}` },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 },
  badge:        { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px" },
};

// ─── SESIÓN Y HISTORIAL ───────────────────────────────────────────────────────
const SESSION_KEY = "asegurate_session";
const HISTORY_KEY = "asegurate_historial";
const SESSION_TTL = 12 * 60 * 60 * 1000;
const sessionValida    = () => { try { const ts = localStorage.getItem(SESSION_KEY); return ts ? Date.now() - Number(ts) < SESSION_TTL : false; } catch { return false; } };
const guardarSesion    = () => { try { localStorage.setItem(SESSION_KEY, String(Date.now())); } catch {} };
const borrarSesion     = () => { try { localStorage.removeItem(SESSION_KEY); } catch {} };
const cargarHistorial  = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
const agregarAlHistorial = (entrada) => { try { const h = cargarHistorial(); h.unshift(entrada); localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20))); } catch {} };

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
  <div style={{ background: C.navy, padding: "12px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={28} />
        <div>
          <div style={{ fontSize: 10, color: C.silverLight, fontWeight: 700, letterSpacing: "1px" }}>ASEGÚRATE TU TRANQUILIDAD</div>
          <div style={{ fontSize: 9, color: udiSource === "banxico" ? C.mint : C.silver }}>
            {udiSource === "banxico" ? "🟢" : "🟡"} 1 UDI = ${udi.toFixed(4)} MXN
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onHistorial} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>📋</button>
        <button onClick={onLogout}    style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>Salir</button>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {["Perfil", "Protección", "Proyección", "Pólizas", "Cotización"].map((t, i) => (
        <div key={i} style={{ textAlign: "center", flex: 1 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", margin: "0 auto 4px", background: pantalla > i + 1 ? C.silver : pantalla === i + 1 ? C.silver : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: pantalla >= i + 1 ? C.navy : "rgba(255,255,255,0.3)" }}>
            {pantalla > i + 1 ? "✓" : i + 1}
          </div>
          <div style={{ fontSize: 9, color: pantalla === i + 1 ? C.silverLight : "rgba(255,255,255,0.3)", fontWeight: pantalla === i + 1 ? 700 : 400, paddingBottom: 8 }}>{t}</div>
        </div>
      ))}
    </div>
    <div style={{ height: 3, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ height: "100%", background: C.silver, width: `${((pantalla - 1) / 4) * 100}%`, transition: "width 0.4s" }} />
    </div>
  </div>
);

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const PantallaLogin = ({ onLogin }) => {
  const [usuario, setUsuario]   = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrar, setMostrar]   = useState(false);
  const handleLogin = async () => {
    if (!usuario || !password) { setError("Ingresa usuario y contraseña."); return; }
    setCargando(true); setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
      if (res.ok) { guardarSesion(); onLogin(); }
      else { const d = await res.json(); setError(d.error || "Usuario o contraseña incorrectos."); }
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    finally { setCargando(false); }
  };
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <Logo size={88} style={{ margin: "0 auto 20px" }} />
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: "0.3px" }}>Asegúrate Tu Tranquilidad</div>
        <div style={{ fontSize: 12, color: C.silverLight, marginTop: 4, fontWeight: 700, letterSpacing: "1.5px" }}>ASESORES EN SEGUROS</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Portal de Cotización · Uso interno</div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 22 }}>Iniciar sesión</div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ ...S.label, color: "rgba(255,255,255,0.4)" }}>Usuario</label>
          <input style={{ ...S.input, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: C.white }}
            placeholder="tu.usuario" value={usuario}
            onChange={e => { setUsuario(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()} autoComplete="username" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ ...S.label, color: "rgba(255,255,255,0.4)" }}>Contraseña</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...S.input, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: C.white, paddingRight: 44 }}
              placeholder="••••••••" type={mostrar ? "text" : "password"} value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()} autoComplete="current-password" />
            <button onClick={() => setMostrar(!mostrar)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.35)" }}>
              {mostrar ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        {error && (
          <div style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.35)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#FF8A80", marginBottom: 16 }}>⚠️ {error}</div>
        )}
        <button style={{ ...S.btn, width: "100%", opacity: cargando ? 0.7 : 1 }} onClick={handleLogin} disabled={cargando}>
          {cargando ? "Verificando…" : "Entrar al sistema"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 28, textAlign: "center" }}>
        SMNYL · GNP · Monterrey, N.L.{"\n"}
        <a href="https://instagram.com/aseguratetutranquilidad" target="_blank" rel="noreferrer"
          style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>
          @aseguratetutranquilidad
        </a>
      </div>
    </div>
  );
};

// ─── PANTALLA 1 — PERFIL ──────────────────────────────────────────────────────
const Pantalla1 = ({ cliente, onChange, onNext }) => (
  <div>
    <div style={S.header}>
      <div style={{ fontSize: 10, color: C.silverLight, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 6 }}>NUEVA COTIZACIÓN</div>
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
        <div style={{ fontSize: 10, color: C.silverLight, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>ANÁLISIS DE RIESGO</div>
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
        <div style={{ ...S.card, background: "#EBF2FF", border: `1px solid ${C.navyMid}25` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>📊 ¿Por qué UDIs?</div>
          <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>Las UDIs se actualizan diariamente con la inflación (Banxico). Garantizan que el valor real de la cobertura no disminuya con el tiempo. <strong>1 UDI = ${udi.toFixed(4)} MXN hoy.</strong></div>
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
        <div style={{ fontSize: 10, color: C.silverLight, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>PROYECCIÓN FINANCIERA</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>{cliente.nombre}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Plan de Ahorro en UDIs · Rendimiento real 6% anual</div>
      </div>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: C.gray, fontWeight: 700, letterSpacing: "0.5px" }}>APORTACIÓN SUGERIDA</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, marginTop: 2 }}>{fmtUDI(aportacionUDI)}<span style={{ fontSize: 13, color: C.gray, fontWeight: 400 }}>/mes</span></div>
              <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{fmtMXN(aportacion)}/mes</div>
            </div>
            <div style={{ fontSize: 38 }}>📐</div>
          </div>
          <div style={{ background: C.offWhite, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: C.gray, fontWeight: 700 }}>% del ingreso destinado al ahorro</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{Math.round(porcentaje * 100)}%</span>
            </div>
            <input type="range" min={5} max={20} step={1} value={Math.round(porcentaje * 100)}
              onChange={e => onPorcentaje(Number(e.target.value) / 100)}
              style={{ width: "100%", accentColor: C.navyMid, cursor: "pointer" }} />
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
                  <stop offset="5%" stopColor={C.navyMid} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.navyMid} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grayLight} />
              <XAxis dataKey="año" tickFormatter={v => `${v}a`} tick={{ fontSize: 11, fill: C.gray }} />
              <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: C.gray }} />
              <Tooltip formatter={(v, n) => [fmtUDI(v), n === "conSeguro" ? "Con seguro" : "Sin seguro"]} labelFormatter={v => `Año ${v}`} />
              <Area type="monotone" dataKey="sinSeguro" stroke={C.grayLight} fill={C.grayLight} strokeWidth={1.5} />
              <Area type="monotone" dataKey="conSeguro" stroke={C.navyMid} fill="url(#gradSeg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[10, 20, 30].map(años => {
            const d = datos.find(d => d.año === años) || datos[datos.length - 1];
            return (
              <div key={años} style={{ ...S.card, textAlign: "center", marginBottom: 0, padding: 14 }}>
                <div style={{ fontSize: 10, color: C.gray, fontWeight: 700 }}>A {años} AÑOS</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.navyMid, margin: "6px 0 2px" }}>{fmtUDI(d?.conSeguro || 0)}</div>
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

// ─── PANTALLA 4 — COMPARADOR ──────────────────────────────────────────────────
const Pantalla4 = ({ cliente, udi, polizasSeleccionadas, onSeleccionar, onBack, onNext }) => {
  const [filtroRamo, setFiltroRamo] = useState("Todos");
  const [expandida, setExpandida]   = useState(null);
  const polizasFiltradas = filtroRamo === "Todos" ? POLIZAS : POLIZAS.filter(p => p.ramo === filtroRamo);
  const togglePoliza = (id) => {
    if (polizasSeleccionadas.includes(id)) onSeleccionar(polizasSeleccionadas.filter(p => p !== id));
    else if (polizasSeleccionadas.length < 2) onSeleccionar([...polizasSeleccionadas, id]);
    else onSeleccionar([polizasSeleccionadas[1], id]);
  };
  return (
    <div>
      <div style={S.header}>
        <div style={{ fontSize: 10, color: C.silverLight, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>COMPARADOR DE PÓLIZAS</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>{cliente.nombre}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Selecciona 1 o 2 pólizas · SMNYL · GNP</div>
      </div>
      <div style={{ padding: "12px 20px 0", background: C.white, borderBottom: `1px solid ${C.grayLight}` }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10 }}>
          {RAMOS.map(r => (
            <button key={r} onClick={() => setFiltroRamo(r)} style={{ whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", background: filtroRamo === r ? C.navy : C.grayLight, color: filtroRamo === r ? C.silverLight : C.gray }}>
              {r}
            </button>
          ))}
        </div>
      </div>
      {polizasSeleccionadas.length > 0 && (
        <div style={{ padding: "8px 20px", background: "#EBF2FF", borderBottom: `1px solid ${C.navyMid}20` }}>
          <div style={{ fontSize: 12, color: C.navy, fontWeight: 600 }}>
            {polizasSeleccionadas.length === 1 ? "✅ 1 póliza seleccionada · puedes agregar 1 más para comparar" : "⚖️ 2 pólizas listas para comparar"}
          </div>
        </div>
      )}
      <div style={{ padding: "14px 20px 0" }}>
        {polizasFiltradas.map(p => {
          const idx = polizasSeleccionadas.indexOf(p.id);
          const sel = idx !== -1;
          const abierta = expandida === p.id;
          return (
            <div key={p.id} style={{ position: "relative", marginBottom: 12 }}>
              {sel && (
                <div style={{ position: "absolute", top: -8, right: -6, zIndex: 1, width: 22, height: 22, borderRadius: "50%", background: p.color, color: C.white, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>{idx + 1}</div>
              )}
              <div onClick={() => togglePoliza(p.id)} style={{ ...S.card, cursor: "pointer", marginBottom: 0, border: sel ? `2px solid ${p.color}` : `1px solid ${C.grayLight}`, background: sel ? `${p.color}08` : C.white, transition: "all 0.2s" }}>
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
                <div onClick={e => { e.stopPropagation(); setExpandida(abierta ? null : p.id); }} style={{ marginTop: 10, fontSize: 11, color: C.teal, fontWeight: 600, cursor: "pointer" }}>
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
      <NavButtons onBack={onBack} onNext={onNext} nextLabel={polizasSeleccionadas.length === 2 ? "Comparar pólizas ⚖️" : "Generar cotización →"} disabled={polizasSeleccionadas.length === 0} />
    </div>
  );
};

// ─── PANTALLA 5 — COTIZACIÓN FINAL ───────────────────────────────────────────
const Pantalla5 = ({ cliente, polizasSeleccionadas, udi, porcentaje, onNuevaCita }) => {
  const polizas       = polizasSeleccionadas.map(id => POLIZAS.find(p => p.id === id)).filter(Boolean);
  const hoy           = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const gastos        = Number(cliente.gastosMensuales) || Number(cliente.ingresoMensual) * 0.7;
  const meses         = gastos > 0 ? Math.round((Number(cliente.ingresoMensual) * 3) / gastos) : 0;
  const sumaRec       = Number(cliente.ingresoMensual) * 12 * 7;
  const sumaRecUDI    = Math.round(sumaRec / udi);
  const esComparacion = polizas.length === 2;

  const compartirWhatsApp = () => {
    const lineas = [
      `*Cotización — Asegúrate Tu Tranquilidad*`,
      ``,
      `👤 *${cliente.nombre}*  |  ${cliente.edad} años`,
      `💰 Ingreso mensual: ${fmtMXN(cliente.ingresoMensual)}`,
      ``,
      ...(esComparacion
        ? [`⚖️ *Comparativa:*`, ...polizas.map((p, i) => `${i+1}. *${p.nombre}*\n   Prima desde: ${p.desdeUDI} UDIs/mes (${udiAMXN(p.desdeUDI, udi)})`)]
        : polizas.map(p => [`🛡️ *${p.nombre}*`, `   Prima desde: ${p.desdeUDI} UDIs/mes (${udiAMXN(p.desdeUDI, udi)})`]).flat()),
      ``,
      `📊 Cobertura recomendada: ${fmtUDI(sumaRecUDI)} (${fmtMXN(sumaRec)})`,
      ``,
      `_Cotización informativa. Valores exactos al contratar._`,
      ``,
      `Antonio Caporali · Asegúrate Tu Tranquilidad`,
      `📸 @aseguratetutranquilidad`,
      `📧 antonio.caporali@gmail.com`,
    ];
    window.open(`https://wa.me/?text=${encodeURIComponent(lineas.join("\n"))}`, "_blank");
  };

  return (
    <div>
      <div style={S.header}>
        <div style={{ fontSize: 10, color: C.silverLight, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4 }}>
          {esComparacion ? "COMPARATIVA DE PÓLIZAS" : "COTIZACIÓN PERSONALIZADA"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>{cliente.nombre}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{hoy}</div>
      </div>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ ...S.card, borderTop: `4px solid ${C.navyMid}` }}>
          {/* Encabezado asesor */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${C.grayLight}` }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>Asegúrate Tu Tranquilidad</div>
              <div style={{ fontSize: 10, color: C.gray, marginTop: 2, fontWeight: 700, letterSpacing: "0.8px" }}>ASESORES EN SEGUROS · MONTERREY, N.L.</div>
              <div style={{ fontSize: 11, color: C.navyMid, marginTop: 4 }}>📸 @aseguratetutranquilidad</div>
            </div>
            <Logo size={48} />
          </div>
          {/* Datos prospecto */}
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
          {/* Pólizas */}
          {esComparacion ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: C.navy, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 10 }}>⚖️ COMPARATIVA DE PÓLIZAS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {polizas.map((p, i) => (
                  <div key={p.id} style={{ background: `${p.color}07`, border: `1.5px solid ${p.color}25`, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 9, color: p.color, fontWeight: 700, marginBottom: 4 }}>OPCIÓN {i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: p.color, lineHeight: 1.3 }}>{p.icono} {p.nombre}</div>
                    <div style={{ fontSize: 10, color: C.gray, marginTop: 4 }}>{p.aseguradora}</div>
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${p.color}20` }}>
                      <div style={{ fontSize: 10, color: C.gray }}>Prima desde</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: p.color }}>{p.desdeUDI} <span style={{ fontSize: 10 }}>UDIs/mes</span></div>
                      <div style={{ fontSize: 10, color: C.gray }}>{udiAMXN(p.desdeUDI, udi)}/mes</div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 10, color: C.gray }}><strong>Plazo:</strong> {p.plazo}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {polizas.map(p => (
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
          ) : polizas[0] && (
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
          <div style={{ background: "#EBF2FF", borderRadius: 8, padding: 10, marginBottom: 18, border: `1px solid ${C.navyMid}25` }}>
            <div style={{ fontSize: 11, color: C.gray, lineHeight: 1.5 }}>
              💡 <strong>Sobre las UDIs:</strong> Actualizadas diariamente por Banxico. Valor actual: <strong>${udi.toFixed(6)} MXN</strong>. Los valores exactos se determinan al contratar.
            </div>
          </div>
          {/* Tarjeta de contacto */}
          <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, borderRadius: 12, padding: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Logo size={40} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>Antonio Caporali</div>
                <div style={{ fontSize: 10, color: C.silver, fontWeight: 700, letterSpacing: "0.5px" }}>ASEGÚRATE TU TRANQUILIDAD · SMNYL & GNP</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>✉️ antonio.caporali@gmail.com</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>📍 Monterrey, N.L.</div>
              <div style={{ fontSize: 11, color: C.silverLight, gridColumn: "1 / -1" }}>
                📸{" "}
                <a href="https://instagram.com/aseguratetutranquilidad" target="_blank" rel="noreferrer"
                  style={{ color: C.silverLight, textDecoration: "none", fontWeight: 700 }}>
                  @aseguratetutranquilidad
                </a>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.gray, textAlign: "center", marginBottom: 16, lineHeight: 1.5 }}>
            Esta cotización es informativa. Los valores exactos se determinan en el proceso formal de contratación.
          </div>
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={28} />
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>Historial de cotizaciones</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.gray }}>✕</button>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {historial.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: C.gray }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No hay cotizaciones guardadas aún.</div>
          </div>
        ) : historial.map(entry => (
          <div key={entry.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.grayLight}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{entry.nombre}</div>
              <div style={{ fontSize: 11, color: C.gray, flexShrink: 0, marginLeft: 8 }}>{entry.fecha}</div>
            </div>
            <div style={{ fontSize: 12, color: C.navyMid, marginTop: 3 }}>{entry.polizas.join(" · ")}</div>
            <div style={{ fontSize: 12, color: C.mint, marginTop: 2 }}>Cobertura: {fmtUDI(entry.sumaRecUDI)}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const CLIENTE_INICIAL = { nombre: "", edad: "", estadoCivil: "casado", hijos: "0", ingresoMensual: "", deudas: "", gastosMensuales: "", telefono: "", correo: "" };

export default function AppSeguros() {
  const [autenticado,          setAutenticado]          = useState(false);
  const [pantalla,             setPantalla]             = useState(1);
  const [cliente,              setCliente]              = useState(CLIENTE_INICIAL);
  const [polizasSeleccionadas, setPolizasSeleccionadas] = useState([]);
  const [porcentaje,           setPorcentaje]           = useState(0.10);
  const [udi,                  setUdi]                  = useState(8.755145);
  const [udiSource,            setUdiSource]            = useState("fallback");
  const [historial,            setHistorial]            = useState([]);
  const [verHistorial,         setVerHistorial]         = useState(false);

  useEffect(() => {
    if (sessionValida()) setAutenticado(true);
    setHistorial(cargarHistorial());
    fetch("/api/udi").then(r => r.json()).then(d => { setUdi(d.valor); setUdiSource(d.fuente); }).catch(() => {});
  }, []);

  const handleChange  = useCallback((campo, valor) => setCliente(prev => ({ ...prev, [campo]: valor })), []);
  const irAPantalla5  = useCallback(() => {
    const polizas    = polizasSeleccionadas.map(id => POLIZAS.find(p => p.id === id)).filter(Boolean);
    const sumaRecUDI = Math.round((Number(cliente.ingresoMensual) * 12 * 7) / udi);
    agregarAlHistorial({ id: Date.now(), fecha: new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }), nombre: cliente.nombre, polizas: polizas.map(p => p.nombre), sumaRecUDI });
    setHistorial(cargarHistorial());
    setPantalla(5);
  }, [cliente, polizasSeleccionadas, udi]);
  const nuevaCita    = useCallback(() => { setPantalla(1); setPolizasSeleccionadas([]); setCliente(CLIENTE_INICIAL); setPorcentaje(0.10); }, []);
  const handleLogout = useCallback(() => { borrarSesion(); setAutenticado(false); setPantalla(1); setPolizasSeleccionadas([]); setCliente(CLIENTE_INICIAL); }, []);

  if (!autenticado) return <PantallaLogin onLogin={() => setAutenticado(true)} />;
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.offWhite, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <BarraProgreso pantalla={pantalla} udi={udi} udiSource={udiSource} onLogout={handleLogout} onHistorial={() => setVerHistorial(true)} />
      {pantalla === 1 && <Pantalla1 cliente={cliente} onChange={handleChange} onNext={() => setPantalla(2)} />}
      {pantalla === 2 && <Pantalla2 cliente={cliente} udi={udi} onBack={() => setPantalla(1)} onNext={() => setPantalla(3)} />}
      {pantalla === 3 && <Pantalla3 cliente={cliente} udi={udi} porcentaje={porcentaje} onPorcentaje={setPorcentaje} onBack={() => setPantalla(2)} onNext={() => setPantalla(4)} />}
      {pantalla === 4 && <Pantalla4 cliente={cliente} udi={udi} polizasSeleccionadas={polizasSeleccionadas} onSeleccionar={setPolizasSeleccionadas} onBack={() => setPantalla(3)} onNext={irAPantalla5} />}
      {pantalla === 5 && <Pantalla5 cliente={cliente} polizasSeleccionadas={polizasSeleccionadas} udi={udi} porcentaje={porcentaje} onNuevaCita={nuevaCita} />}
      {verHistorial && <HistorialModal historial={historial} onClose={() => setVerHistorial(false)} />}
    </div>
  );
}
