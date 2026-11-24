# TP 13 - Buscar y consultar reservas desde la web y la API

**Módulo 3 - Desarrollo Back-end con Node.js**

**UNCA - Universidad Nacional de Catamarca**

**Proyecto:** `tp-13-salas-consultas-web-mongodb`

**Alumno:** Julián Zalazar Jofre

## 1. Introducción

Este trabajo práctico continúa el desarrollo realizado
en el TP12, incorporando la búsqueda, el filtrado,
el ordenamiento y la paginación de reservas de salas
de estudio desde la interfaz web y la API REST.

Ambas interfaces utilizan los mismos criterios de
validación y el mismo servicio de búsqueda.

Se mantienen las operaciones de creación, lectura,
edición completa, modificación parcial y eliminación
desarrolladas en las unidades anteriores.

## 2. Objetivos

- Buscar reservas por fragmentos del nombre del estudiante.
- Filtrar reservas por sala.
- Ordenar los resultados mediante criterios permitidos.
- Incorporar paginación desde la web y la API.
- Compartir criterios y servicios entre ambas interfaces.
- Conservar los criterios al cambiar de página.
- Proteger los caracteres especiales de las búsquedas.
- Validar los parámetros recibidos mediante la URL.
- Mantener las funcionalidades de las unidades anteriores.

## 3. Tecnologías utilizadas

- Node.js.
- Express 5.
- MongoDB Atlas Free.
- Mongoose 9.
- EJS.
- express-ejs-layouts.
- Morgan.
- ESLint.
- Prettier.
- Postman.
- HTML y CSS.

El proyecto utiliza CommonJS.

No se incorporaron nuevas dependencias respecto
del trabajo práctico anterior.

## 4. Configuración de MongoDB Atlas

| Elemento | Valor |
| --- | --- |
| Base de datos | reservas_salas_u13 |
| Colección | reservas |
| Puerto | 3000 |
| Variable de conexión | MONGODB_URI |

Se utiliza una base de datos independiente de las
entregas anteriores.

Se conserva la configuración DNS utilizada desde
la Unidad 7.

### Variables de entorno

Crear un archivo privado .env a partir de .env.example.

```dotenv
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u13?retryWrites=true&w=majority
```

Reemplazar los marcadores por los valores correspondientes
a MongoDB Atlas.

La dirección IP utilizada debe estar autorizada en
MongoDB Atlas.

El archivo .env privado no debe publicarse en GitHub.

## 5. Instalación y ejecución

Clonar el repositorio de entrega:

```powershell
git clone https://github.com/Jjofre8/tp-13-salas-consultas-web-mongodb.git
```

Ingresar a la carpeta:

```powershell
cd tp-13-salas-consultas-web-mongodb
```

Instalar las dependencias:

```powershell
npm.cmd ci
```

Crear el archivo de configuración:

```powershell
Copy-Item .env.example .env
```

Completar las credenciales correspondientes.

Verificar la calidad del código:

```powershell
npm.cmd run check
```

Comprobar la conexión:

```powershell
node --env-file=.env scripts/comprobar-conexion.js
```

Iniciar el servidor:

```powershell
node --env-file=.env src/index.js
```

También puede utilizarse:

```powershell
npm.cmd start
```

Dirección principal:

<http://localhost:3000>

Listado de reservas:

<http://localhost:3000/reservas>

Nueva consulta API:

<http://localhost:3000/api/reservas/consulta>

## 6. Organización del proyecto

```text
tp-13-salas-consultas-web-mongodb/
├── src/
│   ├── config/
│   │   ├── base-datos.js
│   │   └── entorno.js
│   ├── controladores/
│   │   ├── reservas.js
│   │   └── reservas-api.js
│   ├── middleware/
│   │   ├── reservas.js
│   │   └── solicitudes.js
│   ├── modelos/
│   │   └── reserva.js
│   ├── rutas/
│   │   ├── reservas.js
│   │   └── reservas-api.js
│   ├── servicios/
│   │   ├── criterios-reservas.js
│   │   └── reservas.js
│   ├── app.js
│   └── index.js
├── scripts/
│   ├── comprobar-conexion.js
│   ├── crear-reserva.js
│   └── listar-reservas.js
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   ├── reservas/
│   │   ├── nueva.ejs
│   │   ├── lista.ejs
│   │   ├── detalle.ejs
│   │   ├── editar.ejs
│   │   ├── estado.ejs
│   │   └── eliminar.ejs
│   ├── inicio.ejs
│   └── no-encontrado.ejs
├── public/
│   ├── css/
│   │   └── estilos.css
│   └── img/
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md
```

