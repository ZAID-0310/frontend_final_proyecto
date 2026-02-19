import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api"
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const {login} = useContext(AuthContext)
    const navigate = useNavigate()

    const manejarEnvio = async (e) => {
        e.preventDefault()
        try {
            const response = await api.post("/login",{
                email,
                password
            })
            //usar backend falso o real
            const token = response.data.accessToken || response.data.token;            login(token) //guarda el token en context y localstore
            navigate("/principal")
            
        }catch (error) {
            if (!error.response) {
            // El servidor ni siquiera respondió (está apagado)
                alert("Error de conexión: ¿Está encendido el backend?");
            } else {
            // El servidor respondió con 401, 400, etc.
                alert("Credenciales incorrectas o error en el servidor");
    }
    console.error(error);
        }
    }
    return (
    <form onSubmit={manejarEnvio}>
        <h2>Login</h2>

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>

        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>

        <button type="submit">Ingresar</button>
    </form>
    )
}

export default Login 