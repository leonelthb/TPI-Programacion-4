import axios from 'axios'

// Dirección de nuestra API obtenida desde el archivo .env.
const API_BASE_URL = import.meta.env.VITE_API_URL

// Instancia centralizada de Axios.
const api = axios.create({
  baseURL: API_BASE_URL,

  // Permite enviar y recibir cookies HttpOnly del backend.
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
})

export default api