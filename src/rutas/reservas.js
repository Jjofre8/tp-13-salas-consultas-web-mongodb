const express = require("express");

const {
  prepararAreaReservas,
  validarReserva,
  validarEdicionWeb,
  validarEstadoWeb,
} = require("../middleware/reservas");

function crearRouterReservas(controlador) {
  const router = express.Router();

  router.use(prepararAreaReservas);

  router.get("/", controlador.listar);

  router.get("/nueva", controlador.nueva);

  router.get("/:id/editar", controlador.editar);

  router.get("/:id/estado", controlador.cambiarEstado);

  router.get("/:id/eliminar", controlador.confirmarEliminacion);

  router.get("/:id", controlador.detalle);

  router.post("/", validarReserva, controlador.crear);

  router.post("/:id/editar", validarEdicionWeb, controlador.guardarEdicion);

  router.post("/:id/estado", validarEstadoWeb, controlador.guardarEstado);

  router.post("/:id/eliminar", controlador.eliminar);

  return router;
}

module.exports = crearRouterReservas;
