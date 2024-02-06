const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const FollowSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User",
        required: true,
    },
    followed: {
        type: Schema.ObjectId,
        ref: "User",
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// Inicializar el plugin de paginación antes de crear el modelo
FollowSchema.plugin(mongoosePaginate);

// Crear el modelo usando el esquema
const Follow = model('Follow', FollowSchema);

module.exports = Follow;
