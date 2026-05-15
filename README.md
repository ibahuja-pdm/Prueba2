# Mantenimiento PDM — GitHub Pages

App web de gestión de mantenimiento predictivo. Funciona 100% en el navegador, sin servidor.

## Estructura

```
pdm-app/
├── index.html               ← LOGIN (entrada principal de GitHub Pages)
├── menu.html                ← Menú principal (post-login)
├── css/global.css           ← Estilos compartidos
├── js/auth.service.js       ← Autenticación con localStorage
└── modules/
    ├── hmi/index.html       ← ✅ HMI Monitoreo (funcional)
    ├── dashboard/index.html ← 🔜 Próximamente
    ├── mp/index.html        ← 🔜 Próximamente
    ├── qr/index.html        ← 🔜 Próximamente
    └── inventario/index.html← 🔜 Próximamente
```

## Despliegue en GitHub Pages

1. Crea un repositorio en GitHub (ej. `pdm-app`)
2. Sube **todo el contenido** de esta carpeta a la raíz del repo
3. Ve a **Settings → Pages**
4. Source: **Deploy from a branch** → `main` → `/ (root)`
5. Guarda — en minutos estará en:
   `https://TU_USUARIO.github.io/pdm-app/`

> GitHub Pages sirve `index.html` automáticamente — el login aparece directo.

## Usuarios de prueba

| Usuario    | Contraseña | Rol        |
|------------|-----------|------------|
| carlos     | pdm2024   | Técnico    |
| supervisor | admin123  | Supervisor |

## Flujo de navegación

```
index.html (login)
    ↓ login exitoso
menu.html (menú principal)
    ↓ tap tarjeta
modules/hmi/index.html  ←── ✅ funcional
modules/*/index.html    ←── 🔜 próximamente
```
