const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/user");
const check = require("../middlewares/auth");

// Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./uploads/avatars");
    },
    filename:(req, file, cb) =>{
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({storage});

// definir rutas
router.get("/prueba-usuario", check.auth, userController.pruebaUser);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", check.auth, userController.profile);
router.get("/list/:page?", check.auth, userController.list);
router.put("/update", check.auth, userController.update);
router.post("/upload", [check.auth, uploads.single("file0")], userController.upload);
router.get("/avatar/:file", check.auth, userController.avatar);

// Exportar Router
module.exports = router;