/**
 * HistoricoPrecioView - Componente para visualizar el histórico de precios sugeridos.
 * 
 * Este componente permite filtrar, visualizar y exportar registros del historial de precios
 * sugeridos por proveedores. Proporciona funcionalidades para gestionar la paginación, descarga de datos
 * en Excel y visualización detallada de cada solicitud.
 * 
 * @component
 * @returns {JSX.Element}
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import * as XLSX from "xlsx";
import { Grid, Stack, TablePagination } from "@mui/material";
import Swal from "sweetalert2";

import Container from "../../../components/Container";
import { validacion } from "../../../utils/apiUtils";
import Modal from "../../../components/Modal";
import fetchApi from "../../../utils/fechtData";
import LogoFinal from "../../../assets/images/conorque2.avif";

import { ReactComponent as Icon } from "../../../assets/iconos/eye.svg";
import "../../../css/Proveedores/UpdatePrice.css";

export default function HistoricoPrecioView() {
  const navigate = useNavigate();
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [codigoo, setCodigoo] = useState("");
  const [cantItems, setCantItems] = useState(0);
  // Formatea la fecha en formato YYYY-MM-DD
  const formatDate = (date) => date.toISOString().substr(0, 10);
  const [rowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 30);
  const [inicio, setInicio] = useState(formatDate(sevenDaysAgo));
  const [fin, setFin] = useState(formatDate(today));
  const [devolucion, setDevolucion] = useState({});
  const [detalles, setDetalles] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const CardCode = useSelector(
    (state) => state.auth.datos_Usuario?.CARDCODE ?? ""
  );

  /**
   * Maneja la respuesta en caso de error en la solicitud de datos.
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
   // Muestra una alerta cuando no hay órdenes disponibles
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

  // Maneja el cambio de fecha de inicio
  const handleInicioChange = (e) => {
    setInicio(formatDate(new Date(e.target.value)));
  };

  // Maneja el cambio de fecha de fin
  const handleFinChange = (e) => {
    setFin(formatDate(new Date(e.target.value)));
  };
 /**
   * Maneja el cambio de página en la tabla paginada.
   * @param {Event} event - Evento del paginador.
   * @param {number} newPage - Nueva página seleccionada.
   */ 
  const handleChangePage = async (event, newPage) => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      setPage(newPage);
      const datos = await fetchApi({
        endPoint: `/items/preciosugeridosqlserver?recordsPorPagina=10&pagina=${newPage + 1}&fechaDesde=${inicio}&fechaHasta=${fin}&codigoProveedor=${CardCode}&estado=Todas`,
        method: 'GET',
        paginacion: false,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + tokenId,
        }
      })
      if (datos.error) {
        handleErrorSis(datos.error)
        return
      }
      pasoSiguiente(datos.datos)
    } else {
      handleError();
    }
  };

  const claseEstado = (idEstado) => {
    let sColor = "blanco";
    switch (idEstado) {
      case "PARA REVISION":
        sColor = "azul";
        break;
      case "NO APROBADA":
        sColor = "tomate";
        break;
      case "APROBADA":
        sColor = "verde";
        break;
      default:
        break;
    }
    return sColor;
  };


  /**
   * Obtiene los datos del historial de precios desde el API.
   * @param {number} [newPage=0] - Página de datos a recuperar.
   */
  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      setLoading(true);
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/items/preciosugeridosqlserver?pagina=1&recordsPorPagina=10&fechaDesde=${inicio}&fechaHasta=${fin}&codigoProveedor=${CardCode}&estado=Todas`,
        method: 'GET',
        paginacion: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + tokenId,
        }
      })
      if (datos.error) {
        handleErrorSis(datos.error)
        setLoading(false)
        return
      }
      setCantItems(datos.totalRegistros)
      pasoSiguiente(datos.datos)
    } else {
      handleError();
    }
  };

  const pasoSiguiente = (info) => {
    setHistorial(info);
    setLoading(false);
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

      const filteredData = datos.datos.map(item => ({
        "Código Barras": item["codigoPrincipal"],
        "Descripción": item["descripcion"],
        "Precio Actual": item["precioActual"],
      }));
      exportToExcel(filteredData);
    } else {
      console.log("error");
    }
  };

  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: ["Código Barras", "Descripción", "Precio Actual"],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Precios");

    // Guarda el archivo Excel
    XLSX.writeFile(workbook, "precios_negociados.xlsx");
  };

  const irNuevoListado = () => {
    navigate("/actualizacionprecio/listado");
  };

  const abrirModalVisualizar = async (datos_orden) => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/items/preciosugeridosqlserver/${datos_orden.id}`,
        method: 'GET',
        paginacion: false,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + tokenId,
        }
      })
      if (datos.error) {
        handleErrorSis(datos.error)
        return
      }
      listadoproductos(datos.datos)
      setModalVisualizar(!modalVisualizar);
    } else {
      handleError();
    }
  };

  const descargarExcelSolicitud = () => {
    const filterDataS = detalles.map((item) => ({
      "Código Barras":item.codigoPrincipal,
      "Descripción":item.descripcion,
      "Precio Anterior":item.precioUnitario,
      "Precio Solicitado":item.precioSugerido,
      "Estado":item.estado,
    }));
    exportToExcelSolicitud (filterDataS);
  }

  const exportToExcelSolicitud = (data) => {
    const worksheet =XLSX.utils.json_to_sheet(data, {
      header: ["Código Barras","Descripción", "Precio Anterior", "Precio Solicitado", "Estado"]
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook,worksheet, "ACTUALIZACION PRECIOS");
    XLSX.writeFile(workbook, "actualizacion.xlsx")
  }

  const listadoproductos = (products) => {
    setDevolucion(products);
    setDetalles(products.details);
  };


  const cerraModalVisualizar = () => {
    setModalVisualizar(false)
  };

   // Maneja el cambio de código de orden
  const handleCodigo = (e) => {
    const docNum = e.target.value;
    setCodigoo(docNum);
  };


    // Filtra los reportes según los parámetros seleccionados
  const filtrarReportes = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/items/preciosugeridosqlserver?pagina=1&recordsPorPagina=10&fechaDesde=${inicio}&fechaHasta=${fin}&codigoProveedor=${CardCode}&codigoPrecioSugerido=${codigoo}&estado=Todas`,
        method: 'GET',
        paginacion: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + tokenId,
        }
      })
      if (datos.error) {
        handleOrdenes();
        reinicirarDatos();
        setCodigoo(0);
        return
      }

      const registro = parseInt(datos.totalRegistros)
      setCantItems(registro)
      setHistorial(datos.datos);
      setPage(0);
    } else {
      handleError();
    }
  };

    // Reinicia los filtros de búsqueda
  const reinicirarDatos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      setPage(0);
      setCodigoo("");
      setInicio(formatDate(sevenDaysAgo));
      setFin(formatDate(today));
      getData();
    } else {
      handleError();
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Container className="inicio_pedido" fluid>
        <div className="panel">
          <p className="panel-title">HISTÓRICO ACTUALIZACIÓN PRECIOS</p>
          {/* Filtros de búsqueda y tabla de resultados */}
          <div className="panel-grid">
            <div className="panel-item">
              <label className="input-label">Id Solicitud</label>
              <input
                className="modal-input"
                id="combo-box-demo"
                name="id"
                type="text"
                placeholder="Ingrese id solicitud"
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
          <div className="panel-title">
            <Stack
              direction={isMobile ? 'column' : 'row'}
              alignItems={"center"}
              justifyContent={"space-between"}
              spacing={2}
            >
              <p className="panel-title"></p>
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
                <button className="boton-orden" onClick={irNuevoListado}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      spacing: "5px",
                    }}
                  >
                    <svg height="1.3rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M7.26279 3.25871C7.38317 2.12953 8.33887 1.25 9.5 1.25H14.5C15.6611 1.25 16.6168 2.12953 16.7372 3.25871C17.5004 3.27425 18.1602 3.31372 18.7236 3.41721C19.4816 3.55644 20.1267 3.82168 20.6517 4.34661C21.2536 4.94853 21.5125 5.7064 21.6335 6.60651C21.75 7.47348 21.75 8.5758 21.75 9.94339V16.0531C21.75 17.4207 21.75 18.523 21.6335 19.39C21.5125 20.2901 21.2536 21.048 20.6517 21.6499C20.0497 22.2518 19.2919 22.5107 18.3918 22.6317C17.5248 22.7483 16.4225 22.7483 15.0549 22.7483H8.94513C7.57754 22.7483 6.47522 22.7483 5.60825 22.6317C4.70814 22.5107 3.95027 22.2518 3.34835 21.6499C2.74643 21.048 2.48754 20.2901 2.36652 19.39C2.24996 18.523 2.24998 17.4207 2.25 16.0531V9.94339C2.24998 8.5758 2.24996 7.47348 2.36652 6.60651C2.48754 5.7064 2.74643 4.94853 3.34835 4.34661C3.87328 3.82168 4.51835 3.55644 5.27635 3.41721C5.83977 3.31372 6.49963 3.27425 7.26279 3.25871ZM7.26476 4.75913C6.54668 4.77447 5.99332 4.81061 5.54735 4.89253C4.98054 4.99664 4.65246 5.16382 4.40901 5.40727C4.13225 5.68403 3.9518 6.07261 3.85315 6.80638C3.75159 7.56173 3.75 8.56285 3.75 9.99826V15.9983C3.75 17.4337 3.75159 18.4348 3.85315 19.1901C3.9518 19.9239 4.13225 20.3125 4.40901 20.5893C4.68577 20.866 5.07435 21.0465 5.80812 21.1451C6.56347 21.2467 7.56458 21.2483 9 21.2483H15C16.4354 21.2483 17.4365 21.2467 18.1919 21.1451C18.9257 21.0465 19.3142 20.866 19.591 20.5893C19.8678 20.3125 20.0482 19.9239 20.1469 19.1901C20.2484 18.4348 20.25 17.4337 20.25 15.9983V9.99826C20.25 8.56285 20.2484 7.56173 20.1469 6.80638C20.0482 6.07261 19.8678 5.68403 19.591 5.40727C19.3475 5.16382 19.0195 4.99664 18.4527 4.89253C18.0067 4.81061 17.4533 4.77447 16.7352 4.75913C16.6067 5.87972 15.655 6.75 14.5 6.75H9.5C8.345 6.75 7.39326 5.87972 7.26476 4.75913ZM9.5 2.75C9.08579 2.75 8.75 3.08579 8.75 3.5V4.5C8.75 4.91421 9.08579 5.25 9.5 5.25H14.5C14.9142 5.25 15.25 4.91421 15.25 4.5V3.5C15.25 3.08579 14.9142 2.75 14.5 2.75H9.5ZM12 9.25C12.4142 9.25 12.75 9.58579 12.75 10L12.75 12.25H15C15.4142 12.25 15.75 12.5858 15.75 13C15.75 13.4142 15.4142 13.75 15 13.75H12.75V16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16V13.75H9C8.58579 13.75 8.25 13.4142 8.25 13C8.25 12.5858 8.58579 12.25 9 12.25H11.25L11.25 10C11.25 9.58579 11.5858 9.25 12 9.25Z" fill="Currentcolor" />
                    </svg>
                    <span style={{ marginLeft: "8px" }}> NUEVO LISTADO</span>
                  </div>
                </button>
                <button
                  className="boton-orden"
                  onClick={descargarExcel}
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
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      height="1.1rem"
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
                    <span style={{ marginLeft: "8px" }}>PRECIOS NEGOCIADOS</span>
                  </div>
                </button>
              </Stack>
            </Stack>
          </div>
          <div className="Scroll">
            <table className="table table-ligh table-hover">
              <thead>
                <tr>
                  <th style={{ textAlign: "start" }}>Id</th>
                  <th style={{ textAlign: "start" }}>Descripción</th>
                  <th style={{ textAlign: "start" }}>Fecha</th>
                  <th style={{ textAlign: "start" }}>Solicitante</th>
                  <th style={{ textAlign: "start" }}>Estado</th>
                  <th style={{ textAlign: "start" }}>Revisado por</th>
                  <th style={{ textAlign: "start" }}>Motivo</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((listado, i) => {
                  const currentIndex = i + 1;
                  return (
                    <tr key={currentIndex}>
                      <td className="start">{listado.id}</td>
                      <td className="start">{listado.nombreListado}</td>
                      <td className="start">
                        {new Date(listado.fechaEntrega).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="start">{listado.solicitante}</td>
                      <td className={`start ${claseEstado(listado.estado)}`}>
                        {listado.estado}
                      </td>
                      <td className="start">{listado.nombreAsesor}</td>
                      <td className="start">{listado.motivoAnulacion}</td>
                      <td className="center">
                        <Icon onClick={() => { abrirModalVisualizar(listado); }} />  
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TablePagination
            component="div"
            count={cantItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[]}
          />
        </div>
      </Container>
      <Modal
        isOpen={modalVisualizar}
        onClose={() => { cerraModalVisualizar() }}
        title=""
        size="lg"
        className="Pruebas"
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
                      <strong>Estado Solicitud: </strong> {devolucion.estado}
                    </p>

                  </Stack>
                </div>
              </Stack>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <div className="derechaa">
              <Stack spacing={2} direction={"column"}>
                <p className="texto_fac">
                  <strong>SOLICITUD N° {devolucion.id}</strong>
                </p>
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>Tipo: </strong>
                    {devolucion.tipo}
                  </p>
                </li>
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>Descripción: </strong>
                    {devolucion.nombreListado}
                  </p>
                </li>
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>Solicitante: </strong>
                    {devolucion.solicitante}
                  </p>
                </li>
              </Stack>
            </div>
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <button className="boton-orden" onClick={descargarExcelSolicitud}> DESCARGAR EXCEL</button>
          </Grid>
          
          <Grid item xs={12} sm={12} md={12}>
            <div className="Scroll" style={{ marginTop: '20px', marginBottom: '20px' }}>
              <table className="table table-ligh table-hover">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>#</th>
                    <th style={{ textAlign: "center" }}>Código Barras</th>
                    <th style={{ textAlign: "center" }}>Descripcion</th>
                    <th style={{ textAlign: "center" }}>Precio Cambiado</th>
                    <th style={{ textAlign: "center" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((item, i) => {
                    const currentIndex = i + 1;
                    const rowStyle = item.estado !== "APROBADO" ? { color: '#151635', opacity: '0.5', cursor: 'not-allowed' } : { color: 'green' };
                    return (
                      <tr key={currentIndex} style={rowStyle}>
                        <td className="start">{currentIndex}</td>
                        <td style={{ textAlign: "start" }}>{item.codigoPrincipal}</td>
                        <td style={{ textAlign: "start" }}>{item.descripcion}</td>
                        <td style={{ textAlign: "end" }}>$ {item.precioSugerido}</td>
                        <td style={{ textAlign: "end" }}>{item.estado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Grid>
        </Grid>
      </Modal>
    </>
  );
}
