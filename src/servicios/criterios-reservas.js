const criteriosPermitidos = ["q", "sala", "orden", "pagina", "limite"];

const ordenesPermitidos = ["estudiante", "personas-asc", "personas-desc"];

function errorCriterio(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  throw error;
}

function leerEntero(valor, nombre, predeterminado, minimo, maximo) {
  if (valor === undefined) {
    return predeterminado;
  }

  if (!/^\d+$/.test(valor)) {
    errorCriterio(`El criterio ${nombre} debe ser un número entero.`);
  }

  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
    errorCriterio(
      `El criterio ${nombre} debe estar entre ${minimo} y ${maximo}.`
    );
  }

  return numero;
}

function leerCriterios(parametros = {}) {
  if (
    parametros === null ||
    typeof parametros !== "object" ||
    Array.isArray(parametros)
  ) {
    errorCriterio("Los criterios de búsqueda no son válidos.");
  }

  for (const [clave, valor] of Object.entries(parametros)) {
    if (!criteriosPermitidos.includes(clave)) {
      errorCriterio(`El criterio ${clave} no está permitido.`);
    }

    if (typeof valor !== "string") {
      errorCriterio(
        `El criterio ${clave} debe ser textual y no estar repetido.`
      );
    }
  }

  const q = (parametros.q ?? "").trim();
  const sala = (parametros.sala ?? "").trim();
  const orden = parametros.orden ?? "estudiante";

  if (q.length > 60) {
    errorCriterio("La búsqueda no puede superar los 60 caracteres.");
  }

  if (sala.length > 80) {
    errorCriterio("La sala no puede superar los 80 caracteres.");
  }

  if (!ordenesPermitidos.includes(orden)) {
    errorCriterio("El criterio de ordenamiento no es válido.");
  }

  const pagina = leerEntero(parametros.pagina, "pagina", 1, 1, 1000);
  const limite = leerEntero(parametros.limite, "limite", 2, 1, 20);

  return {
    q,
    sala,
    orden,
    pagina,
    limite,
  };
}

module.exports = {
  leerCriterios,
};
