const Publication = require("../models/publication")

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    });
}

// Guardar Publicaciones
const save = async (req, res) => {
    try {
        // Recoger datos
        const params = req.body;

        // Si no llegan, dar respuesta negativa
        if (!params.text) {
            return res.status(400).send({
                status: "error",
                message: "Debes enviar el texto de la publicación"
            });
        }

        // Crear y rellenar el objeto
        let newPublication = new Publication(params);
        newPublication.user = req.user.id;

        // Guardar objeto en la bbdd usando async/await
        const publicationStored = await newPublication.save();

        if (!publicationStored) {
            return res.status(400).send({
                status: "error",
                message: "No se ha guardado la publicación"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publicación guardada",
            publicationStored
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al guardar la publicación en la base de datos"
        });
    }
}


// Sacar una sola publicaciones

// Listas publicaciones

// Listar publicaciones de un usuario

// Eliminar publicaciones

// Subir ficheros

// Devolver archivos multimedia


module.exports = {
    pruebaPublication,
    save
}