Se mantiene la separación entre rutas, controladores,
middlewares, servicios y modelos.

La validación de criterios se encuentra centralizada
en criterios-reservas.js.

Las consultas a MongoDB se realizan desde el servicio
de reservas.

## 7. Modelo de reservas

| Campo | Tipo | Validación |
| --- | --- | --- |
| estudiante | String | Obligatorio |
| email | String | Obligatorio, contiene @ |
| sala | String | Sala permitida |
| fecha | String | Obligatorio |
| turno | String | Turno permitido |
| personas | Number | Entero entre 1 y 6 |
| estado | String | pendiente o confirmada |

### Salas permitidas para escrituras

- Sala Norte.
- Sala Sur.
- Sala Multimedia.

### Turnos permitidos

- Mañana.
- Tarde.
- Noche.

### Estados permitidos

- pendiente.
- confirmada.

Las nuevas reservas tienen estado pendiente.

MongoDB genera automáticamente el identificador _id,
representado como id en las respuestas públicas.

## 8. Criterios de consulta

La función leerCriterios centraliza la validación
de los parámetros utilizados por la web y la API.

| Parámetro | Regla | Predeterminado |
| --- | --- | --- |
| q | Fragmento literal, máximo 60 caracteres | Vacío |
| sala | Igualdad exacta, máximo 80 caracteres | Vacío |
| orden | estudiante, personas-asc o personas-desc | estudiante |
| pagina | Entero entre 1 y 1000 | 1 |
| limite | Entero entre 1 y 20 | 2 |

Los parámetros q y sala se procesan mediante trim.

Cuando q está vacío, no se aplica una restricción
por nombre del estudiante.

Cuando sala está vacía, se consultan todas las salas.

Un orden vacío se considera inválido.

Se rechazan:

- Parámetros repetidos.
- Parámetros desconocidos.
- Valores no textuales.
- Páginas fuera del intervalo permitido.
- Límites fuera del intervalo permitido.
- Valores decimales en pagina y limite.
- Ordenamientos no permitidos.
- Textos que superan las longitudes máximas.
- Claves que intentan introducir operadores MongoDB.

Las entradas inválidas generan HTTP 400.

## 9. Búsqueda y filtro

La búsqueda por estudiante permite encontrar
reservas utilizando una parte del nombre.

Por ejemplo:

```text
q=ana
```

Puede encontrar Ana Alba, Ana Berta, Ana Clara
y Ana Diana.

La búsqueda ignora diferencias entre mayúsculas
y minúsculas, pero no elimina las tildes.

El filtro por sala utiliza igualdad exacta.

Por ejemplo:

```text
sala=Sala Norte
```

Solo devuelve reservas pertenecientes a esa sala.

Los dos criterios pueden utilizarse simultáneamente.

```text
q=ana&sala=Sala Norte
```

En ese caso, se deben cumplir ambas condiciones.

Una sala inexistente no constituye una entrada
inválida para una consulta.

Devuelve HTTP 200 con cero coincidencias.

## 10. Protección de caracteres especiales

La búsqueda se realiza mediante una expresión regular
construida dentro del servicio.

Antes de utilizar el fragmento recibido, se aplica
la función escaparExpresionRegular.

