import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar';
import '../css/ComponentesAdicionales/Layout.css'; 

/**
 * Componente de diseño general de la aplicación.
 * Incluye la barra lateral (Sidebar), la barra de navegación (Navbar)
 * y una sección principal donde se renderizan las vistas hijas.
 *
 * @param {Object} props 
 * @param {React.ReactNode} props.children - Contenido que se renderiza dentro del layout.
 * 
 * @returns {JSX.Element} - Estructura del layout con sidebar, navbar y breadcrumb de navegación.
 */
const Layout = ({ children }) => {
  // Estado para almacenar el grupo y la ruta actual
  const [group, setGroup] = useState('Desconocido');
  const [routeName, setRouteName] = useState('Desconocido');

  /**
   * Maneja el cambio del grupo y el nombre de la ruta actual,
   * permitiendo actualizar la navegación dinámica en el breadcrumb.
   *
   * @param {string} newGroup - Nuevo nombre del grupo de navegación.
   * @param {string} newRouteName - Nuevo nombre de la ruta activa.
   */
  const handleGroupAndRouteChange = (newGroup, newRouteName) => {
    setGroup(newGroup);
    setRouteName(newRouteName);
  };

  return (
    <div className="layout-container">
      {/* Barra lateral de navegación */}
      <Sidebar className="sidebar" />

      {/* Contenedor principal de contenido */}
      <div className="layout-content">
        {/* Barra de navegación */}
        <Navbar onGroupAndRouteChange={handleGroupAndRouteChange} />

        {/* Contenido principal de la vista */}
        <main className="main-content">
          {/* Breadcrumb para mostrar la ubicación dentro de la aplicación */}
          <div className="navigation">
            <ul className="breadcrumb">
              <li>
                <span>{group}</span>
              </li>
              <li className="breadcrumb-separator">
                <span>{routeName}</span>
              </li>
            </ul>
          </div>

          {/* Renderiza el contenido dinámico de la aplicación */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
