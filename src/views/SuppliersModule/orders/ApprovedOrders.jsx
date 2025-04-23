/**
 * Vista de órdenes de compra para proveedores.
 * Permite la visualización, filtrado y descarga de órdenes de compra.
 */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { validacion } from "../../../utils/apiUtils";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TablePagination from "@mui/material/TablePagination";

import Container from "../../../components/Container";
import Modal from "../../../components/Modal";
import DotSpinner from "../../../components/DotSpinner";
import fetchApi from "../../../utils/fechtData";
import Swal from 'sweetalert2';


import LogoFinal from "../../../assets/images/conorque2.avif";
import Icon from "../../../assets/iconos/eye.svg";
import "../../../css/ComponentesAdicionales/Tabla.css";
import "../../../css/Proveedores/Ordenes.css";
import "../../../css/EmpleadosMegas/Employees.css";

/**
 * Componente principal para la visualización de órdenes de compra.
 * @returns {JSX.Element} Componente de órdenes de compra.
 */
export default function OrdersView() {
  const CardCode = useSelector((state) => state.auth.datos_Usuario.CARDCODE);
  const navigate = useNavigate();
    // Estados para almacenar información relevante de las órdenes
  const [data, setData] = useState([]);
  const [datosSucursal, setdatosSucursal] = useState([]);
  const [page, setPage] = useState(0);
  const [pageP, setPageP] = useState(0);
  const [rowsPerPage] = useState(10);
  const [rowsPerPageProduct] = useState(8);
  const [cantItems, setCantItems] = useState(0);
  const [estadoo, setEstadoo] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [codigoo, setCodigoo] = useState(0);
  const [reset, setReset] = useState(false);
  const [loading, setLoading] = useState(false);
  
    /**
   * Maneja la selección de una sucursal del dropdown.
   * @param {Event} event - Evento de selección.
   */
  const handleSucursal = (event) => {
    const nombreSucursal = event.target.value;
    const sucursalSeleccionada = datosSucursal.find(
      (suc) => suc.whsName === nombreSucursal
    );
    setSucursal(sucursalSeleccionada ? sucursalSeleccionada.whsCode : "");
  };

    /**
   * Maneja el cambio de número de orden ingresado.
   * @param {Event} e - Evento del input.
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
   * Maneja el cambio del estado seleccionado.
   * @param {Event} event - Evento de selección.
   */
  const handleStatus = (event) => {
    setEstadoo(event.target.value);
  };



  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosf, setProductosf] = useState({});
  const claseEstado = (idEstado) => {
    let sColor = "blanco";
    switch (idEstado) {
      case "POR DESPACHAR":
        sColor = "tomate";
        break;
      case "ENTREGADO":
        sColor = "azul";
        break;
      case "FACTURADO":
        sColor = "morado";
        break;
      case "PAGADO":
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
  const estadosp = [
    { label: "POR DESPACHAR" },
    { label: "ENTREGADO" },
    { label: "FACTURADO" },
    { label: "PAGADO" },
    { label: "CANCELADO" },
  ];

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

  const handleOrdenes = () => {
    Swal.fire({
      position: "center",
      icon: "warning",
      title: "ORDENES INEXISTENTES",
      text: "No se encontro ordenes con esos parámetro",
      showConfirmButton: false,
      timer: 5000,
    });
  };

  const descargarPdf = async (datos_orden, setLoading) => {
    setLoading(true);
    try {
      const validado = await validacion();
      if (validado === 1) {
        const tokenId = localStorage.getItem("token");
        const datos = await fetchApi({
          endPoint: `/purchaseorder/printpdforder/${datos_orden.docNum}`,
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
      link.download = "OrdenPedido.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  const PdfDownloadButton = ({ item, isDisabled }) => {
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
            onClick={() => {
              if (!isDisabled) descargarPdf(item, setLoading);
            }}
            style={{
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.3 : 1,
            }}
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

  const cerrarModalVisualizar = () => {
    setModalVisualizar(!modalVisualizar);
    setPageP(0);
  };
  const abrirModalVisualizar = async (datos_orden) => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/purchaseorder/${datos_orden.docNum}`,
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

      listadoproductos(datos.datos);
      setModalVisualizar(!modalVisualizar);
    } else {
      handleError();
    }
  };

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
        endPoint: `/purchaseorder/${CardCode}?pagina=${newPage + 1}&recordsPorPagina=10&whsCode=${sucursal}&status=${estadoo}&docNum=${codigoo}`,
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
      pasoSiguiente(datos.datos);
    } else {
      handleError();
    }
  };

  const handleChangePageProduct = (event, newPage) => {
    setPageP(newPage);
  };

     /**
   * Obtiene la lista de sucursales.
   */ 
  const getSucursales = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/warehouse/ObtenerSucursales`,
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
        setdatosSucursal(sucursales);
      }
    } else {
      handleError();
    }
  };

  const reinicirarDatos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      setPage(0);
      getData();
      setReset(!reset);
      setCodigoo(0);
      setSucursal("");
      setEstadoo("");
    } else {
      handleError();
    }
  };

  const filtrarReportes = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/purchaseorder/${CardCode}?pagina=1&recordsPorPagina=10&whsCode=${sucursal}&status=${estadoo}&docNum=${codigoo}`,
        method: "GET",
        paginacion: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenId,
        },
      });
      if (datos.error) {
        setLoading(false);
        setReset(!reset);
        setCodigoo(0);
        setTimeout(() => handleOrdenes(), 1000);}
      setCantItems(datos.totalRegistros);
      pasoFiltrar(datos.datos);
      setPage(0);
      const cantidad = datos.datos.length;
      if (cantidad === 0) {
        setLoading(false);
        reinicirarDatos();
        setTimeout(() => handleOrdenes(), 1000);}
    } else {
      setLoading(false);
      handleError();
    }
  };
  

  const pasoFiltrar = (info) => {
    if (data.length !== 0) {
      return setData(info);
    } else {
      handleOrdenes();
    }
  };

  /**
   * Obtiene las órdenes de compra del proveedor autenticado.
   */
  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      setLoading(true);
      const datos = await fetchApi({
        endPoint: `/purchaseorder/${CardCode}`,
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
      setCantItems(datos.totalRegistros);
      pasoSiguiente(datos.datos);
    } else {
      handleError();
    }
  };

    /**
   * Maneja los datos obtenidos de la API.
   * @param {Array} info - Datos de las órdenes de compra.
   */
  const pasoSiguiente = (info) => {
    setData(info);
    setLoading(false);
  };

    // Llamar a las funciones para obtener datos al cargar el componente
  useEffect(() => {
    getSucursales();
    getData();
  }, []);

  return (
    <>
      <Container fluid>
        <div className="panel">
          <p className="panel-title">ORDENES DE COMPRA</p>
          <div className="panel-grid">
            <div className="panel-item">
              <label className="input-label">Sucursal</label>
              <select
                className="select-dashboard"
                value={
                  datosSucursal.find((suc) => suc.whsCode === sucursal)
                    ?.whsName || ""
                }
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
              <label className="input-label">Estado</label>
              <select
                id="combo-box-demo"
                className="select-dashboard"
                value={estadoo}
                onChange={handleStatus}
              >
                <option value="" className="default-option">
                  Seleccione un estado
                </option>
                {estadosp.map((estado) => (
                  <option key={estado.label} value={estado.label}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="panel-item">
              <label className="input-label">N° Orden</label>
              <input
                key={reset}
                className="modal-input"
                id="combo-box-demo"
                name="proveIdentificadoredor"
                type="text"
                placeholder="Ingrese número orden"
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
                  <th style={{ textAlign: "center" }}>Estado</th>
                  <th style={{ textAlign: "center" }}>Fecha Orden</th>
                  <th style={{ textAlign: "center" }}>Fecha Entrega</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const currentIndex = i + 1 + page * rowsPerPage;
                  const isDisabled = item.status !== "POR DESPACHAR";
                  return (
                    <tr key={item.docNum}>
                      <td className="center">{currentIndex}</td>
                      <td className="center">{item.docNum}</td>
                      <td className="start">{item.whsName}</td>
                      <td className={`center ${claseEstado(item.status)}`}>
                        {item.status}
                      </td>
                      <td className="center">
                        {new Date(item.docDate).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="center">
                        {new Date(item.docDueDate).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="center">
                        <Stack
                          spacing={2}
                          direction={"row"}
                          justifyContent={"center"}
                        >
                            <img src={Icon}
                              onClick={() => {
                                abrirModalVisualizar(item);
                              }}
                            />
                            <PdfDownloadButton
                              item={item}
                              isDisabled={isDisabled}
                            />
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
        className="Pruebas"
      >
        <Grid container spacing={2} style={{backgroundColor:"#fff"}}>
          <Grid item xs={12} sm={12} md={6}>
            <Grid container spacing={2} style={{backgroundColor:"#fff"}}>
              <Grid item xs={12} sm={6} md={12}>
                <div className="contenedorImagenvisua">
                  <img src={LogoFinal} height={100} alt="" />
                </div>
              </Grid>
              <Grid item xs={12} sm={6} md={12}>
                <div className="izquierdaa">
                  <Stack spacing={2} direction={"column"}>
                    <p className="texto_conorque"> CONORQUE CIA LTDA</p>
                    <p className="texto_factura">
                      <strong>Dir. Matriz:</strong> Circunvalacion Sur Sn y
                      Avenida 12 de Octubre
                    </p>
                    <p className="texto_factura">
                      <strong>Sucursal:</strong> Circunvalacion Sur Sn y Avenida
                      12 de Octubre
                    </p>
                  </Stack>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <div className="derechaa">
              <Stack spacing={2} direction={"column"}>
                <p className="texto_fac">
                  <strong>ORDEN</strong> # {productosf.docNum}
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
                    <strong>Fecha Ingreso: </strong>
                    {new Date(productosf.docDate).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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
                    {new Date(productosf.docDueDate).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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
                    {productosf.whsName}
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
                    {productosf.slpName}
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
                    <td style={{ textAlign: "center" }}>Código</td>
                    <td style={{ textAlign: "center" }}>Descripción</td>
                    <td style={{ textAlign: "center" }}>Cant.</td>
                    <td style={{ textAlign: "center" }}>P Unit.</td>
                    <td style={{ textAlign: "center" }}>Dest.</td>
                    <td style={{ textAlign: "center" }}>P Total</td>
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
                          <td style={{ textAlign: "center" }}>
                            {products.codeBars}
                          </td>
                          <td style={{ textAlign: "start" }}>
                            {products.itemName}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {products.quantity}
                          </td>
                          <td style={{ textAlign: "end" }}>
                            ${products.unitPrice}
                          </td>
                          <td style={{ textAlign: "end" }}>
                            {products.discount}%
                          </td>
                          <td style={{ textAlign: "end" }}>
                            ${products.lineTotal}
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
          <Grid item xs={12} sm={12} md={7}></Grid>
          <Grid item xs={12} sm={12} md={5}>
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
                      <p className="subtotal">DESCUENTO:</p>
                    </th>
                    <td className="tablath">$ {productosf.discountHeader}</td>
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