```javascript
function escaparExpresionRegular(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

Esto permite buscar caracteres especiales como texto
literal sin alterar el significado de la consulta.

Ejemplos:

- A+B busca el texto A+B.
- [ busca un corchete literal.
- .* busca un punto seguido de un asterisco.

Los parámetros recibidos desde la URL no se envían
directamente a MongoDB.

El filtro se construye utilizando exclusivamente
los campos y criterios admitidos.

## 11. Servicio compartido de búsqueda

Se incorpora la función buscar al servicio existente.

El controlador web y el controlador API utilizan:

```javascript
const criterios = leerCriterios(req.query);
const resultado = await servicio.buscar(criterios);
```

La operación construye el filtro, establece el orden,
cuenta las coincidencias y obtiene los documentos
correspondientes a la página solicitada.

Se utilizan las operaciones:

- countDocuments.
- find.
- select.
- sort.
- skip.
- limit.
- lean.

No se realizan solicitudes HTTP internas desde
la aplicación web hacia su propia API.

Se conserva la función consultar utilizada por
GET /api/reservas en las unidades anteriores.

## 12. Ordenamiento

Los criterios recibidos se traducen a campos
conocidos del modelo.

| Criterio | Orden MongoDB |
| --- | --- |
| estudiante | estudiante ascendente, _id ascendente |
| personas-asc | personas ascendente, _id ascendente |
| personas-desc | personas descendente, _id ascendente |

El identificador se utiliza como criterio de
desempate para mantener un orden estable.

El usuario no puede seleccionar campos arbitrarios
de MongoDB mediante la URL.

## 13. Paginación

El salto de documentos se calcula mediante:

```javascript
const salto = (pagina - 1) * limite;
```

El total de coincidencias se obtiene utilizando
el mismo filtro de la búsqueda.

```javascript
const total = await Reserva.countDocuments(filtro);
```

La cantidad de páginas se calcula mediante:

```javascript
const paginas = Math.ceil(total / limite);
```

El resultado final tiene la estructura:

```javascript
return {
  datos: reservas.map(convertirReserva),
  pagina,
  limite,
  total,
  paginas: Math.ceil(total / limite),
};
```

El campo datos contiene únicamente los documentos
de la página solicitada.

El campo total representa todas las coincidencias,
no solamente los documentos de la página actual.

## 14. Interfaz web

La ruta GET /reservas incorpora un formulario
de búsqueda mediante el método GET.

El formulario permite seleccionar:

- Fragmento del nombre del estudiante.
- Sala.
- Ordenamiento.
- Cantidad de resultados por página.

También presenta los botones Buscar y Limpiar.

Se utiliza datalist para ofrecer sugerencias de salas
sin impedir la consulta de otros valores textuales.

El formulario conserva los criterios válidos recibidos.

El parámetro pagina no se incluye en el formulario,
por lo que una nueva búsqueda comienza en la página 1.

El enlace Limpiar regresa a /reservas sin parámetros.

## 15. Navegación entre páginas

Los enlaces se construyen mediante URLSearchParams.

```javascript
const parametros = new URLSearchParams({
  q: criterios.q,
  sala: criterios.sala,
  orden: criterios.orden,
  pagina: String(pagina),
  limite: String(criterios.limite),
});
```

Al cambiar de página se conservan:

- q.
- sala.
- orden.
- limite.

Anterior y Siguiente se muestran cuando corresponde.

La interfaz informa la cantidad total de coincidencias,
los documentos mostrados y la página actual.

## 16. Consultas sin resultados

Cuando no existen coincidencias, el resultado tiene:

```json
{
  "datos": [],
  "pagina": 1,
  "limite": 2,
  "total": 0,
  "paginas": 0
}
```

La API responde HTTP 200.

La web muestra el mensaje:

No hay coincidencias.

Los criterios permanecen visibles y se ofrece
la posibilidad de limpiar la búsqueda.

## 17. Páginas fuera de resultados

Una página válida puede superar la cantidad de
páginas disponibles.

Por ejemplo, si existen tres coincidencias y el
límite es dos, solicitar la página tres devuelve:

```json
{
  "datos": [],
  "pagina": 3,
  "limite": 2,
  "total": 3,
  "paginas": 2
}
```

La API responde HTTP 200.

La interfaz informa que la página está fuera de
resultados y ofrece regresar a la primera página
conservando los criterios.

No se muestra una numeración incorrecta como
Página 3 de 2.

## 18. Rutas web

| Método | Ruta | Funcionalidad |
| --- | --- | --- |
| GET | / | Página principal |
| GET | /reservas | Búsqueda y listado paginado |
| GET | /reservas/nueva | Formulario de creación |
| POST | /reservas | Crear reserva |
| GET | /reservas/:id | Detalle |
| GET | /reservas/:id/editar | Formulario de edición |
| POST | /reservas/:id/editar | Guardar edición |
| GET | /reservas/:id/estado | Formulario de estado |
| POST | /reservas/:id/estado | Cambiar estado |
| GET | /reservas/:id/eliminar | Confirmación |
| POST | /reservas/:id/eliminar | Eliminar reserva |
| GET | /estado | Estado del servidor |

Se mantienen las acciones de alta, detalle, edición,
cambio de estado y eliminación.

## 19. API REST

| Método | Ruta | Funcionalidad |
| --- | --- | --- |
| GET | /api/reservas | Listado anterior |
| GET | /api/reservas/consulta | Nueva búsqueda compartida |
| GET | /api/reservas/:id | Consulta individual |
| POST | /api/reservas | Creación |
| PUT | /api/reservas/:id | Reemplazo completo |
| PATCH | /api/reservas/:id | Modificación parcial |
| DELETE | /api/reservas/:id | Eliminación física |

La ruta /consulta se registra antes de /:id para
evitar que Express interprete consulta como
un identificador de reserva.

## 20. Compatibilidad con la API anterior

| Característica | /api/reservas | /api/reservas/consulta |
| --- | --- | --- |
| Búsqueda por nombre | No | Sí |
| Filtro por sala | Sí | Sí |
| Ordenamiento | Sí | Sí |
| Paginación | Sí | Sí |
| Sala vacía | HTTP 400 | Todas las salas |
| Servicio | consultar | buscar |
| Respuesta | Objeto JSON | Objeto JSON |

El listado anterior conserva su contrato.

El detalle individual y las operaciones de escritura
no fueron reemplazados.

## 21. Códigos HTTP

| Situación | Código |
| --- | --- |
| Consulta válida | 200 |
| Consulta sin coincidencias | 200 |
| Página fuera de resultados | 200 |
| Creación mediante API | 201 |
| Eliminación mediante API | 204 |
| Creación mediante formulario | 302 |
| Edición web correcta | 303 |
| Cambio de estado correcto | 303 |
| Eliminación web correcta | 303 |
| Criterios inválidos | 400 |
| Identificador inválido | 400 |
| Reserva inexistente | 404 |
| Error interno | 500 |

Los errores de la interfaz web se presentan mediante
una página HTML.

Los errores de la API se devuelven en formato JSON.

Se conserva el manejador general de errores del TP12.

## 22. Datos de práctica

La consigna propone seis reservas ficticias:

| Estudiante | Email | Sala | Personas |
| --- | --- | --- | --- |
| Ana Alba | <ana.alba@example.com> | Sala Norte | 1 |
| Ana Berta | <ana.berta@example.com> | Sala Norte | 2 |
| Ana Clara | <ana.clara@example.com> | Sala Norte | 3 |
| Ana Diana | <ana.diana@example.com> | Sala Sur | 4 |
| Bruno Ejemplo | <bruno@example.com> | Sala Norte | 2 |
| Carla (A+B) | <carla@example.com> | Sala Sur | 1 |

Datos comunes:

- Fecha ilustrativa: 2026-11-18.
- Turno: Mañana.
- Estado inicial: pendiente.

No duplicar registros existentes ni vaciar
la colección para ejecutar las pruebas.

Los resultados esperados de la siguiente sección
presuponen que se encuentran cargadas las seis reservas.

## 23. Pruebas reproducibles

Utilizar Postman con una colección denominada:

TP 13 - Reservas.

Método GET.

URL:

<http://localhost:3000/api/reservas/consulta>

Seleccionar Body none y utilizar la pestaña Params
para ingresar los criterios.

No enviar los parámetros mediante raw JSON.

### Prueba 1 - Consulta predeterminada

```http
GET /api/reservas/consulta
```

Resultado esperado con los seis registros:

- HTTP 200.
- total: 6.
- pagina: 1.
- limite: 2.
- paginas: 3.
- Dos documentos en datos.

Ruta web equivalente:

<http://localhost:3000/reservas>

### Prueba 2 - Búsqueda por estudiante

```http
GET /api/reservas/consulta?q=ana
```

Resultado esperado:

- HTTP 200.
- total: 4.
- paginas: 2.

Agregar el filtro de sala:

```http
GET /api/reservas/consulta?q=ana&sala=Sala%20Norte
```

Resultado esperado:

- total: 3.
- paginas: 2.

### Prueba 3 - Ordenamiento y paginación

```http
GET /api/reservas/consulta?q=ana&sala=Sala%20Norte&orden=personas-asc&pagina=1&limite=2
```

Resultado esperado:

- total: 3.
- paginas: 2.
- Ana Alba, personas: 1.
- Ana Berta, personas: 2.

Cambiar pagina a 2.

Resultado esperado:

- Ana Clara, personas: 3.
- total: 3.
- paginas: 2.

Comparar los identificadores con las páginas web
equivalentes.

### Prueba 4 - Conservación de criterios

Abrir:

```text
/reservas?q=ana&sala=Sala%20Norte&orden=personas-asc&pagina=1&limite=2
```

Presionar Siguiente.

Comprobar que la URL conserva q, sala, orden y limite.

Modificar la búsqueda y presionar Buscar.

La nueva consulta debe comenzar en la página 1.

Presionar Limpiar para volver a los valores
predeterminados.

### Prueba 5 - Caracteres especiales

```http
GET /api/reservas/consulta?q=A%2BB
```

Resultado esperado:

- HTTP 200.
- total: 1.
- Carla (A+B).

Probar también:

```http
GET /api/reservas/consulta?q=%5B
```

```http
GET /api/reservas/consulta?q=.%2A
```

Resultado esperado:

- HTTP 200.
- total: 0.
- Sin errores de expresión regular.

### Prueba 6 - Sin coincidencias

```http
GET /api/reservas/consulta?q=ZZZsincoincidencias
```

Resultado esperado:

```json
{
  "datos": [],
  "pagina": 1,
  "limite": 2,
  "total": 0,
  "paginas": 0
}
```

Ruta web equivalente:

```text
/reservas?q=ZZZsincoincidencias
```

La interfaz debe mostrar No hay coincidencias
y conservar los criterios.

### Prueba 7 - Página fuera de resultados

```http
GET /api/reservas/consulta?q=ana&sala=Sala%20Norte&pagina=3&limite=2
```

Resultado esperado:

```json
{
  "datos": [],
  "pagina": 3,
  "limite": 2,
  "total": 3,
  "paginas": 2
}
```

La ruta web equivalente debe ofrecer regresar
a la primera página conservando los criterios.

### Prueba 8 - Parámetros inválidos

Probar individualmente:

```text
pagina=0
pagina=1.5
limite=21
orden=inventado
q=ana&q=bruno
desconocido=valor
orden=
```

Resultado esperado:

- HTTP 400 JSON en la API.
- HTTP 400 HTML en la web.

Volver a una consulta válida para comprobar
la recuperación del funcionamiento.

### Prueba 9 - Criterios vacíos

```http
GET /api/reservas/consulta?q=&sala=
```

Resultado esperado:

HTTP 200 sin restricciones por estudiante ni sala.

```http
GET /api/reservas/consulta?sala=Inexistente
```

Resultado esperado:

HTTP 200 con cero coincidencias.

### Prueba 10 - Continuidad del CRUD

Comprobar las rutas heredadas:

```http
GET /api/reservas
GET /api/reservas/ID_REAL
```

Crear una reserva adicional ficticia.

Comprobar:

- Creación desde el formulario.
- Consulta individual.
- Edición completa.
- Cambio parcial de estado.
- Eliminación con confirmación.
- Consulta posterior a la eliminación.

Realizar estas operaciones sobre el registro adicional
para conservar los seis datos principales de consulta.

### Prueba 11 - Persistencia

Registrar el resultado de una consulta.

Detener el servidor con Ctrl+C.

Iniciar nuevamente:

```powershell
npm.cmd start
```

Repetir la consulta utilizando los mismos criterios.

Resultado esperado:

Los documentos conservan sus identificadores y datos
almacenados en MongoDB Atlas.

## 24. Registro de funcionamiento

Fecha: 24/11/2026.

Durante el desarrollo se realizaron comprobaciones
desde el navegador utilizando la nueva interfaz.

| Comprobación | Resultado |
| --- | --- |
| Inicio del servidor | Correcto |
| Conexión a MongoDB Atlas | Correcto al iniciar |
| Acceso a /reservas | Correcto |
| Visualización del buscador | Correcto |
| Visualización de los filtros | Correcto |
| Límite predeterminado de 2 | Visible |
| Mensaje sin coincidencias con base vacía | Correcto |
| Creación de Ana Alba | Correcto |
| Creación de Ana Diana | Correcto |
| Funcionamiento básico con dos reservas | Correcto |

Durante la configuración se produjo un error de
conexión a MongoDB Atlas que no impidió el posterior
inicio correcto del servidor.

Las pruebas con las seis reservas, los caracteres
especiales, las respuestas HTTP detalladas,
la comparación de identificadores y la persistencia
quedan documentadas como procedimientos reproducibles.

No se registran como ejecutadas las pruebas
que todavía no fueron comprobadas.

## 25. Continuidad de las unidades anteriores

Se conservan:

- Creación de reservas.
- Consulta individual.
- Edición completa mediante PUT y formulario web.
- Modificación parcial mediante PATCH.
- Cambio de estado desde la web.
- Eliminación mediante DELETE.
- Confirmación de eliminación mediante formulario.
- Validaciones del modelo.
- Manejo de errores.
- Identificación y medición de solicitudes.
- Endpoint de estado del servidor.

La nueva búsqueda no requiere modificar los
documentos almacenados.

## 26. Calidad del código

Aplicar formato mediante:

```powershell
npm.cmd run format
```

Verificar formato:

```powershell
npm.cmd run format:check
```

Verificar ESLint:

```powershell
npm.cmd run lint
```

Ejecutar ambas comprobaciones:

```powershell
npm.cmd run check
```

El proyecto conserva las herramientas utilizadas
en los trabajos prácticos anteriores.

## 27. Seguridad

No se deben publicar:

- Archivos .env privados.
- Contraseñas.
- Cadenas privadas de conexión.
- Carpeta node_modules.
- Datos personales reales.

La aplicación valida los parámetros antes de
construir las consultas.

Los operadores utilizados en MongoDB se establecen
desde el servidor y no desde los parámetros
recibidos directamente.

Los errores inesperados utilizan mensajes seguros.

No se incorpora autenticación ni autorización,
ya que no forman parte de la consigna.

El proyecto está destinado a fines académicos
y ejecución local.

## 28. Entrega

Repositorio individual:

tp-13-salas-consultas-web-mongodb

La entrega incluye:

- Código fuente.
- Vistas EJS.
- Estilos CSS.
- Scripts.
- Archivos de configuración.
- package.json.
- package-lock.json.
- .env.example.
- .gitignore.
- README.md.

Las pruebas se documentan mediante procedimientos
reproducibles y registros de funcionamiento.

## 29. Conclusión

El TP13 incorpora la búsqueda literal por estudiante,
el filtro exacto por sala, el ordenamiento y la
paginación desde la interfaz web y la API REST.

La solución comparte los criterios y el servicio
de búsqueda, protege los caracteres especiales
y mantiene los parámetros durante la navegación.

Se conserva la arquitectura por capas y las
funcionalidades desarrolladas en las unidades
anteriores.
