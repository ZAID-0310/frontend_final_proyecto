import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Principal = () =>  {
    // Traemos el token y el rol (si lo agregaste al context como sugerí)
    const { token, rol, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    const manejarLogout = () => {
        logout()
        navigate("/login")
    }

    return  (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>Bienvenido 🎉</h1>
            <p>Has ingresado como: <strong>{rol}</strong></p>
            
            <div style={{ background: "#f4f4f4", padding: "15px", borderRadius: "8px" }}>
                <h2>📅 HORARIO DE LA SEMANA</h2>
                <p>Aquí irá tu tabla o lista de horarios...</p>
            </div>

            {/* EJEMPLO DE PROTECCIÓN DE VISTA: Solo el ADMIN ve esto */}
            {rol === "ADMIN" && (
                <div style={{ marginTop: "20px", border: "1px solid red", padding: "10px" }}>
                    <h3>Panel de Administrador 🛠️</h3>
                    <button>Importar Excel de Requerimientos</button>
                    <button>Gestionar Usuarios</button>
                </div>
            )}

            <hr style={{ marginTop: "30px" }} />
            <p><strong>Tu token de seguridad (JWT):</strong></p>
            <div style={{ 
                wordBreak: "break-all", 
                backgroundColor: "#eee", 
                padding: "10px", 
                fontSize: "12px" 
            }}>
                <code>{token}</code>
            </div>
            
            <br />
            <button 
                onClick={manejarLogout}
                style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}
            >
                Cerrar sesión
            </button>
        </div>
    )
}

export default Principal                           