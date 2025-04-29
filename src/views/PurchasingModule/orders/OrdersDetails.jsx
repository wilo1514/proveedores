import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validacion } from "../../../utils/apiUtils";

import Swal from 'sweetalert2';
import * as XLSX from "xlsx";
import Container from "../../../components/Container";
import fetchApi from "../../../utils/fechtData";
import { descargarArchivo } from '../../../utils/descargarPlantilla';
import { readDuplicadoExcel, validateAndTransformDuplicado, showDuplicadoAlerts } from '../../../utils/excelDuplicadoProcessor';
import "../../../css/DepartamentoCompras/Autorizar.css";
import "../../../css/ComponentesAdicionales/Tabla.css";
import "../../../css/EmpleadosMegas/Employees.css";
import ModalPrecios from "../../../components/OrdersDetails/ModalPrecios";
import ModalFiltros from "../../../components/OrdersDetails/ModalFiltros";
import ModalComentario from "../../../components/OrdersDetails/ModalComentario";
import ModalAnalisis from "../../../components/OrdersDetails/ModalAnalisis";
import ModalVisualizar from "../../../components/OrdersDetails/ModalVisualizar";
import TablaProductos from "../../../components/OrdersDetails/Tabla";
import HeaderOrden from "../../../components/OrdersDetails/HeaderOrden";
import DetallePedido from "../../../components/OrdersDetails/Details";
import ResumenPedido from "../../../components/OrdersDetails/Summary";

