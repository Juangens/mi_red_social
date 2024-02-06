    const mongoose = require("mongoose");
    const Follow = require("../models/follow");
    const mongoosePaginate = require("mongoose-paginate-v2");

    // Configurar la paginación en el modelo Follow
    //Follow.paginate = mongoosePaginate;

    // Importar servicio
    const followService = require("../services/followUserIds");


    // Acciones de prueba
    const pruebaFollow = (req, res) => {
        return res.status(200).send({
            message: "Mensaje enviado desde: controllers/follow.js"
        });
    }

    // Accion de guardar un follow
    const save = (req, res) => {
        // Conseguir datos por body
        const params = req.body;

        // Sacar ID del usuario identificado
        const identity = req.user;

        // Crear objeto con modelo follow
        let userToFollow = new Follow({
            user: identity.id,
            followed: params.followed
        });

        // Guardar objeto en bbdd
        userToFollow.save()
            .then(followStored => {
                if (!followStored) {
                    return res.status(505).send({
                        status: "error",
                        message: "No se ha podido guardar el follow"
                    });
                }

                return res.status(200).send({
                    status: "success",
                    identity: req.user,
                    follow: followStored
                });
            })
            .catch(error => {
                return res.status(505).send({
                    status: "error",
                    message: "No se ha podido guardar el follow",
                    error: error.message
                });
            });
    }

    // Accion de borrar un follow
    const unfollow = async (req, res) => {
        try {
            const userIde = req.user.id;
            const followedId = req.params.id;

            const follow = await Follow.findOneAndDelete({
                user: userIde,
                followed: followedId
            });

            if (!follow) {
                return res.status(404).send({
                    status: "error",
                    message: "No se encontró el follow para borrar"
                });
            }

            return res.status(200).send({
                status: "success",
                message: "El follow se ha borrado correctamente",
                identity: req.user,
                followDeleted: follow
            });
        } catch (error) {
            console.error("Error al intentar borrar el follow:", error);
            return res.status(500).send({
                status: "error",
                message: "Error interno al intentar borrar el follow"
            });
        }
    };
    // Accion de listar los follows de un usuario (siguiendo )
    const following = async (req, res) => {
        try {
            let userId = req.user.id;
            if (req.params.id) userId = req.params.id;

            let page = 1;
            if (req.params.page) page = req.params.page;

            const itemsPerPage = 5;

            const options = {
                page: page,
                limit: itemsPerPage,
                populate: {
                    path: 'user followed',
                    select: '-password -__v'
                }
            };

            const result = await Follow.paginate({ user: userId }, options);

            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "Listado de usuarios que estoy siguiendo",
                follows: result.docs,
                total: result.totalDocs,
                pages: result.totalPages,
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        } catch (error) {
            console.error("Error al obtener el listado de usuarios seguidos:", error);
            return res.status(500).send({
                status: "error",
                message: "Error al obtener el listado de usuarios seguidos.",
                error: error.message
            });
        }
    };

    // Accion de listado de los usuarios que me siguen (soy seguido)
    const followers = async (req, res) => {
        try {
            let userId = req.user.id;

            if (req.params.id) userId = req.params.id;

            let page = 1;

            if (req.params.page) page = req.params.page;

            const itemsPerPage = 5;

            const follows = await Follow.find({ followed: userId })
                .populate("user followed", "-password -role -__v")
                .skip((page - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .exec();

            const total = await Follow.countDocuments({ followed: userId });

            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "listado de usuarios que me siguen",
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al obtener seguidores"
            });
        }


    }

    module.exports = {
        pruebaFollow,
        save,
        unfollow,
        following,
        followers
    }