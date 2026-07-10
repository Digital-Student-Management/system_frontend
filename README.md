# Sistema de Gestión Escolar Digital (GED)

Plataforma web para la gestión integral de un establecimiento educacional, construida con una
**arquitectura de microservicios** (Spring Boot) y este **frontend SPA** (React + Vite).

Este repositorio contiene el **frontend** y es la **guía principal del proyecto completo**: desde
aquí se explica cómo levantar todo el sistema (los 9 microservicios + la interfaz web).

> 🗂️ El proyecto se organiza en **repositorios separados** dentro de la organización GitHub
> [`Digital-Student-Management`](https://github.com/Digital-Student-Management): un repo por
> microservicio + este repositorio del frontend.

---

## 📑 Índice

1. [Arquitectura y puertos](#-arquitectura-y-puertos)
2. [Requisitos previos](#-requisitos-previos)
3. [Configuración de la base de datos](#-configuración-de-la-base-de-datos)
4. [Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto-paso-a-paso)
5. [Cargar datos de demostración](#-cargar-datos-de-demostración)
6. [Credenciales de acceso](#-credenciales-de-acceso)
7. [Seguridad](#-seguridad)
8. [Solución de problemas](#-solución-de-problemas)
9. [Detalle del frontend](#-detalle-del-frontend)

---

## 🏗️ Arquitectura y puertos

El sistema tiene **9 microservicios** independientes (cada uno con su propia base de datos MySQL)
y este **frontend**, que los consume mediante un proxy.

| Componente         | Puerto | Repositorio | Responsabilidad                                          |
|--------------------|:------:|-------------|----------------------------------------------------------|
| **ms-asignaturas** |  8081  | [ms-asignaturas](https://github.com/Digital-Student-Management/ms-asignaturas) | Asignaturas y bitácora de clases   |
| **ms-cursos**      |  8082  | [ms-cursos](https://github.com/Digital-Student-Management/ms-cursos)           | Cursos, niveles y salas            |
| **ms-direcciones** |  8083  | [ms-direcciones](https://github.com/Digital-Student-Management/ms-direcciones) | País, región, ciudad, comuna, dirección |
| **ms-estudiantes** |  8084  | [ms-estudiantes](https://github.com/Digital-Student-Management/ms-estudiantes) | Anotaciones, hoja de vida y matrículas |
| **ms-evaluaciones**|  8085  | [ms-evaluaciones](https://github.com/Digital-Student-Management/ms-evaluaciones) | Evaluaciones y notas             |
| **ms-mensajeria**  |  8086  | [ms-mensajeria](https://github.com/Digital-Student-Management/ms-mensajeria)   | Mensajería interna                 |
| **ms-murales**     |  8087  | [ms-murales](https://github.com/Digital-Student-Management/ms-murales)         | Mural digital y calendario         |
| **ms-reuniones**   |  8088  | [ms-reuniones](https://github.com/Digital-Student-Management/ms-reuniones)     | Actas, citaciones y reuniones      |
| **ms-usuarios**    |  8089  | [ms-usuarios](https://github.com/Digital-Student-Management/ms-usuarios)       | Autenticación (JWT), usuarios y roles |
| **Frontend**       |  5173  | *(este repo)* | Interfaz web (React + Vite)                              |

> Los microservicios se consultan entre sí (por ejemplo, `ms-murales` valida el funcionario contra
> `ms-usuarios`). Por eso conviene tener **todos** los servicios levantados.

---

## 🧰 Requisitos previos

| Herramienta | Versión mínima | Verificar con      |
|-------------|----------------|--------------------|
| **Java (JDK)** | 21          | `java -version`    |
| **Maven**   | 3.9 (o usar el `mvnw` incluido) | `mvn -version` |
| **Node.js** | 18 o superior  | `node -version`    |
| **MySQL**   | 8.x            | `mysql --version`  |

---

## 🗄️ Configuración de la base de datos

1. Ten **MySQL corriendo** en `localhost:3306`.
2. Las bases de datos y tablas se **crean automáticamente** al iniciar cada microservicio
   (`createDatabaseIfNotExist=true` y Hibernate `ddl-auto=update`). **No hay que crear nada a mano.**
3. Credenciales de MySQL usadas por defecto (en cada `application.properties`):

   ```properties
   spring.datasource.username = root
   spring.datasource.password = fullstack3-2026
   ```

   > Si tu MySQL usa otra contraseña, cámbiala en el archivo
   > `src/main/resources/application.properties` de cada microservicio.

---

## ▶️ Cómo ejecutar el proyecto (paso a paso)

### 1. Levantar los 9 microservicios

Clona los 9 repositorios de la organización y, en la carpeta de **cada uno**, ejecuta:

```bash
# Windows
mvnw.cmd spring-boot:run
# Linux / macOS
./mvnw spring-boot:run
```

Cada servicio queda listo cuando aparece `Started Ms...Application` en la consola.

### 2. Levantar el frontend (este repositorio)

```bash
npm install     # solo la primera vez
npm run dev     # servidor de desarrollo en http://localhost:5173
```

### 3. Cargar los datos de demostración

Con MySQL y los 9 microservicios arriba (ver siguiente sección).

---

## 🌱 Cargar datos de demostración

Las bases arrancan **vacías**. Para poblarlas con un set coherente de datos (usuarios de cada rol,
cursos, asignaturas, notas, matrículas, calendario, mural, reuniones y anotaciones), ejecuta
**una sola vez** desde la carpeta de este repositorio:

```bash
node seed-datos-demo.mjs
```

> ⚠️ Ejecutar **una única vez** sobre bases de datos recién creadas. Si se corre sobre datos
> existentes, generará duplicados o errores de "ya registrado".

---

## 🔑 Credenciales de acceso

Todas las cuentas de demostración usan la contraseña: **`Password123`**

| Rol           | Correo                   |
|---------------|--------------------------|
| Administrador | `admin@colegio.cl`       |
| Directivo     | `directivo@colegio.cl`   |
| Docente       | `docente@colegio.cl`     |
| Inspector     | `inspector@colegio.cl`   |
| Apoderado     | `apoderado@colegio.cl`   |
| Estudiante    | `estudiante@colegio.cl`  |

> Puedes iniciar sesión con **correo** o con **RUT**. El registro público del login solo permite
> crear cuentas de **Estudiante** y **Apoderado** (ver [Seguridad](#-seguridad)).

---

## 🔒 Seguridad

Implementada en el microservicio **ms-usuarios** (donde viven las credenciales):

- **Contraseñas cifradas** con **BCrypt** (nunca en texto plano).
- **Tokens JWT firmados** (HS512) con expiración; se adjuntan automáticamente en cada petición.
- **Operaciones sensibles protegidas**: crear/editar/eliminar usuarios exige token con rol
  **ADMIN/DIRECTIVO**.
- **Prevención de escalada de privilegios**: el auto-registro público solo permite
  **ESTUDIANTE/APODERADO**; las cuentas de personal las crea un administrador desde
  *Panel de Administración → Usuarios*.

---

## 🛠️ Solución de problemas

| Problema | Causa / Solución |
|----------|------------------|
| **Un microservicio no arranca (puerto en uso)** | El puerto ya está ocupado. Cierra la instancia anterior o libera el puerto. |
| **Error de conexión a MySQL** | Verifica que MySQL esté corriendo y que la contraseña coincida en `application.properties`. |
| **Las pantallas aparecen vacías** | Faltan datos: ejecuta `node seed-datos-demo.mjs`. |
| **Cambios del frontend no se reflejan** | Reinicia el dev server (`Ctrl+C` y `npm run dev`) y recarga con `Ctrl+F5`. |
| **Swagger de :8085 muestra "Failed to load API definition"** | Es solo el agregador de documentación intentando leer otros servicios (CORS). No afecta el funcionamiento de la app. |
| **No puedo registrarme como Docente/Directivo** | Es intencional (seguridad): esas cuentas las crea un administrador desde el Panel de Administración. |

---

## 💻 Detalle del frontend

### Stack tecnológico

| Herramienta | Versión | Rol |
|-------------|---------|-----|
| **React** | 19 | Framework de UI |
| **Vite** | 8 | Build tool y servidor de desarrollo |
| **react-router-dom** | 7 | Navegación SPA |
| **axios** | 1.x | Cliente HTTP (con interceptores JWT) |
| **react-hook-form** | 7 | Manejo de formularios |
| **react-toastify** | 11 | Notificaciones |
| **react-icons** | 5 | Íconos SVG |
| **recharts** | 3 | Gráficos y estadísticas |
| **dayjs** | 1.11 | Manejo de fechas |
| **sass** | 1.x | Preprocesador CSS |

### Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # compila la versión de producción (dist/)
npm run preview  # sirve la build de producción
npm run lint     # análisis estático con oxlint
```

### Estructura

```
src/
├── main.jsx          ← Punto de entrada
├── App.jsx           ← Enrutador principal (rutas y roles)
├── context/          ← AuthContext (sesión: token + usuario)
├── hooks/            ← useAuth
├── components/       ← PrivateRoute (protección de rutas)
├── services/         ← Clientes HTTP por dominio (axiosConfig adjunta el JWT)
├── pages/            ← Una carpeta por pantalla (.jsx + .scss)
├── styles/           ← Variables, mixins y estilos compartidos (SCSS)
└── validators/       ← Validaciones (RUT, email, fechas)
```

### Cómo se conecta con el backend

- Todas las peticiones usan rutas que empiezan por **`/api`**.
- `vite.config.js` tiene un **proxy** que redirige cada prefijo al microservicio correcto
  (ej. `/api/cursos → :8082`, `/api/matriculas → :8084`, `/api/calendario → :8087`), evitando CORS
  en desarrollo.
- `src/services/axiosConfig.js` **adjunta el token JWT** en cada petición y redirige al login si la
  sesión expira.
