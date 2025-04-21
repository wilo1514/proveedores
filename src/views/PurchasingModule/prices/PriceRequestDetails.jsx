import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validacion } from "../../../utils/apiUtils";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import Container from "../../../components/Container";
import DotSpinner from "../../../components/DotSpinner";
import fetchApi from "../../../utils/fechtData";

import { ReactComponent as Icon } from "../../../assets/iconos/x.svg";
import "../../../css/DepartamentoCompras/Autorizar.css";
import "../../../css/ComponentesAdicionales/Tabla.css";
import "../../../css/DepartamentoCompras/Dashboard.css";
import CustomDecimalInput from "../../../components/NumericDecimalInput";
import Modal from "../../../components/Modal";

/**
 * AutorizarPrecios es un componente que maneja la lógica y la presentación para autorizar precios de items.
 * 
 * - Maneja el estado del componente que incluye listas de items, datos del pedido, y estados de carga y modales.
 * - Proporciona funciones de manejo de errores y validaciones para asegurar la correcta autorización de precios.
 * - Implementa cálculos para rentabilidad y precios, y actualiza el estado de los items en base a estas operaciones.
 * - Realiza peticiones a APIs para obtener y actualizar datos relacionados a los precios de los items.
 * - Proporciona funcionalidad para descargar datos en formato Excel y mostrar alertas y modales en la interfaz de usuario.
 */

export default function AutorizarPrecios() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [modalAnalisis, setModalAnalisis] = useState(false);
  const [stockAlmacenes, setStockAlmacenes] = useState([]);
  const [stockTotal, setStockTotal] = useState(0);
  const [avgTotal, setAvgTotal] = useState(0);
  const [datosPedidos, setDatosPedidos] = useState({
    nombreProveedor: "",
    nombreAlmacen: "",
    fechaDocumento: new Date(),
    fechaEntrega: new Date(),
  });
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

