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
const detail = async (req, res) => {
    try {
        // Sacar id de publicacion
        const publicationId = req.params.id;

        // Utilizar async/await para esperar la respuesta de la consulta
        const publicationStored = await Publication.findById(publicationId);

        if (!publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Mostrar publicacion",
            publication: publicationStored
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

// Eliminar publicaciones

const remove = async (req, res) => {
    try {
        const publicationId = req.params.id;

        const query = Publication.findOneAndDelete({ "user": req.user.id, "_id": publicationId });

        const deletedPost = await query.exec();

        if (!deletedPost) {
            console.log('No existe el post');
            return res.status(404).send({
                status: "error",
                message: "No existe el post"
            });
        }

        console.log('Post borrado con éxito:', deletedPost);

        return res.status(200).send({
            status: "success",
            message: "Post borrado con éxito",
            user: req.user.name,
            deletedPost
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

// Listas publicaciones

// Listar publicaciones de un usuario

// Eliminar publicaciones

// Subir ficheros

// Devolver archivos multimedia


module.exports = {
    pruebaPublication,
    save,
    detail,
    remove
}