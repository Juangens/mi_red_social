const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publication");
const check = require("../middlewares/auth");

// definir rutas
router.get("/prueba-publication", publicationController.pruebaPublication);
router.post("/save", check.auth, publicationController.save);
router.get("/detail/:id", check.auth, publicationController.detail);
router.delete("/remove/:id", check.auth, publicationController.remove);



// Exportar Router

module.exports = router;