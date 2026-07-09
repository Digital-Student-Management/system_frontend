# Frontend — Sistema de Gestión Escolar Digital (GED)

Interfaz web del sistema, desarrollada como **Single Page Application** con **React 19 + Vite**.
Consume los 9 microservicios del backend a través de un **proxy** configurado en `vite.config.js`.

> 📖 Para instrucciones de ejecución de **todo el sistema** (backend + frontend), consulta el
> [README raíz del proyecto](../README.md).

---

## 🧰 Stack tecnológico

| Herramienta          | Versión | Rol                              |
|----------------------|---------|----------------------------------|
| **React**            | 19      | Framework de UI                  |
| **Vite**             | 8       | Build tool y servidor de desarrollo |
| **react-router-dom** | 7       | Navegación SPA                   |
| **axios**            | 1.x     | Cliente HTTP (con interceptores JWT) |
| **react-hook-form**  | 7       | Manejo de formularios            |
| **react-toastify**   | 11      | Notificaciones                   |
| **react-icons**      | 5       | Íconos SVG                       |
| **recharts**         | 3       | Gráficos y estadísticas          |
| **dayjs**            | 1.11    | Manejo de fechas                 |
| **sass**             | 1.x     | Preprocesador CSS                |

---

## ▶️ Ejecución

```bash
npm install     # solo la primera vez
npm run dev     # inicia el servidor de desarrollo en http://localhost:5173
```

Otros comandos:

```bash
npm run build   # compila la versión de producción (carpeta dist/)
npm run preview # sirve la build de producción localmente
npm run lint    # análisis estático con oxlint
```

> Requiere que **MySQL y los 9 microservicios** estén corriendo (ver README raíz).

---

## 🌱 Datos de demostración

Con el backend arriba y las bases vacías, carga el set de datos de prueba **una sola vez**:

```bash
node seed-datos-demo.mjs
```

Crea usuarios de cada rol, cursos, asignaturas, notas, matrículas, calendario, mural, reuniones
y anotaciones. Las credenciales generadas están documentadas en el encabezado del script y en el
README raíz (contraseña: `Password123`).

---

## 🗂️ Estructura del proyecto

```
system_frontend/
├── seed-datos-demo.mjs      ← Script de carga de datos de prueba
├── vite.config.js           ← Config de Vite + proxy /api → microservicios
└── src/
    ├── main.jsx             ← Punto de entrada (monta React, importa estilos)
    ├── App.jsx              ← Enrutador principal (mapa de rutas y roles)
    ├── context/
    │   └── AuthContext.jsx  ← Estado global de sesión (token + usuario)
    ├── hooks/
    │   └── useAuth.js       ← Hook para consumir el AuthContext
    ├── components/
    │   └── PrivateRoute/    ← Protección de rutas por autenticación y rol
    ├── services/            ← Clientes HTTP por dominio (un archivo por microservicio)
    │   ├── axiosConfig.js   ← Instancia axios central (adjunta el JWT)
    │   ├── authService.js   · usuarioService.js   · cursoService.js
    │   ├── asignaturaService.js · notaService.js  · matriculaService.js
    │   ├── calendarioService.js · muralService.js · reunionService.js
    │   ├── anotacionService.js  · mensajeService.js  · ...
    ├── pages/               ← Una carpeta por pantalla (.jsx + .scss)
    ├── styles/              ← Variables, mixins, reset y estilos compartidos (SCSS)
    └── validators/          ← Reglas de validación (RUT, email, fechas, etc.)
```

---

## 🔗 Cómo se conecta con el backend

- Todas las peticiones salen a rutas que empiezan por **`/api`**.
- `vite.config.js` tiene un **proxy** que redirige cada prefijo al microservicio correcto
  (por ejemplo, `/api/cursos → :8082`, `/api/matriculas → :8084`, `/api/calendario → :8087`).
  Esto evita problemas de CORS en desarrollo.
- `src/services/axiosConfig.js` **adjunta automáticamente el token JWT** en cada petición y
  redirige al login si la sesión expira (401).

---

## 🔐 Autenticación y roles

- La sesión (token JWT + datos del usuario) se guarda en `localStorage` y se expone mediante
  `AuthContext` / `useAuth`.
- `PrivateRoute` protege las rutas: verifica que el usuario esté autenticado y, cuando aplica,
  que tenga el rol requerido.
- El **auto-registro** solo permite roles **Estudiante** y **Apoderado**; las cuentas de personal
  las crea un administrador desde *Panel de Administración → Usuarios*.

---

## 🧩 Pantallas principales

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| Login / Registro | `/login` | Inicio de sesión y registro de estudiantes/apoderados |
| Dashboard | `/` | Inicio con resumen según el rol |
| Registrar Notas | `/registro-notas` | Ingreso/edición/eliminación de calificaciones (docente) |
| Mis Notas | `/mis-notas` | Libreta de calificaciones (estudiante/apoderado) |
| Anotaciones | `/anotaciones` | Hoja de vida conductual + descarga |
| Bitácora | `/bitacora-asignatura` | Leccionario por asignatura (docente) |
| Matrículas | `/matriculas` | Gestión de matrículas |
| Reuniones | `/reuniones` | Actas, citaciones y reuniones de curso |
| Mural | `/mural` | Comunicados del establecimiento |
| Calendario | `/calendario` | Eventos y fechas importantes |
| Mensajería | `/mensajeria` | Mensajes internos |
| Mi Perfil / Mi Estudiante / Mis Cursos | `/mi-perfil`, etc. | Datos personales y académicos |
| Panel de Administración | `/admin` | CRUD de usuarios, cursos, niveles, salas, asignaturas |
