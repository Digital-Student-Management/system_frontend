# GED — Frontend

> Sistema de Gestión Estudiantil Digital · Frontend React + Vite

---

## Stack tecnológico

| Herramienta | Versión | Rol |
|---|---|---|
| **React** | 19 | Framework UI |
| **Vite** | 6 | Build tool y dev server |
| **react-router-dom** | 7 | Navegación SPA |
| **axios** | 1.x | Cliente HTTP |
| **react-hook-form** | 7 | Gestión de formularios |
| **react-toastify** | 10 | Notificaciones |
| **react-icons** | 5 | Íconos SVG |
| **recharts** | 2 | Gráficos y estadísticas |
| **dayjs** | 1.11 | Fechas y horas (ES) |
| **sass** | 1.x | Preprocesador CSS |
| **prop-types** | 15 | Validación de props |

---

## Estructura del proyecto

```
src/
├── main.jsx              ← Punto de entrada: monta React, importa estilos
├── App.jsx               ← Enrutador principal con mapa de rutas del GED
│
├── context/
│   └── AuthContext.jsx   ← Estado global de autenticación (token + usuario + rol)
│
├── hooks/
│   ├── useAuth.js        ← Consumidor del AuthContext
│   └── index.js
│
├── services/
│   ├── axiosConfig.js    ← Instancia axios con interceptores JWT
│   ├── authService.js    ← Login, logout, refresh
│   ├── usuarioService.js
│   ├── estudianteService.js
│   ├── cursoService.js
│   ├── asignaturaService.js
│   ├── notaService.js
│   ├── asistenciaService.js
│   ├── mensajeService.js
│   ├── calendarioService.js
│   ├── matriculaService.js
│   ├── anotacionService.js
│   ├── muralService.js
│   ├── reunionService.js
│   ├── dashboardService.js
│   ├── ubicacionService.js
│   └── index.js
│
├── validators/
│   ├── rutValidators.js   ← RUT chileno (formato + dígito verificador)
│   ├── fieldValidators.js ← Email, teléfono, contraseñas, nombres
│   ├── fechaValidators.js ← Fechas coherentes (rango, edad, futuro)
│   └── index.js
│
├── components/
│   ├── PrivateRoute/     ← Portero de rutas protegidas por rol
│   ├── Navbar/           ← Barra de navegación superior
│   ├── Sidebar/          ← Menú lateral por rol (por implementar)
│   ├── Footer/
│   ├── Modal/
│   ├── UI/
│   ├── DataTable/
│   ├── Charts/           ← Wrappers de Recharts
│   ├── CalendarioWidget/
│   ├── MuralCard/
│   ├── NotaCard/
│   ├── EstudianteCard/
│   ├── RutInput/         ← Input con formateo automático de RUT
│   └── ... (ver estructura completa)
│
├── pages/
│   ├── Login/
│   ├── MiPerfil/         ← Todos los roles
│   ├── Mensajeria/       ← Todos los roles
│   ├── MisNotas/         ← ESTUDIANTE
│   ├── RegistroNotas/    ← DOCENTE
│   ├── Dashboard/        ← DIRECTIVO
│   ├── Matriculas/       ← FUNCIONARIO
│   ├── AdminPanel/       ← ADMIN
│   └── ... (ver estructura completa)
│
└── styles/
    ├── main.scss
    ├── _variables.scss
    ├── _reset.scss
    ├── _mixins.scss
    └── _typography.scss
```

---

## Roles del sistema

| Rol | Acceso principal |
|---|---|
| `ESTUDIANTE` | Notas, asistencia, horario, mensajes, calendario |
| `DOCENTE` | Cursos, registro de notas y asistencia, bitácora |
| `APODERADO` | Datos del estudiante, reuniones, mensajes |
| `INSPECTOR` | Gestión de asistencia, anotaciones |
| `DIRECTIVO` | Dashboard, reportes estadísticos |
| `FUNCIONARIO` | Matrículas, gestión de usuarios |
| `ADMIN` | Administración completa del sistema |

---

## Cómo ejecutar el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 3. Ejecutar en modo desarrollo
npm run dev
```

El dev server queda en `http://localhost:5173`.
Las peticiones a `/api/*` se redirigen al backend en `localhost:8080`.

---

## Convenciones del proyecto

- **Componentes**: PascalCase con carpeta propia (`components/Modal/Modal.jsx`)
- **Hooks**: camelCase con prefijo `use` (`hooks/useAuth.js`)
- **Services**: camelCase con sufijo `Service` (`services/notaService.js`)
- **Validators**: camelCase con sufijo `Validators` (`validators/rutValidators.js`)
- **SCSS**: co-located junto al componente o partials en `styles/`
- **Imports HTTP**: siempre desde `axiosConfig.js`, nunca `axios` directo
- **Token JWT**: `localStorage` con claves `ged_token` y `ged_user`
