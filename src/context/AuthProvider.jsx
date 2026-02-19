import { useState } from "react"
import { AuthContext } from "./AuthContext"

export const AuthProvider = ({children}) => {
    
    //verifica si hay token guardado
    const [token, setToken] = useState(() => {
    return localStorage.getItem("token")
})

    //guarda el tokenb en localstore
    const login = (newToken) => {
        localStorage.setItem("token",newToken)
        setToken(newToken)
    }

    //borra el token
    const logout = () => {
        localStorage.removeItem("token")
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{token, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}