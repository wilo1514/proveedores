// utils/excelProcessor.js
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export const readExcelFile = (file, onSuccess, onError) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const workbook = XLSX.read(new Uint8Array(event.target.result), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      onSuccess(json);
    } catch (error) {
      onError(error);
    }
  };
  reader.onerror = onError;
  reader.readAsArrayBuffer(file);
};

export const validateAndTransform = (json, productos) => {
  const requiredColumns = ["codigoPrincipal", "descripcion", "cantidad", "precio", "descuento", "comentario"];
  const headers = json[0] || [];
  const missing = requiredColumns.filter(c => !headers.includes(c));
  if (missing.length) {
    throw new Error(`Faltan columnas: ${missing.join(', ')}`);
  }

  // índices de cada columna
  const idx = {};
  requiredColumns.forEach(c => { idx[c] = headers.indexOf(c); });

  const productCodeSet = new Set();
  const alertas        = [];
  const duplicateAlerts = [];

  const nuevosProductos = json
    .slice(1)
    // filtrar filas vacías o con cantidad <= 0
    .filter(fila =>
      parseFloat(fila[idx.cantidad]) > 0 &&
      fila.some(cell => cell !== null && cell !== "")
    )
    .map((fila, i) => {
      const rowNum = i + 2; // para referencias en errores
      const codigoExcel     = fila[idx.codigoPrincipal]?.toString().trim();
      const descripcionExcel = fila[idx.descripcion]?.toString().trim();

      if (!codigoExcel) {
        // si incluso falta el código, lo consideramos fila inválida
        alertas.push({
          codigoPrincipal: "(sin código)",
          descripcionExcel,
          mensaje: `Fila ${rowNum}: no existe códigoPrincipal`,
          fila: rowNum
        });
        return null;
      }

      // duplicados
      if (productCodeSet.has(codigoExcel)) {
        duplicateAlerts.push({
          codigoPrincipal: codigoExcel,
          descripcionExcel,
          fila: rowNum
        });
        return null;
      }
      productCodeSet.add(codigoExcel);

      // buscar en tu catálogo (redux)
      const prodRedux = productos.find(p => p.codigoPrincipal === codigoExcel);
      if (!prodRedux) {
        alertas.push({
          codigoPrincipal: codigoExcel,
          descripcionExcel,
          mensaje: `Producto no encontrado en la base`,
          fila: rowNum
        });
        return null;
      }

      /*// cantidad
      const rawCant = parseFloat(fila[idx.cantidad]) || 0;
      let transCant = rawCant;
      if (prodRedux.unidad === "UN") transCant = Math.trunc(rawCant);
      if (transCant !== rawCant || transCant > 20000) {
        alertas.push({
          codigoPrincipal: codigoExcel,
          descripcionExcel,
          mensaje: `Cantidad modificada: ${rawCant} → ${transCant}`,
          fila: rowNum
        });
      }*/
        const rawCant0 = parseFloat(fila[idx.cantidad]) || 0;

        // 1) redondeo “seguro” a 6 decimales
        const rawCant = Math.round(rawCant0 * 1e6) / 1e6;
        
        // 2) calculo la versión “truncada” si es unidad
        let transCant = rawCant;
        if (prodRedux.unidad === "UN") {
          transCant = Math.trunc(rawCant);
        }
        
        // 3) sólo aviso si la diferencia es mayor a un epsilon muy pequeño
        const EPS = 1e-6;
        if (Math.abs(rawCant - transCant) > EPS || transCant > 35000) {
          alertas.push({
            codigoPrincipal: codigoExcel,
            descripcionExcel,
            mensaje: `Cantidad modificada: ${rawCant} → ${transCant}`,
            fila: rowNum
          });
        }

      // precio
      const rawPrecio = parseFloat(fila[idx.precio]) || 0;
      const basePrecio = parseFloat(prodRedux.precioUnitario) || 0;
      if (rawPrecio > basePrecio + 0.001) {
        alertas.push({
          codigoPrincipal: codigoExcel,
          descripcionExcel,
          mensaje: `El precio ingresado ${rawPrecio} es mayor precio base ${basePrecio}`,
          fila: rowNum
        });
      }

      // descuento/comentario
      const descuento = parseFloat(fila[idx.descuento]) || 0;
      let comentario  = fila[idx.comentario];
      comentario = (comentario === "0" || comentario === 0) ? "" : comentario;

      return {
        ...prodRedux,
        cantidad:        transCant.toString(),
        precioUnitario:  rawPrecio.toString(),
        descuento:       descuento.toString(),
        comentario:      String(comentario || "").trim(),
        esPromocion:     descuento > 0 || comentario !== ""
      };
    })
    .filter(Boolean);

  return { nuevosProductos, alertas, duplicateAlerts };
};

export const showAlertsIfNeeded = (alertas, duplicateAlerts) => {
  if (!alertas.length && !duplicateAlerts.length) return;

  // construyo todas las filas de la tabla
  const rows = [
    // primero las alertas de validación
    ...alertas.map(a => `
      <tr>
        <td>${a.codigoPrincipal}</td>
        <td>${a.descripcionExcel}</td>
        <td>${a.mensaje}</td>
      </tr>
    `),
    // luego los duplicados
    ...duplicateAlerts.map(d => `
      <tr>
        <td>${d.codigoPrincipal}</td>
        <td>${d.descripcionExcel}</td>
        <td>Duplicado</td>
      </tr>
    `)
  ].join("");

  const alertTableHtml = `
    <div class="alert-container">
      <table class="alert-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Mensaje</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  Swal.fire({
    title: "AVISO",
    html: `
      <strong>Advertencias encontradas en el Excel</strong><br>
      ${alertTableHtml}
    `,
    icon: "warning",
    iconColor: "#e31616",
    width: "60%",
    confirmButtonColor: "#7c7c7e"
  });
};
