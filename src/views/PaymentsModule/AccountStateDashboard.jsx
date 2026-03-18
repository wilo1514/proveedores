/**
 * AccountStateDashboard (EstadoCuentaPagosView)
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { Grid, Stack, TablePagination } from "@mui/material";
import TextField from "@mui/material/TextField"; // ✅ IMPORT NECESARIO
import Swal from "sweetalert2";

import Container from "../../../src/components/Container";
import { validacion } from "../../../src/utils/apiUtils";
import Modal from "../../../src/components/Modal";
import Autocomplete from "@mui/material/Autocomplete";
import fetchApi from "../../../src/utils/fechtData";
import LogoFinal from "../../../src/assets/images/conorque2.avif";

import Icon from "../../../src/assets/iconos/eye.svg";
import "../../../src/css/Proveedores/UpdatePrice.css";

export default function EstadoCuentaPagosView() {
  const navigate = useNavigate();

  // ---------- Estado UI principal ----------
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cantItems, setCantItems] = useState(0);
  const [rowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  // ---------- Fechas (últimos 30 días) ----------
  const formatDate = (date) => date.toISOString().substr(0, 10);
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const [inicio, setInicio] = useState(formatDate(thirtyDaysAgo));
  const [fin, setFin] = useState(formatDate(today));

  // Proveedor (filtro) y lista de proveedores
  const [proveedor, setProveedor] = useState(""); // ✅ ESTADO QUE FALTABA
  const [datosProveedores, setDatosProveedores] = useState([]);

  // ---------- Detalle (modal) ----------
  const [devolucion, setDevolucion] = useState({});
  const [detalles, setDetalles] = useState([]);

  // ---------- Responsivo ----------
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ---------- Datos de usuario ----------
  const CardCode = useSelector((state) => state.auth.datos_Usuario?.CARDCODE ?? "");

  // ---------- Helpers de error ----------
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
      title: "ESTADOS NO ENCONTRADOS",
      text: "No se encontraron registros con esos parámetros",
      showConfirmButton: false,
      timer: 2000,
    });
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

  // ---------- Decoradores UI ----------
  const claseEstado = (idEstado) => {
    const s = (idEstado ?? "").toString().trim().toUpperCase();
    switch (s) {
      case "CRG":
        return "azul";
      default:
        return "blanco";
    }
  };

  // ---------- Navegación ----------
  const irNuevoListado = () => {
    navigate("/estadocuenta/cargar");
  };

  // ---------- Modal (detalle) ----------
  const abrirModalVisualizar = async (datos_orden) => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      const datos = await fetchApi({
        endPoint: `/estadocuenta/${datos_orden.id}`,
        method: "GET",
        paginacion: false,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenId,
        },
      });
      if (datos?.error) {
        handleErrorSis(datos.error);
        return;
      }
      listadoproductos(datos?.datos);
      setModalVisualizar(true);
    } else {
      handleError();
    }
  };

  const listadoproductos = (products = {}) => {
    setDevolucion(products || {});
    const arr = Array.isArray(products?.detalle) ? products.detalle : [];
    setDetalles(arr);
  };

  const cerraModalVisualizar = () => {
    setModalVisualizar(false);
  };

  // ---------- Unificación de carga ----------
  /**
   * Carga una página del historial según filtros actuales.
   * @param {Object} opt
   * @param {number} opt.pageUI        Índice 0-based (TablePagination)
   * @param {boolean} opt.includeTotal Si true, actualiza totalRegistros y resetea a página 0
   */
  const loadPage = async ({ pageUI = 0, includeTotal = false } = {}) => {
    const validado = await validacion();
    if (validado !== 1) {
      handleError();
      return;
    }

    try {
      setLoading(true);

      const tokenId = localStorage.getItem("token");
      const pageApi = pageUI + 1;

      // ✅ Construye el query string correctamente
      const qs = new URLSearchParams({
        pagina: String(pageApi),
        recordsPorPagina: "10",
        fechaDesde: inicio,
        fechaHasta: fin,
      });
      if (proveedor) qs.append("codigoProveedor", proveedor);

      const datos = await fetchApi({
        endPoint: `/estadocuenta?${qs.toString()}`,
        method: "GET",
        paginacion: includeTotal, // cuando es true, backend debe incluir totalRegistros
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenId,
        },
      });

      if (datos?.error) {
        handleErrorSis(datos.error);
        return;
      }

      // Actualiza total si corresponde (carga inicial o al filtrar)
      if (includeTotal) {
        const total = parseInt(datos?.totalRegistros ?? "0", 10);
        setCantItems(Number.isNaN(total) ? 0 : total);
        setPage(0); // al filtrar/inicial, nos quedamos en la primera página
      } else {
        setPage(pageUI); // al paginar, sincroniza con el UI
      }

      setHistorial(Array.isArray(datos?.datos) ? datos.datos : []);

      // Avisar cuando no hay datos en una búsqueda nueva
      if (includeTotal && (!datos?.datos || datos.datos.length === 0)) {
        handleOrdenes();
      }
    } catch (e) {
      handleErrorSis(e);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Reemplazos mínimos que usan la función unificada ----------
  // Carga inicial
  const getData = async () => {
    await loadPage({ pageUI: 0, includeTotal: true });
  };

  // Paginador
  const handleChangePage = async (_event, newPage) => {
    await loadPage({ pageUI: newPage, includeTotal: false });
  };

  // Filtros
  const handleInicioChange = (e) => {
    setInicio(formatDate(new Date(e.target.value)));
  };
  const handleFinChange = (e) => {
    setFin(formatDate(new Date(e.target.value)));
  };

  // Filtrar con fechas actuales (resetea a página 0 y actualiza total)
  const filtrarReportes = async () => {
    await loadPage({ pageUI: 0, includeTotal: true });
  };

  const getProveedores = async () => {
    const validado = await validacion();
    if (validado === 1) {
      try {
        const tokenId = localStorage.getItem("token");

        const datos = await fetchApi({
          endPoint: `/supplier?pagina=1&recordsPorPagina=1000`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenId}`,
          },
          paginacion: false,
        });

        if (datos?.error) {
          console.error(datos.error);
          return;
        }

        if (Array.isArray(datos?.datos)) {
          const proveedores = datos.datos.map((p) => ({
            supCode: p.cardCode,
            supName: p.cardName || "",
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

  // Reiniciar filtros y recargar
  const reinicirarDatos = async () => {
    const validado = await validacion();
    if (validado === 1) {
      setPage(0);
      setProveedor(""); // ✅ limpia proveedor
      setInicio(formatDate(thirtyDaysAgo));
      setFin(formatDate(today));
      await loadPage({ pageUI: 0, includeTotal: true });
    } else {
      handleError();
    }
  };
// Convierte "5/10/2025" (dd/mm/yyyy) en un objeto Date correcto
const parseDateDMY = (value) => {
  if (!value) return null;

  // Si ya viene en ISO: "2025-10-05..." la usamos tal cual
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value);
  }

  const parts = String(value).split(/[\/-]/); // admite 5/10/2025 o 5-10-2025
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day); // mes base 0
};

const formatFechaDMY = (value) => {
  const date = parseDateDMY(value);
  if (!date) return "-";

  return date.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

  const handleProveedorChange = (_event, newValue) => {
    setProveedor(newValue ? newValue.supCode : "");
  };

  // ---------- Efecto inicial ----------
  useEffect(() => {
    getData();
    getProveedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Container className="inicio_pedido" fluid>
        <div className="panel">
          <p className="panel-title">ESTADO DE CUENTA</p>

          {/* Filtros */}
          <div className="panel-grid">
            <div className="panel-item">
              <label className="input-label">Proveedor:</label>
              <Autocomplete
                options={datosProveedores}
                getOptionLabel={(option) => option?.supName ?? ""}
                value={
                  datosProveedores.find((prov) => prov.supCode === proveedor) || null
                }
                onChange={handleProveedorChange}
                disableClearable={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecciona un proveedor..."
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      classes: { root: "autocomplete-filtros" },
                    }}
                    InputLabelProps={{
                      classes: { root: "autocomplete-label" },
                    }}
                  />
                )}
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
                  disabled={loading}
                  title={loading ? "Cargando..." : "Aplicar filtros"}
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
                        d="M19 3H5C3.58579 3 2.87868 3 2.43934 3.4122C2 3.8244 2 4.48782 2 5.81466V6.50448C2 7.54232 2 8.06124 2.2596 8.49142C2.5192 8.9216 2.99347 9.18858 3.94202 9.72255L6.85504 11.3624C7.49146 11.7206 7.80967 11.8998 8.03751 12.0976C8.51199 12.5095 8.80408 12.9935 8.93644 13.5872C9 13.8722 9 14.2058 9 14.8729L9 17.5424C9 18.452 9 18.9067 9.25192 19.2613C9.50385 19.6158 9.95128 19.7907 10.8462 20.1406C12.7248 20.875 13.6641 21.2422 14.3321 20.8244C15 20.4066 15 19.4519 15 17.5424V14.8729C15 14.2058 15 13.8722 15.0636 13.5872C15.1959 12.9935 15.488 12.5095 15.9625 12.0976C16.1903 11.8998 16.5085 11.7206 17.145 11.3624L20.058 9.72255C21.0065 9.18858 21.4808 8.9216 21.7404 8.49142C22 8.06124 22 7.54232 22 6.50448V5.81466C22 4.48782 22 3.8244 21.5607 3.4122C21.1213 3 20.4142 3 19 3Z"
                        fill="currentcolor"
                      />
                    </svg>
                    <span>{loading ? "Cargando..." : "FILTRAR"}</span>
                  </div>
                </button>

                <button
                  className="boton-ordenes"
                  style={{ background: "#128496" }}
                  onClick={reinicirarDatos}
                  disabled={loading}
                  title={loading ? "Cargando..." : "Reiniciar filtros"}
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
                      <path d="M18.2211 19.6431C18.6981 18.7396 19.1627 17.7065 19.4613 16.6623C19.8722 15.2247 20.0207 13.8751 20.0629 12.8451L18.5105 11.2926L12.7073 5.48944L11.1549 3.93701C10.1248 3.97917 8.77531 4.12767 7.33767 4.53865C6.29348 4.83716 5.26037 5.30183 4.35693 5.77885C2.10098 6.96998 1.42721 9.71071 2.49716 11.8068L2.51021 11.8324L3.20923 12.9815C5.15002 16.1718 7.82804 18.8499 11.0184 20.7907L12.1675 21.4898L12.1931 21.5028C14.2892 22.5728 17.0299 21.899 18.2211 19.6431Z" fill="currentcolor" />
                      <path d="M21.7747 3.31343C22.0751 3.01296 22.0751 2.52581 21.7747 2.22535C21.4742 1.92488 20.987 1.92488 20.6866 2.22535L19.0118 3.90018C17.3118 2.66569 14.9941 2.66575 13.2942 3.9002L14.4027 5.00866L18.9915 9.59749L20.0999 10.7059C21.3344 9.00597 21.3343 6.68821 20.0998 4.98826L21.7747 3.31343Z" fill="currentcolor" />
                    </svg>
                    <span>{loading ? "Cargando..." : "Reiniciar"}</span>
                  </div>
                </button>
              </Stack>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <Stack
              direction={isMobile ? "column" : "row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              spacing={2}
            >
              <p className="panel-title"></p>
              <Stack
                direction={isMobile ? "column" : "row"}
                alignItems={"center"}
                justifyContent={"flex-end"}
                spacing={2}
                sx={{ minWidth: isMobile ? "100%" : "auto", padding: isMobile ? "0 1rem" : "0" }}
              />
            </Stack>
          </div>

          <div className="Scroll">
            <table className="table table-ligh table-hover">
              <thead>
                <tr>
                  <th style={{ textAlign: "start" }}>Id</th>
                  <th style={{ textAlign: "start" }}>Proveedor</th>
                  <th style={{ textAlign: "start" }}>F. Carga</th>
                  <th style={{ textAlign: "start" }}>Descripción</th>
                  <th style={{ textAlign: "start" }}>Estado</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((listado, i) => {
                  const currentIndex = i + 1;
                  return (
                    <tr key={currentIndex}>
                      <td className="start">{listado.id}</td>
                      <td className="start">{listado.nombreProveedor}</td>
                      <td className="start">
                        {listado?.fecha
                          ? new Date(listado.fecha).toLocaleDateString("es", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="start">{listado.descripcion}</td>
                      <td className={`start ${claseEstado(listado?.estado)}`}>
                        {listado?.estado ?? "-"}
                      </td>
                      <td
                        className="center"
                        style={{
                          display: "flex",
                          gap: 8,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {/* Ver */}
                        <button
                          className="icon-btn"
                          onClick={() => abrirModalVisualizar(listado)}
                          title="Ver"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                          }}
                        >
                          <img src={Icon} alt="ver" />
                        </button>
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
            onRowsPerPageChange={() => {}}
            rowsPerPageOptions={[]}
            backIconButtonProps={{ disabled: loading }}
            nextIconButtonProps={{ disabled: loading }}
          />
        </div>
      </Container>

      <Modal
        isOpen={modalVisualizar}
        onClose={cerraModalVisualizar}
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
                      <strong>Estado Solicitud: </strong>{" "}
                      {devolucion?.estado ?? "-"}
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
                  <strong>ESTADO N° {devolucion?.id ?? "-"}</strong>
                </p>
                <li className="li-tv" />
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>Descripción: </strong>
                    {devolucion?.descripcion ?? "-"}
                  </p>
                </li>
                <li className="li-tv">
                  <p className="texto_indicador">
                    <strong>Proveedor: </strong>
                    {devolucion?.nombreProveedor ?? "-"}
                  </p>
                </li>
              </Stack>
            </div>
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <div className="Scroll" style={{ marginTop: "20px", marginBottom: "20px" }}>
              <table className="table table-ligh table-hover">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>#</th>
                    <th style={{ textAlign: "center" }}>Número Factura</th>
                    <th style={{ textAlign: "center" }}>Fecha Factura</th>
                    <th style={{ textAlign: "center" }}>Fecha Vencimiento</th>
                    <th style={{ textAlign: "center" }}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((item, i) => {
                    const currentIndex = i + 1;
                    const rowStyle =
                      item.estado !== "BLQ"
                        ? { color: "#151635", opacity: "0.5", cursor: "not-allowed" }
                        : { color: "green" };
                    return (
                      <tr key={currentIndex} style={rowStyle}>
                        <td className="start">{currentIndex}</td>
                        <td style={{ textAlign: "start" }}>{item?.nroFactura ?? "-"}</td>
                        {/* <td style={{ textAlign: "start" }}>
                          {item?.fechaFactura
                            ? new Date(item.fechaFactura).toLocaleDateString("es", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td style={{ textAlign: "start" }}>
                          {item?.fechaVencimientoFactura
                            ? new Date(item.fechaVencimientoFactura).toLocaleDateString("es", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td> */}
                        <td style={{ textAlign: "start" }}>
                          {formatFechaDMY(item?.fechaFactura)}
                        </td>

                        <td style={{ textAlign: "start" }}>
                          {formatFechaDMY(item?.fechaVencimientoFactura)}
                        </td>
                        <td style={{ textAlign: "end" }}>{item?.saldoFactura ?? "-"}</td>
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
