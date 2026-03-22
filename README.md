# Asegúrate Tu Tranquilidad — App de Ventas v2.0

Herramienta de cotización para asesores NYL y GNP. Se instala como app en iPhone (PWA).

## Publicar en Vercel (primera vez)

### 1. Subir a GitHub
- Ve a [github.com](https://github.com) → New repository → nombra `app-seguros`
- Descarga [GitHub Desktop](https://desktop.github.com)
- Abre GitHub Desktop → File → Add Local Repository → selecciona esta carpeta
- Escribe un mensaje de commit y haz clic en **Commit to main**
- Clic en **Publish repository** (o **Push origin**)

### 2. Configurar variables de entorno en Vercel
- Ve a [vercel.com](https://vercel.com) → Add New Project → selecciona `app-seguros`
- Antes de hacer Deploy, abre **Environment Variables** y agrega:

| Variable | Valor |
|----------|-------|
| `ASESOR_USUARIO` | `antonio.caporali` |
| `ASESOR_PASSWORD` | tu contraseña segura |
| `BANXICO_TOKEN` | (opcional, ver abajo) |

- Clic en **Deploy**

### 3. Instalar en iPhone
- Abre Safari → entra a tu URL de Vercel
- Toca el ícono de compartir → "Agregar a pantalla de inicio"
- Nombre: **Asegúrate**

---

## Token de Banxico (UDI en tiempo real)

Sin el token la app usa un valor aproximado. Para tenerlo actualizado cada día:
1. Ve a https://www.banxico.org.mx/SieAPIRest/service/v1/token
2. Llena el formulario con tu correo (es gratis)
3. Te mandan el token por correo
4. Agrégalo en Vercel → Settings → Environment Variables → `BANXICO_TOKEN`
5. Redeploy

---

## Tecnologías
- Next.js 14 · React 18 · Recharts · PWA
