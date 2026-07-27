# API de Menú Digital — Documentación de Integración (Frontend)

> **Base URL:** `http://localhost:3000`  
> **Auth:** JWT Bearer Token (solo endpoints de administración)  
> **Content-Type:** `application/json`

---

## Endpoints públicos (sin autenticación)

### `GET /public/menu` — Menú completo del sitio público

Devuelve todos los menús activos con sus categorías activas y productos activos. No requiere token.

**Response `200`:**
```json
{
  "menus": [
    {
      "id": 2,
      "name": "Desayunos",
      "description": "Menú de desayunos",
      "schedule": "7:30 am a 10 am",
      "order": 2,
      "active": true,
      "categories": [
        {
          "id": 5,
          "name": "Desayuno Económico / Simple breakfast",
          "order": 1,
          "active": true,
          "categoryProducts": [
            {
              "order": 0,
              "product": {
                "id": 17,
                "name": "Jugo de frutas tropicales / Tropical fruit juice",
                "price": "0.00",
                "active": true,
                "featured": false
              }
            }
          ]
        }
      ],
      "subtitulos": [
        { "id": 1, "text": "Precios en Usd + 10% Servicio", "order": 1 }
      ]
    }
  ],
  "staticContent": {
    "service_charge_pct": "10",
    "intro_text": "Bienvenidos al menú digital..."
  },
  "hostalName": "Hostal Villa D2"
}
```

> Solo incluye menús con `active: true`, categorías con `active: true`, y productos con `active: true`. Todo ordenado por `order` ascendente.

---

### `GET /public/menu/:id` — Detalle de un menú (público)

Devuelve un solo menú con sus categorías activas y productos activos. Sin autenticación.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | path | Sí | ID del menú |

**Response `200`:** Igual estructura que un elemento del array `menus` del endpoint anterior, pero devuelto directamente (no envuelto en `{ menus: [...] }`).

**Response `404`:** Si el menú no existe o está inactivo.

---

## Endpoints de administración (requieren JWT)

### 0. Autenticación — `POST /auth/login`

