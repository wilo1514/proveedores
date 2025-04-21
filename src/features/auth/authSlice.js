import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: "",
        expiracion: "",
        datos_Usuario: {
            CARDCODE:"",
            CARDNAME:"",
            ROL:"",
            SLPCODE:"",
            SLPNAME:"",
        },
        permissions: [
            {
                nombre: "",
                ruta: "",
                permiso: true,
                menu: true
            },
        ],
    },

    reducers: {
        updateAuth: (state, action) => {
            state.datos_Usuario = action.payload.datos_Usuario
            state.permissions = action.payload.permissions
        },

        updateRenovar: (state, action) => {
            state.token = action.payload.token
            state.expiracion = action.payload.expiracion
            state.datos_Usuario = action.payload.datos_Usuario
        }
    },

})

export const { updateAuth, updateRenovar } = authSlice.actions

export default authSlice.reducer