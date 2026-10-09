# Estructura de la tabla `reservations`

Base de datos en producción: **MariaDB** (MySQL-compatible).

Para desarrollo local puede usar MariaDB o MySQL. 

---

## Tabla principal: `reservations`

| Columna | Tipo | Nulo | Default | Descripción |
|---|---|---|---|---|
| `id` | `int` AUTO_INCREMENT | NO | auto | Clave primaria |
| `reservationNumber` | `varchar(20)` | SÍ | `NULL` | Único. Formato: `R-YYYYMMDD-XXXXXX` o `T-YYYYMMDD-XXXXXX` |
| `roomId` | `int` | NO | — | FK → `rooms.id` |
| `clientId` | `int` | NO | — | FK → `clients.id` |
| `checkInDate` | `varchar(19)` | SÍ | `NULL` | ISO: `YYYY-MM-DDTHH:mm:ss` |
| `checkOutDate` | `varchar(19)` | SÍ | `NULL` | ISO: `YYYY-MM-DDTHH:mm:ss` |
| `reservedAt` | `timestamp(6)` | NO | `CURRENT_TIMESTAMP` | Se asigna automáticamente |
| `status` | `enum` | NO | `'pendiente'` | Ver sección de enums |
| `type` | `enum` | NO | `'habitacion'` | Ver sección de enums |
| `baseGuestsCount` | `int` | NO | `1` | Huéspedes incluidos |
| `extraGuestsCount` | `int` | NO | `0` | Huéspedes extra |
| `hoursCount` | `int` | NO | `0` | Horas (solo para terraza) |
| `notes` | `text` | SÍ | `NULL` | Notas internas |
| `observations` | `text` | SÍ | `NULL` | Observaciones adicionales |
| `additionalGuests` | `json` | SÍ | `NULL` | Array de objetos (ver abajo) |
| `earlyCheckIn` | `tinyint(1)` | NO | `0` | Check-in anticipado a las 12:00 |
| `lateCheckOut` | `tinyint(1)` | NO | `0` | Check-out tardío a las 16:00 |
| `transferRoundTrip` | `tinyint(1)` | NO | `0` | Transfer ida y vuelta |
| `transferOneWay` | `tinyint(1)` | NO | `0` | Transfer solo ida |
| `breakfasts` | `int` | NO | `0` | Desayunos ($8 c/u) |
| `totalPrice` | `decimal(10,2)` | SÍ | `NULL` | Total calculado en USD |
| `stripePaymentIntentId` | `varchar(255)` | SÍ | `NULL` | Referencia de Stripe |
| `paymentStatus` | `varchar(50)` | SÍ | `NULL` | Texto libre: `'paid'`, `'unpaid'`, etc. |
| `paymentExpiresAt` | `timestamp` | SÍ | `NULL` | Si es pendiente, expira en 30 min |
| `pendingDebt` | `decimal(10,2)` | NO | `0.00` | Deuda pendiente acumulada |

---

## Enums

### `status` (ReservationStatus)

| Valor | Significado |
|---|---|
| `'pendiente'` | Pendiente de pago (default) |
| `'confirmada'` | Confirmada / pagada |
| `'cancelada'` | Cancelada |
| `'terminada'` | Check-out realizado |
| `'no_show'` | El huésped no llegó |

### `type` (ReservationType)

| Valor | Significado |
|---|---|
| `'habitacion'` | Habitación |
| `'terraza'` | Terraza |

---

## JSON: `additionalGuests`

```json
[
  {
    "firstName": "string",
    "lastName": "string",
    "sex": "M" | "F" | "otro",
    "idNumber": "string (opcional)"
  }
]
```

---

## Tabla relacionada: `clients`

| Columna | Tipo | Nulo | Default |
|---|---|---|---|
| `id` | `int` AUTO_INCREMENT | NO | PK |
| `firstName` | `varchar(50)` | NO | — |
| `lastName` | `varchar(50)` | SÍ | `NULL` |
| `sex` | `enum('M','F','otro')` | SÍ | `NULL` |
| `email` | `varchar(100)` | SÍ | `NULL` |
| `phone` | `varchar(20)` | SÍ | `NULL` |
| `idNumber` | `varchar(20)` | SÍ | `NULL` | ÚNICO |
| `createdAt` | `timestamp(6)` | NO | `CURRENT_TIMESTAMP` |
| `updatedAt` | `timestamp(6)` | NO | `CURRENT_TIMESTAMP ON UPDATE` |

---

## Tabla relacionada: `rooms`

