const Follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
    try {
        let following = await Follow.find({"user": identityUserId})


        let followers = await Follow.find({"followed": identityUserId})


        // PRocesar array de identificadores
        let followingClean = [];

        following.forEach((follow) => {
            followingClean.push(follow.followed);
        });

        let followersClean = [];
        followers.forEach((follow) => {
            followersClean.push(follow.user);
        });

        return {
            following: followingClean,
            followers: followersClean
        };
    } catch (error) {
        console.error("Error al obtener datos de seguimiento:", error);
        throw error; // Puedes decidir cómo manejar el error aquí
    }
};


const followThisUser = async (identityUserId, profileUserId) => {
    const following = await Follow.findOne({ user: identityUserId, followed: profileUserId }) || {};
    const follower = await Follow.findOne({ user: profileUserId, followed: identityUserId }) || {};

    return {
        following,
        follower
    };
};


module.exports = {
    followUserIds,
    followThisUser
}