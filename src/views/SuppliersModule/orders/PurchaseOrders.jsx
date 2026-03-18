import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Swal from "sweetalert2";
import Stack from "@mui/material/Stack";
import { validacion } from "../../../utils/apiUtils";
import fetchApi from "../../../utils/fechtData";
import { descargarArchivo } from "../../../utils/descargarPlantilla"; 
import { readExcelFile, validateAndTransform, showAlertsIfNeeded } from '../../../utils/excelProcessor';
import Container from "../../../components/Container";
import "../../../css/ComponentesAdicionales/Tabla.css";
import "../../../css/Proveedores/OrderSupplier.css";
import ModalComentarios from "../../../components/Purchase Orders/ModalComentarios";
import ModalVisualizarPurchase from "../../../components/Purchase Orders/ModalVisualizarPurchase";
import TablaPurchase from "../../../components/Purchase Orders/TablaPurchase";
import ModalStock from "../../../components/Purchase Orders/ModalStock";
/**
 * Componente que gestiona las órdenes de compra del proveedor.
 * Permite cargar productos manualmente o desde un archivo Excel,
 * aplicar descuentos y calcular totales.
 */
export default function OrderSupplier() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

   // Datos del usuario extraídos del estado global (Redux)
  const CardCode = useSelector(
    (state) => state.auth.datos_Usuario?.CARDCODE ?? ""
  );
  const CardName = useSelector(
    (state) => state.auth.datos_Usuario?.CARDNAME ?? ""
  );
  const SlpName = useSelector(
    (state) => state.auth.datos_Usuario?.SLPNAME ?? ""
  );
  const SlpCode = useSelector(
    (state) => state.auth.datos_Usuario?.SLPCODE ?? ""
  );
  const navigate = useNavigate();
  
 // Estados locales del componente 
  const [datosSucursal, setDatosSucursal] = useState([]);
  const [sucursal, setSucursal] = useState({ whsCode: "", whsName: "" });
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [modalComentarios, setModalComentarios] = useState(false);
  const [archivoSubido, setArchivoSubido] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [items, setItems] = useState([]);
  const [subtotal, setSubTotal] = useState(0.0);
  const [iva, setIva] = useState(0.0);
  const [total, setTotal] = useState(0.0);
  const [totalDescuento, setTotalDescuento] = useState(0.0);
  const formatDate = (date) => date.toISOString().substr(0, 10);
  const today = new Date();
  const [entrega, setEntrega] = useState(formatDate(today));
  const [page, setPage] = useState(0);
  const [pageP, setPageP] = useState(0);
  const [rowsPerPageProduct] = useState(9);
  const [comentario, setComentario] = useState("");
  const [productoNombre, setProductoNombre] = useState("");
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [busqueda, setBusqueda] = useState(false);
  const [tipoOrden, setTipoOrden] = useState(false)
  const [modalAnalisis, setModalAnalisis] = useState(false);
  const [datosStockAlmacenes, setDatosStockAlmacenes] = useState([]);
  const [nombreProductoAnalisis, setNombreProductoAnalisis] = useState("");
  const [analizarStockStatus, setAnalizarStockStatus] = useState("NO");

  const tiposOrden = [
    { label: "NORMAL", value: false },
    { label: "ESPECIAL", value: true }
  ];

  const handleTipoOrden = (e) => {
    setTipoOrden(e.target.value)
    console.log("tipo", e.target.value)
  };

    /**
   * Maneja errores de autenticación, mostrando una alerta y redirigiendo a la página de login.
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

  const handleSucursal = (event) => {
    const nombreSucursal = event.target.value;
    const sucursalSeleccionada = datosSucursal.find(
      (suc) => suc.whsName === nombreSucursal
    );
    setSucursal(sucursalSeleccionada || { whsCode: "", whsName: "" });
  };

  const resetAutocomplete = () => {
    setSucursal({ whsCode: "", whsName: "" });
  };

  const handleInicioChange = (e) => {
    setEntrega(formatDate(new Date(e.target.value)));
  };

  const abrirComentarios = (_datos) => {

    setProductoNombre(_datos);
    setModalComentarios(true);
  };

  const handleComentario = (e) => {
    setComentario(e.target.value);
  };

  

  const agregarComentario = () => {
    setModalComentarios(false);
    // Si el comentario es "0" o 0, establecerlo como cadena vacía
    const comentarioFinal = comentario === "0" || comentario === 0 ? "" : comentario;
    /*const updatedItems = items.map((it) =>
      it.descripcion === productoNombre ? { ...it, comentario: comentarioFinal } : it
    );*/
    const updatedItems = items.map((it) =>
    it.descripcion.trim().toUpperCase() === productoNombre.trim().toUpperCase()
      ? { ...it, comentario: comentarioFinal }
      : it
    );
    setItems(updatedItems);
    setComentario("");
  };


  useEffect(() => {
    if (modalComentarios) {
      const itemComentario =
        items.find((it) => it.descripcion === productoNombre)?.comentario || "";
      setComentario(itemComentario);
    }
  }, [modalComentarios, productoNombre, items]);

  const cerrarModalComentarios = () => {
    setModalComentarios(!modalComentarios);
  };

  const popUpExcel = () => {
    Swal.fire({
      icon: "info",
      title: "NUEVO FORMATO",
      text: "Vea el video Tutorial y Descargue la Nueva Plantilla",
      confirmButtonText: "Cargar Excel",
      denyButtonText: "Descargar Plantilla",
      cancelButtonText: "Ver Tutorial",
      showDenyButton: true,
      showCancelButton: true,
      buttonsStyling: true,
      iconColor: '#06ac2e',
      customClass: {
        confirmButton: 'swal2-confirm-btn',
        denyButton: 'swal2-cancel-btn',
        cancelButton: 'swal2-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        cargarExcel();
      } else if (result.isDenied) {
        descargarArchivo("plantilla.xlsx")

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.open("https://youtu.be/7KOlYe5qkNI", "_blank");
        console.log("Cargando video tutorial")
      }
    });
  };

  const cargarExcel = () => document.getElementById("fileInput").click();


