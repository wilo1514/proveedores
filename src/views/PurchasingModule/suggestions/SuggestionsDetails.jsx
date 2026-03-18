
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { validacion } from "../../../utils/apiUtils";
import fetchApi from "../../../utils/fechtData";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';


import Container from "../../../components/Container";
import FiltrosPedidos from "../../../components/suggestionsDashboard/FilterProducts";
import TablaPedidos from "../../../components/suggestionsDashboard/TableProducts";
import SugeridosOrden from "../../../components/suggestionsDashboard/SugeridosOrden";
import "../../../css/ComponentesAdicionales/Tabla.css";
import "../../../css/DepartamentoCompras/Dashboard.css";
import "../../../css/EmpleadosMegas/Employees.css";


/**
 * Componente para la mesa de trabajo de la sección de compras.
 * Se encarga de mostrar una tabla con los pedidos de compra,
 * y permite filtrar por proveedor, sucursal, estado, código
 * de pedido, y fechas de inicio y fin.
 * @returns {React.ReactElement}
 */
export default function Employer() {
  const navigate = useNavigate();
  const SlpCode = useSelector((state) => state.auth.datos_Usuario?.SLPCODE ?? "");
  const [data, setData] = useState([]);
  const [codigoo, setCodigoo] = useState(0);
  const [datosSucursal, setDatosSucursal] = useState([]);
  //const [sucursal, setSucursal] = useState({ whsCode: "", whsName: "" });
  const [sucursal, setSucursal] = useState("");
  const [datosProveedores, setDatosProveedores] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [cantItems, setCantItems] = useState(0);
  
  /**
   * Formatea una fecha en formato "YYYY-MM-DD".
   * @param {Date} date - Fecha a formatear.
   * @returns {string} - Cadena con la fecha en formato "YYYY-MM-DD".
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
 * Determina la clase CSS basada en el estado de la orden.
 * @param {string} idEstado - Estado de la orden.
 * @returns {string} - Clase CSS correspondiente.
 */
/**
 * Muestra una alerta de error y redirige al inicio en caso de fallo de autenticación.
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
 * Muestra una alerta de pedidos inexistentes.
 * La función muestra una alerta con el título "PEDIDOS INEXISTENTES" y el texto "No se encontro ordenes con esos parámetro".
 * La alerta no tiene botón de confirmar y se cierra automáticamente después de 2000 milisegundos.
 */
  const handleOrdenes = () => {
    Swal.fire({
      position: "center",
      icon: "warning",
      title: "PEDIDOS INEXISTENTES",
      text: "No se encontro pedidos con esos parámetros",
      showConfirmButton: false,
      timer: 2000,
    });
  };

/**
 * Autoriza una orden de compra.
 * La función recibe un objeto con la estructura de una orden de compra (id, proveedor, fecha, total, etc.).
 * La orden es guardada en el sessionStorage con el key "datosOrden" y se redirige al usuario a la ruta "/mesatrabajo/autorizacion".
 * El redireccionamiento se hace después de 500 milisegundos.
 * @param {object} datos_notificaciones - Objeto con la estructura de una orden de compra.
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
 * Maneja el cambio de fecha de inicio.
 * 
 * La función recibe un evento que contiene la fecha seleccionada por el usuario,
 * la convierte a un objeto Date asegurando que el tiempo sea a las 00:00:00,
 * y actualiza el estado de inicio con el formato deseado.
 * 
 * @param {Object} e - Evento que contiene la fecha seleccionada.
 */

  const handleInicio = (e) => {
    const selectedDate = new Date(e.target.value + "T00:00:00");
    setInicio(formatDate(selectedDate));
  };

/**
 * Maneja el cambio de fecha de fin.
 * 
 * La función recibe un evento que contiene la fecha seleccionada por el usuario,
 * la convierte a un objeto Date asegurando que el tiempo sea a las 00:00:00,
 * y actualiza el estado de fin con el formato deseado.
 * 
 * @param {Object} e - Evento que contiene la fecha seleccionada.
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
 * Hace una solicitud GET a la API para obtener la lista de proveedores.
 * Si la respuesta es exitosa, se actualiza el estado de proveedores con la
 * lista de proveedores.
 * 
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
   * Maneja el cambio de sucursal en el select.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - Evento de cambio del select.
   */
  /*const handleSucursal = (event) => {
    const nombreSucursal = event.target.value;
    const sucursalSeleccionada = datosSucursal.find(
      (suc) => suc.whsName === nombreSucursal
    );
    setSucursal(sucursalSeleccionada ? sucursalSeleccionada.whsCode : "");
  };*/
  const handleSucursal = (event) => {
    setSucursal(event.target.value);
  };

/**
 * Maneja el cambio de página en la tabla paginada.
 * @param {Event} event - Evento del paginador.
 * @param {number} newPage - Nueva página seleccionada.
 */

  /**
   * Obtiene los datos de las órdenes de compra desde el API.
   * - Verifica la autenticación del usuario.
   * - Si hay parámetros de búsqueda en la URL, los utiliza para filtrar los datos.
   * - Si no hay parámetros de búsqueda, utiliza los valores actuales de los estados.
   * - Realiza la solicitud GET al API y maneja los errores.
   * - Carga los datos en la tabla y actualiza el paginador.
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

      const proveedorSearchParams = searchParams.get("proveedor");
      const sucursalSearchParams = searchParams.get("sucursal");

      const proveedorEnviar = proveedorSearchParams || proveedorActual;
      const sucursalEnviar = sucursalSearchParams || sucursalActual;
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
        endPoint: `/items/sugeridonotificacionqlserver?pagina=${page + 1}&recordsPorPagina=30&fechaDesde=${fechInicio}&fechaHasta=${fechFin}&codigoProveedor=${proveedorEnviar}&codigoAlmacen=${sucursalEnviar}&codigoAsesor=${SlpCode}&estado=Todas`,
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
        pathname: "/sugeridosmegas",
        search: newSearchParams.toString(),
      });
    } else {
      handleError();
    }
  };



/**
 * Reinicia los filtros y carga los datos nuevamente.
 * @function
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
      navigate("/sugeridosmegas");
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

  

/**
 * Maneja el cambio del estado de la orden de compra.
 * 
 * Esta función se activa cuando se selecciona un nuevo estado
 * de la orden de compra desde el elemento del formulario correspondiente.
 * 
 * @param {Event} event - Evento que contiene el nuevo valor del estado seleccionado.
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

    // Descarga Excel de los items mostrados
const descargarExcel = () => {
  // expresion para extraer SAP (12 dígitos) y producto
  const regex = /^Item\s+(\d{12})-(.+?)\s+es\s+/i;

  const exportData = data.map(item => {
    let codigoSap = "";
    let producto   = "";
    const match = item.texto.match(regex);
    if (match) {
      codigoSap = match[1];
      producto  = match[2];
    }
    return {
      Proveedor:   item.nombreProveedor,
      Sucursal:    item.nombreAlmacen,
      "Código SAP": codigoSap,
      Producto:     producto,
      "Fecha Pedido": new Date(item.fechaNotificacion)
                          .toLocaleDateString("es"),
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData, {
    header: ["Proveedor","Sucursal","Código SAP","Producto","Fecha Pedido"]
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sugeridos");
  XLSX.writeFile(wb, "sugeridos_megas.xlsx");
};



  return (
    <>
      <Container className="inicio_pedido" fluid>
        <div className="panel">
          <div className="panel-title">
                      <SugeridosOrden titulo={`MESA DE TRABAJO - PEDIDOS MEGAS`} 
                      onDescargarExcel={descargarExcel} 
                      />
                    </div>
          <FiltrosPedidos
      datosProveedores={datosProveedores}
      datosSucursal={datosSucursal}
      proveedor={proveedor}
      sucursal={sucursal}
      estado={estado}
      inicio={inicio}
      fin={fin}
      setProveedor={setProveedor}
      setSucursal={setSucursal}
      setEstado={setEstado}
      setInicio={setInicio}
      setFin={setFin}
      setCodigoo={setCodigoo}
      filtrarReportes={filtrarReportes}
      reiniciarDatos={reiniciarDatos}
      handleProveedorChange={handleProveedorChange}
      handleSucursal={handleSucursal}
      handleStatus={handleStatus}
      handleInicio={handleInicio}
      handleFin={handleFin}
      handleCodigo={handleCodigo}
    />
       </div>
       <TablaPedidos
      data={data}
      page={page}
      rowsPerPage={rowsPerPage}
      cantItems={cantItems}
      setPage={setPage}
      visualizar={visualizar}
      autorizar={autorizar}
    />

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