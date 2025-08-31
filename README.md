# Olimpiadas V2 Frontend

Sistema de gestión de olimpiadas escolares desarrollado con React, Redux Toolkit y Tailwind CSS.

## 🚀 Características

- **Gestión completa de torneos deportivos** (Fútbol y Vóley)
- **Sistema de roles** (Administrador, Árbitro, Veedor, Registrador)
- **Gestión de equipos y jugadores**
- **Programación y seguimiento de partidos**
- **Registro de eventos en tiempo real**
- **Gestión de canchas/estadios**
- **Dashboard interactivo con estadísticas**
- **Interfaz responsive y moderna**

## 🛠️ Tecnologías

- **React 19** - Biblioteca de interfaz de usuario
- **Redux Toolkit** - Gestión de estado
- **React Router DOM** - Enrutamiento
- **Tailwind CSS** - Framework de CSS
- **Headless UI** - Componentes accesibles
- **Heroicons** - Iconografía
- **Axios** - Cliente HTTP
- **Vite** - Herramienta de construcción

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── AdminRoute.jsx   # Protección de rutas admin
│   ├── ProtectedRoute.jsx # Protección de rutas autenticadas
│   ├── Header.jsx       # Cabecera del dashboard
│   ├── Sidebar.jsx      # Barra lateral de navegación
│   ├── Modal.jsx        # Modal reutilizable
│   ├── Notification.jsx # Sistema de notificaciones
│   ├── Loading.jsx      # Componentes de carga
│   ├── ConfirmDialog.jsx # Diálogo de confirmación
│   └── FormField.jsx    # Campo de formulario con validación
├── hooks/               # Hooks personalizados
│   └── useNotification.js # Hook para notificaciones
├── pages/               # Páginas principales
│   ├── LandingPage.jsx  # Página de inicio
│   ├── LoginPage.jsx    # Página de login
│   ├── Dashboard.jsx    # Dashboard principal
│   └── dashboard/       # Páginas del dashboard
│       ├── DashboardHome.jsx    # Inicio del dashboard
│       ├── Torneos.jsx          # Gestión de torneos
│       ├── Equipos.jsx          # Gestión de equipos
│       ├── Canchas.jsx          # Gestión de canchas
│       ├── Partidos.jsx         # Gestión de partidos
│       ├── Administradores.jsx  # Gestión de admins
│       ├── Arbitros.jsx         # Gestión de árbitros
│       ├── Veedores.jsx         # Gestión de veedores
│       └── MisPartidos.jsx      # Partidos del registrador
├── services/            # Servicios de API
│   ├── api.js          # Configuración de Axios
│   └── authService.js  # Servicios de autenticación
├── store/              # Estado global con Redux
│   ├── index.js        # Configuración del store
│   └── slices/         # Slices de Redux Toolkit
│       ├── authSlice.js      # Estado de autenticación
│       ├── torneosSlice.js   # Estado de torneos
│       ├── equiposSlice.js   # Estado de equipos
│       ├── partidosSlice.js  # Estado de partidos
│       ├── canchasSlice.js   # Estado de canchas
│       ├── jugadoresSlice.js # Estado de jugadores
│       └── usuariosSlice.js  # Estado de usuarios
├── utils/              # Utilidades
│   └── validation.js   # Sistema de validación
└── styles/
    └── index.css       # Estilos globales
```

## 🎯 Funcionalidades por Rol

### Administrador
- ✅ Gestión completa de torneos (CRUD)
- ✅ Gestión de equipos y jugadores
- ✅ Gestión de canchas/estadios
- ✅ Programación de partidos
- ✅ Gestión de usuarios (árbitros, veedores, registradores)
- ✅ Dashboard con estadísticas generales

### Registrador
- ✅ Visualización de partidos asignados
- ✅ Inicio y finalización de partidos
- ✅ Registro de eventos en tiempo real (goles, tarjetas, cambios)
- ✅ Dashboard personalizado

### Árbitro/Veedor
- 👀 Visualización de información (funcionalidad base implementada)

## 🚦 Estado del Desarrollo

### ✅ Completado
- [x] Configuración inicial del proyecto
- [x] Sistema de autenticación completo
- [x] Protección de rutas por roles
- [x] Dashboard responsive con navegación
- [x] Gestión completa de torneos
- [x] Gestión completa de equipos
- [x] Gestión completa de canchas
- [x] Gestión completa de partidos
- [x] Gestión de usuarios (administradores, árbitros, veedores)
- [x] Página "Mis Partidos" para registradores
- [x] Componentes reutilizables (Modal, Notification, Loading, etc.)
- [x] Sistema de validación de formularios
- [x] Manejo de errores y notificaciones

### 🔄 Pendiente
- [ ] Integración completa con el backend
- [ ] Pruebas unitarias
- [ ] Optimización de rendimiento
- [ ] Funcionalidades específicas para árbitros y veedores

## 🔧 Instalación y Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Olimpiadas_V2_Frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
VITE_API_URL=http://localhost:8000/api
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
```

