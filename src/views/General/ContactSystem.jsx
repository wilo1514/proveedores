import React from 'react';
import { useNavigate } from 'react-router-dom';

import Grid from "@mui/material/Grid";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography  from '@mui/material/Typography';

import Container from '../../components/Container';

import '../../css/VistasGenerales/Systems.css';


/**
 * Componente que muestra la informaci n de contacto para el soporte t cnico
 * de la APP DE PROVEEDORES.
 *
 * @returns {JSX.Element}
 */
export default function ContactSystem() {
  const navigate = useNavigate();

  return (
    <>
      <Container fluid>
              <div className="textsystem-container">
                <Grid container spacing={1} style={{background:'white'}}>
                  <Grid item xs={12} sm={12} md={12}>
                    <Typography component="div" variant="h7" className="title-system" style={{ textAlign: "center" }}>
                      SOPORTE TÉCNICO
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Typography component="div" variant="h7" className="text-system" style={{ textAlign: "center" }}>
                      En caso de presentar algún inconveniente con la APP DE PROVEEDORES o requerir soporte comuniquese con nosotros al:
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Typography component="div" variant="h4" className="contact-system" style={{ textAlign: "center" }}>
                    0962591287 - 4100429 ext.225
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                      <Button variant="contained" className="sistemas" onClick={() => { navigate("/home") }}>
                        Regresar a Inicio
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </div>
      </Container>
    </>
  );
}
