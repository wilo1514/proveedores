import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Container from "../../../components/Container";
import { Stack, TablePagination } from "@mui/material";
import DotSpinner from "../../../components/DotSpinner";
import { ReactComponent as Icon } from "../../../assets/iconos/eye.svg";
import Modal from "../../../components/Modal";
import "../../../css/Proveedores/Pagos.css";
import { validacion } from "../../../utils/apiUtils";
import fetchApi from "../../../utils/fechtData";
import LogoFinal from "../../../assets/images/conorque2.avif";

/**
 * Componente para visualizar y gestionar pagos efectuados.
 * @component
 */
export default function PagosView() {
  const Swal = require("sweetalert2");
  const CardCode = useSelector((state) => state.auth.datos_Usuario.CARDCODE);
  const navigate = useNavigate();

    // Estados para manejar la información de los pagos
  const [reset, setReset] = useState(false);
  const [data, setData] = useState([]);
  const [codigo, setCodigo] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [modalVisualizar, setModalVisualizar] = useState(false);
  
  // Fechas por defecto (últimos 30 días)
  const formatDate = (date) => date.toISOString().substr(0, 10);
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 30);
  const [inicio, setInicio] = useState(formatDate(sevenDaysAgo));
  const [fin, setFin] = useState(formatDate(today));
  const [loading, setLoading] = useState(false);
  const [cantItems, setCantItems] = useState(0);
  const [detalles, setDetalles] = useState([]);
  const [detallesCabeceras, setDetallesCabeceras] = useState({});
  const [pageDetalles, setPageDetalles] = useState(0);
  const [rowsPerPageDetalles] = useState(15);


  /**
   * Maneja el cambio en el campo de código de pago.
   * @param {Event} e - Evento de cambio en el input.
   */
  const handleCodigo = (e) => {
    const docNum = e.target.value
    if (!isNaN(docNum)) {
      setCodigo(docNum)
    } else {
      setCodigo(1)
    }
  };


  const handleChangePage = (e, newPage) => {
    setPage(newPage)
  };
  const handleChangePageDetalles = (e, newPage) => {
    setPageDetalles(newPage)
  };

  const handleInicioChange = (e) => {
    setInicio(formatDate(new Date(e.target.value)));
  };

  const handleFinChange = (e) => {
    setFin(formatDate(new Date(e.target.value)));
  };

  
  /**
   * Maneja los errores de sistema mostrando una alerta.
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
   * Maneja el error de sesión expirada.
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

  const PdfDownloadButton = ({ item, isDisabled }) => {
    const [loading, setLoading] = useState(false);
    return (
      <>
        {loading ? (<DotSpinner />) : (
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
    )
  };

  const descargarPdf = async (datos_pago, setLoading) => {
    setLoading(true);
    try {
      const validado = await validacion();
      if (validado === 1) {
        const tokenId = localStorage.getItem("token");
        const datos = await fetchApi({
          endPoint: `/outgoingpayment/printpdfpagoefectuado/${datos_pago.docNum}`,
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
      link.download = "Pagos.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  }
  const abrirModalVisualizar = async (datos_orden) => {
    const valido = await validacion();
    if (valido === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/outgoingpayment/${datos_orden.docNum}`,
        method: 'GET',
        paginacion: false,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer" + tokenId,
        }
      })
      if (datos.error) {
        handleErrorSis(datos.error)
      }
      listadoproductos(datos.datos);
      setModalVisualizar(!modalVisualizar);
    } else {
      handleError();
    }
  };

  const listadoproductos = (products) => {
    setDetalles(products.details);
    setDetallesCabeceras(products);
  };

  const cerrarModalVisualizar = () => {
    setModalVisualizar(!modalVisualizar);
    setPageDetalles(0);
  };

  /**
   * Obtiene la lista de pagos efectuados.
   */
  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      setLoading(true);
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/outgoingpayment?pagina=1&recordsPorPagina=10&dateFrom=${inicio}&dateTo=${fin}&cardCode=${CardCode}`,
        method: 'GET',
        paginacion: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer" + tokenId,
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

  const pasoSiguiente = (info) => {
    setData(info);
    setLoading(false);
  };

 
  
  /**
   * Filtra pagos según los parámetros seleccionados.
   */
  const filtrarReportes = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/outgoingpayment?pagina=1&recordsPorPagina=10&dateFrom=${inicio}&dateTo=${fin}&cardCode=${CardCode}&docNum=${codigo}`,
        method: 'GET',
        paginacion: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer" + tokenId,
        }
      });
      if (datos.error) {
        setLoading(false);
        setReset(!reset);
        setCodigo(0);
      }
      setCantItems(datos.totalRegistros);
      pasoFiltrar(datos.datos);
      setPage(0);
      const cantidad = datos.datos.length;
      if (cantidad === 0) {
        setLoading(false);
        handleOrdenes();
        reinicirarDatos();
      }
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
   * Reinicia los filtros y vuelve a cargar la información.
   */ 
  const reinicirarDatos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      setPage(0);
      setInicio(formatDate(sevenDaysAgo));
      setFin(formatDate(today));
      getData();
      setReset(!reset);
      setCodigo(0);
    } else {
      handleError();
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Container fluid>
        <div className="panel">
          <div className="panel-title">PAGOS EFECTUADOS</div>
          <div className="panel-grid">
            <div className="panel-item">
              <label>N° Pago</label>
              <input
                key={reset}
                className="modal-input"
                id="combo-box-demo"
                name="pagoId"
                type="text"
                placeholder="Ingrese id del pago"
                onChange={handleCodigo}
                maxLength={10}
              />
            </div>
            {/* <div className="panel-item">
              <label>Tipo de Pago</label>
              <select
                className="select-dashboard"
                value={tipoPago}
                onChange={handleTipoPago}
              >
                <option value="">
                  Todos
                </option>
                {tiposPago.map((tipo) => (
                  <option key={tipo.label} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div> */}
            <div className="panel-item">
              <label>Desde:</label>
              <input
                type="date"
                value={inicio}
                name="Desde"
                onChange={handleInicioChange}
                className="modal-input"
              />
            </div>
            <div className="panel-item">
              <label>Hasta:</label>
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
                alignItems="center"
                justifyContent="space-between"
                spacing={2}>
                <button
                  className="boton-ordenes"
                  style={{ background: "#06ac2e" }}
                  onClick={filtrarReportes}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", spacing: "5px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", spacing: "5px" }}>
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
                    <span style={{ marginLeft: "5px" }}>REINICIAR</span>
                  </div>
                </button>
              </Stack>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="Scroll">
            <table className="table table-light table-hover">
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>N° Pago</th>
                  <th style={{ textAlign: "center" }}>Fecha</th>
                  <th style={{ textAlign: "center" }}>Tipo</th>
                  <th style={{ textAlign: "center" }}>Monto</th>
                  <th style={{ textAlign: "center" }}>Recibido</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const currentIndex = i + 1 + page * rowsPerPage;
                  return (
                    <tr key={currentIndex}>
                      <td style={{ textAlign: "center" }}>{item.docNum}</td>
                      <td style={{ textAlign: "center" }}>
                        {new Date(item.docDate).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.type}</td>
                      <td style={{ textAlign: "center" }}>${item.totalPayment}</td>
                      <td style={{ textAlign: "center" }}>{item.paymentRetired}</td>
                      <td style={{ textAlign: "center" }}>
                        <Stack
                          direction="row"
                          alignItems={"center"}
                          justifyContent={"center"}
                          spacing={1}
                        >
                          <Icon onClick={() => abrirModalVisualizar(item)} />
                          <PdfDownloadButton item={item} />
                        </Stack>

                      </td>
                    </tr>
                  )
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
        </div>
      </Container>

      <Modal
        isOpen={modalVisualizar}
        onClose={() => {
          cerrarModalVisualizar();
        }}
        size="lg"
      >
        <img src={LogoFinal} height={60} alt="" />
        <p className="texto_pagos" style={{ marginTop: '3rem' }}>Cuenca, Señores:</p>
        <p className="texto_pagos">{detallesCabeceras.cardName}</p>
        <p className="texto_pagos">
          Nos complace informarles que <strong>CONORQUE CIA LTDA. (RUC 0190386252001)</strong> le ha realizado el pago de <strong>${detallesCabeceras.totalPayment}</strong> mediante <strong>{detallesCabeceras.type}</strong>, correspondiente a los siguientes documentos:
        </p>

        <p className="titulo_pagos" style={{ marginTop: '2rem' }}>COMPROBANTE DE PAGO NRO:{detallesCabeceras.docNum}</p>

        <div className="datos_beneficiario">
          <p className="texto_factura">
            RUC del Beneficiario : <span>{detallesCabeceras.licTradNum} </span>
          </p>
          <p className="texto_factura">
            Nombre : <span>{detallesCabeceras.cardName}</span>
          </p>
          <p className="texto_factura">
            Valor total de pago: <span>{detallesCabeceras.totalPayment} USD</span>
          </p>
          <p className="texto_factura">
            Fecha de pago:
            <span> {new Date(detallesCabeceras.docDate).toLocaleDateString("es", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}</span>
          </p>
        </div>


        <div className="Scroll">
          <table className="table table-ligh table-hover">
            <thead>
              <tr style={{ background: '#9c9a9a', color: 'white' }}>
                <td style={{ textAlign: "center" }}>Nro. Factura</td>
                <td style={{ textAlign: "center" }}>Valor a pagar</td>
                <td style={{ textAlign: "center" }}>Valor retención</td>
                <td style={{ textAlign: "center" }}>Valores aplicados</td>
                <td style={{ textAlign: "center" }}>Valor pagado</td>
              </tr>
            </thead>
            <tbody>
              {detalles.slice(
                pageDetalles * rowsPerPageDetalles,
                pageDetalles * rowsPerPageDetalles + rowsPerPageDetalles,

              )
                .map((detalle, i) => {
                  const currentIndex = i + 1 + pageDetalles * rowsPerPageDetalles;
                  return (
                    <tr key={currentIndex} style={{ borderBottom: '1px solid #a3a0a0' }}>
                      <td style={{ borderBottom: '1px solid #a3a0a0', textAlign: "center" }}>{detalle.numAtCard}</td>
                      <td style={{ borderBottom: '1px solid #a3a0a0', textAlign: "end" }}>${detalle.totalDocument}</td>
                      <td style={{ borderBottom: '1px solid #a3a0a0', textAlign: "end" }}>${detalle.valueRetention}</td>
                      <td style={{ borderBottom: '1px solid #a3a0a0', textAlign: "end" }}>${detalle.valueOther}</td>
                      <td style={{ borderBottom: '1px solid #a3a0a0', textAlign: "end" }}>${detalle.valuePayment}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <TablePagination
            component="div"
            count={detalles.length}
            rowsPerPage={rowsPerPageDetalles}
            page={pageDetalles}
            onPageChange={handleChangePageDetalles}
            rowsPerPageOptions={[]}
          />
        </div>

        <div className="datos_beneficiario">
          <p>NOTA: Si tiene alguna inconformidad con el pago realizado, dispone de un plazo de <strong>8 días</strong> para comunicar el inconveniente al Departamento de Pagos.</p>
        </div>
      </Modal>
    </>
  );
}