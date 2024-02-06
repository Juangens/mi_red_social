const mongoose = require("mongoose");

const connection = async() => {
    try {
        await mongoose.connect("mongodb://localhost:27017/mi_redsocial");

        console.log("Conectado correctamente");

    } catch (error) {
        console.log(error);
        throw new Error ("No se ha podido conectar a la BBDD");
    }
}
module.exports = connection;