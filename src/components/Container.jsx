import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import '../css/ComponentesAdicionales/Container.css';

/**
 * Componente de contenedor reutilizable que envuelve otros elementos y ajusta el espaciado interno.
 *
 * @param {Object} props
 * @param {string} [props.className=''] - Clases CSS adicionales para personalizar el contenedor.
 * @param {React.ReactNode} props.children - Elementos hijos que se renderizan dentro del contenedor.
 * @param {'less' | 'normal' | 'more'} [props.padding='normal'] - Nivel de padding que se aplicará al contenedor.
 *
 * @returns {JSX.Element} - Contenedor estilizado con diferentes niveles de padding.
 */
const Container = ({ className = '', children, padding = 'normal' }) => {
  // Define las clases CSS basadas en el padding recibido como prop
  const classes = classNames(
    'container-fluid', 
    {
      'less-padding': padding === 'less',
      'normal-padding': padding === 'normal',
      'more-padding': padding === 'more',
    }, 
    className
  );

  return <div className={classes}>{children}</div>;
};

// Definición de los tipos de propiedades esperadas
Container.propTypes = {
  className: PropTypes.string, // Clase CSS opcional para estilos adicionales
  children: PropTypes.node, // Elementos que se renderizarán dentro del contenedor
  padding: PropTypes.oneOf(['less', 'normal', 'more']), // Opciones de padding predefinidas
};

export default Container;
