import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import './PageTiendas.css';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '300px', borderRadius: '8px', marginBottom: '10px' };
const centerLima = { lat: -12.1585, lng: -76.9535 };
const libraries = ['places'];

export const PageTiendas = () => {
    const [tiendas, setTiendas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const autocompleteRef = useRef(null);

    const formInicial = { 
        id: null,
        nombreTienda: '', 
        ruc: '', 
        direccion: '', 
        estado: true, 
        radioPermitidoMetros: 100,
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

    // --- BUSCADOR POR NOMBRE (Misma lógica del DNI pero con nombre) ---
    const buscarPorNombre = async (nombre) => {
        if (nombre.length < 3) return; // Espera a que escriba 3 letras para buscar
        try {
            const res = await fetch(`http://localhost:9090/api/tiendas/buscar?nombre=${nombre}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.length > 0) {
                // Si encuentra una coincidencia exacta, podrías cargarla
                const encontrada = data.find(t => t.nombreTienda.toLowerCase() === nombre.toLowerCase());
                if (encontrada) {
                    const latBus = encontrada.ubicacion ? encontrada.ubicacion.coordinates[1] : centerLima.lat;
                    const lngBus = encontrada.ubicacion ? encontrada.ubicacion.coordinates[0] : centerLima.lng;
                    setFormData({ ...encontrada, latitud: latBus, longitud: lngBus });
                }
            }
        } catch (error) { console.log("Buscando tienda nueva..."); }
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

    const obtenerTiendas = () => {
        fetch('http://localhost:9090/api/tiendas', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => { setTiendas(data); setCargando(false); })
        .catch(err => { console.error(err); setCargando(false); });
    };

    useEffect(() => { if (token) obtenerTiendas(); }, [token]);

    const guardarTienda = async () => {
        const metodo = formData.id ? 'PUT' : 'POST';
        const url = formData.id 
            ? `http://localhost:9090/api/tiendas/${formData.id}` 
            : 'http://localhost:9090/api/tiendas/registrar';

        const res = await fetch(url, {
            method: metodo,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            alert(formData.id ? "Tienda actualizada" : "Tienda registrada");
            setFormData(formInicial);
            obtenerTiendas();
        }
    };

    if (!isLoaded) return <div>Cargando Google Maps...</div>;
    if (cargando) return <div className="loading">Cargando Tiendas de Pekalab...</div>;

    return (
        <div className="usuarios-container"> {/* Reutilizo tu clase de CSS para ahorrar tiempo */}
            <div className="edit-form-container">
                <h3>{formData.id ? `Editando: ${formData.nombreTienda}` : "Registrar Sucursal"}</h3>
                
                <input 
                    placeholder="Nombre de la Tienda / Sucursal" 
                    value={formData.nombreTienda} 
                    onChange={e => setFormData({...formData, nombreTienda: e.target.value})}
                    onBlur={e => buscarPorNombre(e.target.value)}
                />

                <input placeholder="RUC" value={formData.ruc} onChange={e => setFormData({...formData, ruc: e.target.value})} />
                
                <label>Ubicación de la Sucursal:</label>
                <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={alCambiarDireccion}>
                    <input type="text" placeholder="Buscar dirección exacta..." />
                </Autocomplete>

                <GoogleMap mapContainerStyle={containerStyle} center={{ lat: formData.latitud, lng: formData.longitud }} zoom={16}>
                    <Marker 
                        position={{ lat: formData.latitud, lng: formData.longitud }} 
                        draggable={true} 
                        onDragEnd={e => setFormData({...formData, latitud: e.latLng.lat(), longitud: e.latLng.lng()})} 
                    />
                </GoogleMap>

                <div className="input-group">
                    <label>Radio de Asistencia (Metros):</label>
                    <input type="number" value={formData.radioPermitidoMetros} onChange={e => setFormData({...formData, radioPermitidoMetros: parseInt(e.target.value)})} />
                </div>

                <button onClick={guardarTienda} className="btn-save">{formData.id ? "Actualizar Tienda" : "Registrar Tienda"}</button>
                {formData.id && <button onClick={() => setFormData(formInicial)} className="btn-cancel">Cancelar</button>}
            </div>

            <table className="tabla-pkalab">
                <thead>
                    <tr><th>Nombre</th><th>RUC</th><th>Radio</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    {tiendas.map(t => (
                        <tr key={t.id}>
                            <td>{t.nombreTienda}</td>
                            <td>{t.ruc}</td>
                            <td>{t.radioPermitidoMetros}m</td>
                            <td>
                                <button className="btn-icon edit" onClick={() => {
                                    const lat = t.ubicacion ? t.ubicacion.coordinates[1] : centerLima.lat;
                                    const lng = t.ubicacion ? t.ubicacion.coordinates[0] : centerLima.lng;
                                    setFormData({...t, latitud: lat, longitud: lng});
                                }}>✏️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};