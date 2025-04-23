import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from '../assets/iconos/x.svg';
import '../css/ComponentesAdicionales/Modal.css';

/**
 * Componente de modal reutilizable.
 * 
 * Este modal puede usarse para mostrar contenido emergente en la aplicación.
 * Se cierra al hacer clic en el botón de cierre o al presionar la tecla "Escape".
 *
 * @param {Object} props 
 * @param {boolean} props.isOpen - Indica si el modal está abierto o cerrado.
 * @param {Function} props.onClose - Función que se ejecuta al cerrar el modal.
 * @param {'xl' | 'lg' | 'md' | 'sm'} [props.size=''] - Tamaño del modal (opcional).
 * @param {string} [props.className=''] - Clases CSS adicionales para personalizar el modal.
 * @param {string} [props.title=''] - Título del modal.
 * @param {React.ReactNode} [props.children=null] - Contenido que se mostrará dentro del modal.
 * 
 * @returns {JSX.Element} - Componente de modal con fondo semitransparente.
 */
const Modal = ({
  isOpen,
  onClose,
  size = '',
  className = '',
  title = '',
  children = null
}) => {
  // Genera las clases CSS dinámicas para el modal y su fondo
  const modalClasses = classNames('modal', { 'show': isOpen }, className);
  const backdropClasses = classNames('modal-backdrop', { 'show': isOpen });

  /**
   * Retorna la clase de tamaño del modal según la prop `size`.
   * @returns {string} - Clase CSS correspondiente al tamaño seleccionado.
   */
  const getSizeClass = () => {
    switch (size) {
      case 'xl': return 'modal-xl';
      case 'lg': return 'modal-lg';
      case 'md': return 'modal-md';
      case 'sm': return 'modal-sm';
      default: return '';
    }
  };

  /**
   * Agrega un listener para cerrar el modal con la tecla "Escape".
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className={modalClasses} tabIndex="-1" role="dialog" style={{ display: isOpen ? 'block' : 'none' }}>
      <div className={`modal-dialog ${getSizeClass()}`} role="document">
        <div className="modal-content">
          {/* Encabezado del modal con título y botón de cierre */}
          <div className="modal-header">
            <Stack direction="row" alignItems={"center"} justifyContent={"space-between"} marginBottom={2} spacing={2}>
              <h5 className="modal-title">{title}</h5>
              <img src={Icon} alt="Cerrar" onClick={onClose} style={{ cursor: 'pointer' }} /> {/* Ícono de cierre */}
            </Stack>
          </div>

          {/* Cuerpo del modal con el contenido dinámico */}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>

      {/* Fondo del modal para el efecto de desenfoque */}
      <div className={backdropClasses}></div>
    </div>
  );
};

// Validación de propiedades con PropTypes
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // Indica si el modal está abierto
  onClose: PropTypes.func.isRequired, // Función para cerrar el modal
  size: PropTypes.oneOf(['xl', 'lg', 'md', 'sm']), // Tamaño del modal
  className: PropTypes.string, // Clases CSS personalizadas
  title: PropTypes.string, // Título del modal
  children: PropTypes.node // Contenido del modal
};

export default Modal;