/**
 * Muestra una alerta de error y redirige a la pantalla de inicio de sesi n en caso de fallo de autenticaci n.
 * - Muestra un mensaje con el t tulo "TIEMPO EXCEDIDO" y texto "Vuelve a ingresar a la APP".
 * - Cierra la sesi n eliminando el token y su fecha de expiraci n del localStorage.
 * - Redirige a la pantalla de inicio de sesi n.
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
 * Muestra una alerta de error en caso de fallo en el sistema.
 * - Muestra un icono de warning y un mensaje indicando que el sistema
 *   est  intentando resolver el problema. Proporciona un enlace a soporte.
 * - La alerta no tiene bot n de confirmar y se cierra autom ticamente despu s de 2200 milisegundos.
 */
  const handleErrorSis = () => {
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
 * Actualiza el estado de un item en la lista de items seg n la nueva rentabilidad ingresada.
 * - Toma la nueva rentabilidad como par metro y la item relacionada.
 * - Convierte la rentabilidad en un n mero y la redondea a dos decimales.
 * - Actualiza el estado del item en la lista con la nueva rentabilidad y el precio mayorista
 *   calculado con la nueva rentabilidad.
 */
  const handleRentabilidadChange = (newRentabilidad, item) => {
    const numericRentabilidad = parseFloat(newRentabilidad);
    const formattedRentabilidad = !isNaN(numericRentabilidad) ? parseFloat(numericRentabilidad.toFixed(2)) : 0;
    const updatedItems = items.map((it) => {
      if (it.codigoPrincipal === item.codigoPrincipal) {
        const updatedItem = {
          ...it,
          rentabilidadMayorista: formattedRentabilidad,
          precioMayorista: Number(calculateRentabilidad(item.rentabilidadMayorista, item.precioSugerido)?.toFixed(4))
        };
        return updatedItem;
      }
      return it;
    });
    setItems(updatedItems);
  };

/**
 * Actualiza el estado de un item en la lista de items seg n la nueva rentabilidad minorista ingresada.
 * - Toma la nueva rentabilidad como par metro y la item relacionada.
 * - Convierte la rentabilidad en un n mero y la redondea a dos decimales.
 * - Actualiza el estado del item en la lista con la nueva rentabilidad y el precio minorista
 *   calculado con la nueva rentabilidad.
 */
  const handleRentabilidadMinorista = (newRentabilidadMin, item) => {
    const numericRentabilidadMin = parseFloat(newRentabilidadMin);
    const formattedRentabilidadMin = !isNaN(numericRentabilidadMin) ? parseFloat(numericRentabilidadMin.toFixed(2)) : 0;
    const updatedItems = items.map((it) => {
      if (it.codigoPrincipal === item.codigoPrincipal) {
        const updatedItem = {
          ...it,
          rentabilidadMinorista: formattedRentabilidadMin,
          precioMinorista: Number(calculateRentabilidadMinorista(item.rentabilidadMinorista, item.precioSugerido)?.toFixed(4))
        };
        return updatedItem;
      }
      return it;
    });
    setItems(updatedItems);
  };

/**
 * Actualiza el estado de un item en la lista de items seg n el nuevo precio mayorista ingresado.
 * - Toma el nuevo precio mayorista como par metro y la item relacionada.
 * - Convierte el precio mayorista en un n mero y lo utiliza para calcular la rentabilidad.
 * - Actualiza el estado del item en la lista con el nuevo precio mayorista y la rentabilidad calculada.
 */
  const handlePrecioMayorista = (newPrecioMayorista, item) => {
    const numericPrecioMayorista = parseFloat(newPrecioMayorista);
    const updatedItems = items.map((it) => {
      if (it.codigoPrincipal === item.codigoPrincipal) {
        const rentabilidad = ((numericPrecioMayorista - it.precioSugerido) * 100) / it.precioSugerido;
        const updatedItem = {
          ...it,
          precioMayorista: numericPrecioMayorista,
          rentabilidadMayorista: isNaN(rentabilidad) ? 0 : rentabilidad,
        };
        return updatedItem;
      }
      return it;
    });
    setItems(updatedItems);
  };

/**
 * Actualiza el estado de un item en la lista de items seg n el nuevo precio minorista ingresado.
 * - Toma el nuevo precio minorista como par metro y la item relacionada.
 * - Convierte el precio minorista en un n mero y lo utiliza para calcular la rentabilidad minorista.
 * - Actualiza el estado del item en la lista con el nuevo precio minorista y la rentabilidad minorista calculada.
 */
  const handlePrecioMinorista = (newPrecioMinorista, item) => {
    const numericPrecioMinorista = parseFloat(newPrecioMinorista);
    const updatedItems = items.map((it) => {
      if (it.codigoPrincipal === item.codigoPrincipal) {
        const rentabilidadMin = ((numericPrecioMinorista - it.precioSugerido) * 100) / it.precioSugerido;
        const updatedItem = {
          ...it,
          precioMinorista: numericPrecioMinorista,
          rentabilidadMinorista: isNaN(rentabilidadMin) ? 0 : rentabilidadMin,
        };
        return updatedItem;
      }
      return it;
    });
    setItems(updatedItems);
  };

/**
 * Calcula el precio mayorista seg n la rentabilidad ingresada.
 * @param {number} rentabilidadMayorista - La rentabilidad mayorista ingresada.
 * @param {number} newPriceMayo - El nuevo precio mayorista ingresado.
 * @returns {number} El precio mayorista calculado.
 */
  const calculateRentabilidad = (rentabilidadMayorista, newPriceMayo) => {
    const resultado = (((parseFloat(rentabilidadMayorista) * 0.01) * parseFloat(newPriceMayo)) + parseFloat(newPriceMayo));
    return resultado;
  };

/**
 * Calcula el precio minorista seg n la rentabilidad ingresada.
 * @param {number} rentabilidadMinorista - La rentabilidad minorista ingresada.
 * @param {number} newPrice - El nuevo precio minorista ingresado.
 * @returns {number} El precio minorista calculado.
 */
  const calculateRentabilidadMinorista = (rentabilidadMinorista, newPrice) => {
    const resultado = (((parseFloat(rentabilidadMinorista) * 0.01) * parseFloat(newPrice)) + parseFloat(newPrice));
    return resultado;
  };

/**
 * Obtiene la lista de items de la orden de compra ingresada.
 *
 * Realiza una petici n GET a la API para obtener la lista de items de la orden de
 * compra. Si la petici n es exitosa, se llama a la funci n ObtenerInformacion para
 * procesar los datos y se setean los datos en el estado. Si la petici n falla, se
 * llama a la funci n handleError para mostrar una alerta de error.
 *
 * @returns {Promise<void>}
 */
  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const numordenCompra = sessionStorage.getItem("datosOrden");
      const datos = await fetchApi({
        endPoint: `/items/preciosugeridosqlserver/${numordenCompra}`,
        method: "GET",
        paginacion: false,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenId,
        },
      });
      if (datos.error) {
        handleErrorSis(datos.error);
        return;
      }
      ObtenerInformacion(datos.datos);
      setDatosPedidos(datos.datos)
    } else {
      handleError();
    }
  };

  // const ObtenerInformacion = (data) => {
  //   if (data.details && data.details.length !== 0) {
  //     sessionStorage.setItem("codeSup", data.codigoProveedor);
  //     const valor = data.details.map((item) => ({
  //       ...item,
  //       filtrado: false,
  //     }));
  //     setItems(valor);
  //   } else {
  //     console.log("No hay detalles en los datos proporcionados.");
  //   }
  // };

/**
 * Procesa los datos de la orden de compra y calcula los precios mayorista y minorista
 * para cada item. Luego, actualiza el estado de items con los valores calculados.
 * 
 * @param {object} data - Los datos de la orden de compra.
 * @property {number} data.codigoProveedor - El código del proveedor.
 * @property {array} data.details - La lista de items de la orden de compra.
 * @property {number} data.details.rentabilidadMayorista - La rentabilidad mayorista.
 * @property {number} data.details.rentabilidadMinorista - La rentabilidad minorista.
 * @property {number} data.details.precioSugerido - El precio sugerido.
 * @property {boolean} data.details.filtrado - Un booleano que indica si el item ha sido filtrado.
 * @property {number} data.details.precioMayorista - El precio mayorista calculado.
 * @property {number} data.details.precioMinorista - El precio minorista calculado.
 */
  const ObtenerInformacion = (data) => {
    if (data.details && data.details.length !== 0) {
      // Almacena el código del proveedor en sessionStorage
      sessionStorage.setItem("codeSup", data.codigoProveedor);
  
      // Mapea los datos y calcula precioMayorista y precioMinorista
      const valor = data.details.map((item) => {
        // Calcular precioMayorista usando rentabilidadMayorista si está disponible
        const precioMayoristaCalculado = item.rentabilidadMayorista 
          ? calculateRentabilidad(item.rentabilidadMayorista, item.precioSugerido)
          : item.precioSugerido;
  
        // Calcular precioMinorista usando rentabilidadMinorista si está disponible
        const precioMinoristaCalculado = item.rentabilidadMinorista
          ? calculateRentabilidadMinorista(item.rentabilidadMinorista, item.precioSugerido)
          : item.precioSugerido;
  
        return {
          ...item,
          filtrado: false,
          precioMayorista: parseFloat(precioMayoristaCalculado.toFixed(4)),
          precioMinorista: parseFloat(precioMinoristaCalculado.toFixed(4)),
        };
      });
      // Actualiza el estado de items con los valores calculados
      setItems(valor);
    } else {
      console.log("No hay detalles en los datos proporcionados.");
    }
  };
  

  // PETICIONES

