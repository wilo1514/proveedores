import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import Stack from "@mui/material/Stack";
import TablePagination from "@mui/material/TablePagination";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import { validacion } from "../../../utils/apiUtils";
import fetchApi from "../../../utils/fechtData";
import Container from "../../../components/Container";
import { descargarArchivo } from "../../../utils/descargarPlantilla";

import "../../../css/ComponentesAdicionales/Tabla.css";
import "../../../css/Proveedores/OrderSupplier.css";

export default function UpdatePriceView() {
  // Datos del usuario (para payload)
  const CardCode = useSelector((s) => s.auth.datos_Usuario?.CARDCODE ?? "");
  const CardName = useSelector((s) => s.auth.datos_Usuario?.CARDNAME ?? "");

  const location = useLocation();
  const editId = location.state?.id; // si existe, estamos en edición (PUT)

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // items = [{ numeroFactura, fecha (YYYY-MM-DD), fechaVencimiento (YYYY-MM-DD), pagoTotal, _fechaISOZ, _fechaVencISOZ }]
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

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

  /* =====================
     CARGA INICIAL EN MODO EDICIÓN: GET /estadocuenta/{id}
     ===================== */
  useEffect(() => {
    const idNum = Number(editId);
    const isUpdate = Number.isInteger(idNum) && idNum > 0;
    if (!isUpdate) return;

    const cargarExistente = async () => {
      const ok = await validacion();
      if (ok !== 1) return handleError();

      try {
        const tokenId = localStorage.getItem("token");
        const resp = await fetchApi({
          endPoint: `/estadocuenta/${idNum}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tokenId,
          },
          paginacion: false,
        });

        if (resp?.error) {
          console.error(resp.error);
          Swal.fire({
            icon: "error",
            title: "No se pudo cargar el estado",
            text: String(resp.error),
          });
          return;
        }

        const detalleSrv =
          (Array.isArray(resp?.datos?.detalle) && resp.datos.detalle) ||
          (Array.isArray(resp?.datos?.details) && resp.datos.details) ||
          [];

        const nuevos = detalleSrv.map((d) => {
          const y1 = isoToYMD(d?.fechaFactura);             // "YYYY-MM-DD"
          const y2 = isoToYMD(d?.fechaVencimientoFactura);  // "YYYY-MM-DD"
          return {
            numeroFactura: d?.nroFactura ?? "",
            fecha: y1,
            fechaVencimiento: y2,
            pagoTotal: d?.saldoFactura == null ? "" : String(d.saldoFactura),
            _fechaISOZ: ymdToISOZ(y1),
            _fechaVencISOZ: ymdToISOZ(y2),
          };
        });
        setItems(nuevos);
        setPage(0);
      } catch (e) {
        console.error(e);
        Swal.fire({
          icon: "error",
          title: "Error inesperado",
          text: "No se pudo cargar el estado de cuenta.",
        });
      }
    };

    cargarExistente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  /* =====================
     DESCARGAR PLANTILLA DESDE REPOSITORIO
     ===================== */
  const descargarPlantilla = async () => {
    const ok = await validacion();
    if (ok !== 1) return handleError();

    try {
      await descargarArchivo("estadoCuenta.xlsx");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "No se pudo descargar la plantilla",
        text: "Inténtalo nuevamente o comunícate con soporte.",
      });
    }
  };

  /* =====================
     CARGAR EXCEL (REEMPLAZA DATOS ACTUALES)
     ===================== */
  const cargarExcel = () => {
    const input = document.getElementById("fileInput");
    if (input) {
      input.value = null; // permite recargar el mismo archivo
      input.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: "array", cellText: true, cellDates: true });

        const sheetName =
          wb.SheetNames.find((n) => n.trim().toLowerCase() === "hoja1") ||
          wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];

        const matrix = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          raw: false,
          defval: "",
        });
        if (!matrix || matrix.length === 0) throw new Error("La hoja está vacía.");

        const header = matrix[0].map((h) => (h ?? "").toString().trim());
        const required = ["N° de factura", "Fecha Emision", "Fecha de vencimiento", "Pago total"];
        const missing = required.filter((r) => !header.includes(r));
        if (missing.length) {
          Swal.fire({
            icon: "error",
            title: "Error de formato",
            text: `Faltan columnas: ${missing.join(", ")}`,
          });
          return;
        }

        const col = {
          factura: header.indexOf("N° de factura"),
          fecha: header.indexOf("Fecha Emision"),
          venc: header.indexOf("Fecha de vencimiento"),
          pago: header.indexOf("Pago total"),
        };

        const nuevos = matrix
          .slice(1)
          .filter(
            (row) =>
              row &&
              (row[col.factura] || row[col.fecha] || row[col.venc] || row[col.pago])
          )
          .map((row) => {
            const ymdEmi = excelToYMD(row[col.fecha]); // "YYYY-MM-DD"
            const ymdVto = excelToYMD(row[col.venc]);  // "YYYY-MM-DD"
            return {
              numeroFactura: safeString(row[col.factura]),
              fecha: ymdEmi,
              fechaVencimiento: ymdVto,
              pagoTotal: safeString(row[col.pago]),
              _fechaISOZ: ymdToISOZ(ymdEmi),
              _fechaVencISOZ: ymdToISOZ(ymdVto),
            };
          });

        setItems(nuevos);
        setPage(0);

        if (nuevos.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Sin datos",
            text: "La plantilla no contiene filas.",
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Archivo inválido",
          text: "Asegúrate de que la hoja 'Hoja1' tenga las columnas correctas.",
        });
      } finally {
        if (e.target) e.target.value = null;
      }
    };
    reader.readAsArrayBuffer(file);
  };

  /* =====================
     ENVIAR (POST/PUT) — en edición es PUT
     ===================== */
  const enviarDatos = async () => {
    const ok = await validacion();
    if (ok !== 1) return handleError();

    if (!CardCode || !CardName) {
      Swal.fire({
        icon: "error",
        title: "Sesión incompleta",
        text: "Faltan datos del proveedor (CardCode o CardName).",
      });
      return;
    }

    if (items.length === 0) {
      await Swal.fire({
        title: "Falta información",
        text: "Carga la plantilla con datos antes de enviar.",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    const errores = [];
    items.forEach((it, idx) => {
      if (!it.numeroFactura?.trim()) errores.push(`#${idx + 1}: 'N° de factura' es obligatorio`);
      if (!it.fecha?.trim()) errores.push(`#${idx + 1}: 'Fecha Emisión' es obligatoria`);
      if (!it.fechaVencimiento?.trim()) errores.push(`#${idx + 1}: 'Fecha de vencimiento' es obligatoria`);
      if (!Number.isFinite(toDouble(it.pagoTotal))) errores.push(`#${idx + 1}: 'Pago total' debe ser numérico`);
    });
    if (errores.length) {
      Swal.fire({
        icon: "error",
        title: "Corrige los siguientes errores",
        html: `<ul style="text-align:left">${errores.map((e) => `<li>${e}</li>`).join("")}</ul>`,
      });
      return;
    }

    // Normalizar cabecera 'fecha' a YYYY-MM-DDT00:00:00.000Z (consistente con detalle)
    const todayISOZ = ymdToISOZ(toYMD(new Date()));

    // Construcción EXACTA del payload
    const payload = {
      codigoProveedor: String(CardCode),
      nombreProveedor: String(CardName),
      fecha: todayISOZ, // <- cabecera normalizada a medianoche UTC
      descripcion: `Estado Cargado ${todayISOZ.slice(0, 10)}`,
      estado: "CRG",
      detalle: items.map((it) => ({
        nroFactura: String(it.numeroFactura),
        fechaFactura: it._fechaISOZ || ymdToISOZ(it.fecha),
        fechaVencimientoFactura: it._fechaVencISOZ || ymdToISOZ(it.fechaVencimiento),
        saldoFactura: round2(toDouble(it.pagoTotal)),
      })),
    };

    // Verificación previa de fechas y montos
    if (payload.detalle.some(d => !d.fechaFactura || !d.fechaVencimientoFactura)) {
      Swal.fire({ icon: "error", title: "Fechas inválidas", text: "Verifica que todas las fechas tengan formato válido (YYYY-MM-DD)." });
      return;
    }
    if (payload.detalle.some(d => !Number.isFinite(d.saldoFactura))) {
      Swal.fire({ icon: "error", title: "Montos inválidos", text: "Verifica los valores de 'Pago total'." });
      return;
    }

    const idNum = Number(editId);
    const isUpdate = Number.isInteger(idNum) && idNum > 0;

    const confirm = await Swal.fire({
      title: isUpdate ? "¿Guardar cambios?" : "¿Enviar actualización?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#06ac2e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
    });
    if (!confirm.isConfirmed) return;

    try {
      const tokenId = localStorage.getItem("token");
      const method = isUpdate ? "PUT" : "POST";
      const endPoint = isUpdate ? `/estadocuenta/${idNum}` : "/estadocuenta";

    
      const resp = await fetchApi({
        endPoint,
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + tokenId,
        },
        body: payload, // <- objeto (no string) para evitar doble stringify
        // body: JSON.stringify(payload), // <- usa ESTA línea solo si fetchApi NO serializa
      });

      // Manejo 204 No Content en diferentes formas
      if (isUpdate && is204NoContent(resp)) {
        return successAndBack(setItems, navigate, "Cambios guardados");
      }
      if (resp?.error) {
        // Si el helper encapsula el ProblemDetails
        const msg = extractServerErrors(resp.error) || String(resp.error);
        if (isUpdate && is204NoContent(resp.error)) {
          return successAndBack(setItems, navigate, "Cambios guardados");
        }
        console.error("Error API:", resp.error);
        Swal.fire({ icon: "error", title: "Error al enviar", html: msg });
        return;
      }

      // Si el helper devuelve ProblemDetails plano
      if (isProblemDetails(resp)) {
        const msg = extractServerErrors(resp) || (resp.title ?? "Solicitud inválida");
        Swal.fire({ icon: "error", title: "Error del servidor", html: msg });
        return;
      }

      successAndBack(setItems, navigate, isUpdate ? "Estado actualizado" : "Estado enviado");
    } catch (err) {
      if (isUpdate && is204NoContent(err)) {
        return successAndBack(setItems, navigate, "Cambios guardados");
      }
      console.error(err);
      const msg = extractServerErrors(err) || "Ocurrió un error al enviar. Intenta nuevamente.";
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        html: msg,
      });
    }
  };

  return (
    <>
      <Container className="inicio_pedido" fluid>
        {/* Panel superior */}
        <div className="panel">
          <div className="panel-title">
            <Stack
              direction={isMobile ? "column" : "row"}
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <p className="panel-title">CARGAR ESTADO DE CUENTA</p>
              <Stack
                direction={isMobile ? "column" : "row"}
                alignItems="center"
                justifyContent="flex-end"
                spacing={2}
                sx={{ minWidth: isMobile ? "100%" : "auto", padding: isMobile ? "0 1rem" : "0" }}
              >
                <button
                  onClick={() => {
                    const input = document.getElementById("fileInput");
                    if (input) input.value = null;
                    setItems([]);
                    navigate(-1);
                  }}
                  className="boton-superior"
                  style={{ background: "#06ac2e" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <svg height="1.3rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.4751 5.18355L7.4973 9.60829C6.56674 10.4355 6.10145 10.8491 5.92997 11.3374C5.77939 11.7663 5.77939 12.2337 5.92997 12.6626C6.10145 13.1509 6.56674 13.5645 7.49731 14.3917L12.4751 18.8165C12.8974 19.1918 13.1086 19.3795 13.2879 19.3862C13.4437 19.3921 13.5934 19.3249 13.6925 19.2046C13.8066 19.0661 13.8066 18.7835 13.8066 18.2185V15.4286C16.2347 15.4286 18.7993 16.2084 20.6719 17.5928C21.6468 18.3135 22.1343 18.6739 22.3199 18.6596C22.5009 18.6458 22.6158 18.5751 22.7097 18.4198C22.806 18.2604 22.7209 17.7625 22.5507 16.7667C21.4458 10.3006 16.9958 8.57143 13.8066 8.57143V5.78148C13.8066 5.21646 13.8066 4.93396 13.6925 4.79545C13.5934 4.67513 13.4437 4.60794 13.2879 4.61378C13.1086 4.62049 12.8974 4.80818 12.4751 5.18355Z" fill="currentColor"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M9.81777 3.98966C9.53592 3.68613 9.06137 3.66856 8.75784 3.95041L3.54163 8.79403C2.5947 9.67333 2.05664 10.9072 2.05664 12.1994C2.05664 13.5616 2.65432 14.8553 3.69163 15.7382L8.78205 20.0711C9.09747 20.3396 9.57081 20.3016 9.8393 19.9861C10.1078 19.6707 10.0697 19.1974 9.75431 18.9289L4.66389 14.596C3.9614 13.998 3.55664 13.122 3.55664 12.1994C3.55664 11.3243 3.92102 10.4887 4.56231 9.89322L9.77852 5.0496C10.082 4.76775 10.0996 4.2932 9.81777 3.98966Z" fill="currentColor"/>
                    </svg>
                    <span>REGRESAR</span>
                  </div>
                </button>

                <button className="boton-superior" style={{ background: "#128496" }} onClick={enviarDatos}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <svg height="1.3rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.4975 18.4851L20.6281 9.09378C21.419 6.72107 21.9594 5.1 21.9978 3.97919C22.0108 3.60165 21.5845 3.47624 21.3173 3.74336L6.85855 18.2022C6.62519 18.4355 6.6807 18.8286 6.99826 18.9185C7.02946 18.9273 7.0609 18.9356 7.09257 18.9433C7.59254 19.0657 8.24578 18.977 9.5522 18.7997L9.62363 18.79C9.99191 18.74 10.1761 18.715 10.3529 18.7257C10.6738 18.7451 10.9838 18.8496 11.251 19.0286C11.3981 19.1271 11.5295 19.2586 11.7923 19.5213L12.0436 19.7726C13.5539 21.2828 14.309 22.0379 15.1101 21.9986C15.3309 21.9877 15.5479 21.9365 15.7503 21.8475C16.4844 21.5244 16.8221 20.5113 17.4975 18.4851Z" fill="currentColor"/>
                      <path d="M14.906 3.37194L5.57477 6.48223C3.49295 7.17615 2.45203 7.5231 2.13608 8.28642C2.06182 8.46582 2.01692 8.65601 2.00311 8.84968C1.94433 9.6737 2.72018 10.4495 4.27188 12.0012L4.55451 12.2838C4.80921 12.5385 4.93655 12.6658 5.03282 12.8076C5.22269 13.0871 5.33046 13.4143 5.34393 13.752C5.35076 13.9232 5.32403 14.1013 5.27057 14.4575C5.07488 15.7613 4.97703 16.4131 5.0923 16.9148C5.09632 16.9322 5.1005 16.9497 5.10484 16.967C5.18629 17.292 5.58551 17.3539 5.82242 17.117L20.2567 2.68271C20.5238 2.41559 20.3984 1.9893 20.0209 2.00224C18.9 2.04066 17.2788 2.58102 14.906 3.37194Z" fill="currentColor"/>
                    </svg>
                    <span>{editId ? "GUARDAR CAMBIOS" : "ENVIAR ACTUALIZACIÓN"}</span>
                  </div>
                </button>
              </Stack>
            </Stack>
          </div>
        </div>

        {/* Panel inferior */}
        <div className="panel">
          <div className="panel-title">
            <Stack
              direction={isMobile ? "column" : "row"}
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <p className="panel-title">LISTADO</p>
              <Stack
                direction={isMobile ? "column" : "row"}
                alignItems="center"
                justifyContent="flex-end"
                spacing={2}
                sx={{ minWidth: isMobile ? "100%" : "auto", padding: isMobile ? "0 1rem" : "0" }}
              >
                {/* descarga directa desde el repo */}
                <button onClick={descargarPlantilla} className="boton-orden">
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="1.2rem" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>PLANTILLA</span>
                  </div>
                </button>

                <input type="file" id="fileInput" style={{ display: "none" }} onChange={handleFileChange} accept=".xlsx, .xls" />
                <button onClick={cargarExcel} className="boton-orden">
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <svg height="1.2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.25 2.83422C11.7896 2.75598 11.162 2.75005 10.0298 2.75005C8.11311 2.75005 6.75075 2.75163 5.71785 2.88987C4.70596 3.0253 4.12453 3.27933 3.7019 3.70195C3.27869 4.12516 3.02502 4.70481 2.88976 5.7109C2.75159 6.73856 2.75 8.09323 2.75 10.0001V14.0001C2.75 15.9069 2.75159 17.2615 2.88976 18.2892C3.02502 19.2953 3.27869 19.8749 3.7019 20.2981C4.12511 20.7214 4.70476 20.975 5.71085 21.1103C6.73851 21.2485 8.09318 21.2501 10 21.2501H14C15.9068 21.2501 17.2615 21.2485 18.2892 21.1103C19.2952 20.975 19.8749 20.7214 20.2981 20.2981C20.7213 19.8749 20.975 19.2953 21.1102 18.2892C21.2484 17.2615 21.25 15.9069 21.25 14.0001V13.5629C21.25 12.0269 21.2392 11.2988 21.0762 10.7501H17.9463C16.8135 10.7501 15.8877 10.7501 15.1569 10.6518C14.3929 10.5491 13.7306 10.3268 13.2019 9.79815C12.6732 9.26945 12.4509 8.60712 12.3482 7.84317C12.25 7.1123 12.25 6.18657 12.25 5.05374V2.83422Z" fill="currentColor" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M9.01296 12.9529C8.72446 12.6824 8.27554 12.6824 7.98704 12.9529L5.98704 14.8279C5.68486 15.1112 5.66955 15.5858 5.95285 15.888C6.23615 16.1902 6.71077 16.2055 7.01296 15.9222L7.75 15.2312L7.75 18.5001C7.75 18.9143 8.08579 19.2501 8.5 19.2501C8.91421 19.2501 9.25 18.9143 9.25 18.5001L9.25 15.2312L9.98704 15.9222C10.2892 16.2055 10.7639 16.1902 11.0472 15.888C11.3305 15.5858 11.3151 15.1112 11.013 14.8279L9.01296 12.9529Z" fill="currentColor" />
                    </svg>
                    <span>SUBIR EXCEL</span>
                  </div>
                </button>
              </Stack>
            </Stack>
          </div>

          <div className="ScrollSinLargo">
            <table className="table table-ligh table-hover">
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>N° de factura</th>
                  <th style={{ textAlign: "center" }}>Fecha</th>
                  <th style={{ textAlign: "center" }}>Fecha de vencimiento</th>
                  <th style={{ textAlign: "center" }}>Pago total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((it, i) => (
                      <tr key={`${it.numeroFactura}-${i}`}>
                        <td style={{ textAlign: "center" }}>{it.numeroFactura}</td>
                        <td style={{ textAlign: "center" }}>{it.fecha}</td>
                        <td style={{ textAlign: "center" }}>{it.fechaVencimiento}</td>
                        <td style={{ textAlign: "center" }}>{it.pagoTotal}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                      Carga la plantilla para visualizar el listado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <TablePagination
              component="div"
              count={items.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_e, p) => setPage(p)}
              onRowsPerPageChange={() => {}}
              rowsPerPageOptions={[]}
            />
          </div>
        </div>
      </Container>
    </>
  );
}

/* ========================
   Utilidades
======================== */

/** Éxito + navegar atrás */
function successAndBack(setItems, navigate, title) {
  setItems([]);
  Swal.fire({
    title,
    icon: "success",
    showConfirmButton: false,
    timer: 1500,
  });
  navigate(-1);
}

/** Detecta 204 No Content en diversas formas (objeto, número, string o error) */
function is204NoContent(obj) {
  if (obj == null) return false;
  if (typeof obj === "number") return obj === 204;
  if (typeof obj === "string") {
    const s = obj.toLowerCase();
    return s.includes("204") || s.includes("no content");
  }
  const cand = [
    obj.status,
    obj.statusCode,
    obj.httpStatus,
    obj.codigo,
    obj.code,
  ].find((v) => v !== undefined && v !== null);
  if (cand === 204 || cand === "204") return true;
  if (is204NoContent(obj.message)) return true;
  if (is204NoContent(obj.error)) return true;
  return false;
}

function isProblemDetails(x) {
  return x && typeof x === "object" && ("type" in x || "title" in x) && x.status === 400;
}

function extractServerErrors(x) {
  try {
    const data = typeof x === "string" ? JSON.parse(x) : x;
    if (!data) return "";
    if (data.errors && typeof data.errors === "object") {
      const list = [];
      for (const k of Object.keys(data.errors)) {
        const val = data.errors[k];
        if (Array.isArray(val)) val.forEach(v => list.push(`${k}: ${v}`));
        else if (val) list.push(`${k}: ${String(val)}`);
      }
      if (list.length) return `<ul style="text-align:left">${list.map(li => `<li>${li}</li>`).join("")}</ul>`;
    }
    if (data.title) return data.title;
    return "";
  } catch {
    return "";
  }
}

function safeString(v) {
  if (v == null) return "";
  return String(v).trim();
}

/** ISO "2025-10-16T00:00:00Z" -> "2025-10-16" */
function isoToYMD(s) {
  try {
    if (!s) return "";
    return new Date(s).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

/** Robusto a $/separadores/coma decimal */
function toDouble(val) {
  if (typeof val === "number") return val;
  let s = String(val ?? "").trim();
  if (!s) return NaN;
  s = s.replace(/[^\d.,-]/g, ""); // deja solo dígitos, coma, punto, signo
  // Si hay una sola coma y no hay punto, asumimos coma decimal
  const commas = (s.match(/,/g) || []).length;
  const dots = (s.match(/\./g) || []).length;
  if (commas === 1 && dots === 0) {
    s = s.replace(",", ".");
  } else {
    // elimina miles (comas) y deja punto como decimal
    s = s.replace(/,/g, "");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Rellena con 2 dígitos */
function pad2(n) {
  return String(n).padStart(2, "0");
}

/** Date -> "YYYY-MM-DD" */
function toYMD(d) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convierte lo que venga del Excel a "YYYY-MM-DD".
 * Soporta: Date, serial Excel (número), "dd/mm/yyyy", "dd-mm-yyyy",
 * "mm/dd/yyyy", "yyyy-mm-dd", "yyyy/mm/dd".
 * En ambigüedad (x<=12 & y<=12) asume formato latino: dd/mm/yyyy.
 */
function excelToYMD(v) {
  if (v == null || v === "") return "";

  // 1) Date nativo
  if (v instanceof Date && !isNaN(v.getTime())) {
    return toYMD(v);
  }

  // 2) Serial Excel (número)
  if (typeof v === "number" && isFinite(v)) {
    // Excel epoch: 1899-12-30
    const excelEpoch = Date.UTC(1899, 11, 30);
    const ms = v * 86400000; // días -> ms
    return toYMD(new Date(excelEpoch + ms));
  }

  // 3) String
  if (typeof v === "string") {
    const s = v.trim();

    // yyyy-mm-dd o yyyy/mm/dd
    let m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (m) {
      const [, yyyy, mm, dd] = m.map(Number);
      return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
    }

    // dd/mm/yyyy ó mm/dd/yyyy
    m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      let [, a, b, yyyy] = m;
      a = Number(a); b = Number(b); yyyy = Number(yyyy);

      let dd, mm;
      if (a > 12 && b <= 12) { dd = a; mm = b; }
      else if (b > 12 && a <= 12) { dd = b; mm = a; }
      else { dd = a; mm = b; } // LATAM

      return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
    }

    // Último recurso: Date.parse
    const d = new Date(s);
    if (!isNaN(d.getTime())) return toYMD(d);
  }

  return "";
}

/** "YYYY-MM-DD" -> "YYYY-MM-DDT00:00:00.000Z" (UTC con Z) */
function ymdToISOZ(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
}
