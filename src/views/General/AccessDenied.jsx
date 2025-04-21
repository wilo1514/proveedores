import React from 'react';
import { useNavigate } from 'react-router-dom';

import Grid from "@mui/material/Grid";
import Button from '@mui/material/Button';

import Container from '../../components/Container';

import '../../css/VistasGenerales/General.css';
import '../../css/VistasGenerales/Notfound.css';

/**
 * Vista encargada de mostrar un mensaje de acceso denegado.
 * Se encarga de informar al usuario que no tiene permisos para acceder a la ruta solicitada.
 * 
 * @returns {JSX.Element} Componente que renderiza el mensaje de acceso denegado.
 */
export default function DeniedView() {
  const navigate = useNavigate();

  return (
    <Container >
      <Grid container spacing={2} >
        <div className='container-denied'>
          <Grid item xs={12}>
            <h2 className='title-denied'>ACCESO DENEGADO</h2>
          </Grid>
          <Grid item xs={12}>
            <p className='text-denied'>No cuentas con los permisos necesarios para ingresar</p>
          </Grid>
          <Grid item xs={12}>
            <p className='text-denied'>En caso de requerirlo, comunicate con tu asesor</p>
          </Grid>
          <Grid item xs={12}>
            <Button className="button-denied" onClick={() => { navigate("/home") }} variant="contained">Regresar Inicio</Button>
          </Grid>
        </div>
      </Grid>
    </Container>
  );
}
