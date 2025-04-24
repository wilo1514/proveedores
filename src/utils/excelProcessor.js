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
  const jsonColumns = json[0] || [];
  const missingColumns = requiredColumns.filter(col => !jsonColumns.includes(col));
  if (missingColumns.length) {
    throw new Error(`Las siguientes columnas están faltando: ${missingColumns.join(', ')}`);
  }

  const productCodeSet = new Set();
  const alertas = [];
  const duplicateAlerts = [];

  const nuevosProductos = json.slice(1)
    .filter(fila => parseFloat(fila[jsonColumns.indexOf("cantidad")]) > 0 && fila.some(cell => cell !== null && cell !== ""))
    .map((fila, index) => {
      const codigo = fila[jsonColumns.indexOf("codigoPrincipal")]?.toString();
      if (!codigo) return null;

      if (productCodeSet.has(codigo)) {
        duplicateAlerts.push({
          index: index + 2,
          descripcion: fila[jsonColumns.indexOf("descripcion")]
        });
        return null;
      }
      productCodeSet.add(codigo);

      const productoEnRedux = productos.find(p => p.codigoPrincipal === codigo);
      if (!productoEnRedux) {
        alertas.push({
          descripcion: fila[jsonColumns.indexOf("descripcion")],
          campo: "codigoPrincipal",
          cantidadExcel: "No encontrado",
          cantidadTransformada: "No encontrado",
          fila: index + 2
        });
        return null;
      }

      const cantidadOriginal = parseFloat(fila[jsonColumns.indexOf("cantidad")]) || 0;
      let cantidadTransformada = cantidadOriginal;
      if (productoEnRedux.unidad === "UN") {
        cantidadTransformada = Math.trunc(cantidadOriginal);
      }
      if (cantidadTransformada > 20000 || cantidadTransformada !== cantidadOriginal) {
        alertas.push({
          descripcion: productoEnRedux.descripcion,
          campo: "Cantidad",
          cantidadExcel: cantidadOriginal,
          cantidadTransformada,
          fila: index + 2
        });
      }

      const precio = parseFloat(fila[jsonColumns.indexOf("precio")]) || 0;
      const descuento = parseFloat(fila[jsonColumns.indexOf("descuento")]) || 0;
      let comentario = fila[jsonColumns.indexOf("comentario")];
      comentario = comentario === "0" || comentario === 0 ? "" : comentario;

      return {
        ...productoEnRedux,
        cantidad: cantidadTransformada.toString(),
        precioUnitario: precio.toString(),
        descuento: descuento.toString(),
        comentario: comentario || "",
        esPromocion: descuento > 0 || comentario !== ""
      };
    })
    .filter(Boolean);

  return { nuevosProductos, alertas, duplicateAlerts };
};

export const showAlertsIfNeeded = (alertas, duplicateAlerts) => {
  if (alertas.length || duplicateAlerts.length) {
    const alertTableHtml = `
    <div class="alert-container">
      <table class="alert-table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Campo</th>
            <th>Ingresado</th>
            <th>Modificado</th>
          </tr>
        </thead>
        <tbody>
          ${alertas.map(alert => `
            <tr>
              <td>${alert.descripcion}</td>
              <td>${alert.campo}</td>
              <td>${alert.cantidadExcel}</td>
              <td>${alert.cantidadTransformada}</td>
            </tr>
          `).join('')}
          ${duplicateAlerts.map(alert => `
            <tr>
              <td>${alert.descripcion}</td>
              <td>Duplicado</td>
              <td colspan="2"></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;

    Swal.fire({
      title: "AVISO",
      html: `<strong>Advertencias encontradas en el Excel</strong><br>${alertTableHtml}`,
      icon: "warning",
      iconColor: '#e31616',
      width: "60%",
      confirmButtonColor: '#7c7c7e'
    });
  }
};
