import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { usuario, password } = await request.json();

    const USUARIO  = process.env.ASESOR_USUARIO;
    const PASSWORD = process.env.ASESOR_PASSWORD;

    if (!USUARIO || !PASSWORD) {
      return NextResponse.json(
        { error: "Credenciales no configuradas. Agrega ASESOR_USUARIO y ASESOR_PASSWORD en las variables de entorno de Vercel." },
        { status: 500 }
      );
    }

    if (usuario === USUARIO && password === PASSWORD) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: "Error en el servidor." }, { status: 500 });
  }
}