Obtiene el token JWT necesario para todos los endpoints protegidos.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response `200`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "admin", "roles": ["admin"] }
}
```

**Response `401`:**
```json
{ "statusCode": 401, "message": "Unauthorized" }
```

> El token se envía en el header `Authorization: Bearer <token>` en todas las peticiones siguientes.

---

### 1. Listar Menús — `GET /api/menus`

Devuelve la lista plana de menús. **No** incluye categorías ni productos anidados.

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `isActive` | query string | No | `false` | `"true"` → solo menús activos. `"false"` o ausente → todos |

**Response `200`:**
```json
[
  {
    "id": 1,
    "name": "Bebidas",
    "description": "Menú de bebidas",
    "schedule": null,
    "order": 1,
    "active": true
  },
  {
    "id": 2,
    "name": "Desayunos",
    "description": "Menú de desayunos",
    "schedule": "7:30 am a 10 am",
    "order": 2,
    "active": true
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `number` | ID del menú |
| `name` | `string` | Nombre del menú |
| `description` | `string \| null` | Descripción breve |
| `schedule` | `string \| null` | Horario de servicio (ej: `"7:30 am a 10 am"`) |
| `order` | `number` | Orden de visualización |
| `active` | `boolean` | ¿Visible en el sitio público? |

---

### 2. Detalle de Menú — `GET /api/menus/:id`

Devuelve el menú completo con categorías, productos y subtítulos anidados.

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `id` | path | Sí | — | ID del menú |
| `isActive` | query string | No | `false` | `"true"` → filtra solo categorías activas con sus productos activos. `"false"` o ausente → todo (activos + inactivos) |

**Response `200`:**
```json
{
  "id": 2,
  "name": "Desayunos",
  "description": "Menú de desayunos",
  "schedule": "7:30 am a 10 am",
  "order": 2,
  "active": true,
  "createdAt": "2026-07-25T17:43:19.762Z",
  "updatedAt": "2026-07-25T17:43:19.762Z",
  "categories": [
    {
      "id": 5,
      "name": "Desayuno Económico / Simple breakfast",
      "description": null,
      "active": true,
      "order": 1,
      "menuId": 2,
      "createdAt": "2026-07-25T17:43:19.797Z",
      "updatedAt": "2026-07-25T17:43:19.797Z",
      "categoryProducts": [
        {
          "categoryId": 5,
          "productId": 17,
          "order": 0,
          "product": {
            "id": 17,
            "name": "Jugo de frutas tropicales / Tropical fruit juice",
            "description": null,
            "price": "0.00",
            "active": true,
            "featured": false,
            "createdAt": "2026-07-25T17:43:19.933Z",
            "updatedAt": "2026-07-25T17:43:19.933Z"
          }
        }
      ]
    }
  ],
  "subtitulos": [
    {
      "id": 1,
      "menuId": 2,
      "text": "Precios en Usd + 10% Servicio",
      "order": 1,
      "updatedAt": "2026-07-25T17:43:19.821Z"
    }
  ]
}
```

### Estructura de la respuesta

```
Menu
├── id, name, description, schedule, order, active
├── categories[]          ← ordenado por order ASC
│   ├── id, name, description, active, order, menuId
│   └── categoryProducts[] ← ordenado por order ASC
│       ├── categoryId, productId, order
│       └── product
│           ├── id, name, description, price, active, featured
│           ├── createdAt, updatedAt
└── subtitulos[]          ← ordenado por order ASC
    ├── id, menuId, text, order
    └── updatedAt
```

> **Ordenamiento:** Categorías, productos dentro de cada categoría, y subtítulos se devuelven ordenados por su campo `order` de forma ascendente.

| Campo en product | Tipo | Descripción |
|-----------------|------|-------------|
| `price` | `string` (decimal) | Precio, ej: `"5.00"`. Parsear con `Number()` o `parseFloat()` |
| `name` | `string` | Nombre bilingüe: `"Español / English"`. Separar con `split(" / ")` |
| `description` | `string \| null` | Descripción bilingüe, mismo formato |
| `featured` | `boolean` | Producto destacado |

---

### 3. Crear Menú Completo — `POST /api/menus`

Crea un menú con todas sus categorías, productos y subtítulos en una sola petición.

### Validación de órdenes duplicados

El endpoint **rechaza** el request si detecta valores duplicados en el campo `order` dentro del mismo nivel:

| Nivel | Validación | Error |
|-------|-----------|-------|
| Categorías | Mismo `order` en 2+ categorías | `400: "Órdenes de categorías duplicados: 1"` |
| Productos | Mismo `order` en 2+ productos de una misma categoría | `400: "Órdenes de productos duplicados en categoría 'X': 0"` |
| Subtítulos | Mismo `order` en 2+ subtítulos | `400: "Órdenes de subtítulos duplicados: 0"` |

### Request Body

```json
{
  "name": "Desayunos",
  "description": "Menú de desayunos",
  "schedule": "7:30 am a 10 am",
  "order": 1,
  "active": true,
  "categories": [
    {
      "name": "Clásicos",
      "description": "Desayunos tradicionales",
      "active": true,
      "order": 1,
      "products": [
        {
          "name": "Café Americano / American coffee",
          "description": "Café negro tradicional / Traditional black coffee",
          "price": 2.50,
          "active": true,
          "featured": false
        },
        {
          "name": "Café con Leche / Coffee with milk",
          "price": 3.00,
          "active": true
        }
      ]
    },
    {
      "name": "Extras",
      "order": 2,
      "products": []
    }
  ],
  "subtitulos": [
    {
      "text": "Precios en USD + 10% Servicio",
      "order": 1
    },
    {
      "text": "Servicio a la habitación +$5",
      "order": 2
    }
  ]
}
```

### Campos del request

#### Menú (raíz)
| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `name` | `string` | **Sí** | — | Nombre del menú (máx 100 caracteres) |
| `description` | `string` | No | `null` | Descripción breve |
| `schedule` | `string` | No | `null` | Horario de servicio |
| `order` | `number` | No | `0` | Orden de visualización |
| `active` | `boolean` | No | `true` | ¿Visible en el sitio público? |

#### Categoría (dentro de `categories[]`)
| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `name` | `string` | **Sí** | — | Nombre de la categoría |
| `description` | `string` | No | `null` | — |
| `active` | `boolean` | No | `true` | ¿Visible? |
| `order` | `number` | No | `0` | Orden dentro del menú. **No puede repetirse** |
| `products` | `array` | No | `[]` | Productos dentro de esta categoría |

#### Producto (dentro de `categories[].products[]`)
| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `name` | `string` | **Sí** | — | Nombre (máx 300 caracteres) |
| `description` | `string` | No | `null` | Descripción breve |
| `price` | `number` | **Sí** | — | Precio (ej: `2.50`, `10`) |
| `active` | `boolean` | No | `true` | ¿Disponible? |
| `featured` | `boolean` | No | `false` | ¿Destacado? |

> **Nota:** Aunque los productos no tienen campo `order` propio en este nivel, el orden lo determina la tabla de asociación `category_product`. El `order` de productos se maneja a través del campo `order` en el array `categoryProducts[]` del GET.

#### Subtítulo (dentro de `subtitulos[]`)
| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `text` | `string` | **Sí** | — | Texto del pie/subtítulo |
| `order` | `number` | No | `0` | Orden. **No puede repetirse** |

### Response `201`

Devuelve el menú creado completo, con la misma estructura que `GET /api/menus/:id` (incluye IDs generados y timestamps).

---

### 4. Actualizar Menú Completo — `PUT /api/menus/:id`

Actualiza un menú y **reemplaza completamente** su estructura interna: categorías, productos y subtítulos. Usa comparación de IDs para decidir qué crear, actualizar o eliminar.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | path | **Sí** | ID del menú a actualizar |

> **Misma validación de órdenes duplicados** que el POST (ver sección 3).

### Request Body

```json
{
  "name": "Desayunos (actualizado)",
  "schedule": "8:00 am a 11:00 am",
  "categories": [
    {
      "id": 5,
      "name": "Clásicos (renombrado)",
      "order": 1,
      "products": [
        {
          "id": 17,
          "name": "Café Americano PREMIUM",
          "price": 4.50
        },
        {
          "name": "Nuevo Producto",
          "price": 6.00
        }
      ]
    },
    {
      "name": "Categoría Nueva",
      "order": 2,
      "products": [
        { "name": "Limonada", "price": 3.00 }
      ]
    }
  ],
  "subtitulos": [
    {
      "id": 1,
      "text": "Precios actualizados en USD",
      "order": 1
    }
  ]
}
```

### Reglas de comparación de IDs

El endpoint compara lo que existe en base de datos contra lo que llega en el request:

#### Categorías
| Situación | Acción |
|-----------|--------|
| Viene con `id` | **Actualiza** la categoría existente |
| Viene **sin** `id` | **Crea** una categoría nueva |
| Existe en BD pero **no** viene en el request | **Elimina** la categoría |
| Se elimina una categoría | Se eliminan en cascada sus asociaciones `category_product` |
| Productos de la categoría eliminada que no estén en **ninguna otra categoría** | Se **eliminan** (productos huérfanos) |
| Productos de la categoría eliminada que **sí** están en otras categorías | Solo se borra la asociación, el producto se conserva |

#### Productos dentro de una categoría
| Situación | Acción |
|-----------|--------|
| Viene con `id` | **Actualiza** el producto (y asegura la asociación con esta categoría) |
| Viene **sin** `id` | **Crea** un producto nuevo y lo asocia a esta categoría |
| Existe en la categoría pero **no** viene en el request | **Elimina** la asociación `category_product` |
| El producto queda sin asociaciones (`category_product`) | Se **elimina** el producto |
| El producto tiene otras asociaciones | Solo se borra la asociación, el producto se conserva |

#### Subtítulos
| Situación | Acción |
|-----------|--------|
| Viene con `id` | **Actualiza** el subtítulo |
| Viene **sin** `id` | **Crea** un subtítulo nuevo |
| Existe en BD pero **no** viene | **Elimina** el subtítulo |

### Campos del request (PUT)

Todos los campos son **opcionales**. Solo se actualiza lo que se envía.

#### Menú (raíz)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | `string` | — |
| `description` | `string` | — |
| `schedule` | `string` | — |
| `order` | `number` | — |
| `active` | `boolean` | — |

#### Categoría (dentro de `categories[]`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `number` (opcional) | Si existe → actualiza. Si no → crea |
| `name` | `string` | — |
| `description` | `string` | — |
| `active` | `boolean` | `false` → desactiva la categoría |
| `order` | `number` | **No puede repetirse** |
| `products` | `array` | Si se envía el array, reemplaza los productos de esta categoría |

#### Producto (dentro de `categories[].products[]`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `number` (opcional) | Si existe → actualiza. Si no → crea |
| `name` | `string` | — |
| `description` | `string` | — |
| `price` | `number` | — |
| `active` | `boolean` | `false` → desactiva (excluido con `?isActive=true`) |
| `featured` | `boolean` | — |

#### Subtítulo (dentro de `subtitulos[]`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `number` (opcional) | Si existe → actualiza. Si no → crea |
| `text` | `string` | — |
| `order` | `number` | **No puede repetirse** |

### Response `200`

Devuelve el menú actualizado completo, con la misma estructura que `GET /api/menus/:id`.

---

## Notas importantes para el Frontend

### 1. Formato bilingüe
Los campos `name` y `description` de productos usan el formato `"Español / English"`. Para separar idiomas:
```js
const [es, en] = product.name.split(" / ");
```

### 2. Precios
El campo `price` se devuelve como **string** en las responses (`"5.00"`), pero se envía como **number** en los requests (`5.00`). Parsear al recibir:
```js
const precio = Number(product.price);
```

### 3. Filtro `isActive`
- **Lista** (`GET /api/menus`): `?isActive=true` devuelve solo menús activos.
- **Detalle** (`GET /api/menus/:id`): `?isActive=true` oculta categorías inactivas y productos inactivos. El backend los filtra en memoria.
- El sitio público debe usar **siempre** `?isActive=true` en ambos endpoints.

### 4. Ordenamiento en GETs
Las respuestas del `GET /api/menus/:id` siempre vienen ordenadas por `order` ascendente:
- Categorías → `categories[i].order`
- Productos dentro de cada categoría → `categoryProducts[i].order`
- Subtítulos → `subtitulos[i].order`

No es necesario reordenar en el frontend.

### 5. PUT — Envío parcial vs total

- Si **no** se envía el array `categories`, las categorías **no se modifican**.
- Si se envía `categories: []` (vacío), **se eliminan todas** las categorías.
- Si se envía `categories: [...]` con contenido, se compara contra lo existente y se aplican las reglas de IDs.
- Misma lógica para `subtitulos`.
- Misma lógica para `products` dentro de cada categoría: si no viene el array no se toca, si viene `[]` se eliminan todos los productos de esa categoría, si viene `[...]` se aplican las reglas de IDs.

### 6. Manejo de errores
| Código | Significado |
|--------|-------------|
| `200` | Éxito |
| `400` | Órdenes duplicados en categorías/productos/subtítulos |
| `401` | Token inválido o expirado |
| `404` | Menú/Categoría/Producto no encontrado |
| `500` | Error interno (body malformado, etc.) |

### 7. Transacciones
El `PUT` se ejecuta dentro de una transacción SQL. Si algo falla a mitad del proceso, todos los cambios se revierten automáticamente (**rollback**).
