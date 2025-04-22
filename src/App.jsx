import './App.css';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { recuperarUsuario } from './utils/apiUtils';
import { updateAuth } from './features/auth/authSlice';
import { useSelector, useDispatch } from "react-redux";
import PrivateRoute from './protegidas';
import NotFound from './views/General/NotFound';
import DotSpinner from './components/DotSpinner';
import Layout from './layouts/layout';

import Login from './views/General/Login';
import HomeView from './views/SuppliersModule/settings/Home'; /* VISTAS PROVEDORES */
import Employer from './views/PurchasingModule/orders/OrdersDashboard'; /* VISTAS DEPT COMPRAS */
import DevolucionesPagosView from './views/PaymentsModule/ReturnsDashboard'; /* VISTAS DEPT PAGOS */
import PagosView from './views/SuppliersModule/payments/PaymentsHistory';
import { useEffect } from 'react';
/* VISTAS PROVEDORES */
const OrdersView = React.lazy(() => import('./views/SuppliersModule/orders/ApprovedOrders'));
const RecensionView = React.lazy(() => import('./views/SuppliersModule/orders/SentSuggestions'));
const OrderSupplier = React.lazy(() => import('./views/SuppliersModule/orders/PurchaseOrders'));
const NotasCreditoView = React.lazy(() => import('./views/SuppliersModule/returns/RetundHistory'));
const HistoricoPrecioView = React.lazy(() => import('./views/SuppliersModule/prices/PriceHistory'));
const UpdatePriceView = React.lazy(() => import('./views/SuppliersModule/prices/RequestNewPrices'));

/* VISTAS DEPT COMPRAS */
const AutorizarView = React.lazy(() => import('./views/PurchasingModule/orders/OrdersDetails'));
const PreciosView = React.lazy(() => import('./views/PurchasingModule/prices/PriceRequestsDashboard'));
const AutorizarPreciosCompras = React.lazy(() => import('./views/PurchasingModule/prices/PriceRequestDetails'));
/* VISTAS EMPLEADOS MEGAS */
/* VISTAS SISTEMAS */
const RegView = React.lazy(() => import('./views/UserManagement/RegisterLanding'));
const EmployeesView = React.lazy(() => import('./views/UserManagement/EmployeeCreation'));
const SuppliersView = React.lazy(() => import('./views/UserManagement/SupplierCreation'));
/* VISTAS ADICIONALES */
const ContactSystem = React.lazy(() => import('./views/General/ContactSystem'));
const DeniedView = React.lazy(() => import('./views/General/AccessDenied'));
const SettingsView = React.lazy(() => import('./views/General/setting'));


/**
 * Función principal de la aplicación.
 * 
 * Verifica si la página ya ha sido recargada, en cuyo caso no hace nada.
 * Si no ha sido recargada, marca que la página ha sido recargada y la recarga.
 * 
 * Renderiza el enrutador (BrowserRouter) y las rutas (Routes) con los componentes
 * correspondientes.
 * 
 * @returns {JSX.Element} - El enrutador con las rutas.
 */
function App() {
  const CardCode = useSelector((state) => state.auth.datos_Usuario.CARDCODE);
  const tokenId = localStorage.getItem("token");
  const dispatch = useDispatch();

  /**
 * Actualiza el estado auth con los datos del usuario
 * y los permisos del usuario.
 * 
 * @param {Object} datos - El objeto con los datos del usuario y los permisos.
 */
  const recuperacion = (datos) => {
    dispatch(updateAuth(
      {
        datos_Usuario: datos.datos_Usuario,
        permissions: datos.permissions,
      }
    ))
  };

  (async () => {
    if (tokenId !== null && CardCode === "") {
      const datos = await recuperarUsuario();
      recuperacion(datos);
    }
  })();

  useEffect(() => {
    // Verificar si la página ya fue recargada
    const hasReloaded = localStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      // Marcar que la página ha sido recargada
      localStorage.setItem('hasReloaded', 'true');
      // Recargar la página
      window.location.reload();
    }

    // Limpiar la bandera al cerrar la pestaña
    return () => {
      localStorage.removeItem('hasReloaded');
    };
  }, []);

  return (
    <>
      <BrowserRouter >
        <Suspense fallback={<DotSpinner />}>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route element={<PrivateRoute />}>
               {/* VISTAS PROVEDORES */}
              <Route path='/home' element={<Layout><HomeView /></Layout>} />
              <Route path='/ordenes' element={<Layout><OrdersView/></Layout>} />
              <Route path='/enprogreso' element={<Layout><RecensionView /></Layout>} />
              <Route path='/pagosefectuados' element={<Layout><PagosView/></Layout>} />
              <Route path='/ordencompra' element={<Layout><OrderSupplier /></Layout>} />
              <Route path= '/devoluciones' element={<Layout><NotasCreditoView/></Layout>}/>
              <Route path= '/actualizacionprecio' element={<Layout><HistoricoPrecioView/></Layout>}/>
              <Route path= '/actualizacionprecio/listado' element={<Layout><UpdatePriceView/></Layout>}/>

              {/* VISTAS DEPT COMPRAS */}
              <Route path='/mesatrabajo' element={<Layout><Employer /></Layout>} />
              <Route path='/mesatrabajo/autorizacion' element={<Layout><AutorizarView /></Layout>} />
              <Route path='/mesatrabajoprecio' element={<Layout><PreciosView /></Layout>} />
              <Route path='/mesatrabajoprecio/autorizacion' element={<Layout><AutorizarPreciosCompras /></Layout>} />
                {/* VISTAS DEPT PAGOS */}
              <Route path='/mesatrabajodevoluciones' element={<Layout><DevolucionesPagosView /></Layout>} />     

              {/* VISTAS SISTEMAS */}
              <Route path='/registro' element={<Layout><RegView /></Layout>} />
              <Route path='/registro/empleado' element={<Layout><EmployeesView /></Layout>} />
              <Route path='/registro/proveedor' element={<Layout><SuppliersView /></Layout>} />
              <Route path='/registro/cliente' element={<Layout><NotFound /></Layout>} />
            </Route>
            <Route path='/configuracion' element={<Layout><SettingsView /></Layout>} />
            <Route path='*' element={<NotFound />} />
            <Route path='/denegado' element={<DeniedView />} />
            <Route path='/sistemas' element={<ContactSystem />} />
          </Routes>
        </Suspense>    
      </BrowserRouter>
    </>
  );
}

export default App;


