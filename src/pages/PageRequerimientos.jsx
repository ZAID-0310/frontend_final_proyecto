import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './PageRequerimientos.css';

export const PageRequerimientos = () => {
    const [requerimientos, setRequerimientos] = useState([]);
    const [archivo, setArchivo] = useState(null);
    const [cargando, setCargando] = useState(false);
    const { token } = useContext(AuthContext);

    // 1. Obtener la lista de cupos (Requerimientos)
    const obtenerRequerimientos = async () => {
        try {
            const res = await fetch('http://localhost:9090/api/requerimientos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setRequerimientos(data);
        } catch (error) {
            console.error("Error al obtener requerimientos:", error);
        }
    };

    useEffect(() => {
        if (token) obtenerRequerimientos();
    }, [token]);

    // 2. Manejar la subida del Excel
    const manejarSubidaExcel = async (e) => {
        e.preventDefault();
        if (!archivo) return alert("Por favor, selecciona un archivo Excel.");

        setCargando(true);
        const formData = new FormData();
        formData.append('file', archivo);

        try {
            const res = await fetch('http://localhost:9090/api/requerimientos/importar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData // No ponemos Content-Type, el navegador lo detecta
            });

            if (res.ok) {
                alert("¡Excel importado y cupos generados con éxito!");
                setArchivo(null);
                obtenerRequerimientos(); // Refrescamos la tabla
            } else {
                const errorMsg = await res.text();
                alert("Error: " + errorMsg);
            }
        } catch (error) {
            alert("Error en la conexión con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="requerimientos-container">
            <header className="header-pkalab">
                <h2>Gestión de Requerimientos (Cupos por Tienda)</h2>
            </header>

            {/* SECCIÓN DE IMPORTACIÓN */}
            <div className="import-section">
                <form onSubmit={manejarSubidaExcel} className="upload-form">
                    <label>Subir Programación Semanal (Excel):</label>
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={(e) => setArchivo(e.target.files[0])} 
                    />
                    <button type="submit" disabled={cargando} className="btn-import">
                        {cargando ? "Procesando..." : "🚀 Cargar Cupos"}
                    </button>
                </form>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className="tabla-container">
                <table className="tabla-pkalab">
                    <thead>
                        <tr>
                            <th>Tienda</th>
                            <th>Fecha</th>
                            <th>Día</th>
                            <th>Hora Inicio</th>
                            <th>Hora Fin</th>
                            <th>N° Moto</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requerimientos.length > 0 ? (
                            requerimientos.map((req) => (
                                <tr key={req.id}>
                                    <td><strong>{req.tienda?.nombreTienda}</strong></td>
                                    <td>{req.fecha}</td>
                                    <td>{req.diaSemana}</td>
                                    <td>{req.horaInicio}</td>
                                    <td>{req.horaFin}</td>
                                    <td><span className="badge-moto">Moto #{req.nMotorizado}</span></td>
                                    <td>
                                        <span className={`status ${req.estado.toLowerCase()}`}>
                                            {req.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{textAlign: 'center'}}>No hay cupos cargados aún.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};