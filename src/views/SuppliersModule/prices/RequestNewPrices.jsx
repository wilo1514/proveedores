import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import FormControl from "@mui/material/FormControl";
import FilledInput from "@mui/material/FilledInput";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import Swal from "sweetalert2";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import * as XLSX from "xlsx";

import { validacion } from "../../../utils/apiUtils";
import fetchApi from "../../../utils/fechtData";
import Container from "../../../components/Container";
import Modal from "../../../components/Modal";
import CustomDecimalInput from "../../../components/NumericDecimalInput";

import DeleteIcon from "../../../assets/iconos/trash.svg";
import SearchIcon from "../../../assets/iconos/search.svg";
import "../../../css/ComponentesAdicionales/Tabla.css";
import "../../../css/Proveedores/OrderSupplier.css";


/**
 * Componente para la actualización de precios de productos de proveedores.
 * Permite la carga de un archivo Excel, la selección de productos, y el envío de cambios.
 * @component
 */
export default function UpdatePriceView() {
    // Obtención de datos del usuario desde Redux
  const CardCode = useSelector((state) => state.auth.datos_Usuario?.CARDCODE ?? "");
  const CardName = useSelector((state) => state.auth.datos_Usuario?.CARDNAME ?? "");
  const SlpName = useSelector((state) => state.auth.datos_Usuario?.SLPNAME ?? "");
  const SlpCode = useSelector((state) => state.auth.datos_Usuario?.SLPCODE ?? "");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Verifica si la pantalla es pequeña
    // Estados de control de UI y datos
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [archivoSubido, setArchivoSubido] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [pageP, setPageP] = useState(0);
  const [rowsPerPageProduct] = useState(10);
  const [rowsPerPage] = useState(20);
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [busqueda, setBusqueda] = useState(false);
  const [nombreListado, setNombreListado] = useState("");
  const [encargado, setEncargado] = useState("");
  const [motivo, setMotivo] = useState("");
  
  const handleNombre = (e) => setNombreListado(e.target.value);
  const handleEncargado = (e) => setEncargado(e.target.value);
  const handleMotivo = (e) => setMotivo(e.target.value);

/**
 * Muestra una alerta de error y redirige a la pantalla de inicio de sesión en caso de fallo de autenticación.
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
 * Muestra una alerta de error en caso de fallo en la solicitud.
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

  const cargarExcel = () => document.getElementById("fileInput").click();


/**
 * Maneja el cambio en el archivo seleccionado para carga de precios.
 * Convierte el archivo a un json y lo compara con las columnas requeridas,
 * actualizando el estado de la UI.
 * @param {Event} e - Evento de cambio en el input.
 */

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      compararExcel(json);
      setArchivoSubido(true);
    };
    reader.readAsArrayBuffer(file);
  };
