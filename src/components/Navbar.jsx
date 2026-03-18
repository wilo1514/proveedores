import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { Stack } from '@mui/material';
import Notificaciones from "../components/Notificaciones";

import { clearAuth } from "../features/auth/authSlice";
import Avatar from '../assets/images/avatar2.webp';
import '../css/ComponentesAdicionales/Navbar.css';

/**
 * Navbar con nombre del usuario, notificaciones y menú de usuario.
 * @param {{ onGroupAndRouteChange?: (grupo: string, ruta: string) => void }} props
 */
const Navbar = ({ onGroupAndRouteChange }) => {
  const [mostrar, setMostrar] = useState(false);
  const permissions = useSelector((state) => state.auth.permissions);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Datos de usuario desde Redux
  const cardName = useSelector((state) => state.auth.datos_Usuario?.CARDNAME);
  const slpName  = useSelector((state) => state.auth.datos_Usuario?.SLPNAME);
  const rol      = useSelector((state) => state.auth.datos_Usuario?.ROL);        // <-- faltaba
  const CardCode = useSelector((state) => state.auth.datos_Usuario?.CARDCODE);

  // Nombre e ítems de notificaciones según rol
  let displayName = 'Usuario Inválido';
  let notificaciones = null;

  if (rol === 'supplier') {
    displayName = cardName || 'Usuario Inválido';
  } else if (rol === 'employees') {
    displayName = slpName || 'Usuario Inválido';
    notificaciones = <Notificaciones />;
  } else if (rol === 'employeespago') {
    displayName = slpName || 'Usuario Inválido';
  }

  const toggleMenu = () => setMostrar((v) => !v);

  /**
   * Cerrar sesión:
   * - Borra flag del popup por usuario (para que se muestre de nuevo en próximo login)
   * - Limpia token/expiración
   * - Resetea Redux (clearAuth)
   * - Navega al login
   */
  const modalAvatar1 = () => {
    // 1) Borrar flag del popup (Opción A - SweetAlert2)
    if (CardCode) {
      sessionStorage.removeItem(`homePopupShown:${CardCode}`);
    } else {
      // Limpieza defensiva si aún no hay CardCode
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('homePopupShown:'))
        .forEach((k) => sessionStorage.removeItem(k));
    }

    // 2) Limpiar storage de auth
    localStorage.removeItem("token");
    localStorage.removeItem("expiracion");

    // 3) Limpiar estado global
    dispatch(clearAuth());

    // 4) Cerrar menú y navegar
    setMostrar(false);
    navigate("/");
  };

  // Breadcrumb dinámico según permisos y ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    const currentPerm = permissions.find(perm => perm.ruta === currentPath);
    const currentGroup = currentPerm ? currentPerm.grupo : 'Desconocido';
    const currentName  = currentPerm ? currentPerm.nombre : 'Desconocido';

    onGroupAndRouteChange?.(currentGroup, currentName);
  }, [location, permissions, onGroupAndRouteChange]);

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-links desktop">
          <Stack direction="row" alignItems={"center"} justifyContent={"space-between"} spacing={3}>
            <p>{displayName}</p>
            <div style={{ marginTop: '4px' }}>
              {notificaciones}
            </div>
            <div className="navbar-avatar" onClick={toggleMenu}>
              <img src={Avatar} alt="Logo" />
            </div>
          </Stack>

          {mostrar && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-item" onClick={modalAvatar1}>Salir</div>
            </div>
          )}
        </div>

        <div className="navbar-menu mobile" onClick={toggleMenu}>
          &#9776;
        </div>
      </nav>

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
