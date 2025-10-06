# Sistema de Gestión de Deudas

Hola! Este es un sistema para manejar deudas personales. Basicamente puedes registrar tus deudas, hacer pagos parciales y ver estadisticas de como vas con tus finanzas.

## ¿Que hace este sistema?

- Te registras y haces login (con JWT para que sea seguro)
- Creas deudas y las manejas como quieras
- Puedes hacer abonos parciales - no tienes que pagar todo de una vez
- Exportas tus datos en JSON o CSV por si los necesitas
- Ves estadisticas de cuanto debes y cuanto has pagado
- Todo en español para que sea mas facil de usar
- Cada usuario solo ve sus propias deudas 

## ¿Con que está hecho?

**Backend:**
- NestJS 10.4.20
- PostgreSQL (base de datos)
- TypeORM 0.3.27 (para no escribir SQL a mano todo el tiempo)
- JWT (para que proteger en tu cuenta)
- bcrypt 6.0.0 (para encriptar contraseñas)

**Frontend:**
- Angular 20.3.3
- Angular CLI 20.3.4
- TypeScript 5.9.3 (JavaScript pero con tipos)
- RxJS 7.8.2

## ¿Que necesitas para correrlo?

- Node.js 24.9.0 (o compatible)
- PostgreSQL 14 o mas nuevo  
- npm 9.8.1+ (viene con Node.js)

## Como instalarlo en tu compu

### 1. Bajar el código
```bash
git clone <url-del-repo>
cd GESTION-DEUDAS
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

**Crear archivo .env con esto:**
(No te preocupes por crear la base de datos manualmente - el backend la crea solita cuando arranca)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=gestion_deudas
JWT_SECRET=pon_algo_secreto_aqui
```

**Correr el backend:**
```bash
# Para desarrollo (se reinicia solo cuando cambias algo)
npm run start:dev

# Para producción
npm run build
npm run start:prod
```

El backend va a estar en `http://localhost:3000`

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

**Correr el frontend:**
```bash
# Para desarrollo
ng serve

# Para producción
ng build --prod
```

El frontend va a estar en `http://localhost:4200`

## Como usar la API

### Para autenticarse
- `POST /auth/register` - Crear cuenta nueva
- `POST /auth/login` - Entrar a tu cuenta

### Para manejar deudas
- `GET /debt` - Ver todas tus deudas
- `POST /debt` - Crear deuda nueva
- `GET /debt/:id` - Ver una deuda especifica
- `PATCH /debt/:id` - Cambiar una deuda
- `DELETE /debt/:id` - Borrar una deuda
- `POST /debt/filter` - Buscar deudas con filtros

### Para hacer pagos
- `POST /debt/:id/payments` - Hacer un pago/abono
- `GET /debt/:id/payments` - Ver historial de pagos
- `PATCH /debt/:id/mark-paid` - Marcar como pagada completa

### Para exportar y ver estadisticas
- `GET /debt/export/json` - Descargar en JSON
- `GET /debt/export/csv` - Descargar en CSV
- `GET /debt/stats/aggregations` - Ver estadisticas

## Como está organizada la base de datos

```sql
-- Usuarios
users: id, name, email, password, createdAt

-- Acreedores (a quien le debes)
creditors: id, name, email, phone, createdAt

-- Deudas
debts: id, description, amount, paidAmount, remainingAmount, 
       status, dueDate, userId, creditorId, recordStatus, createdAt

-- Pagos
payments: id, amount, description, debtId, userId, createdAt
```

## Decisiones técnicas

### ¿Por que NestJS?
Porque está bien organizado en módulos. Cada cosa tiene su lugar y es facil de mantener. Además usa TypeScript que ayuda a evitar errores tontos.

### ¿Por que JWT?
Porque no necesitas guardar sesiones en el servidor. El token tiene toda la info y es seguro. Además escala bien si tienes muchos usuarios.

### ¿Por que no borrar las deudas de verdad?
Uso "soft delete" - solo las marco como inactivas. Así si alguien borra algo por error, se puede recuperar. También es bueno para auditorias.

### ¿Por que campos calculados en las deudas?
Guardo `paidAmount` y `remainingAmount` directamente en la tabla de deudas. Sí, es un poco redundante, pero hace las consultas super rapidas. No tengo que calcular cada vez cuanto se ha pagado.

### ¿Por que SQL directo para los pagos?
TypeORM a veces se complica con relaciones. Para los pagos uso SQL directo porque tengo control total y es mas rapido.

### ¿Por que cada usuario solo ve sus deudas?
Obvio, por privacidad. El JWT me da el ID del usuario y filtro todo automáticamente. Nadie puede ver deudas de otros.

### ¿Por que estados en inglés en el código pero español en la UI?
Es una buena practica tener el código en inglés (PENDING, PAID) pero mostrar al usuario en español (Pendiente, Pagada). Así el código es mas universal pero la experiencia es local.

### ¿Por que exportación con headers HTTP?
Para que cuando hagas click en exportar, el navegador descargue el archivo automáticamente. Es mas user-friendly.

## Seguridad

- JWT en todos los endpoints importantes
- Contraseñas encriptadas con bcrypt  
- Cada usuario solo ve sus cosas
- Validación de datos de entrada
- Soft delete para no perder información

## Estadisticas que puedes ver

El endpoint de estadisticas te da:
- Cuantas deudas tienes en total
- Cuantas están pendientes vs pagadas
- Cuanto debes en total
- Cuanto has pagado
- Cuanto te falta por pagar
- Promedio por deuda
- Porcentaje de pago (que tan bien vas)

## Para testing

```bash
# Backend
cd backend
npm run test

# Frontend  
cd frontend
ng test
```

## Para producción

**Backend:**
```bash
npm run build
npm run start:prod
```

**Frontend:**
```bash
ng build --prod
# Después servir los archivos de dist/ con nginx o lo que uses
```

**Variables de entorno para producción:**
```env
NODE_ENV=production
DB_HOST=tu_servidor_de_bd
DB_PORT=5432
DB_USERNAME=usuario_produccion
DB_PASSWORD=password_super_seguro
DB_DATABASE=gestion_deudas_prod
JWT_SECRET=jwt_secreto_largo_y_complicado
```