/**
 * Compara el archivo Excel cargado con las columnas requeridas y con los
 * productos en Redux, actualizando el estado de la UI.
 * @param {Array} json - El contenido del archivo Excel en formato JSON.
 **/
  const compararExcel = (json) => {
    const alertas = [];
    const requiredColumns = [
      "Código Barras",
      "Precio Actual",
      "Precio Nuevo",
    ];
    const jsonColumns = json[0] || [];

    // Verifica si faltan columnas requeridas
    const missingColumns = requiredColumns.filter(
      (col) => !jsonColumns.includes(col)
    );
    if (missingColumns.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Error de formato",
        text: `Faltan las siguientes columnas en el archivo: ${missingColumns.join(
          ", "
        )}`,
      });
      return;
    }

    const productosMap = new Map(
      productos.map((prod) => [prod.codigoPrincipal, prod])
    );

    console.log(productos)

    const productCodeSet = new Set();
    const duplicateAlerts = [];

    const nuevosProductos = json
      .slice(1)
      .filter((filaExcel) => filaExcel[jsonColumns.indexOf("Código Barras")])
      .map((filaExcel, index) => {
        const codigo =
          filaExcel[jsonColumns.indexOf("Código Barras")].toString();

        if (productCodeSet.has(codigo)) {
          duplicateAlerts.push({ filaExcel, index: index + 2 });
          return null;
        }
        productCodeSet.add(codigo);

        const productoEnRedux = productosMap.get(codigo);
        if (productoEnRedux) {
          const precioNuevo =
            parseFloat(filaExcel[jsonColumns.indexOf("Precio Nuevo")]) || 0;

          // Validación de precio
          if (isNaN(precioNuevo)) {
            alertas.push({
              fila: index + 2,
              campo: "Precio",
              cantidadExcel: filaExcel[jsonColumns.indexOf("Precio Nuevo")],
              cantidadTransformada: "0",
            });
            return {
              ...productoEnRedux,
              precioBase: productoEnRedux.precioUnitario.toString(),
              precioMayorista: productoEnRedux.precioMayorista,
              precioMinorista: productoEnRedux.precioMinorista,
              rentabilidadMayorista: productoEnRedux.rentabilidadMayorista,
              rentabilidadMinorista: productoEnRedux.rentabilidadMinorista,

            };
          }
          return {
            ...productoEnRedux,
            precioUnitario: precioNuevo.toString(),
            precioBase: productoEnRedux.precioUnitario.toString(),
            precioMayorista: productoEnRedux.precioMayorista,
            precioMinorista: productoEnRedux.precioMinorista,
            rentabilidadMayorista: productoEnRedux.rentabilidadMayorista,
            rentabilidadMinorista: productoEnRedux.rentabilidadMinorista,
          };
        } else {
          alertas.push({
            fila: index + 2,
            campo: "Código Barras",
            cantidadExcel: "Producto no encontrado",
            cantidadTransformada: "Producto no encontrado",
          });
          return null;
        }
      })
      .filter(Boolean);

    const nuevosItems = [
      ...items.filter(
        ({ codigoPrincipal }) =>
          !nuevosProductos.some(
            (producto) => producto.codigoPrincipal === codigoPrincipal
          )),
      ...nuevosProductos,
    ];

    setItems(nuevosItems);
    setProductosSeleccionados(nuevosProductos);

    if (alertas.length > 0 || duplicateAlerts.length > 0) {
      const tablaHTML = `
        <div class="alert-container">
          <table class="alert-table">
            <thead>
              <tr>
                <th>Fila Excel</th>
                <th>Campo</th>
                <th>Ingresado</th>
                <th>Modificado</th>
              </tr>
            </thead>
            <tbody>
              ${alertas
          .map(
            (alerta) => `
                <tr>
                  <td>${alerta.fila}</td>
                  <td>${alerta.campo}</td>
                  <td>${alerta.cantidadExcel}</td>
                  <td>${alerta.cantidadTransformada}</td>
                </tr>
              `
          )
          .join("")}
              ${duplicateAlerts
          .map(
            (alerta) => `
                <tr>
                  <td>${alerta.index}</td>
                  <td>${alerta.filaExcel[jsonColumns.indexOf("Código Barras")]
              }</td>
                  <td colspan="2">Producto duplicado eliminado</td>
                </tr>
              `
          )
          .join("")}
            </tbody>
          </table>
        </div>
      `;
      Swal.fire({
        icon: "error",
        title: "Cantidades cambiadas y elementos duplicados",
        footer:
          "Las cantidades fueron modificadas si no correspondían con la unidad o superaban los 1000 productos y los productos duplicados eliminados",
        html: tablaHTML,
        width: "60%",
      });
    }
  };

  //PETICIONES

    /**
   * Obtiene la lista de productos disponibles para actualización de precios.
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

  /**
   * Selecciona todos los productos que coinciden con el valor actual de "productosFiltrados" en su código principal o descripción.
   * @param {Event} event - Evento de selección.
   */
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

    const nuevosProductosConPrecioInicializado = nuevosProductos.map(
      (nuevoProducto) => ({
        ...nuevoProducto,
        precioUnitario: 0,
        precioBase: nuevoProducto.precioUnitario,
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

  /**
   * Abre el modal para agregar productos.
   * 
   * Selecciona todos los productos y los pone en la lista de productos filtrados, 
   * limpia el texto de búsqueda y cierra la paginación.
   */
  const openModal = () => {
    setModalVisualizar(true);
    setProductosFiltrados(productos);
    setBusquedaTexto("");
    setPageP(0);
  };

  /**
   * Cierra el modal de productos y limpia la lista de productos filtrados.
   */
  const cerrarProductos = () => {
    setProductosFiltrados([]);
    setModalVisualizar(false);
  };

  //FUNCIONES PAGINA INICIAL

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
  };

  /**
   * Descarga un archivo Excel con la lista de productos del proveedor.
   *
   * Primero, valida que el usuario tenga permiso para descargar el archivo.
   * Si el usuario tiene permiso, hace una solicitud GET al API para obtener
   * la lista de productos del proveedor.
   * Si la solicitud es exitosa, filtra la lista de productos para obtener
   * solo la información relevante y llama a la función `exportToExcel`
   * para descargar el archivo Excel.
   *
   * @returns {Promise<void>}
   */
  const descargarExcel = async () => {
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
      console.log(datos.datos)
      const filteredData = datos.datos.map(item => ({
        "Código Barras": item["codigoPrincipal"],
        "Descripcion": item["descripcion"],
        "Precio Actual": item["precioActual"],
        "Precio Nuevo": item["precioNuevo"],
      }));
      exportToExcel(filteredData);
    } else {
      console.log("error");
    }
  };

/**
 * Descarga un archivo Excel con la lista de productos del proveedor
 *
 * El archivo exportado tiene la siguiente estructura:
 * - Código Barras
 * - Descripcion
 * - Precio Actual
 * - Precio Nuevo
 *
 * @param {Array<Object>} data - La lista de productos a exportar
 */
  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: ["Código Barras", "Descripcion", "Precio Actual", "Precio Nuevo"],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Formato");
    XLSX.writeFile(workbook, "plantilla_actualización.xlsx");
  };

