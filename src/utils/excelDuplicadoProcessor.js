// utils/excelDuplicadoProcessor.js
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

/**
 * Lee un archivo Excel (.xlsx/.xls) y devuelve sus filas en JSON.
 * @param {File} file - Archivo Excel cargado.
 * @param {(rows: object[]) => void} onSuccess - Callback con las filas JSON.
 * @param {(error: Error) => void} onError - Callback en caso de error.
 */
export function readDuplicadoExcel(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheet];
      // Convertir a JSON por filas, tomando encabezados de la primera fila
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      onSuccess(rows);
    } catch (err) {
      onError(err);
    }
  };
  reader.onerror = onError;
  reader.readAsArrayBuffer(file);
}

/**
 * Valida la estructura y transforma filas Excel al formato de items.
 * @param {object[]} rows - Filas obtenidas del Excel.
 * @returns {{ nuevosItems: object[], alertas: object[] }}
 */
export function validateAndTransformDuplicado(rows) {
  const required = [
    'Código Conorque',
    'Código Barras',
    'Descripción',
    'Precio Actual',
    'cantidadAutorizada',
    'descuento',
    'comentario'
  ];

  if (!rows.length) {
    throw new Error('El archivo está vacío.');
  }

  // Chequear columnas
  const first = rows[0];
  const missing = required.filter(col => !(col in first));
  if (missing.length) {
    throw new Error(`Faltan columnas: ${missing.join(', ')}`);
  }

  const seen = new Set();
  const alertas = [];
  const nuevosItems = rows.map((row, idx) => {
    const fila = idx + 2; // offset encabezado
    const code = row['Código Barras']?.toString() || '';
    if (!code) {
      alertas.push({ fila, descripcion: row['Descripción'], error: 'Código vacío' });
      return null;
    }
    if (seen.has(code)) {
      alertas.push({ fila, descripcion: row['Descripción'], error: 'Duplicado' });
      return null;
    }
    seen.add(code);

    const item = {
      codigoConorque: row['Código Conorque']?.toString(),
      codigoPrincipal: code,
      descripcion: row['Descripción'],
      precioUnitario: parseFloat(row['Precio Actual']) || 0,
      cantidadAutorizada: parseFloat(row['cantidadAutorizada']) || 0,
      descuento: parseFloat(row['descuento']) || 0,
      comentario: row['comentario']?.toString() || '',
      esPromocion: (parseFloat(row['descuento']) || 0) > 0 || !!row['comentario'],
      ocultarColumna: false,
      id: 0
    };

    return item;
  }).filter(Boolean);

  return { nuevosItems, alertas };
}

/**
 * Muestra alertas de validación encontradas en el Excel.
 * @param {object[]} alertas - Array de alertas con {fila, descripcion, error}.
 */
export function showDuplicadoAlerts(alertas) {
  if (!alertas.length) return;

  const html = `
    <div class="alert-container">
      <table class="alert-table">
        <thead>
          <tr><th>Fila</th><th>Producto</th><th>Error</th></tr>
        </thead>
        <tbody>
          ${alertas.map(a => `
            <tr>
              <td>${a.fila}</td>
              <td>${a.descripcion}</td>
              <td>${a.error}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  Swal.fire({
    title: 'Advertencias en Excel',
    html,
    icon: 'warning',
    width: '60%',
    confirmButtonColor: '#7c7c7e'
  });
}