| Columna | Tipo | Nulo | Default |
|---|---|---|---|
| `id` | `int` AUTO_INCREMENT | NO | PK |
| `number` | `varchar(10)` | NO | ÚNICO |
| `name` | `varchar(100)` | NO | — |
| `pricePerNight` | `decimal(10,2)` | NO | — |
| `baseCapacity` | `int` | NO | — |
| `extraCapacity` | `int` | NO | — |
| `extraGuestCharge` | `decimal(10,2)` | NO | — |
| `status` | `enum('vacia_limpia','vacia_sucia','fuera_de_orden','ocupada')` | NO | `'vacia_limpia'` |

### Enums de `rooms`

**RoomType:** `'standard_economic'`, `'standard'`, `'standard_plus'`, `'suite_balcony'`

**RoomStatus:** `'vacia_limpia'`, `'vacia_sucia'`, `'fuera_de_orden'`, `'ocupada'`

---

## Relaciones (FK)

```
clients (1) ────<< reservations >>──── (1) rooms

Reservations es referenciada por:
  - payments        (FK: reservationId → reservations.id)
  - paypal_payments (FK: reservationId → reservations.id)
  - billing_records (FK: reservationId → reservations.id, ON DELETE SET NULL)
```

Todas las FK tienen `ON DELETE NO ACTION`, excepto `billing_records` que tiene `SET NULL`.

---

## DDL completo para desarrollo local

```sql
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NULL,
  sex ENUM('M','F','otro') NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(20) NULL,
  idNumber VARCHAR(20) NULL UNIQUE,
  createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  pricePerNight DECIMAL(10,2) NOT NULL,
  baseCapacity INT NOT NULL,
  extraCapacity INT NOT NULL,
  extraGuestCharge DECIMAL(10,2) NOT NULL,
  status ENUM('vacia_limpia','vacia_sucia','fuera_de_orden','ocupada') NOT NULL DEFAULT 'vacia_limpia'
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservationNumber VARCHAR(20) UNIQUE,
  roomId INT NOT NULL,
  clientId INT NOT NULL,
  checkInDate VARCHAR(19),
  checkOutDate VARCHAR(19),
  reservedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  status ENUM('pendiente','confirmada','cancelada','terminada','no_show') NOT NULL DEFAULT 'pendiente',
  type ENUM('habitacion','terraza') NOT NULL DEFAULT 'habitacion',
  baseGuestsCount INT NOT NULL DEFAULT 1,
  extraGuestsCount INT NOT NULL DEFAULT 0,
  hoursCount INT NOT NULL DEFAULT 0,
  notes TEXT,
  observations TEXT,
  additionalGuests JSON,
  earlyCheckIn TINYINT(1) NOT NULL DEFAULT 0,
  lateCheckOut TINYINT(1) NOT NULL DEFAULT 0,
  transferRoundTrip TINYINT(1) NOT NULL DEFAULT 0,
  transferOneWay TINYINT(1) NOT NULL DEFAULT 0,
  breakfasts INT NOT NULL DEFAULT 0,
  totalPrice DECIMAL(10,2),
  stripePaymentIntentId VARCHAR(255),
  paymentStatus VARCHAR(50),
  paymentExpiresAt TIMESTAMP NULL,
  pendingDebt DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (roomId) REFERENCES rooms(id),
  FOREIGN KEY (clientId) REFERENCES clients(id)
);
```

---

## Notas para el desarrollador del frontend

1. **`checkInDate` y `checkOutDate`** son `VARCHAR(19)` en la BD, no `DATE`. Usan formato ISO `YYYY-MM-DDTHH:mm:ss` (ej: `2025-07-22T15:00:00`).
2. **`additionalGuests`** es un JSON array. Si el backend que uses para desarrollo no soporta JSON nativo, puedes usar `TEXT` y parsearlo manualmente.
3. **Número de reserva**: El backend lo genera automáticamente como `R-YYYYMMDD-XXXXXX`. Para desarrollo local puedes insertar cualquier valor único o dejarlo `NULL` y asignarlo después.
4. **Expiración de pago**: Las reservas con status `pendiente` expiran a los 30 minutos. El frontend debería reflejar esto (countdown, deshabilitar botones, etc.).
5. **Para pasar a producción**: Solo cambia la cadena de conexión de tu backend para apuntar a la BD de producción. Las tablas y columnas deben coincidir exactamente con este esquema.
6. **Precios en USD**: Todos los montos (`totalPrice`, `pendingDebt`, etc.) están en dólares estadounidenses.
