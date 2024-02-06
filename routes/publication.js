const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publication");
const check = require("../middlewares/auth");

// definir rutas
router.get("/prueba-publication", publicationController.pruebaPublication);
router.post("/save", check.auth, publicationController.save);

// Exportar Router

module.exports = router;