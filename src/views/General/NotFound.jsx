import React from 'react';
import { useNavigate } from 'react-router-dom';

import Grid from "@mui/material/Grid";
import Button from '@mui/material/Button';

import Container from '../../components/Container';

import ImageScarecrow2 from '../../assets/images/404.avif';
import '../../css/VistasGenerales/General.css';
import '../../css/VistasGenerales/Notfound.css';

/**
 * Vista encargada de mostrar un mensaje de "página no encontrada".
 * Se encarga de informar al usuario que la página que estás buscando no existe o esté en mantenimiento.
 * Muestra un botón para regresar al inicio.
 * 
 * @returns {JSX.Element} Componente que renderiza el mensaje de "página no encontrada".
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container >
      <Grid container spacing={2} >
        <div className='container-denied'>
          <Grid item xs={12}>
            <h2 className='title-denied'>PAGINA NO ENCONTRADA</h2>
          </Grid>
          <Grid item xs={12}>
            <p className='text-denied'>La página que estás buscando, posiblemente no exista o esté en mantenimiento.</p>
          </Grid>
          <Grid item xs={12}>
            <img className='image' src={ImageScarecrow2} alt="" loading='lazy' />
          </Grid>
          <Grid item xs={12}>
            <Button className="button-denied" onClick={() => { navigate("/") }} variant="contained">Regresar al Inicio</Button>
          </Grid>
        </div>
      </Grid>
    </Container>
  );
}
