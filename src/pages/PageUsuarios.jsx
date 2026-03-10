import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './PageUsuarios.css';

export const PageUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    // Estado único para el formulario: si tiene ID, está editando; si no, está creando.
    const formInicial = { nombre: '', apellido: '', dni: '', correo: '', password: '', rol: 'ADMINISTRADOR', estado: true };
    const [formData, setFormData] = useState(formInicial);

    const { token } = useContext(AuthContext); 

    const obtenerUsuarios = () => {
        fetch('http://localhost:9090/api/usuarios', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => { setUsuarios(data); setCargando(false); })
        .catch(err => { console.error(err); setCargando(false); });
    };

    useEffect(() => { if (token) obtenerUsuarios(); }, [token]);

    const eliminarUsuario = (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar a este usuario?")) return;
        fetch(`http://localhost:9090/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => { if (res.ok) setUsuarios(usuarios.filter(u => u.id !== id)); });
    };

   const guardarUsuario = async () => {
    // 1. VALIDACIÓN PREVIA (Evita enviar datos basura al backend)
    if (!formData.dni || !formData.nombre || !formData.apellido || !formData.correo || (!formData.id && !formData.password)) {
        alert("Por favor, completa todos los campos antes de registrar.");
        return; // <--- AQUÍ DETENEMOS LA EJECUCIÓN
    }

    const metodo = formData.id ? 'PUT' : 'POST';
    const url = formData.id 
        ? `http://localhost:9090/api/usuarios/${formData.id}` 
        : 'http://localhost:9090/api/usuarios/registrar';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(formData)
        });

        // 2. Si el servidor responde 403, es un error de permisos
        if (res.status === 403) {
            alert("Acceso denegado. Asegúrate de tener permisos de Administrador.");
            return;
        }

        // 3. Leemos el JSON solo si la respuesta tiene cuerpo
        const text = await res.text(); // Leemos como texto primero
        const data = text ? JSON.parse(text) : {}; 

        if (res.ok) {
            alert(formData.id ? "Actualizado correctamente" : "Registrado correctamente");
            setFormData(formInicial);
            obtenerUsuarios();
        } else { 
            alert(data.error || "Error al guardar, revisa los datos."); 
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error al comunicarse con el servidor.");
    }
};;

    if (cargando) return <div className="loading">Cargando...</div>;

    return (
        <div className="usuarios-container">
            {/* FORMULARIO FIJO PARA REGISTRO/EDICIÓN */}
            <div className="edit-form-container">
                <h3>{formData.id ? `Editando a: ${formData.nombre}` : "Registrar Nuevo Personal"}</h3>
                
                <input name="dni" placeholder="DNI" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
                <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                <input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                <input name="correo" placeholder="Correo" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />
                
                {!formData.id && (
                    <input type="password" placeholder="Contraseña" onChange={e => setFormData({...formData, password: e.target.value})} />
                )}

                <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                    <option value="MOTORIZADO">MOTORIZADO</option>
                </select>

                <button onClick={guardarUsuario} className="btn-save">{formData.id ? "Guardar Cambios" : "Registrar"}</button>
                {formData.id && <button onClick={() => setFormData(formInicial)} className="btn-cancel">Cancelar</button>}
            </div>

            {/* TABLA */}
            <div className="header-tabla">
                <h2>Personal Registrado</h2>
                <span className="badge-count">{usuarios.length} Usuarios</span>
            </div>
            
            <table className="tabla-pkalab">
                <thead>
                    <tr><th>DNI</th><th>Nombre Completo</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id}>
                            <td><strong>{u.dni}</strong></td>
                            <td>{`${u.nombre} ${u.apellido}`}</td>
                            <td>{u.correo}</td>
                            <td><span className={`badge-rol ${u.rol?.toLowerCase()}`}>{u.rol}</span></td>
                            <td><span className={u.estado ? "status-activo" : "status-inactivo"}>{u.estado ? "● Activo" : "○ Inactivo"}</span></td>
                            <td>
                                <button className="btn-icon edit" onClick={() => setFormData(u)}>✏️</button>
                                <button className="btn-icon delete" onClick={() => eliminarUsuario(u.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PageUsuarios;