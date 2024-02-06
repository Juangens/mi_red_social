// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-paginate-v2");
const fs = require("fs");
const path = require("path");

// Importar modelos
const user = require("../models/user");

// Importar servicios
const jwt = require("../services/jwt");
const followService = require("../services/followUserIds");

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js",
        usuario: req.user
    });
}
// Registros de usuario
const register = async (req, res) => {
    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que llegan bien (mas validación)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
// Control usuarios duplicados
    try {
        const users = await user.find({
            $or: [
                {email: params.email.toLowerCase()},
                {nick: params.nick.toLowerCase()}
            ]
        });

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "error",
                message: "El usuario ya existe"
            });
        }

        // Cifrar contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto usuario
        let user_to_save = new user(params);

        // Guardar usuario en la base de datos
        const userStored = await user_to_save.save();

        if (!userStored) {
            return res.status(500).send({
                status: "error",
                message: "Error al guardar el usuario"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            user: userStored
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la petición"
        });
    }
}

const login = async (req, res) => {
    try {
        // Recoger parámetros
        let params = req.body;

        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Buscar en BBDD si existe el usuario
        const userRecord = await user.findOne({email: params.email});

        if (!userRecord) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario"
            });
        }

        // Comprobar si el password es correcto
        const isPasswordCorrect = bcrypt.compareSync(params.password, userRecord.password);
        if (!isPasswordCorrect) {
            return res.status(400).send({
                status: "error",
                message: "El password es incorrecto"
            });
        }

        // Devolver token de JWT
        const token = jwt.createToken(userRecord);

        // Devolver datos usuario
        return res.status(200).send({
            status: "success",
            message: "Usuario logueado correctamente",
            user: {
                id: userRecord._id,
                name: userRecord.name,
                nick: userRecord.nick
            },
            token
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });
    }
}

const profile = async (req, res) => {
    try {
        // Obtener el parámetro de ID de usuario de la URL
        const id = req.params.id;

        // Consulta para obtener datos del usuario excluyendo la contraseña y el rol
        const userProfile = await user.findById(id).select("-password -role");

        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario o hay un error"
            });
        }

        // Obtener información de seguimiento
        const followInfo = await followService.followThisUser(req.user.id, id);

        // Devolver resultado
        return res.status(200).send({
            status: "success",
            message: userProfile,
            following: followInfo.following,
            follower: followInfo.follower
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al buscar el usuario en la base de datos"
        });
    }
};


const list = async (req, res) => {
    try {
        // Controlar en qué página estamos
        let page = 1;
        if (req.params.page) {
            page = parseInt(req.params.page);
        }

        // Consulta mongoose paginate
        let itemsPerPage = 5;

        const result = await user.paginate({}, {page, limit: itemsPerPage, sort: {_id: 1}});

        if (!result.docs || result.docs.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles"
            });
        }

        // Devolver resultado (posterior info de follows)
        return res.status(200).send({
            status: "success",
            users: result.docs,
            page: result.page,
            itemsPerPage: result.limit,
            total: result.totalDocs,
            pages: Math.ceil(result.totalDocs / result.limit)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "error",
            message: "Error al buscar usuarios en la base de datos"
        });
    }

}
const update = async (req, res) => {
    try {
        const userIdentity = req.user;
        const userToUpdate = req.body;

        // Eliminar campos sobrantes
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        delete userToUpdate.image;

        // Comprobar si el usuario ya existe
        const existingUsers = await user.find({
            $and: [
                {_id: {$ne: userIdentity.id}}, // Excluir el usuario actual
                {$or: [{email: userToUpdate.email.toLowerCase()}, {nick: userToUpdate.nick.toLowerCase()}]}
            ]
        });

        if (existingUsers.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "El usuario ya existe"
            });
        }

        // Si se proporciona una contraseña, cifrarla
        if (userToUpdate.password) {
            const hashedPassword = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = hashedPassword;
        }

        // Buscar y actualizar usuario en la base de datos
        const userUpdated = await user.findByIdAndUpdate(
            userIdentity.id,
            {$set: userToUpdate},
            {new: true}
        );

        return res.status(200).json({
            status: "success",
            message: "Usuario actualizado exitosamente",
            user: userUpdated
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor al actualizar el usuario"
        });
    }
}

const upload = (req, res) => {

    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "No se ha subido ninguna imagen"
        });
    }

    // conseguier el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extensión del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar la extension, solo imagenes
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        // Borrar el archivo subido
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "La extensión de la imagen no es válida"
        });
    }

    // Si es correcto, guardar imagen en bbdd
    user.findOneAndUpdate({_id: req.user.id}, {image: req.file.filename}, {new: true})
        .then(userUpdated => {
            if (!userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al guardar la imagen"
                });
            }

            // El usuario se ha actualizado correctamente
            // Puedes realizar más acciones aquí si es necesario
            return res.status(200).send({
                status: "success",
                message: "Imagen guardada exitosamente",
                user: userUpdated,
                file: req.file
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: "error",
                message: "Error al guardar la imagen",
                error: error.message
            });
        });
    }

    const avatar = (req, res) => {
        // Sacar el paramatro de la url
        const file = req.params.file;

        // montar el path real de la imagen
        const filePath = "./uploads/avatars/" + file;

        // Comprobar que existe
        fs.stat(filePath, (error,exists) => {
            if (!exists) {
                return res.status(404).send({
                    status: "error",
                    message: "La imagen no existe"
                });
            }
                // Devolver un file
                return res.sendFile(path.resolve(filePath));
        });
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}