export default function DuplicadoView() {
  const navigate = useNavigate();
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [nombreProducto, setNombreProducto] = useState("");
  const [modalAnalisis, setModalAnalisis] = useState(false);
  const [modalPrecios, setModalPrecios] = useState(false);
  const [modalComentario, setModalComentario] = useState(false);
  const [nombrePrecio, setNombrePrecio] = useState("");
  const [modalFiltros, setModalFiltros] = useState(false);
  const [datosAnalisis, setDatosAnalisis] = useState([]);
  const [promedioCompras, setPromedioCompras] = useState(0);
  const [promedioVentas, setPromedioVentas] = useState(0);
  const [stockActual, setStockActual] = useState(0);
  const [pedidosTabla, setPedidosTabla] = useState([]);
  const [stockAlmacenes, setStockAlmacenes] = useState([]);
  const [stockTotal, setStockTotal] = useState(0);
  const [avgTotal, setAvgTotal] = useState(0);
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [items, setItems] = useState([]);
  const [subtotal, setSubTotal] = useState(0.0);
  const [iva, setIva] = useState(0.0);
  const [cantMensual, setCantMensual] = useState(0.0);
  const [freProduct, setFreProduct] = useState(0.0);
  const [total, setTotal] = useState(0.0);
  const [totalDescuento, setTotalDescuento] = useState(0.0);
  const [rowsPerPageProduct] = useState(8);
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [datosPedidos, setDatosPedidos] = useState({ nombreProveedor: "", nombreAlmacen: "", fechaDocumento: new Date(), fechaEntrega: new Date(), });
  const [codigosPrincipales, setCodigosPrincipales] = useState([]);
  const [codigoConorque, setCodigoConorque] = useState([]);
  const [preciosHistorico, setPrecioHistorico] = useState([]);
  const [descripcion, setDescripcion] = useState([]);
  const [busqueda, setBusqueda] = useState(false);
  const [lectComentario, setLectComentario] = useState("");
  const [pageP, setPageP] = useState(0);
  const ventasMensuales = datosAnalisis;
  const ventas2024 = ventasMensuales.filter((venta) => venta.year === 2024);
  const ventas2025 = ventasMensuales.filter((venta) => venta.year === 2025);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Muestra una alerta de error y redirige al inicio en caso de fallo de autenticación.
   * La función muestra una alerta de error con el título "TIEMPO EXCEDIDO" y el texto "Vuelve a ingresar a la APP".
   * La alerta no tiene botón de confirmar y se cierra automáticamente después de 2200 milisegundos.
   * Luego, se redirige al usuario a la ruta "/" y se eliminan los items "token" y "expiracion" del localStorage.
   */
  const handleError = () => {
    Swal.fire({position: "center",icon: "error",title: "TIEMPO EXCEDIDO",text: "Vuelve a ingresar a la APP",showConfirmButton: false,timer: 2200,});
    navigate('/');
    localStorage.removeItem("token");
    localStorage.removeItem("expiracion");
  };

  /**
   * Muestra una alerta de aviso en caso de error en el sistema.
   * La alerta tiene un título "Cargando" y un texto "Espera unos segundos mientras arreglamos este problema."
   * La alerta no tiene botón de confirmar y se cierra automáticamente después de 2200 milisegundos.
   */
  const handleErrorSis = () => { Swal.fire({ position: "center", icon: "warning", title: "Cargando", text: "Espera unos segundos mientras arreglamos este problema.", showConfirmButton: false, timer: 2200, }); };
  const claseEstado = (idEstado) => {
    let sColor = "blanco"; switch (idEstado) {
      case "POR DESPACHAR": sColor = "tomate"; break;
      case "ENTREGADO":
        sColor = "azul";
        break;
      case "ALMACENADO":
        sColor = "verdeclaro";
        break;
      case "FACTURADO":
        sColor = "morado";
        break;
      case "PAGADO":
        sColor = "verde";
        break;
      default:
        break;
    }
    return sColor;
  };

  /**
   * Actualiza la cantidad autorizada de un item en la lista de items.
   * @param {number} newCantidad - La nueva cantidad autorizada.
   * @param {object} item - El item que se va a actualizar.
   */
  const handleCantidadChange = (newCantidad, item) => {
    const updatedItems = items.map((it) =>
      it.codigoPrincipal === item.codigoPrincipal
        ? { ...it, cantidadAutorizada: newCantidad }
        : it
    );
    setItems(updatedItems);
    actualizarTotales(updatedItems);
  };

  /**
   * Actualiza el precio unitario de un item en la lista de items.
   * @param {number} newPrecio - El nuevo precio unitario.
   * @param {object} item - El item que se va a actualizar.
   */
  const handlePrecioChange = (newPrecio, item) => {
    const updatedItems = items.map((it) =>
      it.codigoPrincipal === item.codigoPrincipal
        ? { ...it, precioUnitario: newPrecio }
        : it
    );
    setItems(updatedItems);
    actualizarTotales(updatedItems);
  };

  /**
   * Updates the current page number in the modal pagination.
   * @param {Event} event - The event that triggered the page change.
   * @param {number} newPage - The new page number to set.
   */

  const handleChangePageModal = (event, newPage) => {
    setPageP(newPage);
  };

  /**Cierra el modal de visualización de productos y limpia la lista de productos filtrados y el texto de búsqueda.*/
  const cerrarModalVisualizar = () => {
    setModalVisualizar(!modalVisualizar);
    setProductosFiltrados([]);
    setBusquedaTexto("");
  };

  /**Cierra el modal de análisis de productos y limpia el estado de la modal.*/
  const cerrarModalAnalisis = () => {
    setModalAnalisis(!modalAnalisis);
  };

  /**
   * Selecciona todos los productos que coinciden con el valor actual de "productosFiltrados" en su código principal o descripción.
   * @param {Event} event - Evento de selección.
   */

  const handleSelectAll = (event) => {
    if (!productos || !Array.isArray(productos)) {
      console.error("Productos no está definido como un array válido.");
      return;
    }

    const isChecked = event.target.checked;

    if (isChecked) {
      const filteredProductos = productos.filter(
        (item) =>
          item.codigoPrincipal.toLowerCase().includes(productosFiltrados) ||
          item.descripcion.toLowerCase().includes(productosFiltrados)
      );
      setProductosSeleccionados(filteredProductos);
    } else {
      setProductosSeleccionados([]);
    }
  };

  /**
   * Maneja el cambio de estado de un checkbox para un producto específico.
   * 
   * @param {Event} event - Evento del checkbox que indica el cambio de estado.
   * @param {Object} item - Producto asociado al checkbox cuyo estado ha cambiado.
   * 
   * - Si el checkbox está marcado, agrega el producto a la lista de productos seleccionados.
   * - Si el checkbox está desmarcado, elimina el producto de la lista de productos seleccionados.
   */

  const handleCheckboxChange = (event, item) => {
    const isChecked = event.target.checked;
    setProductosSeleccionados((prev) => {
      if (isChecked) {
        return [...prev, item];
      } else {
        return prev.filter((p) => p.codigoPrincipal !== item.codigoPrincipal);
      }
    });
  };


  /**
   * Agrega los productos seleccionados a la lista de items.
   * 
   * Selecciona los productos que no estén ya en la lista de items, les asigna un precio unitario inicializado en 0 y un precioBase igual al precio unitario del producto,
   * y los agrega a la lista de items. Limpia la lista de productos filtrados y el texto de búsqueda, y cierra el modal.
   */
  const agregarProductos = () => {
    const nuevosProductos = productosSeleccionados.filter(
      (nuevoProducto) =>
        !items.some(
          (item) => item.codigoPrincipal === nuevoProducto.codigoPrincipal
        )
    );
    const valor = nuevosProductos.map((item) => ({
      ...item,
      ocultarColumna: item.cantidad === 0,
      cantidadAutorizada: item.cantidad,
      id: 0,
      esPromocion: false,
    }));
    const productosRestantes = items.filter((item) =>
      productosSeleccionados.some(
        (productoSeleccionado) =>
          productoSeleccionado.codigoPrincipal === item.codigoPrincipal
      )
    );

    const nuevosItems = [...productosRestantes, ...valor];

    setItems(nuevosItems);
    actualizarTotales(nuevosItems);
    setModalVisualizar(!modalVisualizar);
    setBusquedaTexto("");
    setProductosFiltrados([]);
    setPageP(0);
    setBusquedaTexto("");
  };
  /**
   * Elimina un producto de la lista de items y de la lista de productos seleccionados.
   * @param {number} codigoPrincipal - El código principal del producto a eliminar.
   */
  const eliminarProducto = (codigoPrincipal) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.codigoPrincipal !== codigoPrincipal)
    );
    setProductosSeleccionados((prev) =>
      prev.filter((item) => item.codigoPrincipal !== codigoPrincipal)
    );
    const updatedItems = items.filter(
      (item) => item.codigoPrincipal !== codigoPrincipal
    );
    actualizarTotales(updatedItems);
  };

  const cancelarRegresar = () => {
    navigate(-1);
    sessionStorage.removeItem("datosOrden");
    sessionStorage.removeItem("codeSup");
  };

  const actualizarTotales = (aux_data) => {
    let aux_subtotal = 0.0;
    let aux_totaldesc = 0.0;
    let aux_iva = 0.0;
    aux_data.forEach((item) => {
      const descuentos =
        (parseFloat(item.precioUnitario) * parseFloat(item.descuento)) / 100;
      const valorDescuento = descuentos * parseFloat(item.cantidadAutorizada);
      const itemTotal =
        (parseFloat(item.precioUnitario) - descuentos) *
        parseFloat(item.cantidadAutorizada);
      aux_totaldesc += valorDescuento;
      aux_subtotal += itemTotal;
      aux_iva += (itemTotal * item.tarifa) / 100;
    });
    setTotalDescuento(aux_totaldesc.toFixed(2));
    setIva(aux_iva.toFixed(2));
    setSubTotal(aux_subtotal.toFixed(2));
    setTotal((aux_iva + aux_subtotal).toFixed(2));
  };

  /**
   * Obtiene los datos de la orden de compra actual desde la API.
   * @return {undefined}
   */
  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const numordenCompra = sessionStorage.getItem("datosOrden");
      const datos = await fetchApi({
        endPoint: `/purchaseorder/ordersqlserver/${numordenCompra}`,
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
    } else {
      handleError();
    }
  };

  /**
   * Mapea los datos de una orden de compra y los almacena en el estado.
   * @param {object} data - Contiene los datos de la orden de compra.
   * @return {undefined}
   */
  function getUnidadXCaja(item) {
    const key = Object.keys(item)
      .find(k => k.toLowerCase() === "unidadxcaja");
    return key ? item[key] : 1;
  }
  const ObtenerInformacion = (data) => {
    if (!data.details?.length) return;
    sessionStorage.setItem("codeSup", data.codigoProveedor);
  
    const valor = data.details.map(item => ({
      ...item,
      filtrado: false,
      ocultarColumna: data.estado === "PRE",
      precioBase: item.precioBase || item.precioUnitario,
      unidadXCaja: getUnidadXCaja(item)
    }));
  
    setItems(valor);
    setDatosPedidos(data);
    actualizarTotales(data.details);
  };

  const toggleModalComentario = () => setModalComentario((prev) => !prev);
  const abrirComentario = (data) => {
    setModalComentario(true);
    setLectComentario(data);
  };

  const [selectedOption, setSelectedOption] = useState({
    codigoPrincipal: null,
    codigoConorque: null,
    descripcion: null,
    descuentoFilter: "Todos",
    comentarios: "Todos",
  });

  const [isDisabled, setIsDisabled] = useState({
    codigoPrincipal: false,
    codigoConorque: false,
    descripcion: false,
    descuentoFilter: false,
    analisis: false,
    comentarios: false,
  });

  /**
   * Abre el modal de filtros y asigna los valores a los
   * selectores de c digo principal, c digo Conorque y
   * descripci n.
   */
  const abrirModalFiltros = () => {
    setModalFiltros(true);
    setCodigosPrincipales(items.map((product) => product.codigoPrincipal));
    setCodigoConorque(items.map((product) => product.codigoConorque));
    setDescripcion(items.map((product) => product.descripcion));
  };

  const toggleModalFiltros = () => setModalFiltros((prev) => !prev);

  const handleSwitchChange = (event, field) => {
    setSelectedOption((prev) => ({
      ...prev,
      [field]: event.target.checked ? "Con" : "Todos",
    }));
  };

  useEffect(() => {
    const {
      codigoPrincipal,
      codigoConorque,
      descripcion,
      descuentoFilter,
      comentarios,
    } = selectedOption;
    const anySelected =
      !!codigoPrincipal ||
      !!codigoConorque ||
      !!descripcion ||
      descuentoFilter !== "Todos" ||
      comentarios !== "Todos";
    setIsDisabled({
      codigoPrincipal: anySelected,
      codigoConorque: anySelected,
      descripcion: anySelected,
      descuentoFilter: anySelected,
      comentarios: anySelected,
    });
  }, [selectedOption]);

  /**
   * Cambia el valor de la opcion seleccionada en el estado.
   * 
   * @param {Event} event - Evento de cambio de switch.
   * @param {string} value - Valor que se va a asignar al campo.
   * @param {string} field - Campo que se va a cambiar en el estado.
   */
  const handleChange = (event, value, field) => {
    setSelectedOption((prev) => ({ ...prev, [field]: value }));
  };

  /*funcion para cargar documentos excel*/ 
  const popUpExcel = () => {
    Swal.fire({
      icon: "info",
      title: "NUEVO FORMATO",
      text: "Descargue la plantilla y cargue su Excel de sugeridos",
      confirmButtonText: "Cargar Excel",
      denyButtonText: "Descargar Plantilla",
      cancelButtonText: "Ver Tutorial",
      showDenyButton: true,
      showCancelButton: true,
      iconColor: '#06ac2e',
      customClass: {
        confirmButton: 'swal2-confirm-btn',
        denyButton: 'swal2-cancel-btn',
        cancelButton: 'swal2-cancel-btn'
      }
    }).then(result => {
      if (result.isConfirmed) {
        cargarExcel();
      } else if (result.isDenied) {
        descargarArchivo("sugeridos.xlsx");
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.open("https://youtu.be/7KOlYe5qkNI", "_blank");
      }
    });
  };

  // 2. Dispara el diálogo de archivo
  const cargarExcel = () => document.getElementById("fileInputDuplicado").click();
  // 3. Procesa el archivo y vuelca los items:


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    readDuplicadoExcel(file, (rows) => {
      try {
        const { nuevosItems: rawNuevos, alertas } = validateAndTransformDuplicado(rows);
  
setItems(prevItems => {
  const existing = new Set(prevItems.map(i => i.codigoPrincipal));
  const itemsAInsertar = rawNuevos
    .filter(r => !existing.has(r.codigoPrincipal))
    .map(raw => {
      const fuente = prevItems.find(i => i.codigoPrincipal === raw.codigoPrincipal)
                  || productos.find(p => p.codigoPrincipal === raw.codigoPrincipal);
      if (!fuente) return null;
      return {
        ...fuente,
        unidadXCaja: getUnidadXCaja(fuente),
        precioUnitario:     raw.precioUnitario,
        cantidadAutorizada: raw.cantidadAutorizada,
        descuento:          raw.descuento,
        comentario:         raw.comentario,
        esPromocion:        raw.esPromocion
      };
    })
    .filter(Boolean);

  const merged = [...prevItems, ...itemsAInsertar];
  actualizarTotales(merged);
  return merged;
});
  
        showDuplicadoAlerts(alertas);
      } catch (err) {
        Swal.fire("Error de formato", err.message, "error");
      }
    }, (err) => {
      Swal.fire("Error al leer el archivo", err.message || "Archivo no válido", "error");
    });
  };
  
  
  /**
   * Filtra los productos seg n las opciones seleccionadas.
   * 
   * Si se ha seleccionado un c digo principal, filtra los productos que no coinciden con ese c digo.
   * Si se ha seleccionado un c digo cono, filtra los productos que no coinciden con ese c digo.
   * Si se ha seleccionado una descripci n, filtra los productos que no coinciden con esa descripci n.
   * Si se ha seleccionado "Con" en el filtro de descuentos, filtra los productos que no tienen descuento.
   * 
   * Finalmente, asigna el resultado a items y cierra el modal de filtrado.
   */
  const filterProducts = () => {
    let filtered;

    if (selectedOption.codigoPrincipal) {
      filtered = items.map((product) => {
        if (product.codigoPrincipal !== selectedOption.codigoPrincipal) {
          return { ...product, filtrado: true };
        }
        return product;
      });
    }

    if (selectedOption.codigoConorque) {
      filtered = items.map((product) => {
        if (product.codigoConorque !== selectedOption.codigoConorque) {
          return { ...product, filtrado: true };
        }
        return product;
      });
    }

    if (selectedOption.descripcion) {
      filtered = items.map((product) => {
        if (product.descripcion !== selectedOption.descripcion) {
          return { ...product, filtrado: true };
        }
        return product;
      });
    }

    if (selectedOption.descuentoFilter === "Con") {
      filtered = items.map((product) => {
        if (product.descuento === 0) {
          return { ...product, filtrado: true };
        }
        return product;
      });
    }
    setItems(filtered);
    setModalFiltros(false);
  };

  /**
   * Resets the filtering state of products.
   *
   * - Sets the 'filtrado' property of each item to false.
   * - Resets the selected filter options to their default state.
   * - Closes the filter modal.
   */

  const cleanProducts = () => {
    const valor = items.map((item) => ({
      ...item,
      filtrado: false,
    }));

    setItems(valor);
    setSelectedOption({
      codigoPrincipal: null,
      codigoConorque: null,
      descripcion: null,
      descuentoFilter: "Todos",
      comentarios: "Todos",
    });
    setModalFiltros(false);
  };

  /**
   * Abre el modal de visualización con los productos y
   * los productos seleccionados actualmente.
   *
   * Verifica que el array de productos esté definido y sea
   * un array válido. Si no es así, muestra un mensaje de
   * error y no hace nada.
   *
   * - Setea los productos filtrados con el array de productos.
   * - Limpia el texto de búsqueda y el número de página.
   * - Filtra los productos seleccionados actualmente.
   * - Abre el modal de visualización.
   */
  const abrirModalVisualizar = () => {
    if (!productos || !Array.isArray(productos)) {
      console.error("Productos no está definido como un array válido.");
      return;
    }
    setProductosFiltrados(productos);
    setBusquedaTexto("");
    setPageP(0);
    const productosSeleccionadosActuales = productos.filter((producto) =>
      items.some((item) => item.codigoPrincipal === producto.codigoPrincipal)
    );
    setProductosSeleccionados(productosSeleccionadosActuales);
    setModalVisualizar(true);
  };

  // PETICIONES
  const getProductos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const codeSup = sessionStorage.getItem("codeSup");
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/items/${codeSup}`,
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
      productList(datos.datos);
    } else {
      handleError();
    }
  };

  /**
   * Asigna los productos obtenidos a los estados `productos` y `productosFiltrados` y
   * deshabilita el botón de "Guardar".
   * @param {Object[]} datosProductos - Los productos obtenidos de la API.
   */
  const productList = (datosProductos) => {
    const catalogo = datosProductos.map(p => ({
      ...p,
      unidadXCaja: getUnidadXCaja(p)
    }));
    setProductos(catalogo);
    setProductosFiltrados(catalogo);
    setIsButtonDisabled(false);
  };

  /**
   * Maneja las opciones de alerta seleccionadas por el usuario.
   *
   * Según la opción proporcionada, determina el tipo de requerimiento a procesar:
   * - "guardar": Establece el requerimiento a 1.
   * - "guardarActualizar": Establece el requerimiento a 2.
   * - Cualquier otra opción: Cierra la alerta sin realizar acciones adicionales.
   *
   * Después de procesar la opción, cierra la alerta y llama a la función `procesar`
   * con el requerimiento determinado.
   *
   * @param {string} option - La opción seleccionada por el usuario en la alerta.
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
        codigoAlmacen: datosPedidos.codigoAlmacen,
        nombreAlmacen: datosPedidos.nombreAlmacen,
        precioUnitario: parseFloat(item.precioUnitario),
        cantidad: parseFloat(item.cantidad),
        cantidadAutorizada: parseFloat(item.cantidadAutorizada),
        descuento: item.descuento,
        tarifa: item.tarifa,
        unidad: item.unidad,
        esPromocion: item.esPromocion,
        unidadXCaja: item.unidadXCaja,
        valor: Number(parseFloat(
          (parseFloat(item.precioUnitario) -
            (parseFloat(item.descuento) * parseFloat(item.precioUnitario)) /
            100) *
          parseFloat(item.cantidadAutorizada)
        ).toFixed(2)),
        comentario: item.comentario,
      }));

      const datos = {
        fechaContabilizacion: datosPedidos.fechaContabilizacion,
        fechaEntrega: datosPedidos.fechaEntrega,
        fechaDocumento: datosPedidos.fechaDocumento,
        subtotal: Number(parseFloat(subtotal).toFixed(2)),
        iva: Number(parseFloat(iva).toFixed(2)),
        total: Number(parseFloat(total).toFixed(2)),
        details: details,
      };
      try {
        const tokenId = localStorage.getItem("token");
        const response = await fetchApi({
          endPoint: `/purchaseorder/ordersqlserver/${datosPedidos.id}`,
          method: "PUT",
          paginacion: false,
          body: datos,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tokenId,
          },
        });
        if (response.error !== "Unexpected end of JSON input") {
          console.log("Unexpected end of JSON input")
        }
        if (response.error === 'Error 204') {
          if (requerimiento === 1) {
            await Swal.fire({
              title: "Cambios Guardados",
              html: '<i class="fas fa-check-circle" style="color:green;"></i>',
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
          } else if (requerimiento === 2) {
            console.log("paso por aqui")
            autorizar();
          }
        } else {
          Swal.fire({
            title: "Error",
            text: "Error al guardar los cambios",
            icon: "error",
          });
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
   * Autoriza un pedido de compra.
   *
   * Antes de autorizar, validamos la sesión del usuario y que el pedido tenga items.
   * Luego, se crea un array `details` con los items del pedido, incluyendo la cantidad
   * autorizada, el precio unitario y el descuento.
   *
   * Se muestra una alerta con un textarea para que el usuario ingrese el comentario
   * del pedido. Si el usuario confirma, se envía el pedido a HANA con los datos
   * correspondientes. Si hay un error, se muestra una alerta con el mensaje de error.
   *
   * @returns {Promise<void>}
   */
  const autorizar = async () => {
    try {
      const validado = await validacion();
      if (validado === 1) {
        if (!items || items.length === 0) { setLoading(false); return; }
        if (!datosPedidos) { setLoading(false); return; }
        const details = [];
        items.forEach((item) => {
          const cantidad = parseFloat(item.cantidadAutorizada);
          if (cantidad !== 0) { details.push({ itemCode: item.codigoConorque, quantity: cantidad, unitPrice: parseFloat(item.precioUnitario), discountPercent: item.descuento, warehouseCode: datosPedidos.codigoAlmacen, freeText: item.comentario, uoMCode: item.unidad, }); }
        });
        const tokenId = localStorage.getItem("token");
        const { value: comentario, isConfirmed } = await Swal.fire({
          input: "textarea",
          inputLabel: "COMENTARIO",
          inputPlaceholder: "Ingrese el comentario aquí...",
          inputAttributes: { "aria-label": "Ingrese el comentario aquí" },
          showCancelButton: true,
          confirmButtonText: "Guardar",
          confirmButtonColor: "#23bf07",
          cancelButtonText: "Cancelar",
          cancelButtonColor: "#d33",
        });
        if (isConfirmed) {
          const datos = {
            idOrdenCompra: datosPedidos.id,
            cardCode: datosPedidos.codigoProveedor,
            cardName: datosPedidos.nombreProveedor,
            docDate: datosPedidos.fechaContabilizacion,
            docDueDate: datosPedidos.fechaEntrega,
            taxDate: datosPedidos.fechaContabilizacion,
            slpCode: datosPedidos.codigoAsesor,
            comments: comentario || "",
            documentLines: details,
          };
          setLoading(true);
          const response = await fetchApi({
            endPoint: `/purchaseorder/orderhana`,
            method: "POST",
            paginacion: false,
            body: datos,
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + tokenId,
            },
          });


          if (response.error) {
            const errorLines = response.error.split("<br>");
            const formattedErrors = errorLines.map((line) => {
              const regex = /DocumentLines\[\d+\]\.(\w+):/;
              const match = line.match(regex);
              if (match) {
                const field = match[1];
                return `${field}: ${line.split(":")[1]}`;
              }
              return line;
            });
            const formattedMessage = formattedErrors.join("<br>");
            Swal.fire({ icon: "error", title: "ERROR", html: formattedMessage, showConfirmButton: true }); return;
          }/*
            if (response.error?.includes("orden de compra ya existe")) {
              setLoading(false);
              Swal.fire({
                title: "Pedido ya autorizado",
                text: "La orden ya estaba creada y ya quedó autorizada.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500
              });
              cancelarRegresar();  // tu navegación hacia atrás
              return;
            }
            
            // 2) Si hay otro error, lo mostramos normalmente
            if (response.error) {
              Swal.fire({
                title: "Error",
                text: response.error,
                icon: "error"
              });
              setLoading(false);
              return;
            }
            
            // 3) Si no hay error, sigue tu flujo habitual
            setLoading(false);
            Swal.fire({
              title: "Pedido Autorizado",
              icon: "success",
              showConfirmButton: false,
              timer: 1500
            });
            cancelarRegresar();*/
          if (isNaN(response.datos)) {
            Swal.fire({ icon: "error", title: "ERROR", text: datos, showConfirmButton: true });
            setLoading(false);
          } else {
            setLoading(false);
            Swal.fire({ title: "Pedido Autorizado", text: datos, html: '<i class="fas fa-check-circle" style="color:green;"></i>', icon: "success", showConfirmButton: false, timer: 1500 });
            cancelarRegresar();
          }
        } else {
          console.log("Cancelado");
        }
      } else {
        handleError();
        setLoading(false);
      }
    } catch (responseData) {
      console.error("Error al enviar el pedido: ", responseData);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  /**
   * Anula una orden de compra.
   * @param {number} datoId - El ID de la orden a anular.
   * @returns {Promise<void>}
   */
  const anular = async (datoId) => {
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

        if (isConfirmed) {
          const datos = {
            comentario: comentario || "",
          };

          const response = await fetchApi({
            endPoint: `/purchaseorder/ordersqlserver/cancelled/${datoId}`,
            method: "PUT",
            paginacion: false,
            body: datos,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenId}`,
            },
          });

          // Verificar si el error es "Error 204", lo cual indicaría éxito sin contenido
          if (response.error === "Error 204") {
            Swal.fire({
              title: "Orden Anulada",
              text: "La orden ha sido procesada con éxito.",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
          } else if (response.error) {
            Swal.fire({ title: "Error", text: response.error, icon: "error" });
          } else {
            Swal.fire({ title: "Orden Anulada", text: "La orden ha sido procesada con éxito.", icon: "success", showConfirmButton: false, timer: 1500 });
          }
        } else {
          console.log("Cancelado por el usuario.");
        }
      } else {
        handleError();
      }
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      setLoading(false);

      // Mostrar un SweetAlert con el mensaje de error capturado
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al intentar anular el pedido. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  /**
   * Descarga un archivo Excel con la lista de productos del pedido.
   * @returns {void}
   */
  const descargarExcel = () => {
    const details = items.map((item) => ({
      id: item.id,
      codigoConorque: item.codigoConorque,
      codigoPrincipal: item.codigoPrincipal,
      descripcion: item.descripcion,
      codigoAlmacen: datosPedidos.codigoAlmacen,
      nombreAlmacen: datosPedidos.nombreAlmacen,
      precioUnitario: parseFloat(item.precioUnitario),
      cantidad: parseFloat(item.cantidad),
      cantidadAutorizada: parseFloat(item.cantidadAutorizada),
      descuento: item.descuento,
      tarifa: item.tarifa,
      unidad: item.unidad,
      valor: Number(parseFloat(
        (parseFloat(item.precioUnitario) -
          (parseFloat(item.descuento) * parseFloat(item.precioUnitario)) /
          100) *
        parseFloat(item.cantidadAutorizada)
      ).toFixed(2)),
      comentario: item.comentario,
    }));

    const filteredData = details.map(item => ({
      "Código Conorque": item["codigoConorque"],
      "Código Barras": item["codigoPrincipal"],
      "Descripción": item["descripcion"],
      "Precio Actual": item["precioUnitario"],
      "cantidadAutorizada": item["cantidadAutorizada"],
      "descuento": item["descuento"],
      "comentario": item["comentario"],
    }));
    exportToExcel(filteredData);
  }

  /**
   * Exporta los datos de la orden a un archivo Excel con la lista de productos del pedido.
   * @param {Array<Object>} data - La lista de productos a exportar.
   * @returns {void}
   */
  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: ["Código Conorque", "Código Barras", "Descripción", "Precio Actual", "cantidadAutorizada", "descuento", "comentario"]
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SUGERIDO");

    XLSX.writeFile(workbook, "sugeridos.xlsx")
  }

  /**
   * Obtiene el histórico de precios más recientes para un producto específico.
   *
   * Realiza una validación de usuario y, si es exitosa, se conecta al API para 
   * recuperar el precio más reciente de compra del producto especificado por 
   * 'codigoConorque'. Los datos recuperados se almacenan en el estado para 
   * su visualización en un modal.
   *
   * @async
   * @param {Object} item - El objeto del producto que contiene el código 'codigoConorque'.
   * @returns {Promise<void>}
   */

  const historicoPrecios = async (item) => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const itemCode = item.codigoConorque;
      const response = await fetchApi({
        endPoint: `/purchaseinvoice/lastestpurchasesprice/${datosPedidos.codigoProveedor}?itemCode=${itemCode}`,
        method: "GET",
        paginacion: false,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenId,
        },
      });
      if (response.error) {
        handleErrorSis(response.error);
        return;
      }
      setPrecioHistorico(response.datos);
      setModalPrecios(true);
      setNombrePrecio(item);
    } else {
      handleError();
    }
  };
  /**
   * Cierra el modal de precios.
   *
   * Establece el estado `modalPrecios` como `false` para ocultar el modal
   * de precios, utilizado generalmente para visualizar el histórico de precios.
   */

  const cerrarModalPrecios = () => {
    setModalPrecios(false);
  };

  /**
   * Analiza las ventas del producto especificado.
   * Realiza una validación de usuario y, si es exitosa, se conecta al API para
   * recuperar los datos de ventas mensuales, promedio de compras, promedio de
   * ventas, cantidad de pedidos mensuales y stock actual para el producto
   * especificado por 'codigoConorque'. Los datos recuperados se almacenan en el
   * estado para su visualización en un modal.
   *
   * @async
   * @param {Object} datos - El objeto del producto que contiene el código
   *                         'codigoConorque'.
   * @returns {Promise<void>}
   */
  const analisisVentas = async (datos) => {
    setModalAnalisis(!modalAnalisis);
    const validado = await validacion();
    if (validado === 1) {
      const data = datos.codigoConorque;
      const nombre = datos;
      setNombreProducto(nombre);
      const tokenId = localStorage.getItem("token");
      const codeSup = sessionStorage.getItem("codeSup");
      const proveedor = (datosPedidos.codigoProveedor).slice(2);

      const urls = [
        {
          endPoint: `/salesinvoice/monthlysales/${codeSup}?itemCode=${data}&whsCode=${datosPedidos.codigoAlmacen}`,
          setter: setDatosAnalisis,
        },
        {
          endPoint: `/purchaseinvoice/averagepurchases/${codeSup}?itemCode=${data}&whsCode=${datosPedidos.codigoAlmacen}`,
          setter: setPromedioCompras,
        },
        {
          endPoint: `/salesinvoice/averagesales/${codeSup}?itemCode=${data}&whsCode=${datosPedidos.codigoAlmacen}`,
          setter: setPromedioVentas,
        },
        {
          endPoint: `/purchaseorder/countorderscurrentmonth/${codeSup}?itemCode=${data}&whsCode=${datosPedidos.codigoAlmacen}`,
          setter: setCantMensual,
        },
        {
          endPoint: `/purchaseorder/orderscurrentmonth/${codeSup}?itemCode=${data}&whsCode=${datosPedidos.codigoAlmacen}`,
          setter: pedidosTablaMensual,
        },
        {
          endPoint: `/warehouse/stockwarehouse/${codeSup}?itemCode=${data}&whsCode=${datosPedidos.codigoAlmacen}`,
          setter: almacenesStock,
        },
        {
          endPoint: `/supplier/${proveedor}`,
          setter: (datos) => {
            setFreProduct(datos);
          },
        },

      ];

      for (const { endPoint, setter } of urls) {
        try {
          const datos = await fetchApi({
            endPoint, method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenId}`,
            },
            paginacion: false,
          });

          if (datos.error) {
            console.error(`Error: ${datos.error}`);
            continue;
          }
          setter(datos.datos);
        } catch (error) {
          console.error("Network error:", error);
        }
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
    const stockFiltrado = stock.filter((item) => item.whsActual === 1);
    const totalOnHand = stock.reduce((total, item) => {
      if (item.onHand && typeof item.onHand === "string") {
        const onHandValue = parseFloat(item.onHand.slice(0, -2));
        if (!isNaN(onHandValue)) {
          return total + onHandValue;
        }
      }
      return total;
    }, 0);

    const totalPromedio = stock.reduce((totalAvg, item) => {
      if (item.avgSales && typeof item.avgSales === "string") {
        const avgSalesValue = parseFloat(item.avgSales.slice(0, -2));
        if (!isNaN(avgSalesValue)) {
          return totalAvg + Math.abs(avgSalesValue);
        }
      }
      return totalAvg;
    }, 0);

    if (stockFiltrado.length > 0) {
      const stockActualValor = stockFiltrado[0];
      setStockActual(stockActualValor);
      setStockAlmacenes(stock);
      setStockTotal(totalOnHand.toFixed(2));
      setAvgTotal(totalPromedio);
    } else {
      console.error("No se encontró stock con whsActual=1");
    }
  };

  /**
   * Asigna el valor de 'datos' al estado 'pedidosTabla' para su visualización
   * en la tabla de pedidos mensuales.
   *
   * @param {Object[]} datos - El array de objetos que contiene la información
   *                           de los pedidos mensuales.
   * @returns {void}
   */
  const pedidosTablaMensual = (datos) => {
    setPedidosTabla(datos);
  };

  /**
   * Maneja el cambio de búsqueda en la tabla de productos.
   * @param {Event} event - Evento de cambio de búsqueda.
   * - Actualiza el estado de búsqueda con el texto ingresado.
   * - Filtra los productos con el texto de búsqueda.
   */
  const handleBusqueda = (event) => {
    setBusqueda(event.target.value === "true");
    filtrarProductos(busquedaTexto, event.target.value === "true");
  };

  /**
   * Maneja el cambio de búsqueda en la tabla de productos.
   * @param {Event} event - Evento de cambio de búsqueda.
   * - Actualiza el estado de búsqueda con el texto ingresado.
   * - Filtra los productos con el texto de búsqueda.
   */
  const handleSearchProduct = (event) => {
    const searchText = event.target.value.toLowerCase();
    setBusquedaTexto(searchText);
    filtrarProductos(searchText, busqueda);
  };

  /**
   * Filtra los productos según el texto de búsqueda ingresado.
   * @param {string} searchText - Texto de búsqueda.
   * @param {boolean} buscarPorCodigo - Indica si se debe filtrar por código o descripción.
   * - Si es true, filtra los productos por código.
   * - Si es false, filtra los productos por descripción.
   * - Actualiza el estado de productosFiltrados con los productos filtrados.
   * - Actualiza el estado de la página a 0.
   */
  const filtrarProductos = (searchText, buscarPorCodigo) => {
    const filtrados = productos.filter((item) =>
      buscarPorCodigo
        ? item.codigoPrincipal.toLowerCase().includes(searchText)
        : item.descripcion.toLowerCase().includes(searchText)
    );
    setProductosFiltrados(filtrados);
    setPageP(0);
  };

  const [selectedRows, setSelectedRows] = useState([]);

  /**
   * Maneja la selección de una fila en la tabla de productos.
   * @param {number} index - Índice de la fila seleccionada.
   * - Si la fila ya está seleccionada, la quita de la selección.
   * - Si la fila no está seleccionada, la agrega a la selección.
   * - Actualiza el estado de selectedRows con la selección actual.
   */
  const handleRowSelect = (index) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((row) => row !== index)
        : [...prevSelected, index]
    );
  };

  /**
   * Desplaza el scroll de la sección con la clase "inicio_pedido" hasta el principio, de manera suave* @function
   */
  const scrollToTop = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  const regresar = () => {
    navigate(-1);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const checkCodeSup = () => {
      const codeSup = sessionStorage.getItem("codeSup");
      if (codeSup) {
        clearInterval(interval);
        getProductos();
      } else {
        console.log("Esperando codeSup...");
      }
    };
    const interval = setInterval(checkCodeSup, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <input
        type="file"
        id="fileInputDuplicado"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Container className="inicio_pedido" fluid>
        <div className="panel">
          <div className="panel-title">
            <HeaderOrden titulo={`ORDEN COMPRA N°${datosPedidos.id}`} 
            onRegresar={regresar} 
            onAbrirFiltros={abrirModalFiltros} 
            onAgregarProducto={abrirModalVisualizar} 
            onDescargarExcel={descargarExcel} 
            onCargarExcel={popUpExcel}
            onDescargarPlantilla={() => descargarArchivo("sugeridos.xlsx")}
            />
          </div>
          <DetallePedido datosPedidos={datosPedidos} />
        </div>
        <div className="panel">
          <TablaProductos items={items} selectedRows={selectedRows} handleRowSelect={handleRowSelect} handleCantidadChange={handleCantidadChange} handlePrecioChange={handlePrecioChange} historicoPrecios={historicoPrecios} eliminarProducto={eliminarProducto} abrirComentario={abrirComentario} analisisVentas={analisisVentas} datosPedidos={datosPedidos} selectedOption={selectedOption} />
        </div>
        <ResumenPedido subtotal={subtotal} totalDescuento={totalDescuento} iva={iva} total={total} showAlert={showAlert} handleAlertOption={handleAlertOption} setShowAlert={setShowAlert} anular={anular} datosPedidos={datosPedidos} loading={loading} scrollToTop={scrollToTop} scrollToBottom={scrollToBottom} />
      </Container>
      <ModalVisualizar isOpen={modalVisualizar} onClose={cerrarModalVisualizar} busquedaTexto={busquedaTexto} handleSearchProduct={handleSearchProduct} busqueda={busqueda} handleBusqueda={handleBusqueda} productosSeleccionados={productosSeleccionados} productos={productos} handleSelectAll={handleSelectAll} productosFiltrados={productosFiltrados} pageP={pageP} rowsPerPageProduct={rowsPerPageProduct} handleChangePageModal={handleChangePageModal} handleCheckboxChange={handleCheckboxChange} agregarProductos={agregarProductos} />
      <ModalAnalisis isOpen={modalAnalisis} onClose={cerrarModalAnalisis} nombreProducto={nombreProducto} promedioVentas={promedioVentas} promedioCompras={promedioCompras} cantMensual={cantMensual} freProduct={freProduct} stockActual={stockActual} ventas2024={ventas2024} ventas2025={ventas2025} pedidosTabla={pedidosTabla} stockAlmacenes={stockAlmacenes} stockTotal={stockTotal} avgTotal={avgTotal} claseEstado={claseEstado} />
      <ModalComentario isOpen={modalComentario} onClose={toggleModalComentario} lectComentario={lectComentario} />
      <ModalFiltros isOpen={modalFiltros} onClose={toggleModalFiltros} codigosPrincipales={codigosPrincipales} codigoConorque={codigoConorque} descripcion={descripcion} isDisabled={isDisabled} selectedOption={selectedOption} handleChange={handleChange} handleSwitchChange={handleSwitchChange} filterProducts={filterProducts} cleanProducts={cleanProducts} />
      <ModalPrecios isOpen={modalPrecios} onClose={cerrarModalPrecios} nombrePrecio={nombrePrecio} preciosHistorico={preciosHistorico} />
    </>
  );
}