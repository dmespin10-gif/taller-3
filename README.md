# Unidad 2 – Práctica 3: Desarrollo de una API con el Stack MEAN

**Asignatura:** Patrones de Diseño de APIs · **Maestría de Software**

Este repositorio contiene la solución de la práctica *Stack MEAN* (MongoDB, Express, Angular y Node.js sobre TypeScript). Partiendo de un CRUD de gestión de personal con **deuda técnica intencional**, refactoricé el sistema hasta convertirlo en una arquitectura desacoplada, reactiva, validada y eficiente, alineada con los atributos de calidad (mantenibilidad, seguridad y fiabilidad).

| Capa | Tecnologías |
|---|---|
| Backend | Node.js, Express 5, TypeScript, Mongoose 9, Zod 4, MongoDB Atlas |
| Frontend | Angular 17, RxJS, Bootswatch (Bootstrap 5) |

---

# Retos resueltos

### * [Reto 1] Desacoplamiento del Backend y Persistencia Inversa
* **Problema en la base:** el controlador importaba directamente el modelo de Mongoose y ejecutaba `find()`, `findByIdAndUpdate()` y `findByIdAndRemove()`, acoplando la capa web con el motor de base de datos. Además, las rutas no estaban registradas, `PUT`/`DELETE` no recibían `:id` y `findByIdAndRemove` ya no existe en Mongoose 9.
* **Solución implementada:**
  * Interfaz abstracta **`IEmployeeRepository`** con el contrato `findAll`, `findById`, `create`, `update` y `delete`.
  * Implementación concreta **`MongoEmployeeRepository`**, único lugar (junto con `models/` y `config/`) que conoce Mongoose.
  * **`EmployeeController`** recibe el repositorio por **inyección de dependencias** en su constructor; no contiene ningún `import mongoose`.
 
### * [Reto 2] Validación Perimetral DTO y Respuesta Universal
* **Problema en la base:** no existía validación en tiempo de ejecución, cada endpoint respondía con un formato distinto y los errores del sistema se exponían al cliente.
* **Solución implementada:**
  * **Esquemas Zod** (`employee.dto.ts`) para `req.body`, `req.params` y `req.query`: nombre de 3 a 100 caracteres, cargo y departamento de 2 a 80, sueldo numérico mayor a 0. `z.strictObject` rechaza campos no declarados (*mass assignment*).
  * **Middleware `validate`**: rechaza la petición con `400 Bad Request` **antes** de llegar al controlador.
  * **Response Wrapper** (`ResponseWrapper`) y **middleware global de errores** (`errorHandler`): todas las respuestas comparten la misma estructura y nunca se exponen excepciones internas.

### * [Reto 3] Programación Reactiva e Inmutabilidad en el Servicio
* **Problema en la base:** el componente guardaba el estado en arreglos mutables y llamaba a `HttpClient` con `.subscribe()` manuales.
* **Solución implementada:**
  * **`EmployeeService`** como única fuente de verdad, con `BehaviorSubject` **privados**.
  * Flujos expuestos **de solo lectura** con `asObservable()`: `employees$`, `draft$`, `selectedId$`, `loading$`, `notification$`.
  * Mutaciones **inmutables**: `[...current, created]`, `map(...)` y `filter(...)`; nunca `push` ni `splice`.

### * [Reto 4] Arquitectura de Componentes Smart vs. Dumb
* **Problema en la base:** un HTML monolítico mezclaba formulario y tabla (con etiquetas mal cerradas).
* **Solución implementada:**
  * **Smart Component** `EmployeePageComponent` (`containers/`): consume un único `vm$` mediante el **`async` pipe**; cero `.subscribe()`.
  * **Dumb Components** `EmployeeFormComponent` y `EmployeeTableComponent` (`components/`): solo `@Input()` / `@Output()`, `ChangeDetectionStrategy.OnPush`.
  * El formulario **clona** su entrada (`{ ...this.employee }`) para evitar mutaciones colaterales en la tabla.

---

## * Contratos REST (`/api/v1`)

| Operación | Método y ruta | Validación |
|---|---|---|
| Consulta completa | `GET /employees` · `GET /employees?page=1&limit=10` | query |
| Consulta  ID | `GET /employees/:id` | params |
| Registro | `POST /employees` | body estricto |
| Actualización total | `PUT /employees/:id` | params + body completo |
| Actualización parcial | `PATCH /employees/:id` | params + body parcial |
| Eliminación | `DELETE /employees/:id` | params |

