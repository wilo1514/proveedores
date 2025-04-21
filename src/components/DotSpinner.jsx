import React from 'react';
import '../css/ComponentesAdicionales/Spinner.css';

/**
 * Componente de carga (spinner) que muestra una animación de puntos giratorios.
 * Se utiliza para indicar que el sistema está procesando o cargando datos.
 *
 * @returns {JSX.Element} - Un spinner animado con un mensaje de carga.
 */
const DotSpinner = () => {
  return (
    <div className="dot-spinner">
      {/* Contenedor de la animación de carga */}
      <div className="lds-spinner">
        <div></div><div></div><div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div><div></div><div></div>
      </div>

      {/* Mensaje de carga */}
      <div className="dot-spinner-message">
        ¡Espéranos! Estamos obteniendo tu información...
      </div>
    </div>
  );
};

export default DotSpinner;
