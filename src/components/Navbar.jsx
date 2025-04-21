import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { Stack } from '@mui/material';
import Notificaciones from "../components/Notificaciones";

import Avatar from '../assets/images/avatar2.webp';
import '../css/ComponentesAdicionales/Navbar.css';

/**
 * Componente de barra de navegación (Navbar) que muestra el nombre del usuario,
 * notificaciones y un menú de opciones.
 *
 * @param {Object} props 
 * @param {Function} props.onGroupAndRouteChange - Función para actualizar el grupo y la ruta actual en el layout.
 * 
 * @returns {JSX.Element} - Navbar con nombre del usuario, notificaciones y opciones de menú.
 */
const Navbar = ({ onGroupAndRouteChange }) => {
  const [mostrar, setMostrar] = useState(false); // Estado para mostrar/ocultar menú
  const permissions = useSelector((state) => state.auth.permissions); // Permisos del usuario desde Redux
  const navigate = useNavigate();
  const location = useLocation();

  // Obtención de valores desde Redux para mostrar información del usuario
  const cardName = useSelector((state) => state.auth.datos_Usuario?.CARDNAME);
  const slpName = useSelector((state) => state.auth.datos_Usuario?.SLPNAME);
  const rol = useSelector((state) => state.auth.datos_Usuario?.ROL);

  // Variables para mostrar el nombre correcto y la sección de notificaciones
  let displayName = 'Usuario Inválido';
  let notificaciones = null;

  if (rol === 'supplier') {
    displayName = cardName || 'Usuario Inválido';
    // notificaciones = <NotificacionesProveedor />; // (Deshabilitado en este código)
  } else if (rol === 'employees') {
    displayName = slpName || 'Usuario Inválido';
    notificaciones = <Notificaciones />;
  } else if (rol === 'employeespago') {
    displayName = slpName || 'Usuario Inválido';
  }

  /**
   * Alterna la visibilidad del menú de usuario.
   */
  const toggleMenu = () => {
    setMostrar(!mostrar);
  };

  /**
   * Maneja el cierre de sesión del usuario.
   * - Redirige a la página de inicio de sesión.
   * - Elimina el token de autenticación y la expiración del almacenamiento local.
   */
  const modalAvatar1 = () => {
    navigate("/");
    localStorage.removeItem("token");
    localStorage.removeItem("expiracion");
    setMostrar(false);
  };

  /**
   * Efecto que actualiza el grupo y nombre de la ruta actual
   * basado en los permisos y la ubicación actual.
   */
  useEffect(() => {
    const currentPath = location.pathname;
    const currentPerm = permissions.find(perm => perm.ruta === currentPath);
    const currentGroup = currentPerm ? currentPerm.grupo : 'Desconocido';
    const currentName = currentPerm ? currentPerm.nombre : 'Desconocido';

    if (onGroupAndRouteChange) {
      onGroupAndRouteChange(currentGroup, currentName);
    }
  }, [location, permissions, onGroupAndRouteChange]);

  return (
    <div>
      {/* Navbar principal */}
      <nav className="navbar">
        <div className="navbar-links desktop">
          <Stack direction="row" alignItems={"center"} justifyContent={"space-between"} spacing={3}>
            <p>{displayName}</p> {/* Nombre del usuario */}
            <div style={{ marginTop: '4px' }}>
              {notificaciones} {/* Sección de notificaciones si aplica */}
            </div>
            {/* Avatar del usuario */}
            <div className="navbar-avatar" onClick={toggleMenu}>
              <img src={Avatar} alt="Logo" />
            </div>
          </Stack>
          {/* Menú desplegable del avatar */}
          {mostrar && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-item" onClick={modalAvatar1}>Salir</div>
            </div>
          )}
        </div>

        {/* Menú hamburguesa para dispositivos móviles */}
        <div className="navbar-menu mobile" onClick={toggleMenu}>
          &#9776;
        </div>
      </nav>

      {/* Menú de navegación en dispositivos móviles */}
      {mostrar && (
        <div className="navbar-mobile-menu">
          {permissions
            .filter(item => item.permiso && item.menu)
            .map((perm) => (
              <Link
                key={perm.nombre}
                to={perm.ruta}
                className={`navbar-link-mobile ${location.pathname === perm.ruta ? 'active' : ''}`}
                onClick={() => setMostrar(false)}
              >
                {perm.nombre}
              </Link>
            ))}
          <div className="navbar-dropdown-item-mobile" onClick={modalAvatar1}>Salir</div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
