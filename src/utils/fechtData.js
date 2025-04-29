import Swal from 'sweetalert2';

const baseUrl = 'https://190.57.143.126:52100';
//const baseUrl = 'http://192.168.10.212:8085';

/**
 * Realiza una solicitud HTTP a un endpoint específico utilizando fetch.
 *
 * @param {Object} params - Los parámetros para la solicitud.
 * @param {string} params.endPoint - El endpoint de la API al que se realizará la solicitud.
 * @param {string} [params.method='GET'] - El método HTTP a utilizar (GET, POST, etc.).
 * @param {Object} [params.headers={}] - Encabezados adicionales para la solicitud.
 * @param {Object|null} [params.body=null] - El cuerpo de la solicitud, si es necesario.
 * @param {boolean} [params.paginacion=false] - Indica si se debe manejar la paginación.
 * @returns {Promise<Object>} - Retorna un objeto con los datos y cualquier error.
 *
 * Maneja status comunes como 204 No Content y 404 Not Found. En caso de error 400 Bad Request,
 * muestra mensajes de error mejorados. Agrega información de paginación si es necesario y maneja 
 * errores HTTP y errores de red de manera adecuada.
 */

const fetchApi = async ({ endPoint, method = 'GET', headers = {}, body = null, paginacion = false }) => {
    try {
        const response = await fetch(`${baseUrl}${endPoint}`, {
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            body: body ? JSON.stringify(body) : null
        });

        // Manejo de status comunes 204 No Content y 404 Not Found
        if ([404, 204].includes(response.status)) {
            console.error(`Error ${response.status}: No Content or Not Found`);
            return { datos: null, error: `Error ${response.status}` };
        }
        // Manejo de 400 Bad Request con formato de error mejorado
        if (response.status === 400) {
            console.error('Respuesta 400 Bad Request');
            const datos = await response.json();
            const errorMessages = handleBadRequestErrors(datos);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: errorMessages,
            });
            return { datos: null, error: errorMessages };
        }

        // Si la respuesta es exitosa (200 OK o 201 Created)
        if (response.ok) {
            const datos = await response.json();
            const respuesta = { datos, error: null };

            // Agregar información de paginación si es necesario
            if (paginacion) {
                const totalRegistros = response.headers.get('Cantidadtotalregistros');
                respuesta.totalRegistros = parseInt(totalRegistros, 10);
            }
            return respuesta;
        }

        // Manejo de otros errores HTTP
        const errorText = `Error ${response.status}: ${response.statusText}`;
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorText,
        });
        return { datos: null, error: errorText };
    } catch (error) {
        return handleGenericError(error);
    }
};

// Función auxiliar para manejar errores del tipo BadRequest (400)
const handleBadRequestErrors = (datos) => {
    if (datos && datos.errors) {
        if (typeof datos.errors === 'object') {
            return Object.keys(datos.errors)
                .map(key => `<strong>${key}:</strong> ${datos.errors[key].join(', ')}`)
                .join('<br>');
        } else if (Array.isArray(datos.errors)) {
            return datos.errors.map(err => err.message || JSON.stringify(err)).join('<br>');
        }
    }
    return datos.message || JSON.stringify(datos);
};

// Función auxiliar para manejo genérico de errores
const handleGenericError = (error) => {
    const errorMessage = error.message || 'Error desconocido';
    console.error(errorMessage);

    try {
        const parsedErrors = JSON.parse(errorMessage);
        const errorMessages = Object.keys(parsedErrors).map(key => `
            <tr><td>${key}</td><td>${parsedErrors[key].join(', ')}</td></tr>
        `).join('');
        
        Swal.fire({
            icon: 'error',
            title: 'Errores encontrados',
            html: `
                <div class="alert-container">
                    <table class="alert-table">
                        <thead>
                            <tr><th>Campo</th><th>Mensaje de error</th></tr>
                        </thead>
                        <tbody>${errorMessages}</tbody>
                    </table>
                </div>
            `,
        });
    } catch (parseError) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
        });
    }

    return { datos: null, error: errorMessage };
};

export default fetchApi;
