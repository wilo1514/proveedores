import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { validacion } from "../../../utils/apiUtils";
import fetchApi from "../../../utils/fechtData";

import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Container from "../../../components/Container";

import "../../../css/DepartamentoCompras/Dashboard.css";
import "../../../css/ComponentesAdicionales/Tabla.css";


/**
 * Componente para la mesa de trabajo de la sección de compras de los pedidos
 * sugueridos.
 * 
 * Este componente muestra un panel con los filtros para buscar los pedidos
 * sugueridos, entre los que se encuentran: proveedor, sucursal, estado, código
 * de pedido, fecha de inicio y fin del rango de fechas.
 * 
 * También muestra una tabla con los pedidos sugueridos encontrados con los
 * filtros aplicados.
 * 
 * Por último, muestra un botón para filtrar los pedidos y otro para reiniciar
 * los filtros.
*/
export default function Employer() {
  const navigate = useNavigate();
  const SlpCode = useSelector((state) => state.auth.datos_Usuario?.SLPCODE ?? "");
  const Swal = require("sweetalert2");
  const [data, setData] = useState([]);
  const [codigoo, setCodigoo] = useState(0);
  const [datosSucursal, setDatosSucursal] = useState([]);
  const [sucursal, setSucursal] = useState("");
  const [datosProveedores, setDatosProveedores] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [cantItems, setCantItems] = useState(0);
  
  /**
   * Formatea una fecha en formato 'yyyy-mm-dd'.
   * 
   * @param {Date} date - La fecha a formatear.
   * @returns {string} La fecha en formato 'yyyy-mm-dd'.
   */
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = new Date();
  const [inicio, setInicio] = useState(formatDate(today));
  const [fin, setFin] = useState(formatDate(today));
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [searchParams] = useSearchParams();
  const urlProveedor = searchParams.get("proveedor");
  const estadoSearchParams = searchParams.get("estado");
  const [estado, setEstado] = useState(estadoSearchParams || "PRE");


  /**
 * Muestra una alerta en caso de error en la solicitud.
 * Muestra un icono de warning y un mensaje indicando que el sistema
 * está intentando resolver el problema. Proporciona un enlace a soporte.
 * @param {string} error - El mensaje de error a mostrar en la alerta.
 */
  const handleErrorSis = (error) => {
    console.error("Error al realizar la solicitud:", error);
    Swal.fire({
      position: "center",
      icon: "warning",
      title: "Cargando",
      text: "Espera unos segundos mientras arreglamos este problema.",
      footer: '<a href="/sistemas">Comunicarse con Soporte</a>',
      showConfirmButton: false,
      timer: 2200,
    });
  };


  /**
   * Asigna un color a cada estado de una solicitud.
   * @param {string} idEstado - El identificador del estado.
   * @returns {string} Un string con el color asignado.
   * @example
   * claseEstado("APROBADO") // "verde"
   */
  const claseEstado = (idEstado) => {
    let sColor = "blanco";
    switch (idEstado) {
      case "PARA REVISION":
        sColor = "azul";
        break;
        case "REVISADO":
          sColor = "azul";
          break;
      case "APROBADO":
        sColor = "verde";
        break;
      case "CANCELADO":
        sColor = "rojo";
        break;
      default:
        break;
    }
    return sColor;
  };

/**
 * Muestra una alerta de error en caso de fallo de autenticación.
 * La alerta no tiene botón de confirmar y se cierra automáticamente después de 2200 milisegundos.
 * Luego, se redirige al usuario a la ruta "/" y se eliminan los items "token" y "expiracion" del localStorage.
 */

  const handleError = () => {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "TIEMPO EXCEDIDO",
      text: "Vuelve a ingresar a la APP",
      showConfirmButton: false,
      timer: 2200,
    });
    navigate("/");
    localStorage.removeItem("token");
    localStorage.removeItem("expiracion");
  };

/**
 * Muestra una alerta de ordenes inexistentes.
 * La alerta no tiene botón de confirmar y se cierra automáticamente después de 2000 milisegundos.
 * Se muestra en caso de no encontrar ordenes con los parámetros de búsqueda proporcionados.
 */
  const handleOrdenes = () => {
    Swal.fire({
      position: "center",
      icon: "warning",
      title: "ORDENES INEXISTENTES",
      text: "No se encontro ordenes con esos parámetro",
      showConfirmButton: false,
      timer: 2000,
    });
  };