**Formato universal de respuesta (éxito y error):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Empleado registrado correctamente",
  "data": { "id": "6ad247fb7c389496c4b40314", "nombre": "Raúl Andrade", "...": "..." },
  "errors": null,
  "timestamp": "2026-10-16T15:51:24.056Z"
}
```

---

## * Requisitos e instalación (Node.js v20.12+; recomendado v24)

El proyecto usa **`tsx`** (basado en esbuild) en lugar del paquete obsoleto `ts-node-dev`, para una ejecución rápida en caliente y compatible con módulos ECMAScript nativos.

### 1. Backend
1. Ir al directorio del backend:
   ```bash
   cd backend
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Crear el archivo `.env` (a partir de `.env.example`) con la cadena de conexión de MongoDB Atlas:
   ```env
   MONGO_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.yk9u3y3.mongodb.net/usuarios_db?retryWrites=true&w=majority&appName=Cluster0
   PORT=3000
   DB_DRIVER=mongo
   ```
   >  El archivo `.env` está en `.gitignore` y **no debe subirse** al repositorio. En Atlas, la IP del equipo debe estar autorizada en *Network Access*.
4. Ejecutar el servidor en modo desarrollo (*hot reload*):
   ```bash
   npm run dev
   ```
   *El servidor escucha en `http://localhost:3000/api/v1` y muestra `Conexión exitosa a MongoDB`.*

| Script | Uso |
|---|---|
| `npm run dev` | Desarrollo con MongoDB Atlas |
| `npm run typecheck` | Verificación de tipos con TypeScript |
| `npm run build` / `npm start` | Compilación a `dist/` y ejecución |

### 2. Frontend
1. En otra terminal, ir al directorio del cliente:
   ```bash
   cd frontend
   ```
2. Instalar las dependencias (incluye los estilos de **Bootswatch**):
   ```bash
   npm install
   ```
3. Levantar el servidor de desarrollo de Angular:
   ```bash
   npx ng serve -o
   ```
   *La aplicación se abre en `http://localhost:4200`.*
4. Ejecutar las pruebas unitarias del servicio reactivo:
   ```bash
   npx ng test
   ```

---

## * Validación de contratos (pruebas de caja negra)

Las peticiones pueden ejecutarse con **Postman** o con la extensión **REST Client** de VS Code (archivo `api.rest`).

### Petición de creación exitosa (`POST`)
```http
POST http://localhost:3000/api/v1/employees
Content-Type: application/json

{
  "nombre": "Raúl Andrade",
  "cargo": "Arquitecto de Software",
  "departamento": "Innovación",
  "sueldo": 4500
}
```
*Resultado obtenido: `201 Created` con el empleado creado dentro de `data`.*

### Petición de inyección inválida (activación del DTO)
```http
POST http://localhost:3000/api/v1/employees
Content-Type: application/json

{
  "nombre": "Ma",
  "cargo": "",
  "departamento": "",
  "sueldo": -50
}
```
*Resultado obtenido: el servidor rechaza la petición con `400 Bad Request` **antes de llegar al controlador** (≈ 6 ms frente a ≈ 190 ms de una operación con base de datos) y devuelve la lista de campos inválidos:*
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Los datos enviados no son válidos",
  "data": null,
  "errors": [
    { "field": "body.nombre", "message": "El nombre debe tener al menos 3 caracteres" },
    { "field": "body.cargo", "message": "El cargo debe tener al menos 2 caracteres" },
    { "field": "body.departamento", "message": "El departamento debe tener al menos 2 caracteres" },
    { "field": "body.sueldo", "message": "El sueldo debe ser mayor a 0" }
  ]
}
```

### Otras pruebas realizadas
| Caso | Resultado |
|---|---|
| `GET /employees/123` (ID con formato inválido) | `400` – *El identificador no tiene un formato válido* |
| `DELETE` de un ID ya eliminado | `404` – *No existe un empleado con id …* |
| `POST` con un campo extra (`"isAdmin": true`) | `400` – *Campos no permitidos: isAdmin* |
| `POST` con JSON mal formado | `400` – *El cuerpo de la petición no es un JSON válido* |

