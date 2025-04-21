import fetchApi from './fechtData';

/**
 * Verifica si el token de autenticacion esta valido.
 * Compara la fecha actual con la fecha de expiracion del token guardada en el localStorage.
 * Si la fecha actual es menor que la fecha de expiracion - 15 minutos, se considera valido.
 * Si la fecha actual esta  dentro de los 15 minutos anteriores a la expiracion, se renueva el token.
 * Si la fecha actual es mayor o igual que la fecha de expiracion, se considera invalido y se redirige al usuario a la pantalla de inicio de sesion.
 * 
 * @returns {number} - 1 si el token est  v lido, 2 si est  inv lido.
 */
export async function validacion() {
    const fecha = new Date();
    const Expiracion = localStorage.getItem("expiracion");
    const nuevaFecha = new Date(Expiracion);

    if (fecha.getTime() < nuevaFecha.getTime() - 15 * 60000) {
        return 1;
    } else if (fecha.getTime() >= nuevaFecha.getTime() - 15 * 60000 && fecha.getTime() < nuevaFecha.getTime()) {
        return await renovartoken();
    } else {
        localStorage.removeItem("token");
        localStorage.removeItem("expiracion");
        window.location.href = '/';
        return 2;
    }
}

/**
 * Renueva el token de autenticacion del usuario.
 * Realiza una solicitud GET a /user/renewtoken con el token actual en el header.
 * Si el token es valido, se almacena la informacion del usuario en Redux y se devuelve 1.
 * Si el token es invalido, se muestra un mensaje de error y se devuelve 0.
 * Si se produce un error en la solicitud, se muestra un mensaje de error y se devuelve 0.
 */
async function  renovartoken () {
    const tokenId = localStorage.getItem("token");
    const Swal = require('sweetalert2');
    
    try {
      const datos = await fetchApi({
        endPoint: '/user/renewtoken',
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenId}`,
        },
      });
  
      if (datos.error) {
        Swal.fire({
          position: "center",
          icon: "warning",
          title: "Problemas de Usuario",
          footer: '<a href="/sistemas">Comunicarse con Soporte</a>',
          showConfirmButton: false,
          timer: 2500,
        });
        return 0;
      }
  
      return almacenarRedux(datos.datos);
    } catch (error) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Problemas de Usuario",
        footer: '<a href="/sistemas">Comunicarse con Soporte</a>',
        showConfirmButton: false,
        timer: 2500,
      });
      return 0;
    }
  };
  
  

/**
 * Almacena la informacion del usuario en Redux y localStorage.
 * @param {Object} datos - Informacion del usuario desde el API.
 * @returns {Number} - 1 si se almacena correctamente, 0 si no.
 */
function almacenarRedux (datos){
    if (datos.token) {
        localStorage.setItem("token", datos.token)
        localStorage.setItem("expiracion", datos.expiracion)
        return 1
    }
}

/**
 * Recupera la información del usuario desde el API.
 * 
 * Verifica si el token de autenticación es válido.
 * Realiza una solicitud GET a la API para obtener los permisos del usuario.
 * Si la solicitud es exitosa, retorna los datos del usuario.
 * Si ocurre un error en la solicitud o la respuesta contiene un error, 
 * muestra un mensaje de error en la consola.
 *
 * @returns {Promise<Object|undefined>} - Datos del usuario si la solicitud es exitosa, undefined si hay un error.
 */

export async function recuperarUsuario() {
  const validado = await validacion();
  if (validado === 1) {
      const tokenId = localStorage.getItem("token");
      try {
          const respuesta = await fetchApi({
              endPoint: `/user/obtainPermission`,
              method: 'GET',
              paginacion: false,
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + tokenId,
              }
          });
          
          if (respuesta.error) {
              console.log("Error:", respuesta.error);
              return;
          } 
          
          const datos = respuesta.datos;  
          return datos;
      } catch (error) {
          console.log("Error en la solicitud:", error);
      }
  } 
}


