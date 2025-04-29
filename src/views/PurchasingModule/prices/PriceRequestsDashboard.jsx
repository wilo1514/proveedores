import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { validacion } from "../../../utils/apiUtils";
import fetchApi from "../../../utils/fechtData";

import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Container from "../../../components/Container";
import Swal from 'sweetalert2';

import "../../../css/DepartamentoCompras/Dashboard.css";

import "../../../css/ComponentesAdicionales/Tabla.css";

export default function PreciosView() {
  const navigate = useNavigate();
  const SlpCode = useSelector((state) => state.auth.datos_Usuario?.SLPCODE ?? "");
  const [data, setData] = useState([]);
  const [datosProveedores, setDatosProveedores] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [cantItems, setCantItems] = useState(0);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = new Date();
  const [inicio, setInicio] = useState(formatDate(today));
  const [fin, setFin] = useState(formatDate(today));
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [searchParams] = useSearchParams();
  const urlProveedor = searchParams.get("proveedor");
  const estadoSearchParams = searchParams.get("estado");
  const [estado, setEstado] = useState(estadoSearchParams || "PRE");

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

  const claseEstado = (idEstado) => {
    let sColor = "blanco";
    switch (idEstado) {
      case "PARA REVISION":
        sColor = "azul";
        break;
      case "APROBADa":
        sColor = "verde";
        break;
      case "NO APROBADA":
        sColor = "rojo";
        break;
        case "CERRADO":
          sColor = "morado";
          break;
      default:
        break;
    }
    return sColor;
  };

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

  const autorizar = (datos_notificaciones) => {
    sessionStorage.setItem(
      "datosOrden",
      JSON.stringify(datos_notificaciones.id)
    );
    setTimeout(function () {
      navigate("/mesatrabajoprecio/autorizacion");
    }, 500);
  };

  const visualizar = (datos_notificaciones) => {
    sessionStorage.setItem(
      "datosOrden",
      JSON.stringify(datos_notificaciones.id)
    );
    setTimeout(function () {
      navigate("/mesatrabajoprecio/autorizacion");
    }, 500);
  };

  const handleInicio = (e) => {
    const selectedDate = new Date(e.target.value + "T00:00:00");
    setInicio(formatDate(selectedDate));
  };

  const handleFin = (e) => {
    const selectedDate = new Date(e.target.value + "T00:00:00");
    setFin(formatDate(selectedDate));
  };


  const getProveedores = async () => {
    const validado = await validacion();
    if (validado === 1) {
      try {
        const tokenId = localStorage.getItem("token");

        const datos = await fetchApi({
          endPoint: `/supplier/${SlpCode}`,
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
          const proveedores = datos.datos.map((proveedor) => ({
            supCode: proveedor.cardCode,
            supName: proveedor.cardName || "",
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

  const handleProveedorChange = (event, newValue) => {
    setProveedor(newValue ? newValue.supCode : "");
  };

  const handleChangePage = async (event, newPage) => {
    const validado = await validacion();
    if (validado === 1) {
      setPage(newPage);
    } else {
      handleError();
    }
  };

  const getData = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token");

      let fechInicio = inicio;
      let fechFin = fin;

      const proveedorActual = proveedor;
      const estadoEnviar = estadoSearchParams || estado || "PRE";

      const proveedorSearchParams = searchParams.get("proveedor");

      const proveedorEnviar = proveedorSearchParams || proveedorActual;
      const urlInicio = searchParams.get("fechaDesde");
      const urlFin = searchParams.get("fechaHasta");

      if (urlInicio && urlInicio !== formatDate(today)) {
        setInicio(urlInicio);
        fechInicio = urlInicio;
      } else {
        setInicio(formatDate(today));
      }

      if (urlFin && urlFin !== formatDate(today)) {
        setFin(urlFin);
        fechFin = urlFin;
      } else {
        setFin(formatDate(today));
      }

      const datos = await fetchApi({
        endPoint: `/items/preciosugeridosqlserver?pagina=${page + 1}&recordsPorPagina=50&fechaDesde=${fechInicio}&fechaHasta=${fechFin}&codigoProveedor=${proveedorEnviar}&codigoAsesor=${SlpCode}&estado=${estadoEnviar}`,
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
      const cantidadItems = parseInt(datos.totalRegistros)
      setCantItems(cantidadItems);
      pasoSiguiente(datos.datos);
    } else {
      handleError();
    }
  };

  const pasoSiguiente = (info) => {
    setData(info);
    if (info.length !== 0) {
      return setData(info);
    } else {
      handleOrdenes();
    }
  };

  const filtrarReportes = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const newSearchParams = new URLSearchParams();

      if (proveedor) {
        newSearchParams.append("proveedor", proveedor);
      }
      if (estado) {
        newSearchParams.append("estado", estado);
      }
      if (inicio) {
        newSearchParams.append("fechaDesde", inicio);
      }
      if (fin) {
        newSearchParams.append("fechaHasta", fin);
      }
      setPage(0);
      navigate({
        pathname: "/mesatrabajoprecio",
        search: newSearchParams.toString(),
      });
    } else {
      handleError();
    }
  };

  const reiniciarDatos = async () => {
    const validado = await validacion();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const today = new Date();
    if (validado === 1) {
      navigate("/mesatrabajoprecio");
      getData();
      setProveedor("");
      setEstado("");
      setInicio(formatDate(today));
      setFin(formatDate(today));
      setPage(0);
    } else {
      handleError();
    }
  };

  const estados = [
    { label: "Todas", value: "TODAS" },
    { label: "Aprobado", value: "AUT" },
    { label: "No Aprobada", value: "NAP" },
    { label: "Cerrado", value: "CER" },
  ];

  const handleStatus = (event) => {
    setEstado(event.target.value);
  };

  const scrollToTop = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const container = document.querySelector(".inicio_pedido");
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    getProveedores();
  }, []);

  useEffect(() => {
    getData();
  }, [page, searchParams]);

  return (
    <>
      <Container className="inicio_pedido" fluid>
        <div className="panel">
          <p className="panel-title">MESA TRABAJO - ACTUALIZACIÓN DE PRECIOS</p>
          <div className="panel-grid">
            <div className="panel-item">
              <label className="input-label">Proveedor:</label>
              <Autocomplete
                options={datosProveedores}
                getOptionLabel={(option) => option.supName}
                value={
                  datosProveedores.find(
                    (prov) =>
                      prov.supCode === proveedor ||
                      prov.supCode === urlProveedor
                  ) || null
                }
                onChange={handleProveedorChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      classes: {
                        root: "autocomplete-filtros",
                      },
                    }}
                    InputLabelProps={{
                      classes: {
                        root: "autocomplete-label",
                      },
                    }}
                  />
                )}
                disableClearable
              />
            </div>
            <div className="panel-item">
              <label className="input-label">Estado:</label>
              <select
                id="combo-box-demo"
                className="select-empleados"
                value={estado}
                onChange={handleStatus}
              >
                <option value="PRE" className="default-option">
                  Para Revisión
                </option>
                {estados.map((estado) => (
                  <option key={estado.label} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="panel-item">
              <label className="input-label">Desde:</label>
              <input
                type="date"
                value={inicio}
                name="Desde"
                onChange={handleInicio}
                className="input-filtros"
              />
            </div>
            <div className="panel-item">
              <label className="input-label">Hasta:</label>
              <input
                type="date"
                value={fin}
                name="Hasta"
                onChange={handleFin}
                className="input-filtros"
              />
            </div>
            <div className="panel-item">
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent={"space-between"}
                spacing={2}>
                <button
                  className="boton-ordenes"
                  style={{ background: "#06ac2e" }}
                  onClick={filtrarReportes}
                >
                  <span style={{ marginLeft: "5px" }}>Filtrar</span>
                </button>
                <button
                  className="boton-ordenes"
                  style={{ background: "#128496" }}
                  onClick={reiniciarDatos}
                >
                  <span style={{ marginLeft: "5px" }}>Reiniciar</span>
                </button>
              </Stack>
            </div>
          </div>
        </div>
        <div className="panel">
          <table className="table table-ligh table-hover">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>#</th>
                <th style={{ textAlign: "center" }}>SOLICITUD</th>
                <th style={{ textAlign: "center" }}>PROVEEDOR</th>
                <th style={{ textAlign: "center" }}>TIPO</th>
                <th style={{ textAlign: "center" }}>ESTADO</th>
                <th style={{ textAlign: "center" }}>FECHA</th>
                <th style={{ textAlign: "center" }}>CANT. ITEMS</th>
                <th style={{ textAlign: "center" }}>SOLICITANTE</th>
                <th style={{ textAlign: "center" }}>REVISOR</th>
                <th style={{ textAlign: "center" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => {
                const currentIndex = i + 1 + page * rowsPerPage;
                const isDisabledVis = item.estado === "PARA REVISION";
                const isDisabledEdit =
                  item.estado === "APROBADO" || item.estado === "NO APROBADA" || item.estado === "CERRADO";

                return (
                  <tr key={currentIndex}>
                    <td style={{ textAlign: "start" }}>{currentIndex}</td>
                    <td style={{ textAlign: "center" }}>{item.id}</td>
                    <td style={{ textAlign: "start" }}>{item.nombreProveedor}</td>
                    <td style={{ textAlign: "center" }}> {item.tipo}</td>
                    <td className={`end ${claseEstado(item.estado)}`}>{item.estado}</td>
                    <td style={{ textAlign: "end" }}>
                      {new Date(item.fechaEntrega).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ textAlign: "center" }}>{item.total}</td>
                    <td style={{ textAlign: "start" }}>{item.solicitante}</td>
                    <td style={{ textAlign: "start" }}>{item.nombreAsesor}</td>
                    <td style={{ textAlign: "center" }}>
                      <Stack spacing={2} direction={"row"} justifyContent={"center"}>
                        <Tooltip title="Editar">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#151635"
                            height="1.5rem"
                            onClick={() => {
                              if (!isDisabledEdit) autorizar(item);
                            }}
                            style={{
                              cursor: isDisabledEdit
                                ? "not-allowed"
                                : "pointer",
                              opacity: isDisabledEdit ? 0.3 : 1,
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Tooltip>
                        <Tooltip title="Visualizar">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={() => {
                              if (!isDisabledVis) visualizar(item);
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#1dbb3a"
                            height="1.5rem"
                            style={{
                              cursor: isDisabledVis ? "not-allowed" : "pointer",
                              opacity: isDisabledVis ? 0.3 : 1,
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        </Tooltip>
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

        <div className="scroll-buttons">
          <button className="scroll-button" onClick={scrollToTop}>
            ↑
          </button>
          <button className="scroll-button" onClick={scrollToBottom}>
            ↓
          </button>
        </div>
      </Container>
    </>
  );
}