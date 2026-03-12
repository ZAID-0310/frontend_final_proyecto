import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import './PageUsuarios.css';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '300px', borderRadius: '8px', marginBottom: '10px' };
const centerLima = { lat: -12.1585, lng: -76.9535 };
const libraries = ['places'];

export const PageUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const autocompleteRef = useRef(null);

    const formInicial = { 
        id: null,
        nombre: '', 
        apellido: '', 
        dni: '', 
        correo: '', 
        password: '', 
        rol: 'ADMINISTRADOR', 
        estado: true, 
        latitud: centerLima.lat, 
        longitud: centerLima.lng 
    };
    
    const [formData, setFormData] = useState(formInicial);
    const { token } = useContext(AuthContext); 

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAQf8CE1mCu7K3VjVpuKVemI4Yr7ax9uZA",
        libraries: libraries
    });

    // --- FUNCIÓN INTELIGENTE: BUSCA DNI MIENTRAS ESCRIBES ---
    const verificarDNI = async (dniDigitado) => {
        if (dniDigitado.length !== 8) return; 

        try {
            const res = await fetch(`http://localhost:9090/api/usuarios/dni/${dniDigitado}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const u = await res.json();
                
                // Extraer coordenadas del Point de PostGIS (Long, Lat)
                const latBus = u.ubicacionCasa ? u.ubicacionCasa.coordinates[1] : centerLima.lat;
                const lngBus = u.ubicacionCasa ? u.ubicacionCasa.coordinates[0] : centerLima.lng;

                setFormData({
                    ...u,
                    latitud: latBus,
                    longitud: lngBus,
                    password: '' // No pisar la contraseña existente
                });
                alert("Usuario encontrado: " + u.nombre + ". Editando...");
            }
        } catch (error) {
            console.log("DNI nuevo detectado.");
        }
    };

    const alCambiarDireccion = () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
            setFormData(prev => ({
                ...prev,
                latitud: place.geometry.location.lat(),
                longitud: place.geometry.location.lng()
            }));
        }
    };

    const onMarkerDragEnd = (event) => {
        setFormData(prev => ({ 
            ...prev, 
            latitud: event.latLng.lat(), 
            longitud: event.latLng.lng() 
        }));
    };

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

    const guardarUsuario = async () => {
        const metodo = formData.id ? 'PUT' : 'POST';
        const url = formData.id 
            ? `http://localhost:9090/api/usuarios/${formData.id}` 
            : 'http://localhost:9090/api/usuarios/registrar';

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(formData.id ? "Actualizado correctamente" : "Registrado correctamente");
                setFormData(formInicial);
                obtenerUsuarios();
            } else {
                alert("Error en el servidor");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const eliminarUsuario = (id) => {
        if (!window.confirm("¿Eliminar usuario?")) return;
        fetch(`http://localhost:9090/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => { if (res.ok) obtenerUsuarios(); });
    };

    if (!isLoaded) return <div>Cargando Google Maps...</div>;
    if (cargando) return <div className="loading">Cargando Usuarios...</div>;

    return (
        <div className="usuarios-container">
            <div className="edit-form-container">
                <h3>{formData.id ? `Editando a: ${formData.nombre}` : "Registrar Nuevo Personal"}</h3>
                
                {/* CAMPO DNI QUE BUSCA Y REGISTRA */}
                <input 
                    placeholder="DNI (8 dígitos)" 
                    value={formData.dni} 
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setFormData({...formData, dni: val});
                        if(val.length === 8) verificarDNI(val);
                    }} 
                />

                <input placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                <input placeholder="Apellido" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                <input placeholder="Correo" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />
                
                {!formData.id && (
                    <input type="password" placeholder="Contraseña" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                )}

                <label>Buscar dirección en el mapa:</label>
                <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={alCambiarDireccion}>
                    <input 
                        type="text" 
                        placeholder="Escribe la calle (Ej: Av. Larco, Miraflores)" 
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                    />
                </Autocomplete>

                <GoogleMap 
                    mapContainerStyle={containerStyle} 
                    center={{ lat: formData.latitud, lng: formData.longitud }} 
                    zoom={15}
                >
                    <Marker 
                        position={{ lat: formData.latitud, lng: formData.longitud }} 
                        draggable={true} 
                        onDragEnd={onMarkerDragEnd}
                    />
                </GoogleMap>

                <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                    <option value="MOTORIZADO">MOTORIZADO</option>
                </select>

                <button onClick={guardarUsuario} className="btn-save">{formData.id ? "Guardar Cambios" : "Registrar"}</button>
                {formData.id && <button onClick={() => setFormData(formInicial)} className="btn-cancel">Cancelar</button>}
            </div>

            <table className="tabla-pkalab">
                <thead>
                    <tr><th>DNI</th><th>Nombre Completo</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id}>
                            <td><strong>{u.dni}</strong></td>
                            <td>{u.nombre} {u.apellido}</td>
                            <td>{u.correo}</td>
                            <td>{u.rol}</td>
                            <td>
                                <button className="btn-icon edit" onClick={() => {
                                    const lat = u.ubicacionCasa ? u.ubicacionCasa.coordinates[1] : centerLima.lat;
                                    const lng = u.ubicacionCasa ? u.ubicacionCasa.coordinates[0] : centerLima.lng;
                                    setFormData({...u, latitud: lat, longitud: lng, password: ''});
                                }}>✏️</button>
                                <button className="btn-icon delete" onClick={() => eliminarUsuario(u.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};