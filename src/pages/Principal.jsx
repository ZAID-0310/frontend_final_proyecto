import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const Principal = () =>  {
    const {token, logout }  = useContext(AuthContext)
    const navigate = useNavigate()

    const manejarLogout = () => {
        logout()
        navigate("/login")
    }
    return  (
        <div style={{ padding: "20px" }}>
        <h1>Bienvenido 🎉</h1>
        <p>Estás en la página principal después de loguearte correctamente.</p>

        <hr />

        <p><strong>Token actual:</strong></p>
        <code>{token}</code>

        <br /><br />

        <button onClick={manejarLogout}>
            Cerrar sesión
        </button>
        </div>
    )
}

export default Principal