## 🔐 Sistema de Autenticación

El sistema utiliza JWT tokens para la autenticación:

- **Login**: `/auth/login`
- **Registro**: `/auth/register` (solo admins)
- **Usuario actual**: `/auth/me`
- **Logout**: `/auth/logout`

### Usuarios de Prueba
```
Admin: admin@olimpiadas.com / admin123
Registrador: registrador1@olimpiadas.com / registrador123
Árbitro: arbitro@olimpiadas.com / arbitro123
```

## 📊 API Endpoints

### Torneos
- `GET /torneos` - Listar torneos
- `POST /torneos` - Crear torneo
- `PUT /torneos/:id` - Actualizar torneo
- `DELETE /torneos/:id` - Eliminar torneo

### Equipos
- `GET /equipos` - Listar equipos
- `POST /equipos` - Crear equipo
- `PUT /equipos/:id` - Actualizar equipo
- `DELETE /equipos/:id` - Eliminar equipo

### Partidos
- `GET /partidos` - Listar partidos
- `GET /mis-partidos` - Partidos del registrador
- `POST /partidos` - Crear partido
- `POST /partidos/:id/iniciar` - Iniciar partido
- `POST /partidos/:id/finalizar` - Finalizar partido
- `POST /partidos/:id/eventos` - Registrar evento

### Canchas
- `GET /canchas` - Listar canchas
- `POST /canchas` - Crear cancha
- `PUT /canchas/:id` - Actualizar cancha
- `DELETE /canchas/:id` - Eliminar cancha

### Usuarios
- `GET /usuarios` - Listar usuarios
- `POST /auth/register` - Crear usuario
- `DELETE /usuarios/:id` - Eliminar usuario

## 🎨 Componentes Reutilizables

### Modal
```jsx
import Modal from './components/Modal'

<Modal isOpen={showModal} onClose={handleClose} title="Título">
  <p>Contenido del modal</p>
</Modal>
```

### Notification
```jsx
import { useNotification } from './hooks/useNotification'

const { showSuccess, showError } = useNotification()
showSuccess('Éxito', 'Operación completada')
```

### FormField
```jsx
import FormField from './components/FormField'

<FormField
  label="Nombre"
  name="nombre"
  value={formData.nombre}
  onChange={handleChange}
  error={errors.nombre}
  required
/>
```

## 🔍 Validación de Formularios

El sistema incluye un robusto sistema de validación:

```jsx
import { validationRules, validateForm } from './utils/validation'

const schema = {
  nombre: [validationRules.required, validationRules.maxLength(100)],
  email: [validationRules.required, validationRules.email]
}

const { errors, isValid } = validateForm(formData, schema)
```

## 🎯 Próximos Pasos

1. **Integración Backend**: Conectar con la API real
2. **Testing**: Implementar pruebas unitarias y de integración
3. **Optimización**: Lazy loading, memoización, etc.
4. **PWA**: Convertir en Progressive Web App
5. **Notificaciones Push**: Para eventos en tiempo real
6. **Reportes**: Generación de reportes y estadísticas avanzadas

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo de Desarrollo

- **Frontend**: React + Redux Toolkit + Tailwind CSS
- **Backend**: Laravel (repositorio separado)
- **Base de Datos**: MySQL/PostgreSQL

---

**Nota**: Este es un sistema completo de gestión deportiva escolar con todas las funcionalidades principales implementadas y listas para integración con el backend.
