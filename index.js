// Importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

// Mensaje bienvenida
console.log("API Node para RED SOCIAL arrancada");

// Conexion BBDD
connection();

// Crear Servidor NODE
const app = express();
const puerto = 3900;

// Conf cors
app.use(cors());

// Convertir datos body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Configuracion de Rutas
const userRoutes = require("./routes/user");
const publicationRoutes = require("./routes/publication");
const followRoutes = require("./routes/follow");

app.use("/api/user", userRoutes);
app.use("/api/publication", publicationRoutes);
app.use("/api/follow", followRoutes);

// Ruta prueba
app.get("/ruta-prueba", (req, res) =>{
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "Victor Robles",
            "web": "victorrobles.es"
        }
    );
})

// Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
   console.log("Servidor NODE funcionando en el puerto: ", puerto);
});
