const { URLSearchParams } = require("node:url");
const { estadosPermitidos } = require("../middleware/reservas");
const { leerCriterios } = require("../servicios/criterios-reservas");

function crearControladorReservas(servicio) {
  function inicio(req, res) {
    res.render("inicio", {
      titulo: "Reservas de salas de estudio",
    });
  }

  async function estado(req, res) {
    const cantidad = await servicio.contar();

    return res.json({
      servicio: "activo",
      reservas: cantidad,
      solicitudId: res.locals.solicitudId,
    });
  }

  async function listar(req, res) {
    const criterios = leerCriterios(req.query);
    const resultado = await servicio.buscar(criterios);

    function crearEnlace(pagina) {
      const parametros = new URLSearchParams({
        q: criterios.q,
        sala: criterios.sala,
        orden: criterios.orden,
        pagina: String(pagina),
        limite: String(criterios.limite),
      });

      return `/reservas?${parametros.toString()}`;
    }

    const fueraDeRango =
      resultado.total > 0 && resultado.pagina > resultado.paginas;

    const enlaces = {
      anterior:
        !fueraDeRango && resultado.total > 0 && resultado.pagina > 1
          ? crearEnlace(resultado.pagina - 1)
          : null,
      siguiente:
        resultado.pagina < resultado.paginas
          ? crearEnlace(resultado.pagina + 1)
          : null,
      primera: crearEnlace(1),
    };

    return res.render("reservas/lista", {
      titulo: "Reservas registradas",
      reservas: resultado.datos,
      criterios,
      pagina: resultado.pagina,
      limite: resultado.limite,
      total: resultado.total,
      paginas: resultado.paginas,
      fueraDeRango,
      enlaces,
      salasPermitidas: servicio.obtenerSalasPermitidas(),
    });
  }

  function nueva(req, res) {
    return res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores: [],
      valores: {},
      salasPermitidas: servicio.obtenerSalasPermitidas(),
      turnosPermitidos: servicio.obtenerTurnosPermitidos(),
    });
  }

  function identificadorInvalido(res) {
    return res.status(400).render("no-encontrado", {
      titulo: "Identificador inválido",
      mensaje: "El identificador de la reserva no es válido.",
      codigo: 400,
    });
  }

  function reservaNoEncontrada(res) {
    return res.status(404).render("no-encontrado", {
      titulo: "Reserva no encontrada",
      mensaje: "La reserva solicitada no existe.",
      codigo: 404,
    });
  }

  async function detalle(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return identificadorInvalido(res);
    }

    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return reservaNoEncontrada(res);
    }

    return res.render("reservas/detalle", {
      titulo: "Detalle de la reserva",
      reserva,
    });
  }

  async function crear(req, res) {
    await servicio.crear(req.reservaValidada);

    return res.redirect(302, "/reservas");
  }

  async function editar(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return identificadorInvalido(res);
    }

    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return reservaNoEncontrada(res);
    }

    const valores = {
      estudiante: String(reserva.estudiante ?? ""),
      email: String(reserva.email ?? ""),
      sala: String(reserva.sala ?? ""),
      fecha: String(reserva.fecha ?? ""),
      turno: String(reserva.turno ?? ""),
      personas: String(reserva.personas ?? ""),
      estado: String(reserva.estado ?? ""),
    };

    return res.render("reservas/editar", {
      titulo: "Editar reserva",
      id,
      errores: [],
      valores,
      salasPermitidas: servicio.obtenerSalasPermitidas(),
      turnosPermitidos: servicio.obtenerTurnosPermitidos(),
      estadosPermitidos,
    });
  }

  async function guardarEdicion(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return identificadorInvalido(res);
    }

    const reserva = await servicio.reemplazar(id, req.reservaValidada);

    if (!reserva) {
      return reservaNoEncontrada(res);
    }

    return res.redirect(303, `/reservas/${id}`);
  }

  async function cambiarEstado(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return identificadorInvalido(res);
    }

    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return reservaNoEncontrada(res);
    }

    return res.render("reservas/estado", {
      titulo: "Cambiar estado de la reserva",
      id,
      errores: [],
      valores: {
        estado: String(reserva.estado ?? ""),
      },
      estadosPermitidos,
    });
  }

  async function guardarEstado(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return identificadorInvalido(res);
    }

    const cambios = {
      estado: req.reservaValidada.estado,
    };

    const reserva = await servicio.modificarParcialmente(id, cambios);

    if (!reserva) {
      return reservaNoEncontrada(res);
    }

    return res.redirect(303, `/reservas/${id}`);
  }

  async function confirmarEliminacion(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return identificadorInvalido(res);
    }

    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return reservaNoEncontrada(res);
    }

    return res.render("reservas/eliminar", {
      titulo: "Eliminar reserva",
      id,
      reserva,
      errores: [],
    });
  }

  async function eliminar(req, res) {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return identificadorInvalido(res);
    }

    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return reservaNoEncontrada(res);
    }

    const datos = req.body;

    const confirmacionValida =
      datos !== null &&
      typeof datos === "object" &&
      !Array.isArray(datos) &&
      Object.keys(datos).length === 1 &&
      Object.prototype.hasOwnProperty.call(datos, "confirmar") &&
      datos.confirmar === "si";

    if (!confirmacionValida) {
      return res.status(400).render("reservas/eliminar", {
        titulo: "Eliminar reserva",
        id,
        reserva,
        errores: [
          "Debe confirmar la eliminación enviando únicamente confirmar=si.",
        ],
      });
    }

    const eliminada = await servicio.eliminar(id);

    if (!eliminada) {
      return reservaNoEncontrada(res);
    }

    return res.redirect(303, "/reservas");
  }

  return {
    inicio,
    estado,
    listar,
    nueva,
    detalle,
    crear,
    editar,
    guardarEdicion,
    cambiarEstado,
    guardarEstado,
    confirmarEliminacion,
    eliminar,
  };
}

module.exports = crearControladorReservas;