/**
 * Maneja la opción seleccionada por el usuario en el alert de opciones para el manejo de la autorización.
 * @param {string} option - La opción seleccionada por el usuario. Puede ser "guardar" o "guardarActualizar".
 */
  const handleAlertOption = async (option) => {
    let requerimiento = 0;
    switch (option) {
      case "guardar":
        requerimiento = 1;
        break;
      case "guardarActualizar":
        requerimiento = 2;
        break;
      default:
        setShowAlert(false);
        return;
    }
    setShowAlert(false);
    await procesar(requerimiento);
  };

/**
 * Procesa la autorización de un pedido.
 *
 * @param {number} requerimiento - 1 para guardar los cambios, 2 para guardar y actualizar.
 * @returns {Promise<void>}
 */
  const procesar = async (requerimiento) => {
    const validado = await validacion();
    if (validado === 1) {
      const details = items.map((item) => ({
        id: item.id,
        codigoConorque: item.codigoConorque,
        codigoPrincipal: item.codigoPrincipal,
        descripcion: item.descripcion,
        precioUnitario: parseFloat(item.precioUnitario),
        precioSugerido: parseFloat(item.precioSugerido),
        rentabilidadMayorista: parseFloat(item.rentabilidadMayorista.toFixed(2)),
        rentabilidadMinorista: parseFloat(item.rentabilidadMinorista.toFixed(2)),
        precioMayorista: parseFloat(item.precioMayorista.toFixed(4)),
        precioActualMayorista: parseFloat(item.precioActualMayorista),
        precioMinorista: parseFloat(item.precioMinorista.toFixed(4)),
        precioActualMinorista: parseFloat(item.precioActualMinorista),
        aprobacion: item.aprobacion,
      }));
      const datos = {
        fechaEntrega: datosPedidos.fechaEntrega,
        tipo: datosPedidos.tipo,
        motivo: datosPedidos.motivo,
        total: datosPedidos.total,
        solicitante: datosPedidos.solicitante,
        nombreListado: datosPedidos.nombreListado,
        details: details,
      };
      try {
        const tokenId = localStorage.getItem("token");
        const response = await fetchApi({
          endPoint: `/items/preciosugeridosqlserver/${datosPedidos.id}`,
          method: "PUT",
          paginacion: false,
          body: datos,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tokenId,
          },
        });
        if (response.error !== "Error 204") {
          return;
        }
        if (requerimiento === 1) {
          await Swal.fire({
            title: "Cambios Guardados",
            html: '<i class="fas fa-check-circle" style="color:green;"></i>',
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        } else if (requerimiento === 2) {
          autorizar();
        }
      } catch (error) {
        console.error("Error al enviar el pedido: ", error);
        await Swal.fire({
          title: "Error",
          text: "Error al guardar los cambios",
          icon: "error",
        });
      }
    } else {
      handleError();
    }
  };


/**
 * Autoriza la actualización de precios de un pedido.
 *
 * @returns {Promise<void>}
 * @throws {Error} Si hay un error al enviar la petición o procesar la respuesta.
 */
  const autorizar = async () => {
    // Validación inicial
    const validado = await validacion();
    if (validado !== 1) {
      handleError();
      setLoading(false);
      return;
    }
  
    if (!items || items.length === 0) {
      console.error("No hay items en el pedido.");
      setLoading(false);
      return;
    }
  
    if (!datosPedidos) {
      console.error("Datos del pedido no están definidos.");
      setLoading(false);
      return;
    }
  
    const codigos = new Set();
    const itemsUnicos = items.filter(item => {
      if (item.aprobacion && !codigos.has(item.codigoConorque) && item.estado === "PARA REVISION") {
        codigos.add(item.codigoConorque);
        return true;
      }
      return false;
    });
  
    if (itemsUnicos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No hay items aprobados para autorizar",
        text: "Verifique que todos los items tengan la aprobación marcada.",
        showConfirmButton: true,
      });
      setLoading(false);
      return;
    }
  
    const productosInvalidos = itemsUnicos.filter(item =>
      item.rentabilidadMayorista < 10 || item.rentabilidadMinorista < 10
    );
  
    if (productosInvalidos.length > 0) {
      let rentabilidadHTML = "<table style='width:100%; border:1px solid black; border-collapse:collapse;'><thead><tr><th style='border:1px solid black; padding:8px;'>Código Item</th><th style='border:1px solid black; padding:8px;'>Descripción</th><th style='border:1px solid black; padding:8px;'>Rentabilidad Mayorista</th><th style='border:1px solid black; padding:8px;'>Rentabilidad Minorista</th></tr></thead><tbody>";
      productosInvalidos.forEach(item => {
        rentabilidadHTML += `<tr><td style='border:1px solid black; padding:8px;'>${item.codigoConorque}</td><td style='border:1px solid black; padding:8px;'>${item.descripcion}</td><td style='border:1px solid black; padding:8px;'>${item.rentabilidadMayorista.toFixed(2)}%</td><td style='border:1px solid black; padding:8px;'>${item.rentabilidadMinorista.toFixed(2)}%</td></tr>`;
      });
      rentabilidadHTML += "</tbody></table>";
      Swal.fire({
        icon: "error",
        title: "Productos con baja rentabilidad",
        html: rentabilidadHTML,
        showConfirmButton: true,
      });
      setLoading(false);
      return;
    }
  
    const tokenId = localStorage.getItem("token");
    const numordenCompra = sessionStorage.getItem("datosOrden");
    const datosItems = itemsUnicos.map(item => ({
      "idPrecioSugerido": numordenCompra,
      "u_dblPrecioNeg": item.precioSugerido,
      "u_CNQ_RENT_MAYORISTA": parseFloat(item.rentabilidadMayorista.toFixed(2)),
      "u_CNQ_RENT_MINORISTA": parseFloat(item.rentabilidadMinorista.toFixed(2)),
      "itemPrices": [
        { "priceList": 1, "price": parseFloat(item.precioMinorista.toFixed(4)) },
        { "priceList": 2, "price": parseFloat(item.precioMayorista.toFixed(4)) }
      ]
    }));
  
    setLoading(true);
  
    try {
      // Primera petición: Envío de actualizaciones de precios
      const primeraPeticion = itemsUnicos.map(async (item, index) => {
        const itemCode = item.codigoConorque;
        const datos = datosItems[index];
  
        const response = await fetchApi({
          endPoint: `/items/preciosugeridohana/${itemCode}`,
          method: "PUT",
          paginacion: false,
          body: datos,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tokenId,
          },
        });
  
        // Si la respuesta es 204, continuar sin lanzar error
        if (response.status === 204) {
          console.log(`Status 204: No content for item ${itemCode}.`);
          return; // Continuar al siguiente item
        }
  
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
  
        return response;
      });
  
      await Promise.all(primeraPeticion);
  
      // Segunda petición: Envío de correos
      Swal.fire({
        title: "Seleccione correos para enviar actualización",
        html: `
          <div style="text-align: left;">
            <ul>
              <li><input type="checkbox" id="email1"> email1@example.com</li>
              <li><input type="checkbox" id="email2"> email2@example.com</li>
              <li><input type="checkbox" id="email3"> email3@example.com</li>
            </ul>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Enviar actualización a Megas",
       
       
        /**
         * Función que se ejecuta antes de confirmar la acción. Se encarga de recopilar
         * los correos electrónicos seleccionados por el usuario y devolverlos como
         * un array para su posterior envío.
         * @returns {string[]} Array de correos electrónicos seleccionados por el usuario.
         */
        preConfirm: () => {
          const selectedEmails = [];
          if (document.getElementById("email1").checked) selectedEmails.push("email1@example.com");
          if (document.getElementById("email2").checked) selectedEmails.push("email2@example.com");
          if (document.getElementById("email3").checked) selectedEmails.push("email3@example.com");
          return selectedEmails;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const selectedEmails = result.value;
          try {
            await fetchApi({
              endPoint: `/emails/send`,
              method: "POST",
              body: { emails: selectedEmails },
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + tokenId,
              },
            });
  
            Swal.fire({
              title: "Actualización enviada correctamente",
              icon: "success",
              timer: 1500,
            });
          } catch (error) {
            Swal.fire({
              icon: "warning",
              title: "Actualización exitosa, pero falló el envío de correos",
              text: error.message,
            });
          }
        }
      });
  
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en la autorización",
        text: error.message || "Ha ocurrido un error desconocido",
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };
  



/**
 * Anula una orden de compra.
 * 
 * Verifica la autenticación del usuario y, si es válida, abre una ventana emergente
 * para que el usuario ingrese el motivo de anulación. Si el usuario confirma, se
 * envía una solicitud PUT a la API para anular la orden, y se muestra una alerta
 * con el resultado de la operación.
 * 
 * @returns {void}
 */
  const anular = async () => {
    try {
      const validado = await validacion();
      if (validado === 1) {
        handleAlertOption("cancelar");
        const tokenId = localStorage.getItem("token");
        const { value: comentario, isConfirmed } = await Swal.fire({
          input: "textarea",
          inputLabel: "MOTIVO DE ANULACIÓN",
          inputPlaceholder: "Ingrese el motivo de anulación aquí...",
          inputAttributes: {
            "aria-label": "Ingrese el motivo de anulación aquí",
          },
          showCancelButton: true,
          confirmButtonText: "Anular",
          confirmButtonColor: "#23bf07",
          cancelButtonText: "Cancelar",
          cancelButtonColor: "#d33",
        });
         if (isConfirmed){
          const numordenCompra = sessionStorage.getItem("datosOrden");
          const reason = comentario || "";
        
          const response = await fetchApi({
            endPoint: `/items/preciosugeridonotificacionsqlserver/cancelled/${numordenCompra}/${reason}`,
            method: "PUT",
            paginacion: false,
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + tokenId,
            },
          });
  
          if (response.error === "Error 204") {
            Swal.fire({
              title: "Solicitud Anulada",
              text: "La orden ha sido anulada correctamente.",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
          } else if (response.error) {
            Swal.fire({
              title: "Error",
              text: response.error,
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          } else {
            Swal.fire({
              title: "Orden Anulada",
              text: "La orden ha sido procesada con éxito.",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate(-1);
          }
        } else {
          console.log("Usuario cancelo");
        }
         }
      
    } catch (error) {
      console.error("Error al enviar el pedido: ", error);
      await Swal.fire({
        title: "Error",
        text: "Error al guardar los cambios",
        icon: "error",
      });
    }
  };

/**
 * Descarga un archivo Excel con la lista de productos aprobados.
 *
 * Verifica si no hay items aprobados, y si no los hay, muestra un mensaje de alerta.
 * Si hay items aprobados, filtra la lista para obtener solo la información relevante
 * y llama a la función `exportToExcel` para descargar el archivo Excel.
 *
 * @returns {void}
 */
  const descargarExcel = () => {
    const codigos = new Set();
    
    // Filtra los items aprobados y elimina duplicados
    const itemsUnicos = items.filter(item => {
      if (item.estado === "APROBADO" && !codigos.has(item.codigoConorque)) {
        codigos.add(item.codigoConorque);
        return true;
      }
      return false;
    });

    // Verifica si no hay items aprobados
    if (itemsUnicos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No hay items aprobados",
        text: "Verifique que todos los items estén autorizados",
        showConfirmButton: true,
      });
      setLoading(false); // Asegúrate de detener la carga
      return;
    }

    // Mapea los detalles de los items aprobados
    const details = itemsUnicos.map(item => ({
      codigoConorque: item.codigoConorque,
      codigoPrincipal: item.codigoPrincipal,
      descripcion: item.descripcion,
      precioMinorista: parseFloat(item.precioMinorista), // Convierte el precio a número
    }));

    // Prepara los datos para exportar a Excel con los nombres de las columnas deseadas
    const filteredData = details.map(item => ({
      "Código Conorque": item.codigoConorque,
      "Código Barras": item.codigoPrincipal,
      "Descripción": item.descripcion,
      "Precio Mega": item.precioMinorista, // Asegúrate de que el precio esté en el formato adecuado
    }));

    // Llamada a la función que exporta a Excel
    exportToExcel(filteredData);
  };


/**
 * Exporta la lista de productos aprobados a un archivo Excel
 *
 * Recibe como parámetro un array de objetos con la siguiente estructura:
 * - Código Conorque
 * - Código Barras
 * - Descripción
 * - Precio Mega
 *
 * La función utiliza la librería XLSX para convertir el array en un archivo Excel
 * y lo guarda en el disco duro con el nombre "precios.xlsx"
 * @param {Array<Object>} data - La lista de productos aprobados
 * @returns {void}
 */
  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: ["Código Conorque", "Código Barras", "Descripción", "Precio Mega"]
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CAMBIO PRECIOS");

    XLSX.writeFile(workbook, "precios.xlsx")
  }

/**
 * Actualiza el estado de "items" cuando se cambia el estado de un checkbox de aprobación.
 * Recibe como parámetro el evento del checkbox y el item que se está actualizando.
 * @param {Event} event - El evento del checkbox.
 * @param {Object} item - El item que se está actualizando.
 * @returns {void}
 */
  const handleCheckboxChange = (event, item) => {
    const isChecked = event.target.checked;
    const updatedItems = items.map((it) =>
      it.codigoPrincipal === item.codigoPrincipal
        ? { ...it, aprobacion: isChecked }
        : it
    );
    setItems(updatedItems);
  };

/**
 * Desplaza el scroll de la sección con la clase "inicio_pedido"
 * hasta el principio, de manera suave.
 * @function
 */
  const scrollToTop = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: 0, behavior: "smooth" });
  };

/**
 * Desplaza el scroll de la sección con la clase "inicio_pedido"
 * hasta el final, de manera suave.
 * @function
 */
  const scrollToBottom = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

/**
 * Navega hacia la pantalla anterior en el historial de navegación.
 * 
 * Utiliza la función de navegación para retroceder una página en el historial
 * cuando se invoca.
 */

  const regresar = () => {
    navigate(-1);
  };

/**
 * Analiza el stock del producto especificado.
 *
 * Realiza una validación de usuario y, si es exitosa, se conecta al API para
 * recuperar los datos de stock del producto especificado por 'dato'. Los datos
 * se obtienen del almacén con código 'numero'. Si el API responde con un error,
 * se maneja el error adecuadamente. Si no, se actualiza el estado del modal de análisis
 * y se llama a la función 'almacenesStock' con los datos recuperados.
 *
 * @async
 * @param {string} dato - El código del producto para el cual se desea obtener la información de stock.
 * @returns {Promise<void>}
 */

  const analisiStock = async (dato) => {
    const validado = await validacion();

    // Verifica si la validación pasa
    if (validado === 1) {
      const codeSup = sessionStorage.getItem("codeSup");
      const tokenId = localStorage.getItem("token");
      const numero = 2;
      try {
        const datos = await fetchApi({
          endPoint: `/warehouse/stockwarehouse/${codeSup}?itemCode=${dato}&whsCode=${numero}`,
          method: "GET",
          paginacion: false,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tokenId,
          },
        });

        // Verificar si hay error en los datos recibidos
        if (datos.error) {
          handleErrorSis(datos.error);
          return;
        }
        setModalAnalisis(!modalAnalisis); // Cambia el estado del modal
        almacenesStock(datos); // Llama a la función con los datos
      } catch (error) {
        console.error("Error en fetchApi:", error);
      }
    } else {
      handleError();
    }
  };

/**
 * Analiza el stock de los almacenes y extrae los valores para stock actual, stock total
 * y promedio de ventas.
 * 
 * @param {Object[]} stock - El array de objetos que contiene la información de stock
 *                           para cada almacén.
 * @returns {void}
 */
  const almacenesStock = (stock) => {
    // Verifica que el parámetro recibido no esté vacío o undefined
    if (!stock) {
      console.error("No se recibió ningún stock.");
    } else {
      setStockAlmacenes(stock.datos)
      const totalOnHand = stock.datos.reduce((total, item) => {
        if (item.onHand && typeof item.onHand === "string") {
          const onHandValue = parseFloat(item.onHand.slice(0, -2));
          if (!isNaN(onHandValue)) {
            return total + onHandValue;
          }
        }
        return total;
      }, 0);

      const totalPromedio = stock.datos.reduce((totalAvg, item) => {
        if (item.avgSales && typeof item.avgSales === "string") {
          const avgSalesValue = parseFloat(item.avgSales.slice(0, -2));
          if (!isNaN(avgSalesValue)) {
            return totalAvg + Math.abs(avgSalesValue);
          }
        }
        return totalAvg;
      }, 0);

      setStockTotal(totalOnHand.toFixed(2));
      setAvgTotal(totalPromedio);

    }
  };

/**
 * Cierra el modal de análisis de stock y limpia el estado de la modal.
 * 
 * @returns {void}
 */
  const cerrarModalStock = () => {
    setModalAnalisis(!modalAnalisis);
  };

/**
 * Cierra una orden de compra después de validar la sesión del usuario.
 *
 * Muestra un modal para que el usuario ingrese un comentario sobre el cierre 
 * de la orden. Al confirmar, envía una solicitud PUT al servidor para cerrar 
 * la orden con el número de orden y el comentario proporcionado. Si la solicitud 
 * es exitosa, notifica al usuario y regresa a la pantalla anterior. Si hay un error 
 * en la solicitud, muestra un mensaje de error. Si el usuario cancela, no se realiza 
 * ninguna acción.
 *
 * Maneja errores en caso de que falle la validación de la sesión o la solicitud al 
 * servidor, mostrando mensajes de error al usuario.
 *
 * @returns {Promise<void>}
 */

  const cerrarOrden = async () => {
    try {
      const validado = await validacion();
      if (validado === 1) {
      const { value: comentario, isConfirmed } = await Swal.fire({
        input: "textarea",
        inputLabel: "CERRAR ORDEN",
        inputPlaceholder: "Ingrese el comentario aquí...",
        inputAttributes: {
          "aria-label": "Ingrese el comentario aquí",
        },
        showCancelButton: true,
        confirmButtonText: "Guardar",
        confirmButtonColor: "#23bf07",
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#d33",
      });

      if (isConfirmed) {
        const tokenId = localStorage.getItem("token");
        const numordenCompra = sessionStorage.getItem("datosOrden");
        const reason = comentario || "";
        const respuesta = await fetchApi({
          endPoint: `/items/preciosugeridonotificacionsqlserver/closed/${numordenCompra}/${reason}`,
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tokenId,
          },
        });



        console.log(respuesta)
        
        if (respuesta.error && respuesta.error !== 'Error 204' ) {
          Swal.fire({
            icon: "error",
            title: "ERROR",
            text: respuesta.error,
            showConfirmButton: true,
          });
          return;
        } else {
          Swal.fire({
            title: "Solicitud Cerrada",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          navigate(-1)
        }
      

      } else {
        console.log("El usuario canceló");
      }
    }
    } catch (error) {
      console.error("Error al enviar el pedido: ", error);
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "Ocurrió un error al enviar el pedido. Por favor, intente de nuevo.",
      });
    }
};

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Container className="inicio_pedido" fluid>
        <div className="panel">
          <div className="panel-title">
            <Stack
              direction={isMobile ? 'column' : 'row'}
              alignItems={"center"}
              justifyContent={"space-between"}
              spacing={2}
            >
              <p className="panel-title">
                SOLICITUD ACTUALIZACIÓN PRECIOS <strong>N°{datosPedidos.id}</strong>
              </p>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                alignItems={"center"}
                justifyContent={"flex-end"}
                spacing={2}
                sx={{
                  minWidth: isMobile ? '100%' : 'auto',
                  padding: isMobile ? '0 1rem' : '0',
                }}>
                <Tooltip title="Regresar">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height={"1.3rem"}
                    onClick={regresar}
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Tooltip>
                <Tooltip title="Descargar Excel">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    height="1.1rem"
                    strokeWidth={1.5}
                    onClick={descargarExcel}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </Tooltip>
                <div>
                  <button
                    className="boton-superior"
                    style={{ background: "#06ac2e" }}
                    onClick={() => setShowAlert(true)}
                    disabled={datosPedidos.estado !== "PARA REVISION"}
                  >
                    GUARDAR - AUTORIZAR
                  </button>
                  {showAlert && (
                    <div className="alert">
                      <div className="icon-container">
                        <Icon onClick={() => handleAlertOption("cancelar")} />
                      </div>
                      <div className="alert-options">
                        <div className="alert-header">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={0.8}
                            stroke="#f8bb86"
                            height="8rem"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                            />
                          </svg>
                          <h2 className="title-alert">
                            ¿Qué acción desea realizar?
                          </h2>
                        </div>
                        <p className="text-alert">
                          Recuerda una vez autorizado no podrás modificar
                        </p>
                        <div className="alert-buttons">
                          <button
                            className="alert-button"
                            style={{ background: "#128496" }}
                            onClick={() => handleAlertOption("guardar")}
                          >
                            GUARDAR
                          </button>
                          <button
                            className="alert-button"
                            style={{ background: "#23bf07" }}
                            onClick={() => handleAlertOption("guardarActualizar")}
                          >
                            AUTORIZAR
                          </button>
                          <button
                            className="alert-button cancel"
                            onClick={() => anular(datosPedidos.id)}
                          >
                            ANULAR
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {loading && <DotSpinner />}
                </div>
                <button
                  className="boton-superior"
                  style={{ background: "#128496" }}
                  onClick={cerrarOrden}
                  disabled={datosPedidos.estado !== "PARA REVISION"}
                > CERRAR ORDEN </button>

              </Stack>
            </Stack>
          </div>

          <div className="panel-grid">
            <div className="panel-item">
              <label className="input-label-autor">Listado: </label>
              <input
                className="dashboard-input"
                id="combo-box-demo"
                name="asesor"
                type="text"
                value={datosPedidos.nombreListado ?? ""}
                readOnly
              />
            </div>
            <div className="panel-item">
              <label className="input-label-autor">Proveedor: </label>
              <input
                className="dashboard-input"
                id="combo-box-demo"
                name="asesor"
                type="text"
                value={datosPedidos.nombreProveedor ?? ""}
                readOnly
              />
            </div>
            <div className="panel-item">
              <label className="input-label-autor">Solicitante</label>
              <input
                className="dashboard-input"
                id="combo-box-demo"
                name="asesor"
                type="text"
                value={datosPedidos.solicitante ?? ""}
                readOnly
              />
            </div>
            <div className="panel-item">
              <label className="input-label-autor">Fecha Solicitud</label>
              <input
                className="dashboard-input"
                id="combo-box-demo"
                name="asesor"
                type="text"
                value={datosPedidos.fechaEntrega ? new Date(datosPedidos.fechaEntrega).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : ""}
                readOnly
              />
            </div>
          </div>
        </div>
        <div className="panel">
          <table className="table table-ligh table-hover">
            <thead>
              <tr className="text-center">
                <th style={{ textAlign: "center" }} rowSpan="2">#</th>
                <th style={{ textAlign: "center" }} rowSpan="2">SAP</th>
                <th style={{ textAlign: "center" }} rowSpan="2">BARRAS</th>
                <th style={{ textAlign: "center" }} rowSpan="2">DESCRIP.</th>
                <th style={{ textAlign: "center" }} colSpan="3">PRECIOS</th>
                <th style={{ textAlign: "center" }} colSpan="3">PRECIO VENTA MAYORISTA</th>
                <th style={{ textAlign: "center" }} colSpan="3">PRECIO VENTA MEGAS-COBERTURA</th>
                <th style={{ textAlign: "center" }} rowSpan="2"></th>
                <th style={{ textAlign: "center" }} rowSpan="2">APR</th>
              </tr>
              <tr>
                <th style={{ textAlign: "center", backgroundColor: "#E2C86C", color: "white" }}>Actual</th>
                <th style={{ textAlign: "center", backgroundColor: "#E2C86C", color: "white" }}>Nuevo</th>
                <th style={{ textAlign: "center", backgroundColor: "#E2C86C", color: "white" }}>Diferencia</th>
                <th style={{ textAlign: "center", backgroundColor: "#79B8D1", color: "white" }}>Actual</th>
                <th style={{ textAlign: "center", backgroundColor: "#79B8D1", color: "white" }}>Nuevo</th>
                <th style={{ textAlign: "center", backgroundColor: "#79B8D1", color: "white" }}>Rent. (%)</th>
                <th style={{ textAlign: "center", backgroundColor: "#71c57d", color: "white" }}>Actual</th>
                <th style={{ textAlign: "center", backgroundColor: "#71c57d", color: "white" }}>Nuevo</th>
                <th style={{ textAlign: "center", backgroundColor: "#71c57d", color: "white" }}>Rent. (%)</th>
              </tr>
            </thead>
            <tbody>
              {items &&
                items.length > 0 &&
                items.map((item, i) => {
                  const currentIndex = i + 1;
                  const diferenciaPorcentaje = ((item.precioSugerido - item.precioUnitario) / item.precioUnitario * 100).toFixed(4);
                  const diferencia = item.precioUnitario===0 ? 100: diferenciaPorcentaje;
                  const isAutorizado = item.estado !== "PARA REVISION";
                  const rowStyle = isAutorizado ? { color: '#151635', opacity: '0.5', cursor: 'not-allowed' } : {};
                  return (
                    <tr key={i} style={rowStyle}>
                      <td style={{ textAlign: "center" }}>{currentIndex}</td>
                      <td style={{ textAlign: "start" }}>{item.codigoConorque}</td>
                      <td style={{ textAlign: "start" }}>{item.codigoPrincipal}</td>
                      <td style={{ textAlign: "start" }}>{item.descripcion}</td>
                      <td style={{ textAlign: "end" }}>${item.precioUnitario}</td>
                      <td style={{ textAlign: "end" }}>
                        <input
                          value={"$" + item.precioSugerido ?? ""}
                          style={{ width: '70px', padding: '3px', borderRadius: '4px', color: '#212529', background: '#f0eeee', border: 'none', textAlign: 'center' }}
                          readOnly />
                      </td>
                      <td style={{ textAlign: "center" }}>{diferencia}%</td>
                      {/* PRECIO VENTA ACTUAL MAYORISTA */}
                      <td style={{ textAlign: "center" }}>{item.precioActualMayorista}</td>
                      {/* PRECIO VENTA NUEVO MAYORISTA */}
                      <td style={{ textAlign: "center" }}>
                        <CustomDecimalInput
                          value={isNaN(item.precioMayorista) ? 0 : parseFloat(item.precioMayorista.toFixed(4))}
                          onChange={(newValue) => handlePrecioMayorista(newValue, item)}
                          cantidad={4}
                          disabled={isAutorizado}
                        />
                      </td>
                      {/* RENTABILIDAD MAYORISTA */}
                      <td style={{ textAlign: "center" }}>
                        <CustomDecimalInput
                          value={isNaN(item.rentabilidadMayorista) ? 0 : parseFloat(item.rentabilidadMayorista.toFixed(2))}
                          onChange={(newValue) => handleRentabilidadChange(newValue, item)}
                          cantidad={2}
                          disabled={isAutorizado}
                        />
                      </td>
                      {/* PRECIO VENTA MINORISTA */}
                      <td style={{ textAlign: "center" }}>
                        {item.precioActualMinorista}
                      </td>
                      {/* PRECIO VENTA MINORISTA */}
                      <td style={{ textAlign: "center" }}>
                        <CustomDecimalInput
                          value={isNaN(item.precioMinorista) ? 0 : parseFloat(item.precioMinorista.toFixed(4))}
                          onChange={(newValue) => handlePrecioMinorista(newValue, item)}
                          cantidad={4}
                          disabled={isAutorizado}
                        />
                      </td>
                      {/* RENTABILIDAD MINORISTA */}
                      <td style={{ textAlign: "center" }}>
                        <CustomDecimalInput
                          value={isNaN(item.rentabilidadMinorista) ? 0 : parseFloat(item.rentabilidadMinorista.toFixed(2))}
                          onChange={(newValue) => handleRentabilidadMinorista(newValue, item)}
                          cantidad={2}
                          disabled={isAutorizado}
                        />
                      </td>
                      <td>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#151635"
                          height="1.2rem"
                          onClick={() => analisiStock(item.codigoConorque)}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                          />
                        </svg>
                      </td>
                      <td>
                        <Stack
                          direction="row"
                          alignItems={"center"}
                          justifyContent={"center"}
                          spacing={2}
                        >
                          <input
                            type="checkbox"
                            checked={item.aprobacion}
                            onChange={(event) => handleCheckboxChange(event, item)}
                            disabled={isAutorizado}
                          />
                        </Stack>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="panel-grid">

            <label className="input-label-autor">Motivo: </label>
            <textarea
              className="dashboard-input"
              id="combo-box-demo"
              name="asesor"
              type="text"
              rows="2"
              value={datosPedidos.motivo}
              readOnly
              style={{ resize: "none" }}
            />

          </div>
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
        isOpen={modalAnalisis}
        onClose={() => { cerrarModalStock() }}
        title="STOCK ALMACENES"
        size="md"
      >
        <div className="Scroll">
          <table className="table table-ligh table-hover">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Almacen</th>
                <th style={{ textAlign: "center" }}>Cantidad</th>
                <th style={{ textAlign: "center" }}>AVG</th>
              </tr>
            </thead>
            <tbody>
              {stockAlmacenes &&
                stockAlmacenes.map((item, i) => {
                  const currentIndex = i + 1;
                  return (
                    <tr key={currentIndex}>
                      <td style={{ textAlign: "start" }}>
                        {item.whsName}
                      </td>
                      <td style={{ textAlign: "end" }}>{item.onHand}</td>
                      <td
                        style={{
                          textAlign: "center",
                          background: "#d1f4cb",
                        }}
                      >
                        {item.avgSales}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <table className="table table-ligh table-hover">
            <tbody>
              <tr style={{ background: "#128496", color: "white" }}>
                <th
                  style={{
                    textAlign: "start",
                    width: "190px",
                    fontSize: "16px",
                  }}
                >
                  <p>TOTAL</p>
                </th>
                <td style={{ textAlign: "center", fontSize: "18px" }}>
                  <p>{stockTotal}</p>
                </td>
                <td style={{ textAlign: "center", fontSize: "18px" }}>
                  <p>{avgTotal}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}