/**
 * Envia la solicitud de actualización de precios al servidor.
 *
 * Valida que el usuario tenga permiso para enviar la solicitud y que los campos
 * obligatorios estén completos. Si todo es correcto, envia la solicitud al servidor
 * y muestra un mensaje de confirmación o error según la respuesta del servidor.
 *
 * @returns {Promise<void>}
 */
  const enviarDatos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const fechActual = new Date().toISOString();
      const alertas = [];
      const detallesValidos = [];

      if (!nombreListado || items.length === 0 || !encargado || !motivo) {
        await Swal.fire({
          title: "Falta Información",
          html: '<i class="fas fa-check-circle" style="color:red;">Debe completar el encabezado y cambiar mínimo 1 Producto</i>',
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      const cantidadProductos = Math.ceil(productos.length * 0.5);
      const cantidadItems = items.length;
      const nuevoTipo = cantidadItems > cantidadProductos ? "LISTADO" : "ITEMS";

      const codigosConorque = items.map((item) => item.codigoConorque);
      const codigosRepetidos = codigosConorque.filter(
        (codigo, index) => codigosConorque.indexOf(codigo) !== index
      );

      items.forEach((item) => {
        if (codigosRepetidos.includes(item.codigoConorque)) {
          alertas.push({
            codigo: item.codigoConorque,
            descripcion: item.descripcion,
            repetido: true,
            advertencia: "Código repetido"
          });
        } else if (Math.abs(item.precioUnitario - item.precioBase) < 0.000001) {
          alertas.push({
            codigo: item.codigoConorque,
            descripcion: item.descripcion,
            repetido: false,
            advertencia: "El nuevo precio no puede ser igual al precio anterior"
          });
        } else {
          detallesValidos.push({
            codigoConorque: item.codigoConorque,
            codigoPrincipal: item.codigoPrincipal,
            descripcion: item.descripcion,
            precioUnitario: item.precioBase,
            precioSugerido: parseFloat(item.precioUnitario),
            precioMinorista: item.precioMinorista,
            precioMayorista: item.precioMayorista,
            rentabilidadMayorista: item.rentabilidadMayorista,
            rentabilidadMinorista: item.rentabilidadMinorista,
          });
        }
      });
      if (alertas.length > 0) {
        const tablaHTML = `
          <div class="alert-container">
            <table class="alert-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Advertencia</th>
                </tr>
              </thead>
              <tbody>
                ${alertas
            .map(
              (alerta) => `
                    <tr>
                      <td>${alerta.codigo}</td>
                      <td>${alerta.descripcion}</td>
                      <td>${alerta.advertencia}</td>
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
          html: `${tablaHTML}`,
          icon: "warning",
          confirmButtonColor: "#06ac2e",
          confirmButtonText: "Entendido",
          width: "50%",
        });
        return;
      }

      const datos = {
        codigoProveedor: CardCode,
        nombreProveedor: CardName,
        nombreListado: nombreListado,
        fechaEntrega: fechActual,
        codigoAsesor: parseInt(SlpCode),
        nombreAsesor: SlpName,
        motivo: motivo,
        solicitante: encargado,
        details: detallesValidos,
        tipo: nuevoTipo,
        total: items.length,
      };

      try {
        const result = await Swal.fire({
          title: "¿Actualizar Precios?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#06ac2e",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, actualizar!",
        });

        if (result.isConfirmed) {
          const tokenId = localStorage.getItem("token");
          const respuesta = await fetchApi({
            endPoint: "/items/preciosugeridosqlserver",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + tokenId,
            },
            body: datos,
          });

          if (respuesta.error) {
            Swal.fire({
              icon: "error",
              title: "Error al enviar actualizacion",
              text: respuesta.error,
            });
          } else if (respuesta.datos.errors) {
            const uniqueErrorMessages = new Set();
            Object.values(respuesta.datos.errors)
              .flatMap((messages) => messages.map((msg) => msg))
              .forEach((error) => uniqueErrorMessages.add(error));
            const errorMessages = Array.from(uniqueErrorMessages)
              .map((error, index) => `${index + 1}. ${error}`)
              .join("\n");

            Swal.fire({
              icon: "error",
              title: "Corrige los siguientes errores de validación",
              text: errorMessages,
            });
          } else {
            await Promise.all([
              setArchivoSubido(false),
              setProductosSeleccionados([]),
              setItems([]),
            ]);

            Swal.fire({
              title: "Pedido agregado",
              html: '<i class="fas fa-check-circle" style="color:green;"></i>',
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate(-1);
          }
        } else {
          console.log("El usuario canceló");
        }
      } catch (error) {
        console.error("Error al enviar la solicitud: ", error);
        Swal.fire({
          icon: "error",
          title: "Error inesperado",
          text: "Ocurrió un error al enviar el pedido. Por favor, intente de nuevo.",
        });
      }
    } else {
      handleError();
    }
  };


