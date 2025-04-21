import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';

import RegisterCard from "../../components/RegisterCard";
import Container from "../../components/Container";
import '../../css/VistasGenerales/Registro.css';

/**
 * Vista para el registro de usuarios.
 * Muestra una tarjeta de registro para cada tipo de usuario (administrador, empleado, proveedor, cliente)
 * y redirige a la vista de registro correspondiente al hacer click en cada tarjeta.
 * @returns {React.ReactElement} un JSX element que representa la vista de registro de usuarios.
 */
export default function RegView() {
    const navigate = useNavigate();
    /**
     * Navega a la vista de registro de administrador.
     * Redirige a la ruta "/registro/administrador".
     */
    const administrador = () => {
        navigate("/registro/administrador")
    }
    /**
     * Navega a la vista de registro de empleado.
     * Redirige a la ruta "/registro/empleado".
     */
    const empleado = () => {
        navigate("/registro/empleado")
    }
/**
 * Navega a la vista de registro de proveedor.
 * Redirige a la ruta "/registro/proveedor".
 */

    const proveedor = () => {
        navigate("/registro/proveedor")
    }
    /**
     * Navega a la vista de registro de cliente.
     * Redirige a la ruta "/registro/cliente".
     */
    const cliente = () => {
        navigate("/registro/cliente")
    }
    return (
        <>
            <Container fluid>
                <div className="container-cardsRegister">
                    <Grid container>
                        <Grid item xs={12} sm={12} md={12}>
                            <Typography component="div" variant="h3" className="title-cardsRegister" style={{ textAlign: "center" }}>
                                REGISTRO DE USUARIOS
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={12} md={6}>
                                    <RegisterCard texto={"ADMINISTRADORES"} funcion={administrador} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6}>
                                    <RegisterCard texto={"EMPLEADOS"} funcion={empleado} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6}>
                                    <RegisterCard texto={"PROVEEDORES"} funcion={proveedor} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6}>
                                    <RegisterCard texto={"CLIENTES"} funcion={cliente} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </Container>
        </>
    );
}