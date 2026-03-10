import { useState, useContext, useEffect } from "react"; // 1. IMPORTA useEffect
import { useNavigate } from "react-router-dom";
import api from "../service/api"
import { AuthContext } from "../context/AuthContext";
import './Login.css';
import  motorizadoLogin from '../assets/motorizado-login.webp';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // 2. AÑADE ESTO: Si ya tiene token, que no vea el login nunca
    useEffect(() => {
        const token = localStorage.getItem("token"); // Ajusta el nombre de tu key si es diferente
        if (token) {
            navigate("/principal", { replace: true });
        }
    }, [navigate]);

    const manejarEnvio = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/api/auth/login", {
                correo: email, 
                password: password
            });
            
            const { token, rol, nombre } = response.data;
            console.log(`Bienvenido ${nombre}, tu rol es ${rol}`);
            
            login(token); 
            localStorage.setItem("rol", rol);
            navigate("/dashboard", { replace: true }); // 3. AÑADE replace: true aquí también
            
        } catch (error) {
            // ... tu manejo de errores sigue igual
            console.error("Error completo:", error);
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
        <div className="login-page">
            <div className="login-card"> 
                <div className="login-image-container">
                <img src={motorizadoLogin}></img>
            </div>
            <form className="login-form" onSubmit={manejarEnvio}>
                <h2 className="titulo-login">PEKALAB</h2>
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
            </div> 
        </div>
    );
}

export default Login;