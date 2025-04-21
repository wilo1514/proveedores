import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import TablePagination from "@mui/material/TablePagination";
import Stack from "@mui/material/Stack";

import { validacion } from "../../../utils/apiUtils";
import Container from "../../../components/Container";
import Modal from "../../../components/Modal";
import DotSpinner from "../../../components/DotSpinner";
import fetchApi from "../../../utils/fechtData";

import { ReactComponent as Icon } from "../../../assets/iconos/eye.svg";
import LogoFinal from "../../../assets/images/conorque2.avif";
import "../../../css/ComponentesAdicionales/Tabla.css";
import "../../../css/Proveedores/Ordenes.css";

/**
 * Componente para gestionar y visualizar órdenes de compra sugeridas.
 * @component
 */
export default function RecensionView() {
  const Swal = require("sweetalert2");
  const CardCode = useSelector((state) => state.auth.datos_Usuario.CARDCODE);
  const navigate = useNavigate();

   // Estados para manejar la información de las órdenes de compra 
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageP, setPageP] = useState(0);
  const [rowsPerPage] = useState(10);
  const [rowsPerPageProduct] = useState(8);
  const [cantItems, setCantItems] = useState(0);
  const [codigoo, setCodigoo] = useState("");
  const [reset, setReset] = useState(false);

  
  // Fechas por defecto (últimos 7 días)
  const formatDate = (date) => date.toISOString().substr(0, 10);
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const [inicio, setInicio] = useState(formatDate(sevenDaysAgo));
  const [fin, setFin] = useState(formatDate(today));
  const [loading, setLoading] = useState(false);
 
  /**
   * Muestra una alerta en caso de error en la solicitud.
   * @param {string} error - Mensaje de error.
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
  const claseEstado = (idEstado) => {
    let sColor = "blanco";
    switch (idEstado) {
      case "PARA REVISION":
        sColor = "azul";
        break;
      case "NO APROBADA":
        sColor = "tomate";
        break;
      default:
        break;
    }
    return sColor;
  };

  const handleCodigo = (e) => {
    const docNum = e.target.value;
    setCodigoo(docNum);
  };
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [modalComentario, setModalComentario] = useState(false);
  const [comentAnulacion, setComentAnulacion] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosf, setProductosf] = useState({});


    /**
   * Maneja errores de sesión expirada y redirige al login.
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
   * Cierra el modal de visualización.
   */ 
  const cerrarModalVisualizar = () => {
    setModalVisualizar(!modalVisualizar);
    setPageP(0);
  };


    /**
   * Abre el modal de comentario con el motivo de no aprobación.
   * @param {string} datos - Comentario de la anulación.
   */
  const abrirModalComentario = (datos) => {
    setModalComentario(true);
    setComentAnulacion(datos);
  };

 
  /**
   * Cierra el modal de comentario.
   */ 
  const cerrarModalComentario = () => {
    setModalComentario(false);
  };

   /**
   * Abre el modal de visualización con los detalles de la orden.
   * @param {object} datos_orden - Datos de la orden seleccionada.
   */ 
  const abrirModalVisualizar = async (datos_orden) => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint:`/purchaseorder/ordersqlserver/${datos_orden.id}`, 
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
   * Almacena los productos de la orden seleccionada.
   * @param {object} products - Productos de la orden.
   */
  const listadoproductos = (products) => {
    setProductos(products.details);
    setProductosf(products);
  };
  const handleChangePage = async (event, newPage) => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      setPage(newPage);
      const datos = await fetchApi({
        endPoint:`/purchaseorder/ordersqlserver?recordsPorPagina=10&pagina=${newPage+1}&fechaDesde=${inicio}&fechaHasta=${fin}&codigoProveedor=${CardCode}&estado=TODAS`, 
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
      
    pasoSiguiente(datos.datos)
       
    } else {
      handleError();
    }
  };

  const handleChangePageProduct = (event, newPage) => {
    setPageP(newPage);
  };

  const reinicirarDatos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      setPage(0);
      setReset(!reset);
      setCodigoo("");
      setInicio(formatDate(sevenDaysAgo));
      setFin(formatDate(today));
      getData();
    } else {
      handleError();
    }
  };

    /**
   * Filtra las órdenes según los parámetros seleccionados.
   */
  const filtrarReportes = async () => { 
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const codigo = codigoo ? codigoo : 0;
  
      // Llamada a la API
      const datos = await fetchApi({
        endPoint: `/purchaseorder/ordersqlserver?pagina=1&recordsPorPagina=10&fechaDesde=${inicio}&fechaHasta=${fin}&codigoProveedor=${CardCode}&codigoOrden=${codigo}&estado=TODAS`, 
        method: 'GET', 
        paginacion: false, 
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + tokenId,
        }
      });
  
      console.log("Datos recibidos de la API:", datos);
  
      if (datos.error) {
        handleOrdenes();
        reinicirarDatos();
        setReset(!reset);
        setCodigoo(0);
        return;
      }
      pasoSiguiente(datos.datos)
    } else {
      handleError();
    }
  };
  

    /**
   * Obtiene la lista de órdenes de compra.
   */
  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      setLoading(true);
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint:`/purchaseorder/ordersqlserver?pagina=1&recordsPorPagina=10&fechaDesde=${inicio}&fechaHasta=${fin}&codigoProveedor=${CardCode}&estado=TODAS`, 
        method:'GET', 
        paginacion:true, 
        headers:{
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenId,
    }})
    if (datos.error){
        handleErrorSis(datos.error)
        setLoading(false)
        return
    } 
    setCantItems(datos.totalRegistros);
    pasoSiguiente(datos.datos)
    } else {
      handleError();
    }
  };


    /**
   * Filtra las órdenes, excluyendo las aprobadas.
   * @param {array} info - Lista de órdenes.
   */
  const pasoSiguiente = (info) => {
    setData(info);
    setLoading(false);
  };
  
  const handleInicioChange = (e) => {
    setInicio(formatDate(new Date(e.target.value)));
  };

  const handleFinChange = (e) => {
    setFin(formatDate(new Date(e.target.value)));
  };

  const setDefaultDates = () => {
    const today = new Date();
    const formattedToday = today.toISOString().substr(0, 10);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const formattedSevenDaysAgo = sevenDaysAgo.toISOString().substr(0, 10);
    setFin(formattedToday);
    setInicio(formattedSevenDaysAgo);
  };

  useEffect(() => {
    getData();
    setDefaultDates();
  }, []);

  return (
    <>
      <Container  fluid>
      <div className="panel">
          <p className="panel-title">ORDENES DE COMPRA SUGERIDAS</p>
          <div className="panel-grid">
            <div className="panel-item">
            <label className="input-label">N° de Orden</label>
                <input
                  className="modal-input"
                  id="combo-box-demo"
                  name="proveedor"
                  type="text"
                  placeholder="Ingrese número orden"
                  onChange={handleCodigo}
                  value={codigoo}
                />
            </div>
            <div className="panel-item">
            <label className="input-label">Desde: </label>
                <input
                  type="date"
                  value={inicio}
                  name="Desde"
                  onChange={handleInicioChange}
                  className="modal-input"
                />
            </div>
            <div className="panel-item">
            <label className="input-label">Hasta: </label>
                <input
                  type="date"
                  value={fin}
                  name="Hasta"
                  onChange={handleFinChange}
                  className="modal-input"
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      spacing: "5px",
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
                        d="M19 3H5C3.58579 3 2.87868 3 2.43934 3.4122C2 3.8244 2 4.48782 2 5.81466V6.50448C2 7.54232 2 8.06124 2.2596 8.49142C2.5192 8.9216 2.99347 9.18858 3.94202 9.72255L6.85504 11.3624C7.49146 11.7206 7.80967 11.8998 8.03751 12.0976C8.51199 12.5095 8.80408 12.9935 8.93644 13.5872C9 13.8722 9 14.2058 9 14.8729L9 17.5424C9 18.452 9 18.9067 9.25192 19.2613C9.50385 19.6158 9.95128 19.7907 10.8462 20.1406C12.7248 20.875 13.6641 21.2422 14.3321 20.8244C15 20.4066 15 19.4519 15 17.5424V14.8729C15 14.2058 15 13.8722 15.0636 13.5872C15.1959 12.9935 15.488 12.5095 15.9625 12.0976C16.1903 11.8998 16.5085 11.7206 17.145 11.3624L20.058 9.72255C21.0065 9.18858 21.4808 8.9216 21.7404 8.49142C22 8.06124 22 7.54232 22 6.50448V5.81466C22 4.48782 22 3.8244 21.5607 3.4122C21.1213 3 20.4142 3 19 3Z"
                        fill="Currentcolor"
                      />
                    </svg>
                    <span style={{ marginLeft: "5px" }}>FILTRAR</span>
                  </div>
                </button>

                <button
                  className="boton-ordenes"
                  style={{ background: "#128496" }}
                  onClick={reinicirarDatos}
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
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.2211 19.6431C18.6981 18.7396 19.1627 17.7065 19.4613 16.6623C19.8722 15.2247 20.0207 13.8751 20.0629 12.8451L18.5105 11.2926L12.7073 5.48944L11.1549 3.93701C10.1248 3.97917 8.77531 4.12767 7.33767 4.53865C6.29348 4.83716 5.26037 5.30183 4.35693 5.77885C2.10098 6.96998 1.42721 9.71071 2.49716 11.8068L2.51021 11.8324L3.20923 12.9815C5.15002 16.1718 7.82804 18.8499 11.0184 20.7907L12.1675 21.4898L12.1931 21.5028C14.2892 22.5728 17.0299 21.899 18.2211 19.6431Z"
                        fill="Currentcolor"
                      />
                      <path
                        d="M21.7747 3.31343C22.0751 3.01296 22.0751 2.52581 21.7747 2.22535C21.4742 1.92488 20.987 1.92488 20.6866 2.22535L19.0118 3.90018C17.3118 2.66569 14.9941 2.66575 13.2942 3.9002L14.4027 5.00866L18.9915 9.59749L20.0999 10.7059C21.3344 9.00597 21.3343 6.68821 20.0998 4.98826L21.7747 3.31343Z"
                        fill="Currentcolor"
                      />
                    </svg>

                    <span style={{ marginLeft: "5px" }}>Reiniciar</span>
                  </div>
                </button>
              </Stack>
            </div>
          </div>
        </div>

          <div className="panel">
            <div className="Scroll">
              <table className="table table-ligh table-hover">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>#</th>
                    <th style={{ textAlign: "center" }}>N° Orden</th>
                    <th style={{ textAlign: "center" }}>Sucursal</th>
                    <th style={{ textAlign: "center" }}>Fecha Orden</th>
                    <th style={{ textAlign: "center" }}>Estado</th>
                    <th style={{ textAlign: "center" }}>Comentario</th>
                    <th style={{ textAlign: "center" }}>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => {
                    const currentIndex = i + 1 + page * rowsPerPage;
                    const isNotApproved = item.estado === "NO APROBADA";
                    const isCommentEmpty =
                      !item.comentario || item.comentario.trim() === "";

                    return (
                      <tr key={currentIndex}>
                        <td className="center">{currentIndex}</td>
                        <td className="center">{item.id}</td>
                        <td className="center">{item.nombreAlmacen}</td>
                        <td style={{ textAlign: "center" }}>
                          {new Date(item.fechaDocumento).toLocaleDateString(
                            "es",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td className={`center ${claseEstado(item.estado)}`}>
                          {item.estado}
                        </td>
                        <td className="center">
                        {isNotApproved && (
                              <button
                                className={`remark ${
                                  isCommentEmpty ? "disabled" : "enabled"
                                }`}
                                onClick={() =>
                                  abrirModalComentario(item.comentario)
                                }
                                disabled={isCommentEmpty}
                              >
                                MOTIVO
                              </button>
                            )}
                        </td>
                        <td className="center">
                          <Stack
                            direction="row"
                            alignItems={"center"}
                            justifyContent={"center"}
                            spacing={1}
                          >
                            <Icon onClick={() => abrirModalVisualizar(item)} />
                      
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
            {loading && <DotSpinner />}
          </div>
      </Container>

      <Modal
        isOpen={modalVisualizar}
        onClose={() => {
          cerrarModalVisualizar();
        }}
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
                <div className="izquierdaa">
                  <p className="texto_conorque"> CONORQUE CIA LTDA</p>
                  <p className="texto_factura">
                    <strong>Dir. Matriz:</strong> Circunvalacion Sur Sn y
                    Avenida 12 de Octubre
                  </p>
                  <p className="texto_factura">
                    <strong>Sucursal:</strong> Circunvalacion Sur Sn y Avenida
                    12 de Octubre
                  </p>
                </div>
              </Stack>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <div className="derechaa">
              <Stack spacing={2} direction={"column"}>
                <p className="texto_fac">
                  <strong>ORDEN</strong> # {productosf.id}
                </p>
                <li className="li-tv">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#1dbb3a"
                    height="1.5rem"
                  >
                    <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                    <path
                      fillRule="evenodd"
                      d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <p className="texto_indicador">
                    <strong>Fecha Pedido: </strong>
                    {new Date(productosf.fechaDocumento).toLocaleDateString(
                      "es",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                </li>
                <li className="li-tv">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#1dbb3a"
                    height="1.5rem"
                  >
                    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
                    <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
                    <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
                  </svg>

                  <p className="texto_indicador">
                    <strong>Fecha Entrega: </strong>
                    {new Date(productosf.fechaEntrega).toLocaleDateString(
                      "es",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                </li>
                <li className="li-tv">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#1dbb3a"
                    height="1.5rem"
                  >
                    <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" />
                    <path
                      fillRule="evenodd"
                      d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <p className="texto_indicador">
                    <strong>Almacen: </strong>
                    {productosf.nombreAlmacen}
                  </p>
                </li>
                <li className="li-tv">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#1dbb3a"
                    height="1.5rem"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <p className="texto_indicador">
                    <strong>Asesor Comercial: </strong>
                    {productosf.nombreAsesor}
                  </p>
                </li>
              </Stack>
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <div className="Scroll">
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
                    <td style={{ textAlign: "center" }}>COMENTARIO</td>
                  </tr>
                </thead>
                <tbody>
                  {productos
                    .slice(
                      pageP * rowsPerPageProduct,
                      pageP * rowsPerPageProduct + rowsPerPageProduct
                    )
                    .map((products, i) => {
                      const currentIndex = i + 1 + pageP * rowsPerPageProduct;
                      return (
                        <tr key={currentIndex}>
                          <td className="center">{currentIndex}</td>
                          <td style={{ textAlign: "end" }}>
                            {products.codigoPrincipal}
                          </td>
                          <td style={{ textAlign: "end" }}>
                            {products.descripcion}
                          </td>
                          <td style={{ textAlign: "end" }}>
                            {products.cantidad}
                          </td>
                          <td style={{ textAlign: "end" }}>
                            ${products.precioUnitario}
                          </td>
                          <td style={{ textAlign: "end" }}>
                            {products.descuento}%
                          </td>
                          <td style={{ textAlign: "end" }}>
                            ${products.valor}
                          </td>
                          <td style={{ textAlign: "end" }}>
                            {products.comentario}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <TablePagination
                component="div"
                count={productos.length}
                rowsPerPage={rowsPerPageProduct}
                page={pageP}
                onPageChange={handleChangePageProduct}
                rowsPerPageOptions={[]}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={6}></Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Stack spacing={2} direction={"column"}>
              <table className="table table-ligh table-hover">
                <tbody>
                  <tr>
                    <th className="tablaItem1">
                      <p className="subtotal">SUBTOTAL:</p>
                    </th>
                    <td className="tablath">$ {productosf.subtotal}</td>
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
                    <td className="tablath">$ {productosf.total}</td>
                  </tr>
                </tbody>
              </table>
            </Stack>
          </Grid>
        </Grid>
      </Modal>
      <Modal
        isOpen={modalComentario}
        onClose={() => {cerrarModalComentario();}}
        title="MOTIVO DE NO APROBADO"
        size="md"
      >
        <p className="texto_producto">{comentAnulacion}</p>
      </Modal>
    </>
  );
}
