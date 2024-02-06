// Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// MIDDLEWARE Funcion de autentificacion
exports.auth = (req, res, next) => {
    // Comprobar si llega la cabecera de autentificacion
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autentificacion" });
    }

    // Limpiar el token y quitar comillas
    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        // Decodificar token
        let payload = jwt.decode(token, secret);

        // Comprobar si el token ha expirado
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "El token ha expirado"
            });
        }
        // Agregar datos de usuario a request
        req.user = payload;
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "El token no es valido",
            error
        });
    }

    // Pasar a ejecucion
    next();
}