//////////////// analisis de ventas //////////////

  const analisisVentas = async (item) => {
  const validado = await validacion();
  if (validado === 1) {
    const data = item.codigoConorque;
    setNombreProductoAnalisis(item.descripcion);
    
    const tokenId = localStorage.getItem("token");
    const codeSup = sessionStorage.getItem("codeSup");
    const proveedor = (CardCode).slice(2); 
    try {
    const resStock = await fetchApi({
      endPoint: `/warehouse/stockwarehouse/${codeSup}?itemCode=${data}&whsCode=${sucursal.whsCode}`,
      method: "GET",
      headers: { Authorization: `Bearer ${tokenId}` },
      paginacion: false,
    });

      const resProv = await fetchApi({
        endPoint: `/supplier/${proveedor}`,
        method: "GET",
        headers: { Authorization: `Bearer ${tokenId}` },
        paginacion: false,
      });

      if (!resStock.error) {
        const bodegasExcluidas = ["05", "06", "12", "17"];
        
        const stockFiltrado = resStock.datos
          .filter((bodega) => !bodegasExcluidas.includes(bodega.whsCode))
          .map((bodega) => {
            // Convertimos a número para asegurar la comparación
            const stockActual = parseFloat(bodega.onHand) || 0;
            
            return {
              ...bodega,
              // Si es menor a 0, ponemos "0", de lo contrario dejamos el valor original
              onHand: stockActual < 0 ? "0" : bodega.onHand 
            };
          });
        
        setDatosStockAlmacenes(stockFiltrado);
      }
      if (!resProv.error) setAnalizarStockStatus(resProv.datos.checkStock);

      setModalAnalisis(true);
    } catch (error) {
      console.error("Error en análisis:", error);
    }
  } else {
    handleError();
  }
};