/**
 * Regresa a la pantalla anterior y borra el archivo seleccionado.
 */

  const regresar = () => {
    setArchivoSubido(false);
    document.getElementById("fileInput").value = null;
    navigate(-1);
  };

/**
 * Maneja el cambio de página en la tabla de productos.
 * @param {Event} event - Evento de cambio de página.
 * @param {number} newPage - Nueva página seleccionada.
 */
  const handleChangePageProduct = (event, newPage) => {
    setPage(newPage);
  };


/**
 * Maneja el cambio de página en la tabla modal de productos.
 * @param {Event} event - Evento de cambio de página.
 * @param {number} newPage - Nueva página seleccionada.
 */
  const handleChangePageModal = (event, newPage) => {
    setPageP(newPage);
  };

/**
 * Maneja el cambio de búsqueda en la tabla de productos.
 * @param {Event} event - Evento de cambio de búsqueda.
 * - Si el valor de la búsqueda es "true", filtra los productos por código.
 * - Si el valor de la búsqueda es "false", filtra los productos por descripción.
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

/**
 * Desplaza la vista del contenedor al inicio de manera suave.
 * 
 * - Selecciona el contenedor con la clase "inicio_pedido".
 * - Utiliza scrollTo con un desplazamiento suave para mover al inicio.
 */

  const scrollToTop = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: 0, behavior: "smooth" });
  };