/**
 * Redirige a la ruta "/mesatrabajo/autorizacion" y asigna
 * el id de la orden de compra a la variable de sesión "datosOrden".
 * @param {{id: number}} datos_notificaciones - Datos de la orden de compra.
 */
  const autorizar = (datos_notificaciones) => {
    sessionStorage.setItem(
      "datosOrden",
      JSON.stringify(datos_notificaciones.id)
    );
    setTimeout(function () {
      navigate("/mesatrabajo/autorizacion");
    }, 500);
  };

  /**
   * Visualiza la orden de compra asociada a una notificación.
   * La función recibe un objeto con la estructura de una notificación (id, proveedor, fecha, total, etc.)
   * y lo guarda en el sessionStorage con el key "datosOrden". Luego, se redirige al usuario a la ruta
   * "/mesatrabajo/autorizacion" después de 500 milisegundos.
   * @param {object} datos_notificaciones - Objeto con la estructura de una notificación.
   */
  const visualizar = (datos_notificaciones) => {
    sessionStorage.setItem(
      "datosOrden",
      JSON.stringify(datos_notificaciones.id)
    );
    setTimeout(function () {
      navigate("/mesatrabajo/autorizacion");
    }, 500);
  };

/**
 * Maneja el cambio de valor en el input de inicio de fecha.
 * Recibe el evento de cambio y obtiene la fecha seleccionada.
 * Luego, llama a la función formatDate para darle formato a la fecha
 * y la almacena en el estado inicio.
 * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio en el input de inicio de fecha.
 */
  const handleInicio = (e) => {
    const selectedDate = new Date(e.target.value + "T00:00:00");
    setInicio(formatDate(selectedDate));
  };

  /**
   * Maneja el cambio de valor en el input de fin de fecha.
   * Recibe el evento de cambio y obtiene la fecha seleccionada.
   * Luego, llama a la función formatDate para darle formato a la fecha
   * y la almacena en el estado fin.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio en el input de fin de fecha.
   */
  const handleFin = (e) => {
    const selectedDate = new Date(e.target.value + "T00:00:00");
    setFin(formatDate(selectedDate));
  };

  /**
   * Maneja el cambio de código ingresado en el input.
   * Si el código ingresado es un número, se actualiza el estado de código con el valor ingresado.
   * De lo contrario, se establece el estado de código en 1.
   * @param {Object} e - Evento que contiene el valor ingresado.
   */
  const handleCodigo = (e) => {
    const docNum = e.target.value;
    if (!isNaN(docNum)) {
      setCodigoo(docNum);
    } else {
      setCodigoo(1);
    }
  };

  /**
   * Obtiene la lista de sucursales disponibles desde la API.
   * Llama a la función fetchApi con el endpoint "/warehouse/ObtenerSucursales",
   * método "GET" y headers con el token de autenticación.
   * Si la respuesta es exitosa, se actualiza el estado de datosSucursal con la
   * lista de sucursales.
   * @returns {Promise<void>}
   */
  const getSucursales = async () => {
    try {
      const tokenId = localStorage.getItem("token");

      const datos = await fetchApi({
        endPoint: "/warehouse/ObtenerSucursales",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenId}`,
        },
        paginacion: false,
      });

      if (datos.error) {
        console.error(datos.error);
        return;
      }

      if (datos.datos && Array.isArray(datos.datos)) {
        const sucursales = datos.datos.map((sucursal) => ({
          whsCode: sucursal.whsCode,
          whsName: sucursal.whsName || "",
        }));
        setDatosSucursal(sucursales);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

/**
 * Obtiene la lista de proveedores disponibles desde la API.
 * Llama a la función fetchApi con el endpoint "/supplier/:SlpCode",
 * método "GET" y headers con el token de autenticación.
 * Si la respuesta es exitosa, se actualiza el estado de datosProveedores con la
 * lista de proveedores.
 * @returns {Promise<void>}
 */
  const getProveedores = async () => {
    const validado = await validacion();
    if (validado === 1) {
      try {
        const tokenId = localStorage.getItem("token");

        const datos = await fetchApi({
          endPoint: `/supplier/${SlpCode}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenId}`,
          },
          paginacion: false,
        });

        if (datos.error) {
          console.error(datos.error);
          return;
        }

        if (datos.datos && Array.isArray(datos.datos)) {
          const proveedores = datos.datos.map((proveedor) => ({
            supCode: proveedor.cardCode,
            supName: proveedor.cardName || "",
          }));
          setDatosProveedores(proveedores);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    } else {
      handleError();
    }
  };

/**
 * Maneja el cambio de proveedor en el select.
 * @param {React.ChangeEvent<HTMLSelectElement>} event - Evento de cambio del select.
 * @param {Object} newValue - Valor seleccionado en el select.
 */
  const handleProveedorChange = (event, newValue) => {
    setProveedor(newValue ? newValue.supCode : "");
  };

/**
 * Maneja la selecci n de una sucursal del dropdown.
 * @param {Event} event - Evento de selecci n.
 */
  const handleSucursal = (event) => {
    const nombreSucursal = event.target.value;
    const sucursalSeleccionada = datosSucursal.find(
      (suc) => suc.whsName === nombreSucursal
    );
    setSucursal(sucursalSeleccionada ? sucursalSeleccionada.whsCode : "");
  };

/**
 * Maneja el cambio de p gina en la tabla paginada.
 * 
 * Verifica si el usuario est  logueado y si es as , actualiza el estado `page` con la nueva p gina.
 * De lo contrario, muestra un mensaje de error.
 * @param {Event} event - Evento del paginador.
 * @param {number} newPage - Nueva p gina seleccionada.
 */
  const handleChangePage = async (event, newPage) => {
    const validado = await validacion();
    if (validado === 1) {
      setPage(newPage);
    } else {
      handleError();
    }
  };

/**
 * Obtiene los datos de las órdenes de compra desde el API.
 * Verifica la autenticación del usuario.
 * Si hay parámetros de búsqueda en la URL, los utiliza para filtrar los datos.
 * Si no hay parámetros de búsqueda, utiliza los valores actuales de los estados.
 * Realiza la solicitud GET al API y maneja los errores.
 * Carga los datos en la tabla y actualiza el paginador.
 * @returns {Promise<void>}
 */
  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");

      let fechInicio = inicio;
      let fechFin = fin;

      const proveedorActual = proveedor;
      const sucursalActual = sucursal;
      const estadoEnviar = estadoSearchParams || estado || "PRE";
      const codigooActual = codigoo;

      const proveedorSearchParams = searchParams.get("proveedor");
      const sucursalSearchParams = searchParams.get("sucursal");
      const codigooSearchParams = searchParams.get("codigoo");

      const proveedorEnviar = proveedorSearchParams || proveedorActual;
      const sucursalEnviar = sucursalSearchParams || sucursalActual;
      const codigooEnviar = codigooSearchParams || codigooActual || 0;
      const urlInicio = searchParams.get("fechaDesde");
      const urlFin = searchParams.get("fechaHasta");

      if (urlInicio && urlInicio !== formatDate(today)) {
        setInicio(urlInicio);
        fechInicio = urlInicio;
      } else {
        setInicio(formatDate(today));
      }

      if (urlFin && urlFin !== formatDate(today)) {
        setFin(urlFin);
        fechFin = urlFin;
      } else {
        setFin(formatDate(today));
      }

      const datos = await fetchApi({
        endPoint: `/purchaseorder/ordersqlserver?pagina=${page + 1}&recordsPorPagina=50&fechaDesde=${fechInicio}&fechaHasta=${fechFin}&codigoProveedor=${proveedorEnviar}&codigoAlmacen=${sucursalEnviar}&codigoOrden=${codigooEnviar}&codigoAsesor=${SlpCode}&estado=${estadoEnviar}`,
        method: "GET",
        paginacion: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenId,
        },
      });
      if (datos.error) {
        handleErrorSis(datos.error);
        return;
      }
      const cantidadItems = parseInt(datos.totalRegistros)
      setCantItems(cantidadItems);
      pasoSiguiente(datos.datos);
    } else {
      handleError();
    }
  };

/**
 * Asigna los datos de la API a la variable de estado 'data' y
 * llama a la función 'handleOrdenes' si no hay datos.
 * @param {Array} info - Arreglo de datos de la API.
 */
  const pasoSiguiente = (info) => {
    setData(info);
    if (info.length !== 0) {
      return setData(info);
    } else {
      handleOrdenes();
    }
  };

/**
 * Filtra los reportes según los parámetros seleccionados.
 * @param {string} [proveedor] - Código del proveedor.
 * @param {string} [sucursal] - Código de la sucursal.
 * @param {string} [estado] - Estado de la orden de compra.
 * @param {number} [codigoo] - Código de la orden de compra.
 * @param {string} [inicio] - Fecha de inicio del rango de fechas.
 * @param {string} [fin] - Fecha de fin del rango de fechas.
 */
  const filtrarReportes = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const newSearchParams = new URLSearchParams();

      if (proveedor) {
        newSearchParams.append("proveedor", proveedor);
      }
      if (sucursal) {
        newSearchParams.append("sucursal", sucursal);
      }
      if (estado) {
        newSearchParams.append("estado", estado);
      }
      if (codigoo) {
        newSearchParams.append("codigoo", codigoo);
      }
      if (inicio) {
        newSearchParams.append("fechaDesde", inicio);
      }
      if (fin) {
        newSearchParams.append("fechaHasta", fin);
      }
      setPage(0);
      navigate({
        pathname: "/mesatrabajo",
        search: newSearchParams.toString(),
      });
    } else {
      handleError();
    }
  };

/**
 * Reinicia los datos de la mesa de trabajo:
 * - Navega a la ruta de la mesa de trabajo.
 * - Limpia los campos de texto de los filtros.
 * - Reestablece la página actual a 0.
 * - Vuelve a cargar los datos de la API.
 * - Si la validación falla, maneja el error correspondiente.
 */
  const reiniciarDatos = async () => {
    const validado = await validacion();
/**
 * Formatea una fecha en formato 'YYYY-MM-DD'
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const today = new Date();
    if (validado === 1) {
      navigate("/mesatrabajo");
      getData();
      setCodigoo("");
      setSucursal("");
      setProveedor("");
      setEstado("PRE");
      setInicio(formatDate(today));
      setFin(formatDate(today));
      setPage(0);
    } else {
      handleError();
    }
  };

  const estados = [
    { label: "Todas", value: "TODAS" },
    { label: "Aprobado", value: "AUT" },
    { label: "No Aprobada", value: "NAP" },
    { label: "Revisado", value: "REV" },
  ];

/**
 * Maneja el cambio de estado de la orden de compra.
 * @param {React.ChangeEvent<HTMLSelectElement>} event - Evento de cambio
 */
  const handleStatus = (event) => {
    setEstado(event.target.value);
  };

/**
 * Desplaza el scroll de la secci n con la clase "inicio_pedido"
 * hasta el principio, de manera suave.
 * @function
 */
  const scrollToTop = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: 0, behavior: "smooth" });
  };

/**
 * Desplaza el scroll de la secci n con la clase "inicio_pedido"
 * hasta el final, de manera suave.
 * @function
 */
  const scrollToBottom = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    getSucursales();
    getProveedores();
  }, []);

  useEffect(() => {
    getData();
  }, [page, searchParams]);

  return (
    <>
      <Container className="inicio_pedido" fluid>
        <div className="panel">
          <p className="panel-title">MESA TRABAJO - ORDENES SUGERIDAS</p>
          <div className="panel-grid">
            <div className="panel-item">
              <label className="input-label">Proveedor:</label>
              <Autocomplete
                options={datosProveedores}
                getOptionLabel={(option) => option.supName}
                value={
                  datosProveedores.find(
                    (prov) =>
                      prov.supCode === proveedor ||
                      prov.supCode === urlProveedor
                  ) || null
                }
                onChange={handleProveedorChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      classes: {
                        root: "autocomplete-filtros",
                      },
                    }}
                    InputLabelProps={{
                      classes: {
                        root: "autocomplete-label",
                      },
                    }}
                  />
                )}
                disableClearable
              />
            </div>
            <div className="panel-item">
              <label className="input-label">Almacen:</label>
              <select
                id="combo-box-demo"
                className="select-empleados"
                value={
                  sucursal === ""
                    ? ""
                    : datosSucursal.find((suc) => suc.whsCode === sucursal)
                        ?.whsName || ""
                }
                onChange={handleSucursal}
              >
                <option value="" className="default-option">
                  Todos
                </option>
                {datosSucursal.map((suc) => (
                  <option key={suc.whsCode} value={suc.whsName}>
                    {suc.whsName}
                  </option>
                ))}
              </select>
            </div>
            <div className="panel-item">
              <label className="input-label">Estado:</label>
              <select
                id="combo-box"
                className="select-empleados"
                value={estado}
                onChange={handleStatus}
              >
                <option value="PRE" className="default-option">
                  Para Revisión
                </option>
                {estados.map((estado) => (
                  <option key={estado.label} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="panel-item">
              <label className="input-label">N° Orden:</label>
              <input
                className="input-filtros"
                id="combo-box-demo"
                name="proveIdentificadoredor"
                type="text"
                placeholder="Código del Pedido"
                onChange={handleCodigo}
                maxLength={10}
              />
            </div>
            <div className="panel-item">
              <label className="input-label">Desde:</label>
              <input
                type="date"
                value={inicio}
                name="Desde"
                onChange={handleInicio}
                className="input-filtros"
              />
            </div>
            <div className="panel-item">
              <label className="input-label">Hasta:</label>
              <input
                type="date"
                value={fin}
                name="Hasta"
                onChange={handleFin}
                className="input-filtros"
              />
            </div>
            <div className="panel-item">
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent={"space-between"}
                spacing={2}
              >
                <button
                  className="boton-ordenes"
                  style={{ background: "#06ac2e" }}
                  onClick={filtrarReportes}
                >
                  <span style={{ marginLeft: "5px" }}>Filtrar</span>
                </button>
                <button
                  className="boton-ordenes"
                  style={{ background: "#128496" }}
                  onClick={reiniciarDatos}
                >
                  <span style={{ marginLeft: "5px" }}>Reiniciar</span>
                </button>
              </Stack>
            </div>
          </div>
        </div>
        <div className="panel">
          <table className="table table-ligh table-hover">
            <thead>
              <tr>
                <th style={{ textAlign: "start" }}>#</th>
                <th style={{ textAlign: "start" }}>PROVEEDOR</th>
                <th style={{ textAlign: "start" }}>SUCURSAL</th>
                <th style={{ textAlign: "center" }}>TIPO</th>
                <th style={{ textAlign: "center" }}>CÓDIGO PEDIDO</th>
                <th style={{ textAlign: "center" }}>ESTADO</th>
                <th style={{ textAlign: "center" }}>FECHA PEDIDO</th>
                <th style={{ textAlign: "center" }}>FECHA ENTREGA</th>
                <th style={{ textAlign: "center" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => {
                const currentIndex = i + 1 + page * rowsPerPage;
                const isDisabledVis = item.estado === "PARA REVISION" || item.estado === "REVISADO";
                const isDisabledEdit =
                  item.estado === "APROBADO" || item.estado === "NO APROBADA";
                const tipoOrden = item.ordenEspecial ? "ESPECIAL" : "NORMAL";
                return (
                  <tr key={currentIndex}>
                    <td style={{ textAlign: "start" }}>{currentIndex}</td>
                    <td style={{ textAlign: "start" }}>
                      {item.nombreProveedor}
                    </td>
                    <td style={{ textAlign: "start" }}>
                      {item.nombreAlmacen}
                    </td>
                    <td style={{ textAlign: "center" }}>{tipoOrden}</td>
                    <td style={{ textAlign: "center" }}>{item.id}</td>
                    <td className={`center ${claseEstado(item.estado)}`}>
                      {item.estado}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {new Date(item.fechaDocumento).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {new Date(item.fechaEntrega).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Stack
                        spacing={2}
                        direction={"row"}
                        justifyContent={"center"}
                      >
                        <Tooltip title="Editar">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#151635"
                            height="1.5rem"
                            onClick={() => {
                              if (!isDisabledEdit) autorizar(item);
                            }}
                            style={{
                              cursor: isDisabledEdit
                                ? "not-allowed"
                                : "pointer",
                              opacity: isDisabledEdit ? 0.3 : 1,
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Tooltip>
                        <Tooltip title="Visualizar">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={() => {
                              if (!isDisabledVis) visualizar(item);
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#1dbb3a"
                            height="1.5rem"
                            style={{
                              cursor: isDisabledVis ? "not-allowed" : "pointer",
                              opacity: isDisabledVis ? 0.3 : 1,
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        </Tooltip>
                      </Stack>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TablePagination
            component="div"
            count={cantItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[]}
          />
        </div>

        <div className="scroll-buttons">
          <button className="scroll-button" onClick={scrollToTop}>
            ↑
          </button>
          <button className="scroll-button" onClick={scrollToBottom}>
            ↓
          </button>
        </div>
      </Container>
    </>
  );
}