/////////////////////////////////////

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    readExcelFile(
      file,
      (json) => {
        try {
          const { nuevosProductos, alertas, duplicateAlerts } =
            validateAndTransform(json, productos);
  
          // ——>>> NUEVA LÓGICA DE PROMOCIÓN <<<——
          const productosConPromo = nuevosProductos.map(p => ({
            ...p,
            esPromocion: parseFloat(p.descuento) > 0
          }));
   
          const nuevosItems = [
            ...items.filter(({ codigoPrincipal }) =>
              !productosConPromo.some(prod => prod.codigoPrincipal === codigoPrincipal)
            ),
            ...productosConPromo
          ];
  
          setItems(nuevosItems);
          setProductosSeleccionados(productosConPromo);
          actualizarTotales(nuevosItems);
          console.log(">>> alertas:", alertas, ">>> duplicateAlerts:", duplicateAlerts);
          showAlertsIfNeeded(alertas, duplicateAlerts);
          setArchivoSubido(true);
        } catch (error) {
          Swal.fire('Error de formato', error.message, 'error');
        }
      },
      (error) => {
        Swal.fire('Error al leer el archivo', error.message || 'Archivo no válido', 'error');
      }
    );
  };


  const getSucursales = async () => {
    const validado = await validacion();
    if (validado === 1) {
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
    } else {
      handleError();
    }
  };

    /**
   * Obtiene la lista de productos disponibles desde la API.
   */
  const getProductos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");

      const datos = await fetchApi({
        endPoint: `/items/${CardCode}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenId}`,
        },
        paginacion: false,
      });

      if (datos.error) {
        handleErrorSis(datos.error);
        return;
      }
      setProductos(datos.datos);
    } else {
      handleError();
    }
  };

  // FUNCIONES MODAL
  const handleCheckboxChange = (event, item) => {
    const isChecked = event.target.checked;
    setProductosSeleccionados((prev) =>
      isChecked
        ? [...prev, item]
        : prev.filter((p) => p.codigoPrincipal !== item.codigoPrincipal)
    );
  };

  const handlePromocion = (event, item) => {
    const updatedItems = items.map((it) =>
      it.codigoPrincipal === item.codigoPrincipal
        ? { ...it, esPromocion: event.target.checked }
        : it
    );
    setItems(updatedItems);
  };

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    setProductosSeleccionados(
      isChecked
        ? productos.filter(
          (item) =>
            item.codigoPrincipal.toLowerCase().includes(productosFiltrados) ||
            item.descripcion.toLowerCase().includes(productosFiltrados)
        )
        : []
    );
  };

  const agregarProductos = () => {
    const nuevosProductos = productosSeleccionados.filter(
      (nuevoProducto) =>
        !items.some(
          (item) => item.codigoPrincipal === nuevoProducto.codigoPrincipal
        )
    );

    const nuevosProductosConPrecioInicializado = nuevosProductos.map(
      (nuevoProducto) => ({
        ...nuevoProducto,
        // precioUnitario: 0,
        precioBase: nuevoProducto.precioUnitario,
        esPromocion: false,
      })
    );

    const nuevosItems = [
      ...items.filter((item) =>
        productosSeleccionados.some(
          (productoSeleccionado) =>
            productoSeleccionado.codigoPrincipal === item.codigoPrincipal
        )
      ),
      ...nuevosProductosConPrecioInicializado,
    ];

    setItems(nuevosItems);
    setProductosFiltrados([]);
    setPageP(0);
    setBusquedaTexto("");
    setModalVisualizar(false);
  };

  const openModal = () => {
    setModalVisualizar(true);
    setProductosFiltrados(productos);
    setBusquedaTexto("");
    setPageP(0);
  };

  const cerrarProductos = () => {
    setProductosFiltrados([]);
    setModalVisualizar(false);
  };

  //FUNCIONES PAGINA INICIAL
  
    /**
   * Actualiza los valores de subtotal, IVA y total basados en los productos seleccionados.
   * @param {Array} productosSeleccionados - Lista de productos en la orden.
   */
  const actualizarTotales = (aux_data) => {
    let aux_subtotal = 0.0;
    let aux_totaldesc = 0.0;
    let aux_iva = 0.0;

    aux_data.forEach((item) => {
      const precioUnitario = parseFloat(item.precioUnitario);
      const descuento = parseFloat(item.descuento);
      const cantidad = parseFloat(item.cantidad);

      const descuentos = (precioUnitario * descuento) / 100;
      const valorDescuento = descuentos * cantidad;
      const itemTotal = (precioUnitario - descuentos) * cantidad;
      aux_totaldesc += valorDescuento;
      aux_subtotal += itemTotal;
      aux_iva += (itemTotal * item.tarifa) / 100;
    });

    const subtotalFormatted = aux_subtotal.toFixed(2);
    const totalDescuentoFormatted = aux_totaldesc.toFixed(2);
    const ivaFormatted = aux_iva.toFixed(2);
    const totalFormatted = (aux_subtotal + aux_iva).toFixed(2);

    setSubTotal(subtotalFormatted);
    setTotalDescuento(totalDescuentoFormatted);
    setIva(ivaFormatted);
    setTotal(totalFormatted);
  };

  const handlePrecioChange = (newPrecio, item) => {
    const updatedItems = items.map((it) =>
      it.codigoPrincipal === item.codigoPrincipal
        ? { ...it, precioUnitario: newPrecio }
        : it
    );
    setItems(updatedItems);
    actualizarTotales(updatedItems);
  };

  const handleCantidadChange = (newCantidad, item) => {
    const updatedItems = items.map((it) =>
      it.codigoPrincipal === item.codigoPrincipal
        ? { ...it, cantidad: newCantidad }
        : it
    );
    setItems(updatedItems);
    actualizarTotales(updatedItems);
  };

  const handleDescuentoChange = (newDescuento, item) => {
    const updatedItems = items.map((it) =>
      it.codigoPrincipal === item.codigoPrincipal
        ? { ...it, descuento: newDescuento }
        : it
    );
    setItems(updatedItems);
    actualizarTotales(updatedItems);
  };
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

  async function getUserIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error al obtener la IP del usuario:", error);
      return null;
    }
  }

  const enviarDatos = async () => {
    try {
      const validado = await validacion();
      if (validado !== 1) {
        handleError();
        return;
      }

      if (!sucursal.whsCode || items.length === 0) {
        await Swal.fire({
          title: "Falta Información",
          html: '<i class="fas fa-check-circle" style="color:red;">Debe seleccionar Sucursal y mínimo 1 Producto</i>',
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      const [fechActual, fechEntrega] = [new Date().toISOString(), new Date(entrega).toISOString()];
      const codigosRepetidos = obtenerCodigosRepetidos(items);
      const productosPrecio = obtenerProductosPrecio(productos);
      const { detallesValidos, alertas } = procesarItems(items, productosPrecio, codigosRepetidos);

      if (alertas.length > 0) {
        await mostrarAlertas(alertas);
        return;
      }

      const confirmacion = await confirmarEnvio();
      if (confirmacion.isConfirmed) {
        await enviarPedido(detallesValidos, fechActual, fechEntrega);
      } else {
        console.log("El usuario canceló");
      }
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      mostrarError();
    }
  };

  const obtenerCodigosRepetidos = (items) => {
    const codigos = items.map((item) => item.codigoConorque);
    return codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index);
  };

  const obtenerProductosPrecio = (productos) =>
    productos.map(({ codigoPrincipal, precioUnitario }) => ({
      codigoPrincipal,
      precioBase: parseFloat(precioUnitario),
    }));

  const procesarItems = (items, productosPrecio, codigosRepetidos) => {
    const detallesValidos = [];
    const alertas = [];

    items.forEach((item) => {
      console.log("items", items)
      const precioProducto = productosPrecio.find((p) => p.codigoPrincipal === item.codigoPrincipal);
      const { precioConDescuento, precioTotalProducto } = calcularPrecios(item);

      if (!precioProducto) {
        console.log("Producto no encontrado:", item.codigoPrincipal);
        return;
      }

      if (item.esPromocion === false) {
        item.comentario = "";
        item.descuento = 0.0000;
      }
      const advertencias = [];
      const parseDescuento = parseFloat(item.descuento)
      const comentarioStr = String(item.comentario || "");

      if (item.esPromocion && (!comentarioStr || comentarioStr.trim() === "") && (parseDescuento < 0.09)) {
        advertencias.push("Promoción activada pero sin datos");
      }

      if (precioConDescuento > precioProducto.precioBase + 0.002) {
        advertencias.push("Precio fuera del rango permitido");
      }

      if (codigosRepetidos.includes(item.codigoConorque)) {
        advertencias.push("Código repetido");
      }

      if (advertencias.length > 0) {
        alertas.push(crearAlerta(item, advertencias));
      } else {
        detallesValidos.push(crearDetalle(item, sucursal, precioTotalProducto));
      }
    });

    return { detallesValidos, alertas };
  };

  const calcularPrecios = (item) => {
    const precioConDescuento = parseFloat(item.precioUnitario) * (1 - parseFloat(item.descuento) / 100);
    const precioConIva = precioConDescuento * (1 + parseFloat(item.tarifa) / 100);
    const precioTotalProducto = (precioConIva * parseFloat(item.cantidad)).toFixed(2);
    return { precioConDescuento, precioTotalProducto };
  };

  const crearAlerta = (item, mensajes) => ({
    codigo: item.codigoPrincipal,
    descripcion: item.descripcion,
    advertencias: mensajes.join(", "),
  });

  const crearDetalle = (item, sucursal, precioTotalProducto) => ({
    codigoConorque: item.codigoConorque,
    codigoPrincipal: item.codigoPrincipal,
    descripcion: item.descripcion,
    codigoAlmacen: sucursal.whsCode,
    nombreAlmacen: sucursal.whsName,
    cantidad: parseFloat(item.cantidad),
    precioUnitario: parseFloat(item.precioUnitario),
    descuento: parseFloat(item.descuento),
    tarifa: parseFloat(item.tarifa),
    unidad: item.unidad,
    esPromocion: item.esPromocion,
    unidadxCaja: item.unidadxCaja,
    valor: parseFloat(precioTotalProducto),
    comentario: String(item.comentario || "").trim(),
  });

  const mostrarAlertas = async (alertas) => {
    const tablaHTML = `
    <div class="alert-container">
      <table class="alert-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Advertencias</th>
          </tr>
        </thead>
        <tbody>
          ${alertas
        .map(
          ({ codigo, descripcion, advertencias }) => `
                <tr>
                  <td>${codigo}</td>
                  <td>${descripcion}</td>
                  <td>${advertencias}</td>
                </tr>
              `
        )
        .join("")}
        </tbody>
      </table>
    </div>
  `;
    await Swal.fire({
      title: "Advertencias en los productos",
      footer: "Para productos con Precio Base igual a CERO o que NO EXISTEN, por favor comuníquese con su asesor.",
      html: tablaHTML,
      icon: "warning",
      confirmButtonColor: "#06ac2e",
      confirmButtonText: "Entendido",
      width: "50%",
    });
  };


  const confirmarEnvio = () =>
    Swal.fire({
      title: "¿Enviar Pedido?",
      html: `<p>Recuerde que las cantidades deben cumplir con el acuerdo de Proveedor</p>`,
      icon: "warning",
      footer: `
        <input type="checkbox" id="acceptAgreement" />
        <label for="acceptAgreement">
          He leído y acepto los términos y condiciones del 
          <a href="#" onclick="window.acuerdoProveedores()" style="color: darkgoldenrod; margin-bottom: 0.5rem">
            Acuerdo del Proveedor
          </a>
        </label>
      `,
      showCancelButton: true,
      confirmButtonColor: "#06ac2e",
      confirmButtonText: "Sí, enviar!",
      preConfirm: () => {
        if (!document.getElementById("acceptAgreement").checked) {
          Swal.showValidationMessage("Debe aceptar los términos del acuerdo para enviar el pedido");
          return false;
        }
        return true;
      },
    });

  const enviarPedido = async (detallesValidos, fechActual, fechEntrega) => {
    const userIP = await getUserIP();
    const userAgent = navigator.userAgent;

    const datos = {
      ipProveedor: userIP || "5-5-5-5",
      codigoProveedor: CardCode,
      nombreProveedor: CardName,
      versionAcuerdo: "DOC-MTS-EC-AGRMNT-V1.1-LOC-CUE",
      fechaAcuerdo: fechActual,
      userAgent: userAgent,
      verificacionAcuerdo: true,
      fechaContabilizacion: fechActual,
      fechaDocumento: fechActual,
      fechaEntrega: fechEntrega,
      codigoAsesor: parseInt(SlpCode),
      nombreAsesor: SlpName,
      ordenEspecial: Boolean(tipoOrden),
      subtotal: parseFloat(subtotal).toFixed(2),
      iva: parseFloat(iva).toFixed(2),
      total: parseFloat(total).toFixed(2),
      details: detallesValidos,
    };
    const tokenId = localStorage.getItem("token");
    const respuesta = await fetchApi({
      endPoint: "/purchaseorder/ordersqlserver",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokenId,
      },
      body: datos,
    });

    if (respuesta.error) {
      console.log("Falla en el Servidor - OrderSupplier 792");
    } else {
      await Promise.all([
        setArchivoSubido(false),
        setProductosSeleccionados([]),
        resetAutocomplete(),
        setItems([]),
        setIva(0.0),
        setSubTotal(0.0),
        setTotal(0.0),
        setEntrega(formatDate(today)),
      ]);

      Swal.fire({
        title: "Pedido agregado",
        html: '<i class="fas fa-check-circle" style="color:green;"></i>',
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const mostrarError = () => {
    Swal.fire({
      icon: "error",
      title: "Error inesperado",
      text: "Ocurrió un error al enviar el pedido. Por favor, intente de nuevo.",
    });
  };


  const cancelar = () => {
    setArchivoSubido(false);
    document.getElementById("fileInput").value = null;
    setSucursal({ whsCode: "", whsName: "" });
    resetAutocomplete();
    setItems([]);
    setProductosSeleccionados([]);
    setIva(0.0);
    setSubTotal(0.0);
    setTotal(0.0);
    setEntrega(formatDate(today));
  };

  const handleChangePageProduct = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangePageModal = (event, newPage) => {
    setPageP(newPage);
  };

  const handleBusqueda = (event) => {
    setBusqueda(event.target.value === "true");
    filtrarProductos(busquedaTexto, event.target.value === "true");
  };

  const handleSearchProduct = (event) => {
    const searchText = event.target.value.toLowerCase();
    setBusquedaTexto(searchText);
    filtrarProductos(searchText, busqueda);
  };

  const filtrarProductos = (searchText, buscarPorCodigo) => {
    const filtrados = productos.filter((item) =>
      buscarPorCodigo
        ? item.codigoPrincipal.toLowerCase().includes(searchText)
        : item.descripcion.toLowerCase().includes(searchText)
    );
    setProductosFiltrados(filtrados);
    setPageP(0);
  };

  const acuerdoProveedores = () => {
    const pdfUrl = "/ACUERDO.pdf";
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "AcuerdoProveedores.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  window.acuerdoProveedores = acuerdoProveedores;

  useEffect(() => {
    getSucursales();
    getProductos();
  }, []);

  return (
    <>
      <Container fluid>
        <div className="panel">
          <div className="panel-title">
            <Stack
              direction={isMobile ? 'column' : 'row'}
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <p className="panel-title">ORDEN COMPRA</p>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                alignItems="center"
                justifyContent="flex-end"
                sx={{
                  minWidth: isMobile ? '100%' : 'auto',
                  padding: isMobile ? '0 1rem' : '0',
                }}
                spacing={2}
              >
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                />
                <button
                  onClick={popUpExcel}
                  className="boton-superior"
                  style={{ background: "#06ac2e" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.3517 7.61665L15.3929 4.05375C14.2651 3.03868 13.7012 2.53114 13.0092 2.26562L13 5.00011C13 7.35713 13 8.53564 13.7322 9.26787C14.4645 10.0001 15.643 10.0001 18 10.0001H21.5801C21.2175 9.29588 20.5684 8.71164 19.3517 7.61665Z"
                        fill="currentColor"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10 22H14C17.7712 22 19.6569 22 20.8284 20.8284C22 19.6569 22 17.7712 22 14V13.5629C22 12.6901 22 12.0344 21.9574 11.5001H18L17.9051 11.5001C16.808 11.5002 15.8385 11.5003 15.0569 11.3952C14.2098 11.2813 13.3628 11.0198 12.6716 10.3285C11.9803 9.63726 11.7188 8.79028 11.6049 7.94316C11.4998 7.16164 11.4999 6.19207 11.5 5.09497L11.5092 2.26057C11.5095 2.17813 11.5166 2.09659 11.53 2.01666C11.1214 2 10.6358 2 10.0298 2C6.23869 2 4.34315 2 3.17157 3.17157C2 4.34315 2 6.22876 2 10V14C2 17.7712 2 19.6569 3.17157 20.8284C4.34315 22 6.22876 22 10 22ZM9.01296 12.9528C8.72446 12.6824 8.27554 12.6824 7.98704 12.9528L5.98704 14.8278C5.68486 15.1111 5.66955 15.5858 5.95285 15.888C6.23615 16.1901 6.71077 16.2055 7.01296 15.9222L7.75 15.2312L7.75 18.5C7.75 18.9142 8.08579 19.25 8.5 19.25C8.91421 19.25 9.25 18.9142 9.25 18.5L9.25 15.2312L9.98704 15.9222C10.2892 16.2055 10.7639 16.1901 11.0472 15.888C11.3305 15.5858 11.3151 15.1111 11.013 14.8278L9.01296 12.9528Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span style={{ marginLeft: "8px" }}> CARGAR EXCEL</span>
                  </div>
                </button>

                <button
                  className="boton-superior"
                  style={{ background: "#128496" }}
                  onClick={openModal}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.04047 2.29242C2.6497 2.15503 2.22155 2.36044 2.08416 2.7512C1.94678 3.14197 2.15218 3.57012 2.54295 3.7075L2.80416 3.79934C3.47177 4.03406 3.91052 4.18961 4.23336 4.34802C4.53659 4.4968 4.67026 4.61723 4.75832 4.74609C4.84858 4.87818 4.91828 5.0596 4.95761 5.42295C4.99877 5.80316 4.99979 6.29837 4.99979 7.03832L4.99979 9.64C4.99979 12.5816 5.06302 13.5523 5.92943 14.4662C6.79583 15.38 8.19028 15.38 10.9792 15.38H16.2821C17.8431 15.38 18.6236 15.38 19.1753 14.9304C19.727 14.4808 19.8846 13.7164 20.1997 12.1875L20.6995 9.76275C21.0466 8.02369 21.2202 7.15417 20.7762 6.57708C20.3323 6 18.8155 6 17.1305 6H6.49233C6.48564 5.72967 6.47295 5.48373 6.4489 5.26153C6.39517 4.76515 6.27875 4.31243 5.99677 3.89979C5.71259 3.48393 5.33474 3.21759 4.89411 3.00139C4.48203 2.79919 3.95839 2.61511 3.34187 2.39838L3.04047 2.29242ZM13 8.25C13.4142 8.25 13.75 8.58579 13.75 9V10.25H15C15.4142 10.25 15.75 10.5858 15.75 11C15.75 11.4142 15.4142 11.75 15 11.75H13.75V13C13.75 13.4142 13.4142 13.75 13 13.75C12.5858 13.75 12.25 13.4142 12.25 13V11.75H11C10.5858 11.75 10.25 11.4142 10.25 11C10.25 10.5858 10.5858 10.25 11 10.25H12.25V9C12.25 8.58579 12.5858 8.25 13 8.25Z"
                        fill="Currentcolor"
                      />
                      <path
                        d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
                        fill="Currentcolor"
                      />
                      <path
                        d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
                        fill="Currentcolor"
                      />
                    </svg>

                    <span style={{ marginLeft: "8px" }}>PRODUCTO</span>
                  </div>
                </button>
              </Stack>
            </Stack>
          </div>

          <div className="panel-grid">
            <div className="panel-item">
              <label className="input-label-autor">Asesor</label>
              <input
                className="dashboard-input"
                id="combo-box-demo"
                name="asesor"
                type="text"
                value={SlpName}
                readOnly
              />
            </div>
            <div className="panel-item">
              <label className="input-label-autor">Sucursal</label>
              <select
                className="select-dashboard"
                value={sucursal.whsName || " "}
                onChange={handleSucursal}
              >
                <option value="">Seleccione una sucursal</option>
                {datosSucursal.map((suc) => (
                  <option key={suc.whsCode} value={suc.whsName}>
                    {suc.whsName}
                  </option>
                ))}
              </select>
            </div>
            <div className="panel-item">
              <label className="input-label-autor">Fecha de Entrega</label>
              <input
                type="date"
                value={entrega}
                name="Desde"
                onChange={handleInicioChange}
                className="input-dashboard"
              />
            </div>
            <div className="panel-item">
              <label>Tipo de Orden</label>
              <select
                className="select-dashboard"
                value={tipoOrden}
                onChange={handleTipoOrden}>
                <option value="" className="default-option">
                  Seleccione un tipo de orden
                </option>
                {tiposOrden.map((tipo) => (
                  <option key={tipo.label} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="Scroll">
            <TablaPurchase items={items} page={page} rowsPerPageProduct={rowsPerPageProduct} handleCantidadChange={handleCantidadChange} handlePrecioChange={handlePrecioChange} handlePromocion={handlePromocion} abrirComentarios={abrirComentarios} handleDescuentoChange={handleDescuentoChange} eliminarProducto={eliminarProducto} analisisVentas={analisisVentas} handleChangePageProduct={handleChangePageProduct}/>
          </div>
        </div>

        <div className="proforma-container">
          <div className="panel">
            <div className="panel-grid">
              <div className="panel-item">
                <div className="proforma-item">
                  <p className="proforma-item-p">
                    Subtotal sin impuestos: ${subtotal}
                  </p>
                </div>
                <div className="proforma-item">
                  <p className="proforma-item-p">
                    Descuento: ${totalDescuento}
                  </p>
                </div>
                <div className="proforma-item">
                  <p className="proforma-item-p">IVA: ${iva}</p>
                </div>
                <div className="proforma-item">
                  <p className="proforma-item-p">Total: {total}</p>
                </div>
              </div>
            </div>
            <div className="panel-item">
              <button variant="contained" className="boton-ordenes"  style={{ background: "#06ac2e", marginBottom: "10px", padding: "0.6rem" }} onClick={enviarDatos}>Enviar Orden</button>
              <button variant="contained" className="boton-orden" style={{ padding: "0.6rem" }} onClick={cancelar}>Cancelar Orden</button>
            </div>
          </div>
        </div>
      </Container>
<ModalStock isOpen={modalAnalisis} onClose={() => setModalAnalisis(false)} title={nombreProductoAnalisis}stockData={datosStockAlmacenes}analizarStock={analizarStockStatus} />
<ModalComentarios isOpen={modalComentarios} onClose={cerrarModalComentarios} productoNombre={productoNombre}  comentario={comentario} handleComentario={handleComentario} agregarComentario={agregarComentario} />
<ModalVisualizarPurchase isOpen={modalVisualizar} onClose={cerrarProductos} busquedaTexto={busquedaTexto} handleSearchProduct={handleSearchProduct} busqueda={busqueda} handleBusqueda={handleBusqueda} productos={productos} productosFiltrados={productosFiltrados} productosSeleccionados={productosSeleccionados} handleSelectAll={handleSelectAll} handleCheckboxChange={handleCheckboxChange} pageP={pageP} rowsPerPageProduct={rowsPerPageProduct} handleChangePageModal={handleChangePageModal} agregarProductos={agregarProductos} />   
    </>
  );
}