/**
 * Desplaza la vista del contenedor al final de manera suave.
 * 
 * - Selecciona el contenedor con la clase "inicio_pedido".
 * - Utiliza scrollTo con un desplazamiento suave para mover al final.
 */
  const scrollToBottom = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };
  useEffect(() => {
    getProductos();
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
              <p className="panel-title">SOLICITUD ACTUALIZACIÓN DE PRECIOS</p>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                alignItems={"center"}
                justifyContent={"flex-end"}
                sx={{
                  minWidth: isMobile ? '100%' : 'auto',
                  padding: isMobile ? '0 1rem' : '0',
                }}
                spacing={2}
              >
                <button
                  onClick={regresar}
                  className="boton-superior"
                  style={{ background: "#06ac2e" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", gap: "5px"}}>
                    <svg height={"1.3rem"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.4751 5.18355L7.49731 9.60829C6.56674 10.4355 6.10145 10.8491 5.92997 11.3374C5.77939 11.7663 5.77939 12.2337 5.92997 12.6626C6.10145 13.1509 6.56674 13.5645 7.49731 14.3917L12.4751 18.8165C12.8974 19.1918 13.1086 19.3795 13.2879 19.3862C13.4437 19.3921 13.5934 19.3249 13.6925 19.2046C13.8066 19.0661 13.8066 18.7835 13.8066 18.2185V15.4286C16.2347 15.4286 18.7993 16.2084 20.6719 17.5928C21.6468 18.3135 22.1343 18.6739 22.3199 18.6596C22.5009 18.6458 22.6158 18.5751 22.7097 18.4198C22.806 18.2604 22.7209 17.7625 22.5507 16.7667C21.4458 10.3006 16.9958 8.57143 13.8066 8.57143V5.78148C13.8066 5.21646 13.8066 4.93396 13.6925 4.79545C13.5934 4.67513 13.4437 4.60794 13.2879 4.61378C13.1086 4.62049 12.8974 4.80818 12.4751 5.18355Z" fill="Currentcolor" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M9.81777 3.98966C9.53592 3.68613 9.06137 3.66856 8.75784 3.95041L3.54163 8.79403C2.5947 9.67333 2.05664 10.9072 2.05664 12.1994C2.05664 13.5616 2.65432 14.8553 3.69163 15.7382L8.78205 20.0711C9.09747 20.3396 9.57081 20.3016 9.8393 19.9861C10.1078 19.6707 10.0697 19.1974 9.75431 18.9289L4.66389 14.596C3.9614 13.998 3.55664 13.122 3.55664 12.1994C3.55664 11.3243 3.92102 10.4887 4.56231 9.89322L9.77852 5.0496C10.082 4.76775 10.0996 4.2932 9.81777 3.98966Z" fill="Currentcolor" />
                    </svg>
                    <span style={{ marginLeft: "4px" }}> REGRESAR</span>
                  </div>
                </button>
                <button className="boton-superior" style={{ background: "#128496" }} onClick={enviarDatos}>
                  <div style={{display: "flex", justifyContent: "space-evenly", alignItems: "center", spacing: "5px"}}>
                    <svg height={"1.3rem"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.4975 18.4851L20.6281 9.09378C21.419 6.72107 21.9594 5.1 21.9978 3.97919C22.0108 3.60165 21.5845 3.47624 21.3173 3.74336L6.85855 18.2022C6.62519 18.4355 6.6807 18.8286 6.99826 18.9185C7.02946 18.9273 7.0609 18.9356 7.09257 18.9433C7.59254 19.0657 8.24578 18.977 9.5522 18.7997L9.62363 18.79C9.99191 18.74 10.1761 18.715 10.3529 18.7257C10.6738 18.7451 10.9838 18.8496 11.251 19.0286C11.3981 19.1271 11.5295 19.2586 11.7923 19.5213L12.0436 19.7726C13.5539 21.2828 14.309 22.0379 15.1101 21.9986C15.3309 21.9877 15.5479 21.9365 15.7503 21.8475C16.4844 21.5244 16.8221 20.5113 17.4975 18.4851Z" fill="Currentcolor" />
                      <path d="M14.906 3.37194L5.57477 6.48223C3.49295 7.17615 2.45203 7.5231 2.13608 8.28642C2.06182 8.46582 2.01692 8.65601 2.00311 8.84968C1.94433 9.6737 2.72018 10.4495 4.27188 12.0012L4.55451 12.2838C4.80921 12.5385 4.93655 12.6658 5.03282 12.8076C5.22269 13.0871 5.33046 13.4143 5.34393 13.752C5.35076 13.9232 5.32403 14.1013 5.27057 14.4575C5.07488 15.7613 4.97703 16.4131 5.0923 16.9148C5.09632 16.9322 5.1005 16.9497 5.10484 16.967C5.18629 17.292 5.58551 17.3539 5.82242 17.117L20.2567 2.68271C20.5238 2.41559 20.3984 1.9893 20.0209 2.00224C18.9 2.04066 17.2788 2.58102 14.906 3.37194Z" fill="Currentcolor" />
                    </svg>
                    <span style={{ marginLeft: "8px" }}>
                      ENVIAR ACTUALIZACIÓN
                    </span>
                  </div>
                </button>
              </Stack>
            </Stack>
          </div>

          <div className="panel-grid">
            <div className="panel-item">
              <label className="input-label-autor">
                Nombre Listado o Cambio
              </label>
              <input
                className="dashboard-input"
                id="combo-box-demo"
                name="asesor"
                type="text"
                value={nombreListado}
                onChange={handleNombre}
              />
            </div>
            <div className="panel-item">
              <label className="input-label-autor">
                Persona que realiza el cambio
              </label>
              <input
                className="dashboard-input"
                id="combo-box-demo"
                name="asesor"
                value={encargado}
                onChange={handleEncargado}
                type="text"
              />
            </div>
            <div className="panel-item">
              <label className="input-label-autor">Motivo del cambio</label>
              <input
                className="dashboard-input"
                id="combo-box-demo"
                name="asesor"
                value={motivo}
                onChange={handleMotivo}
                type="text"
              />
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">
            <Stack
              direction={isMobile ? 'column' : 'row'}
              alignItems={"center"}
              justifyContent={"space-between"}
              spacing={2}
            >
              <p className="panel-title">LISTADO PRODUCTOS</p>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                alignItems={"center"}
                justifyContent={"flex-end"}
                spacing={2}
                sx={{
                  minWidth: isMobile ? '100%' : 'auto', 
                  padding: isMobile ? '0 1rem' : '0', 
                }}
              >
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
                    <span style={{ marginLeft: "8px" }}>PLANTILLA</span>
                  </div>
                </button>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                />
                <button
                  onClick={cargarExcel}
                  className="boton-orden"
                  disabled={archivoSubido}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      spacing: "5px",
                    }}
                  >
                    <svg
                      height="1.2rem"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.25 2.83422C11.7896 2.75598 11.162 2.75005 10.0298 2.75005C8.11311 2.75005 6.75075 2.75163 5.71785 2.88987C4.70596 3.0253 4.12453 3.27933 3.7019 3.70195C3.27869 4.12516 3.02502 4.70481 2.88976 5.7109C2.75159 6.73856 2.75 8.09323 2.75 10.0001V14.0001C2.75 15.9069 2.75159 17.2615 2.88976 18.2892C3.02502 19.2953 3.27869 19.8749 3.7019 20.2981C4.12511 20.7214 4.70476 20.975 5.71085 21.1103C6.73851 21.2485 8.09318 21.2501 10 21.2501H14C15.9068 21.2501 17.2615 21.2485 18.2892 21.1103C19.2952 20.975 19.8749 20.7214 20.2981 20.2981C20.7213 19.8749 20.975 19.2953 21.1102 18.2892C21.2484 17.2615 21.25 15.9069 21.25 14.0001V13.5629C21.25 12.0269 21.2392 11.2988 21.0762 10.7501H17.9463C16.8135 10.7501 15.8877 10.7501 15.1569 10.6518C14.3929 10.5491 13.7306 10.3268 13.2019 9.79815C12.6732 9.26945 12.4509 8.60712 12.3482 7.84317C12.25 7.1123 12.25 6.18657 12.25 5.05374V2.83422ZM13.75 3.6095V5.00005C13.75 6.19976 13.7516 7.0241 13.8348 7.64329C13.9152 8.24091 14.059 8.53395 14.2626 8.73749C14.4661 8.94103 14.7591 9.08486 15.3568 9.16521C15.976 9.24846 16.8003 9.25005 18 9.25005H20.0195C19.723 8.9625 19.3432 8.61797 18.85 8.17407L14.8912 4.61117C14.4058 4.17433 14.0446 3.85187 13.75 3.6095ZM10.1755 1.25002C11.5601 1.24965 12.4546 1.24942 13.2779 1.56535C14.1012 1.88129 14.7632 2.47735 15.7873 3.39955C15.8226 3.43139 15.8584 3.46361 15.8947 3.49623L19.8534 7.05912C19.8956 7.09705 19.9372 7.1345 19.9783 7.17149C21.162 8.23614 21.9274 8.92458 22.3391 9.84902C22.7508 10.7734 22.7505 11.8029 22.75 13.3949C22.75 13.4502 22.75 13.5062 22.75 13.5629V14.0565C22.75 15.8942 22.75 17.3499 22.5969 18.4891C22.4392 19.6615 22.1071 20.6104 21.3588 21.3588C20.6104 22.1072 19.6614 22.4393 18.489 22.5969C17.3498 22.7501 15.8942 22.7501 14.0564 22.7501H9.94359C8.10583 22.7501 6.65019 22.7501 5.51098 22.5969C4.33856 22.4393 3.38961 22.1072 2.64124 21.3588C1.89288 20.6104 1.56076 19.6615 1.40314 18.4891C1.24997 17.3499 1.24998 15.8942 1.25 14.0565V9.94363C1.24998 8.10587 1.24997 6.65024 1.40314 5.51103C1.56076 4.33861 1.89288 3.38966 2.64124 2.64129C3.39019 1.89235 4.34232 1.56059 5.51887 1.40313C6.66283 1.25002 8.1257 1.25003 9.97352 1.25005L10.0298 1.25005C10.0789 1.25005 10.1275 1.25004 10.1755 1.25002Z"
                        fill="Currentcolor"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.01296 12.9529C8.72446 12.6824 8.27554 12.6824 7.98704 12.9529L5.98704 14.8279C5.68486 15.1112 5.66955 15.5858 5.95285 15.888C6.23615 16.1902 6.71077 16.2055 7.01296 15.9222L7.75 15.2312L7.75 18.5001C7.75 18.9143 8.08579 19.2501 8.5 19.2501C8.91421 19.2501 9.25 18.9143 9.25 18.5001L9.25 15.2312L9.98704 15.9222C10.2892 16.2055 10.7639 16.1902 11.0472 15.888C11.3305 15.5858 11.3151 15.1112 11.013 14.8279L9.01296 12.9529Z"
                        fill="Currentcolor"
                      />
                    </svg>
                    <span style={{ marginLeft: "8px" }}>SUBIR EXCEL</span>
                  </div>
                </button>

                <button className="boton-orden" onClick={openModal}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      spacing: "5px",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      height="1.2rem"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
                        fill="Currentcolor"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.0574 1.25H11.9426C9.63424 1.24999 7.82519 1.24998 6.41371 1.43975C4.96897 1.63399 3.82895 2.03933 2.93414 2.93414C2.03933 3.82895 1.63399 4.96897 1.43975 6.41371C1.24998 7.82519 1.24999 9.63422 1.25 11.9426V12.0574C1.24999 14.3658 1.24998 16.1748 1.43975 17.5863C1.63399 19.031 2.03933 20.1711 2.93414 21.0659C3.82895 21.9607 4.96897 22.366 6.41371 22.5603C7.82519 22.75 9.63423 22.75 11.9426 22.75H12.0574C14.3658 22.75 16.1748 22.75 17.5863 22.5603C19.031 22.366 20.1711 21.9607 21.0659 21.0659C21.9607 20.1711 22.366 19.031 22.5603 17.5863C22.75 16.1748 22.75 14.3658 22.75 12.0574V11.9426C22.75 9.63423 22.75 7.82519 22.5603 6.41371C22.366 4.96897 21.9607 3.82895 21.0659 2.93414C20.1711 2.03933 19.031 1.63399 17.5863 1.43975C16.1748 1.24998 14.3658 1.24999 12.0574 1.25ZM3.9948 3.9948C4.56445 3.42514 5.33517 3.09825 6.61358 2.92637C7.91356 2.75159 9.62177 2.75 12 2.75C14.3782 2.75 16.0864 2.75159 17.3864 2.92637C18.6648 3.09825 19.4355 3.42514 20.0052 3.9948C20.5749 4.56445 20.9018 5.33517 21.0736 6.61358C21.2484 7.91356 21.25 9.62177 21.25 12C21.25 14.3782 21.2484 16.0864 21.0736 17.3864C20.9018 18.6648 20.5749 19.4355 20.0052 20.0052C19.4355 20.5749 18.6648 20.9018 17.3864 21.0736C16.0864 21.2484 14.3782 21.25 12 21.25C9.62177 21.25 7.91356 21.2484 6.61358 21.0736C5.33517 20.9018 4.56445 20.5749 3.9948 20.0052C3.42514 19.4355 3.09825 18.6648 2.92637 17.3864C2.75159 16.0864 2.75 14.3782 2.75 12C2.75 9.62177 2.75159 7.91356 2.92637 6.61358C3.09825 5.33517 3.42514 4.56445 3.9948 3.9948Z"
                        fill="Currentcolor"
                      />
                    </svg>
                    <span style={{ marginLeft: "8px" }}>PRODUCTO</span>
                  </div>
                </button>
              </Stack>
            </Stack>
          </div>
          <div className="ScrollSinLargo">
            <table className="table table-ligh table-hover">
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>#</th>
                  <th style={{ textAlign: "center" }}>Código Conorque</th>
                  <th style={{ textAlign: "center" }}>Código Barras</th>
                  <th style={{ textAlign: "center" }}>Descripción</th>
                  <th style={{ textAlign: "center" }}>Iva</th>
                  <th style={{ textAlign: "center" }}>Precio Actual</th>
                  <th style={{ textAlign: "center" }}>Nuevo Precio</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                  .map((item, i) => {
                    const currentIndex = i + 1 + page * rowsPerPage;
                    return (
                      <tr key={i}>
                        <td style={{ textAlign: "center" }}>{currentIndex}</td>
                        <td style={{ textAlign: "center" }}>
                          {item.codigoConorque}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item.codigoPrincipal}
                        </td>
                        <td style={{ textAlign: "justify" }}>
                          {item.descripcion}
                        </td>
                        <td style={{ textAlign: "center" }}>{item.tarifa}%</td>
                        <td style={{ textAlign: "end" }}>{item.precioBase}</td>
                        <td style={{ textAlign: "center" }}>
                          <CustomDecimalInput
                            value={item.precioUnitario}
                            onChange={(newPrecio) => handlePrecioChange(newPrecio, item)}
                            cantidad={4}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <img src={DeleteIcon} alt="borrar"
                            onClick={() => eliminarProducto(item.codigoPrincipal)}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <TablePagination
              component="div"
              count={items.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePageProduct}
              rowsPerPageOptions={[]}
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
        isOpen={modalVisualizar}
        onClose={() => {
          cerrarProductos();
        }}
        title="LISTADO DE PRODUCTOS"
        size="lg"
        className="Pruebas"
      >
        <Grid container spacing={2} style={{ backgroundColor: "#fff" }}>
          <Grid item xs={12} sm={12} md={8}>
            <FormControl fullWidth variant="filled">
              <FilledInput
                hiddenLabel
                id="filled-adornment-password"
                type="text"
                className="buscar"
                size="small"
                value={busquedaTexto}
                onChange={handleSearchProduct}
                endAdornment={
                  <InputAdornment position="end">
                    <img src={SearchIcon} alt="buscar"/>
                  </InputAdornment>
                }
                label="Buscar"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <FormControl>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={busqueda}
                onChange={handleBusqueda}
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Código"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="Descrip."
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        <div className="Scroll">
          <table className="table table-ligh table-hover">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }} className="checkgeneral">
                  <Checkbox
                    checked={productosSeleccionados.length === productos.length}
                    indeterminate={
                      productosSeleccionados.length > 0 &&
                      productosSeleccionados.length < productos.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th
                  style={{ textAlign: "center" }}
                  className="encabezadosTabal"
                >
                  CÓDIGO BARRA
                </th>
                <th
                  style={{ textAlign: "center" }}
                  className="encabezadosTabal"
                >
                  DESCRIPCIÓN
                </th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length > 0 &&
                productosFiltrados
                  .slice(
                    pageP * rowsPerPageProduct,
                    pageP * rowsPerPageProduct + rowsPerPageProduct
                  )
                  .map((item) => {
                    const isSelected = productosSeleccionados.some(
                      (p) => p.codigoPrincipal === item.codigoPrincipal
                    );
                    return (
                      <tr key={item.codigoPrincipal}>
                        <td style={{ textAlign: "start" }}>
                          <Checkbox
                            checked={isSelected}
                            onChange={(event) =>
                              handleCheckboxChange(event, item)
                            }
                            className="check"
                          />
                        </td>
                        <td style={{ textAlign: "start" }}>
                          {item.codigoPrincipal}
                        </td>
                        <td style={{ textAlign: "start" }}>
                          {item.descripcion}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          <TablePagination
            component="div"
            count={productos ? productos.length : 0}
            rowsPerPage={rowsPerPageProduct}
            page={pageP}
            onPageChange={handleChangePageModal}
            rowsPerPageOptions={[]}
          />
        </div>
        <button
          variant="contained"
          className="boton-modal"
          onClick={agregarProductos}
        >
          Agregar
        </button>
      </Modal>
    </>
  );
}
