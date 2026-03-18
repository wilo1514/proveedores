import { createSlice } from '@reduxjs/toolkit'

// Estado inicial separado para poder resetear fácil en clearAuth
const INITIAL_STATE = {
  token: "",
  expiracion: "",
  datos_Usuario: {
    CARDCODE: "",
    CARDNAME: "",
    ROL: "",
    SLPCODE: "",
    SLPNAME: "",
  },
  permissions: [
    {
      nombre: "",
      ruta: "",
      permiso: true,
      menu: true
    },
  ],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: INITIAL_STATE,

  reducers: {
    updateAuth: (state, action) => {
      state.datos_Usuario = action.payload.datos_Usuario;
      state.permissions = action.payload.permissions;
      // Opcional: si en tu login también quieres setear token/expiración aquí,
      // puedes hacerlo con action.payload.token / action.payload.expiracion
    },

    updateRenovar: (state, action) => {
      state.token = action.payload.token;
      state.expiracion = action.payload.expiracion;
      state.datos_Usuario = action.payload.datos_Usuario;
    },

    // <<< Nueva acción para logout
    clearAuth: () => {
      // Resetea todo el slice a su estado inicial
      return INITIAL_STATE;
    },
  },
});

export const { updateAuth, updateRenovar, clearAuth } = authSlice.actions;
export default authSlice.reducer;
