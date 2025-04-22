import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DotSpinner from './components/DotSpinner';

/**
 * Componente de ruta privada que protege el acceso a ciertas rutas basado en permisos y autenticación.
 *
 * Este componente verifica si el usuario tiene un token de autenticación válido y si posee los permisos
 * necesarios para acceder a la ruta actual. Si no se cumple alguna de estas condiciones, redirige al usuario
 * a la página de inicio de sesión o a una página de acceso denegado.
 *
 * Utiliza un estado de carga para mostrar un indicador visual mientras se valida la información de permisos.
 * 
 * @returns {JSX.Element} - Componente `DotSpinner` mientras se cargan los permisos, `Navigate` para redirección
 * a diferentes rutas según la autenticación y permisos, o `Outlet` para renderizar componentes secundarios.
 */

const PrivateRoute = () => {
    const permissions = useSelector((state) => state.auth.permissions);
    const token = localStorage.getItem("token");
    const location = useLocation();
    const { pathname } = location;
    const permisoEncontrado = permissions.find(permiso => permiso.ruta === pathname);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const isDifferent = !permissions.some(permission =>
            permission.nombre === "" &&
            permission.ruta === "" &&
            permission.permiso === true &&
            permission.menu === true
        );

        if (isDifferent) {
            setLoading(false);
        }
    }, [permissions]);

    if (loading) {
        return <DotSpinner />;
    }

    if (!token) {
        return <Navigate to={"/"} />;
    }

    //if (token) {
    //    return <Navigate to={"/"} />;
    //}

    if (!permisoEncontrado || !permisoEncontrado.permiso) {
        return <Navigate to={'/denegado'} />;
    }

    return <Outlet />;
}

export default PrivateRoute;
