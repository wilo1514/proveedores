// src/utils/descargarArchivo.js

import Swal from "sweetalert2";

/**
 * Descarga un archivo desde la carpeta public.
 * @param {string} nombreArchivo - El nombre del archivo, incluyendo la extensión (ej: 'plantilla.xlsx').
 */
export async function descargarArchivo(nombreArchivo) {
  try {
    const response = await fetch(`/${nombreArchivo}`);
    if (!response.ok) {
      throw new Error("Archivo no disponible.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
}
