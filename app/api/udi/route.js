import { NextResponse } from "next/server";

// Serie SF43718 = UDI (Banxico SIE API)
const BANXICO_URL =
  "https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno";

export async function GET() {
  const token = process.env.BANXICO_TOKEN;

  if (token) {
    try {
      const res = await fetch(BANXICO_URL, {
        headers: { "Bmx-Token": token },
        next: { revalidate: 3600 }, // cache 1 hora
      });

      if (res.ok) {
        const data = await res.json();
        const valor = parseFloat(data?.bmx?.series?.[0]?.datos?.[0]?.dato);
        if (!isNaN(valor)) {
          return NextResponse.json({ valor, fuente: "banxico" });
        }
      }
    } catch {
      // cae al fallback
    }
  }

  // Fallback: valor aproximado (actualizar manualmente si no hay token)
  return NextResponse.json({ valor: 8.755145, fuente: "fallback" });
}
