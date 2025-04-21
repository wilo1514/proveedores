import { useState } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const usePedidosHelpers = () => {
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [busqueda, setBusqueda] = useState(false);
  
  /**
   * Formatea una fecha en formato 'YYYY-MM-DD'.
   * @param {Date} date - Fecha a formatear.
   * @returns {string} - Fecha formateada.
   */
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Muestra una alerta de error.
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
  };
  
  /**
   * Maneja los errores del sistema con una alerta.
   */
  const handleErrorSis = () => {
    Swal.fire({
      position: "center",
      icon: "warning",
      title: "Cargando",
      text: "Espera unos segundos mientras arreglamos este problema.",
      showConfirmButton: false,
      timer: 2200,
    });
  };
  
  /**
   * Descarga un archivo Excel con los productos del pedido.
   * @param {Array<Object>} data - Datos a exportar.
   */
  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SUGERIDO");
    XLSX.writeFile(workbook, "sugeridos.xlsx");
  };

  /**
   * Filtra productos basados en texto de búsqueda.
   * @param {string} searchText - Texto a buscar.
   * @param {boolean} buscarPorCodigo - Indica si filtrar por código o descripción.
   * @param {Array} productos - Lista de productos.
   * @param {Function} setProductosFiltrados - Setter para actualizar la lista filtrada.
   */
  const filtrarProductos = (searchText, buscarPorCodigo, productos, setProductosFiltrados) => {
    const filtrados = productos.filter((item) =>
      buscarPorCodigo
        ? item.codigoPrincipal.toLowerCase().includes(searchText)
        : item.descripcion.toLowerCase().includes(searchText)
    );
    setProductosFiltrados(filtrados);
  };
  
  /**
   * Desplaza el scroll hasta el principio.
   */
  const scrollToTop = () => {
    const container = document.querySelector(".inicio_pedido");
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  /**
   * Desplaza el scroll hasta el final.
   */
  const scrollToBottom = () => {
    const container = document.querySelector(".inicio_pedido");
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };
  
  return {
    formatDate,
    handleError,
    handleErrorSis,
    exportToExcel,
    filtrarProductos,
    scrollToTop,
    scrollToBottom,
    busquedaTexto,
    setBusquedaTexto,
    busqueda,
    setBusqueda,
  };
};

export default usePedidosHelpers;
