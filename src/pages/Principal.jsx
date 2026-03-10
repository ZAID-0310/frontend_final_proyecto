import { Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Principal.css"; 

export const Principal = () => {
    const { logout, rol, token } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header"> 
                    <h2>Pkalab Admin</h2>
                    {/* El rol ahora se muestra aquí y esto elimina el error de compilación */}
                    <p className="rol-badge">Sesión: {rol}</p>
                </div>

                <nav>
                    <button onClick={() => navigate("/dashboard")}>🏠 Inicio</button>
                    <button onClick={() => navigate("/dashboard/usuarios")}>👥 Usuarios</button>
                    <button onClick={() => navigate("/dashboard/importar")}>📅 Importar Excel</button>
                    <button onClick={() => navigate("/dashboard/horarios")}>📅 Gestionar Horarios</button>
                    
                </nav>

                <button className="btn-logout" onClick={logout}>Cerrar Sesión</button>
            </aside>

            <main className="main-content">
                {/* Aquí cargará el Inicio o cualquiera de las otras páginas */}
                <Outlet />
                
                {/* Token fijo al pie */}
                <footer className="footer-token">
                    <small>Token: {token?.substring(0, 30)}...</small>
                </footer>
            </main>
        </div>
    );
};