import React from "react";
import '../css/ComponentesAdicionales/Tarjeta.css';

/**
 * Componente de tarjeta para mostrar información en formato resumido.
 * 
 * @param {Object} props
 * @param {string | number} props.valor1 - Valor numérico o texto a mostrar en la tarjeta.
 * @param {string} props.titulo - Título de la tarjeta.
 * @param {string} props.colort - Color de fondo del encabezado de la tarjeta.
 * 
 * @returns {JSX.Element} - Tarjeta con título, valor y un color de fondo dinámico.
 */
export default function TarjetasMt({ valor1, titulo, colort }) {
    return (
        <>
            <div className="card-container-s">
                {/* Encabezado de la tarjeta con color dinámico */}
                <div className="card-header-s" style={{ backgroundColor: colort }}>
                    <h5 className="titulo-card-s">{titulo}</h5>
                </div>

                {/* Cuerpo de la tarjeta donde se muestra el valor */}
                <div className="card-body-s">
                    <p className="unidades-card-s">{valor1}</p>
                </div>

                {/* Pie de tarjeta (actualmente vacío, pero disponible para futuros elementos) */}
                <div className="card-footer15 small">
                </div>
            </div>
        </>
    );
}
