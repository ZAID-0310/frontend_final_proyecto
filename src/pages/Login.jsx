import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api"
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    //guardar datos 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    //saco funcion login de autprovider
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const manejarEnvio = async (e) => {
        e.preventDefault();
        try {
        //consumo de ruta para loguearse
            const response = await api.post("/api/auth/login", {
                correo: email, 
                password: password
            });
            //si todo esta bien
            const { token, rol, nombre } = response.data;
            console.log(`Bienvenido ${nombre}, tu rol es ${rol}`);
            //llamas al login(token) para enviar que ya se hizo sesion
            login(token); 
            localStorage.setItem("rol", rol);
            navigate("/principal");
            
        } catch (error) {
        console.error("Error completo:", error); // Mira esto en la consola del navegador
        
        if (error.response) {
            // Si el backend responde un objeto, extraemos el mensaje
            const mensajeError = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.message || error.response.data.error || "Error de credenciales";
                
            alert("Respuesta del Servidor: " + mensajeError);
        } else {
            alert("No se pudo contactar al backend en el puerto 9090");
        }
        }   
    }

    return (
        <form onSubmit={manejarEnvio}>
            <h2>Login</h2>
            <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required 
            />
            <input 
                type="password" 
                placeholder="Contraseña" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required 
            />
            <button type="submit">Ingresar</button>
        </form>
    );
}

export default Login;