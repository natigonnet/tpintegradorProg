🎯 **Colección Bruno - Progr3**





⚙️ **Configuración Inicial**

📝 Variables de Entorno (Environment)



Nombre del Environment: Progr3

apiUrl = http://localhost:3000





🌐 **Endpoints Principales**



Endpoint **Estado API**

GET {{apiUrl}}/api/estado

Content-Type: application/json



Endpoint **Login**

POST {{apiUrl}}/api/v1/login

Content-Type: application/json



{



"nombre\_usuario": "spuchetti16@gmail.com",

"contrasenia": "123456"



}



📂 Carpeta: **Reservas**



Endpoint **Listar todas las reservas**

GET {{apiUrl}}/api/v1/reservas

Authorization: Bearer \\\[token]

Content-Type: application/json



Endpoint **Reserva por id**

GET {{apiUrl}}/api/v1/reservas/3

Authorization: Bearer \\\[token]

Content-Type: application/json



Endpoint **Reserva por id usuario**

GET {{apiUrl}}/api/v1/reservas/usuarios/2

Authorization: Bearer \\\[token]

Content-Type: application/json



Endpoint **Crear reserva**

POST {{apiUrl}}/api/v1/reservas

Authorization: Bearer \\\[token]

Content-Type: application/json



{



"fecha\_reserva": "2025-11-25",

"salon\_id": 1,

"usuario\_id": 1,

"turno\_id": 1,

"tematica": "Prueba Bruno",

"servicios": \[

&nbsp;	{ "servicio\_id": 1, "importe": 15000.00 },

&nbsp;	{ "servicio\_id": 2, "importe": 25000.00 },

&nbsp;	{ "servicio\_id": 4, "importe": 15000.00 }

]



}





Endpoint **Actualizar reserva**

PUT {{apiUrl}}/api/v1/reservas/1

Authorization: Bearer \\\[token]

Content-Type: application/json



{



"tematica": "Robots"



}



Endpoint **Eliminar reserva**

DELETE {{apiUrl}}/api/v1/reservas/8

Authorization: Bearer \\\[token]

Content-Type: application/json



**Endpoint** Generar reporte (CSV y PDF)

GET {{apiUrl}}/api/v1/reservas/reportes/pdf

Authorization: Bearer \\\[token]

Content-Type: application/json





📂 Carpeta: **Salones**



Endpoint **Listar salones**

GET {{apiUrl}}/api/v1/salones

Content-Type: application/json



Endpoint **Salon por id**

GET {{apiUrl}}/api/v1/salones/3

Content-Type: application/json



Endpoint **Crear salon**

POST {{apiUrl}}/api/v1/salones

Content-Type: application/json



{



"titulo": "El calamar",



"direccion": "calle 2",



"capacidad": 350,



"importe": 120000



}





Endpoint **Actualizar salon**

PUT {{apiUrl}}/api/v1/salones/2

Content-Type: application/json



{



"titulo": "Hola a todos",

"capacidad": 100



}





Endpoint **Eliminar salon**

DELETE {{apiUrl}}/api/v1/salones/3

Authorization: Bearer \\\[token]

Content-Type: application/json





📂 Carpeta: **Servicios**



Endpoint **Todos los servicios**

GET {{apiUrl}}/api/v1/servicios

Content-Type: application/json



Endpoint **Servicio por id**

GET {{apiUrl}}/api/v1/servicios/9

Content-Type: application/json



Endpoint **Crear servicio**

POST {{apiUrl}}/api/v1/servicios

Content-Type: application/json



{



"descripcion": "Soy un servicio nuevo",



"importe": 50000



}



Endpoint **Actualizar servicio**

PUT {{apiUrl}}/api/v1/servicios/9

Content-Type: application/json



{



"importe": 30000



}



Endpoint **Eliminar servicio**

DELETE {{apiUrl}}/api/v1/servicios/2

Content-Type: application/json





📂 Carpeta: **Turnos**

Endpoint Todos los turnos

GET {{apiUrl}}/api/v1/turnos

Content-Type: application/json



Endpoint **Turno por id**

GET {{apiUrl}}/api/v1/turnos/2

Content-Type: application/json





Endpoint **Crear turno**



POST {{apiUrl}}/api/v1/turnos

Authorization: Bearer \\\[token]

Content-Type: application/json



{



"hora\_desde": "21:00:00",



"hora\_hasta": "22:00:00"



}





Endpoint **Actualizar turno**

PUT {{apiUrl}}/api/v1/turnos/2

Authorization: Bearer \\\[token]

Content-Type: application/json



{



"hora\_desde": "18:00:00"



}



Endpoint **Eliminar turno**

DELETE {{apiUrl}}/api/v1/turnos/2

Authorization: Bearer \\\[token]

Content-Type: application/json





📂 Carpeta: **Usuarios**



Endpoint **Todos los usuarios**



GET {{apiUrl}}/api/v1/usuarios

Authorization: Bearer \\\[token]

Content-Type: application/json





Endpoint **Usuario por id**



GET {{apiUrl}}/api/v1/usuarios/11

Authorization: Bearer \\\[token]

Content-Type: application/json





Endpoint **Crear usuario**



POST {{apiUrl}}/api/v1/usuarios

Authorization: Bearer \\\[token]

Content-Type: application/json



{



"nombre": "Pepito",



"apellido": "Gutierrez",



"nombre\_usuario": "pepitoelmejor1994@gmail.com",



"contrasenia": "pepitoG01",



"tipo\_usuario": "2"



}





Endpoint **Actualizar usuario**



PUT {{apiUrl}}/api/v1/usuarios/11

Authorization: Bearer \\\[token]

Content-Type: application/json



{



"tipo\_usuario": "3"



}



Endpoint **Eliminar usuario**

DELETE {{apiUrl}}/api/v1/usuarios/11

Authorization: Bearer \\\[token]

Content-Type: application/json





**Recomendaciones**



* Ejecuta primero el Login para obtener un token válido.



* Actualiza los tokens en los headers de autorización según lo que devuelva el login.



* Usa variables para el token y evita hardcodearlo en cada request.



* Verifica que la URL base esté correcta en las variables de entorno.
