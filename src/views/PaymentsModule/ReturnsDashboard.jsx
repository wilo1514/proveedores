import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { validacion } from "../../utils/apiUtils";
import fetchApi from "../../utils/fechtData";
import Swal from 'sweetalert2';


import { Grid } from "@mui/material";
import Stack from "@mui/material/Stack";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Container from "../../components/Container";
import Modal from "../../components/Modal";
import Icon  from "../../assets/iconos/eye.svg";
import LogoFinal from "../../assets/images/conorque2.avif";

import "../../css/DepartamentoCompras/Dashboard.css";
import "../../css/ComponentesAdicionales/Tabla.css";
import DotSpinner from "../../components/DotSpinner";


export default function Employer() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [codigoo, setCodigoo] = useState(0);
  const [datosSucursal, setDatosSucursal] = useState([]);
  const [sucursal, setSucursal] = useState("");
  const [datosProveedores, setDatosProveedores] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [cantItems, setCantItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [searchParams] = useSearchParams();
  const urlProveedor = searchParams.get("proveedor");
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosf, setProductosf] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 

/**
 * Componente de botón para descargar un PDF.
 * 
 * Este componente muestra un botón en forma de ícono SVG que, al ser clicado,
 * inicia la descarga de un PDF asociado al elemento proporcionado. Mientras
 * se realiza la descarga, se muestra un indicador de carga.
 * 
 * Props:
 * - item: objeto que contiene la información necesaria para descargar el PDF.
 * 
 * Comportamiento:
 * - Si la descarga está en progreso, se muestra un componente de carga (DotSpinner).
 * - Si no está en progreso, se muestra un ícono SVG que, al clicarlo, ejecuta
 *   la función `descargarPdf` para iniciar la descarga.
 */

  const PdfDownloadButton = ({ item }) => {
    const [loading, setLoading] = useState(false);

    return (
      <>
        {loading ? (
          <DotSpinner />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#283756"
            height="1.3rem"
            onClick={() => {descargarPdf(item, setLoading);}}
          >
            <path
              fillRule="evenodd"
              d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 0 0 3 3h.27l-.155 1.705A1.875 1.875 0 0 0 7.232 22.5h9.536a1.875 1.875 0 0 0 1.867-2.045l-.155-1.705h.27a3 3 0 0 0 3-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0 0 18 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM16.5 6.205v-2.83A.375.375 0 0 0 16.125 3h-8.25a.375.375 0 0 0-.375.375v2.83a49.353 49.353 0 0 1 9 0Zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 0 1-.374.409H7.232a.375.375 0 0 1-.374-.409l.526-5.784a.373.373 0 0 1 .333-.337 41.741 41.741 0 0 1 8.566 0Zm.967-3.97a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H18a.75.75 0 0 1-.75-.75V10.5ZM15 9.75a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75H15Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </>
    );
  };

/**
 * Descarga el PDF de una orden de devolución.
 * 
 * La función recibe dos parámetros:
 * - `datos_orden`: objeto que contiene la información necesaria para descargar
 *   el PDF de la orden de devolución.
 * - `setLoading`: función que se utiliza para mostrar un indicador de carga
 *   mientras se realiza la descarga.
 * 
 * La función utiliza la función `validacion` para verificar si el usuario
 * tiene permisos para realizar la descarga.
 * 
 * Si la verificación es exitosa, se utiliza la función `fetchApi` para realizar
 * la petición GET a la API para descargar el PDF. Si la petición es exitosa,
 * se utiliza la función `descargarBlobComoPdf` para descargar el PDF.
 * 
 * Si ocurre un error durante la descarga, se muestra un mensaje de error
 * utilizando la función `handleErrorSis`.
 * 
 * La función devuelve una promesa que se resuelve cuando la descarga termina.
 */
  const descargarPdf = async (datos_orden, setLoading) => {
    console.log(datos_orden)
    setLoading(true);
    try {
      const validado = await validacion();
      if (validado === 1) {
        const tokenId = localStorage.getItem("token");
        const datos = await fetchApi({
          endPoint: `/goodsreturn/printpdfdevolucion/${datos_orden.docNum}`,
          method: "GET",
          paginacion: false,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenId}`,
          },
        });

        if (datos.error) {
          handleErrorSis(datos.error);
          setLoading(false);
          return;
        }

        const base64Pdf = datos.datos;
        descargarBlobComoPdf(base64Pdf);
      } else {
        handleError();
      }
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      handleErrorSis("Error al descargar el PDF");
    } finally {
      setLoading(false);
    }
  };

/**
 * Descarga un archivo PDF desde un string base64.
 * 
 * La función toma un string base64 que representa un archivo PDF y lo descarga
 * en el navegador. La función utiliza el objeto `Blob` para crear el archivo
 * PDF y el objeto `URL` para crear una URL temporal que se puede utilizar para
 * descargar el archivo.
 * 
 * La función devuelve nada.
 */
  const descargarBlobComoPdf = (base64Pdf) => {
    try {
      const binStr = window.atob(base64Pdf);
      const len = binStr.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      const blob = new Blob([arr], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Devolucion.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

/**
 * Muestra una alerta de advertencia en caso de error en la solicitud.
 * 
 * La alerta presenta un icono de advertencia y un mensaje indicando
 * que el sistema está intentando resolver el problema. También proporciona
 * un enlace para contactar al soporte técnico.
 * 
 * @param {string} error - El mensaje de error que se registrará en la consola.
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
 * Muestra una alerta de error en caso de fallo de autenticación.
 * 
 * La función muestra una alerta de error con el título "TIEMPO EXCEDIDO" y el texto "Vuelve a ingresar a la APP".
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
 * Muestra una alerta de advertencia en caso de no existir órdenes.
 * 
 * La alerta presenta un icono de advertencia y un mensaje indicando
 * que no se encontraron órdenes con los parámetros seleccionados.
 * La alerta no tiene botón de confirmar y se cierra automáticamente después
 * de 2000 milisegundos.
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
   * Función para manejar el cambio en el input de código de órden.
   * 
   * Verifica si el valor ingresado es numérico, en cuyo caso lo asigna
   * a la variable de estado "codigoo". De lo contrario, se asigna el
   * valor 1 a la variable de estado.
   * @param {React.ChangeEvent<HTMLInputElement>} e - El evento de cambio
   * del input de código de órden.
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
   * Obtiene la lista de sucursales desde la API.
   * 
   * Hace una solicitud GET a la API para obtener la lista de sucursales.
   * Si la respuesta es exitosa, se actualiza el estado de sucursales con la
   * lista de sucursales.
   * 
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
 * Obtiene la lista de proveedores desde la API.
 * 
 * Realiza una solicitud GET a la API para obtener una lista de proveedores.
 * Si la validación es exitosa, se procede con la solicitud. Si la respuesta
 * es exitosa, se mapea la lista de proveedores para extraer el código y
 * nombre del proveedor, actualizando el estado correspondiente.
 * 
 * Maneja errores de red y de respuesta de la API.
 * 
 * @returns {Promise<void>}
 */

  const getProveedores = async () => {
    const validado = await validacion();
    if (validado === 1) {
      try {
        const tokenId = localStorage.getItem("token");

        const datos = await fetchApi({
          endPoint: `/supplier?pagina=1&recordsPorPagina=1000`,
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
 * Maneja el cambio en el campo de proveedor.
 * 
 * @param {object} event - Evento de cambio en el campo de proveedor.
 * @param {object} newValue - Valor seleccionado en el campo de proveedor.
 */
  const handleProveedorChange = (event, newValue) => {
    setProveedor(newValue ? newValue.supCode : "");
  };

/**
 * Maneja el cambio en el campo de sucursal.
 * 
 * @param {object} event - Evento de cambio en el campo de sucursal.
 * 
 * Busca en la lista de sucursales (`datosSucursal`) la sucursal 
 * seleccionada por su nombre (`whsName`) y actualiza el estado `sucursal` 
 * con el c digo de la sucursal (`whsCode`) si existe, o vac o si no existe.
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
 * @param {Event} event - Evento del paginador.
 * @param {number} newPage - Nueva p gina seleccionada.
 * 
 * Verifica si el usuario est  logueado y si es as , actualiza el estado `page` con la nueva p gina.
 * De lo contrario, muestra un mensaje de error.
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
 * Obtiene los datos de la lista de devoluciones desde la API.
 * 
 * Verifica si el usuario est  logueado y si es as , 
 * env a una solicitud GET a la API con los par metros actuales 
 * de proveedor, sucursal y n mero de documento.
 * Si la respuesta es exitosa, actualiza el estado `cantItems` con el n mero de 
 * elementos de la lista y llama a la funci n `pasoSiguiente` con los datos 
 * de la lista.
 * Maneja errores de red y de respuesta de la API.
 * 
 * @returns {Promise<void>}
 */
  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");

      const proveedorActual = proveedor;
      const sucursalActual = sucursal;
      const codigooActual = codigoo;

      const proveedorSearchParams = searchParams.get("proveedor");
      const sucursalSearchParams = searchParams.get("sucursal");
      const codigooSearchParams = searchParams.get("codigoo");

      const proveedorEnviar = proveedorSearchParams || proveedorActual;
      const sucursalEnviar = sucursalSearchParams || sucursalActual;
      const codigooEnviar = codigooSearchParams || codigooActual || 0;

      const datos = await fetchApi({
        endPoint: `/goodsreturn?pagina=${page + 1}&recordsPorPagina=50&cardCode=${proveedorEnviar}&whsCode=${sucursalEnviar}&docNum=${codigooEnviar}`,
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
 * Filtra las devoluciones según los parámetros seleccionados: proveedor, sucursal y código de orden.
 * 
 * Verifica la validación del usuario antes de proceder. Si es válido, construye
 * un conjunto de parámetros de búsqueda basados en los filtros seleccionados y
 * navega a la ruta de la mesa de trabajo de devoluciones con los nuevos parámetros.
 * Si la validación falla, maneja el error correspondiente.
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
      if (codigoo) {
        newSearchParams.append("codigoo", codigoo);
      }
      setPage(0);
      navigate({
        pathname: "/mesatrabajodevoluciones",
        search: newSearchParams.toString(),
      });
    } else {
      handleError();
    }
  };

/**
 * Reinicia los datos de la mesa de trabajo de devoluciones:
 * - Reemplaza los parámetros de búsqueda actuales por defecto.
 * - Navega a la ruta de la mesa de trabajo de devoluciones.
 * - Limpia los campos de texto de los filtros.
 * - Reestablece la página actual a 0.
 * - Vuelve a cargar los datos de la API.
 * - Si la validación falla, maneja el error correspondiente.
 */
  const reiniciarDatos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      navigate("/mesatrabajodevoluciones");
      getData();
      setCodigoo("");
      setSucursal("");
      setProveedor("");
      setPage(0);
    } else {
      handleError();
    }
  };


/**
 * Abre la modal para visualizar los detalles de una devoluci n de mercader a.
 * Verifica la validaci n del usuario y si es v lida, hace una solicitud GET a la API
 * para obtener los detalles de la devoluci n. Luego, llama a la funci n
 * `listadoproductos` con los datos de la devoluci n y abre la modal.
 * Maneja errores de red y de respuesta de la API.
 * 
 * @param {Object} datos_orden - Objeto con los datos de la devoluci n.
 * @returns {Promise<void>}
 */
  const abrirModalVisualizar = async (datos_orden) => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint:`/goodsreturn/${datos_orden.docNum}`, 
        method:'GET', 
        paginacion:false, 
        headers:{
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenId,
    }})
    if (datos.error){
        handleErrorSis(datos.error)
        return
    } 
          listadoproductos(datos.datos);
          setModalVisualizar(!modalVisualizar); 
    } else {
      handleError();
    }
  };
  
/**
 * Asigna los productos obtenidos a los estados `productos` y `productosFiltrados` y
 * deshabilita el bot n de "Guardar".
 * @param {Object[]} products - Los productos obtenidos de la API.
 */
  const listadoproductos = (products) => {
    setProductos(products.details);
    setProductosf(products);
  };

/**
 * Cierra la modal de visualizar detalles de una devoluci n de mercader a
 * y limpia los campos de texto de los filtros.
 */
  const cerrarModalVisualizar = () => {
    setModalVisualizar(!modalVisualizar);
  };

/**
 * Descarga un archivo Excel con la lista de productos.
 *
 * Primero, valida que el usuario tenga permiso para descargar el archivo.
 * Si el usuario tiene permiso, hace una solicitud GET al API para obtener
 * la lista de productos.
 * Si la solicitud es exitosa, filtra la lista de productos para obtener
 * solo la informaci n relevante y llama a la funci n `exportToExcel`
 * para descargar el archivo Excel.
 *
 * @returns {Promise<void>}
 */
  const descargarExcel = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const token = localStorage.getItem("token");

      const datos = await fetchApi ({
        endPoint: `/items/`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        paginacion: false,
      })
    }
  };


/**
 * Desplaza suavemente el scroll de la sección con la clase "inicio_pedido"
 * hasta el inicio de la misma.
 */

  const scrollToTop = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: 0, behavior: "smooth" });
  };

/**
 * Desplaza suavemente el scroll de la secci n con la clase "inicio_pedido"
 * hasta el final de la misma.
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
          <div className="panel-title">
          <Stack
        direction={isMobile ? 'column' : 'row'}
        alignItems={"center"}
        justifyContent={"space-between"}
        spacing={2}>

        <p className="panel-title">MESA TRABAJO - DEVOLUCIONES</p>
        <button onClick={descargarExcel} className="boton-orden">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      spacing: "5px",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      height="1.2rem"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    <span style={{ marginLeft: "8px" }}>EXCEL</span>
                  </div>
                </button>
                
                </Stack>
  
          </div>
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
              <label className="input-label">N° Devolución:</label>
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
                <th style={{ textAlign: "center" }}>Devolución</th>
                <th style={{ textAlign: "center" }}>Fecha Emisión</th>
                <th style={{ textAlign: "center" }}>Sucursal</th>
                <th style={{ textAlign: "center" }}>Proveedor</th>
                <th style={{ textAlign: "center" }}>Factura Relacionada</th>
                <th style={{ textAlign: "center" }}>Subtotal</th>
                <th style={{ textAlign: "center" }}>IVA</th>
                <th style={{ textAlign: "center" }}>Total</th>
                <th style={{ textAlign: "center" }}>Motivo</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => {
                const currentIndex = i + 1 + page * rowsPerPage;
                return (
                  <tr key={currentIndex}>
                    <td style={{ textAlign: "start" }}>{item.docNum}</td>
                    <td style={{ textAlign: "start" }}>
                          {new Date(item.docDate).toLocaleDateString(
                            "es",{ day: "numeric", month: "short", year: "numeric" }
                          )}
                        </td>
                    <td style={{ textAlign: "start" }}>{item.whsName}</td>
                    <td style={{ textAlign: "start" }}>{item.cardName}</td>
                    <td style={{ textAlign: "start" }}>{item.document}</td>
                    <td style={{ textAlign: "end" }}>${item.subTotal}</td>
                    <td style={{ textAlign: "end" }}>${item.iva}</td>
                    <td style={{ textAlign: "end" }}>${item.docTotal}</td>
                    <td style={{ textAlign: "start" }}>{item.motive}</td>
                    <td style={{ textAlign: "center" }}>
                      <Stack spacing={2} direction={"row"} justifyContent={"center"}>
                        <Icon onClick={() => abrirModalVisualizar(item)} />
                        <PdfDownloadButton 
                        item={item}/>
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
      <Modal
        isOpen={modalVisualizar}
        onClose={() => {cerrarModalVisualizar();}}
        title=""
        size="lg"
      >
        <Grid container spacing={2} style={{ backgroundColor: "#ffff" }}>
          <Grid item xs={12} sm={12} md={6}>
            <Grid item xs={12} sm={6} md={12}>
              <Stack spacing={2} direction={"column"}>
                <div className="contenedorImagenvisua">
                  <img src={LogoFinal} height={100} alt="" />
                </div>
                <div className="derechaa">
              <Stack spacing={2} direction={"column"}>
                <p>
                  <strong>CONORQUE CIA LTDA</strong>
                </p>
                <li className="li-tv">
                Dir. Matriz: Circunvalacion Sur Sn y Avenida 12 de Octubre
                </li>
              </Stack>
            </div>
              </Stack>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <div className="derechaa">
              <Stack spacing={2} direction={"column"}>
                <p className="texto_fac">
                  <strong>DEVOLUCIÓN</strong>
                </p>
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>No. </strong> {productosf.docNum}
                  </p>
                </li>
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>Fecha Emisión: </strong>
                    {new Date(productosf.docDate).toLocaleDateString(
                      "es",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                </li>
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>Ambiente: </strong>
                    PRODUCCIÓN
                  </p>
                </li>
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>Emisión: </strong>
                    NORMAL
                  </p>
                </li>
              </Stack>
            </div>
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <div className="Scroll" style={{marginTop:'20px', marginBottom:'20px'}}>
            <table className="table table-ligh table-hover">
  <thead>
    <tr>
      <td style={{ textAlign: "center" }}>#</td>
      <td style={{ textAlign: "center" }}>CÓDIGO</td>
      <td style={{ textAlign: "center" }}>DESCRIP.</td>
      <td style={{ textAlign: "center" }}>CANT.</td>
      <td style={{ textAlign: "center" }}>P.U.</td>
      <td style={{ textAlign: "center" }}>DESCT.</td>
      <td style={{ textAlign: "center" }}>TOTAL</td>
      <td style={{ textAlign: "center" }}>RECONOCIDO</td>
      <td style={{ textAlign: "center" }}>PENDIENTE</td>
    </tr>
  </thead>
  <tbody>
    {productos.map((products, i) => {
        const currentIndex = i + 1 ;

        const rowStyle = products.pending === 0 ? {color:'#151635', opacity:'0.5',  cursor: 'not-allowed'} : {};
        const rowStyleNot = products.pending !== 0 ? {border:'none', backgroundColor:'#dedeea', borderRadius:'5px'} : {};

        return (
          <tr key={currentIndex} style={rowStyle}>
            <td className="center">{currentIndex}</td>
            <td style={{ textAlign: "start" }}>
              {products.codeBars}
            </td>
            <td style={{ textAlign: "center" }}>
              {products.itemName}
            </td>
            <td style={{ textAlign: "end" }}>
              {products.quantity}
            </td>
            <td style={{ textAlign: "end" }}>
              ${products.unitPrice}
            </td>
            <td style={{ textAlign: "end" }}>
              {products.discount}%
            </td>
            <td style={{ textAlign: "end" }}>
              {products.lineTotal}
            </td>
            <td style={{ textAlign: "end" }}>
              {products.applied}
            </td>
            <td style={{ textAlign: "center" }}>
              <p style={rowStyleNot}>{products.pending}</p>
            </td>
          </tr>
        );
      })}
  </tbody>
</table>
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
          <div className="derechaa">
              <Stack spacing={2} direction={"column"}>
                <p>
                  <strong>Información Adicional</strong>
                </p>
                <li className="li-tv">
                Sucursal: {productosf.whsName}
                </li>
                <li className="li-tv">
                Comentarios: {productosf.comments}
                </li>
              </Stack>
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
          <Stack spacing={2} direction={"column"}>
              <table className="table table-ligh table-hover">
                <tbody>
                  <tr>
                    <th className="tablaItem1">
                      <p className="subtotal">SUBTOTAL:</p>
                    </th>
                    <td className="tablath">$ {productosf.subTotal}</td>
                  </tr>
                  <tr>
                    <th className="tablaItem1">
                      <p className="subtotal">IVA:</p>
                    </th>
                    <td className="tablath">$ {productosf.iva}</td>
                  </tr>
                  <tr>
                    <th className="tablaItem1">
                      <p className="subtotal">TOTAL:</p>
                    </th>
                    <td className="tablath">$ {productosf.docTotal}</td>
                  </tr>
                </tbody>
              </table>
            </Stack>
          </Grid>
        </Grid>
      </Modal>
    </>
  );
}