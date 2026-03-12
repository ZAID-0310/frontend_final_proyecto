import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./routes/PrivateRoute";
import Login from "./pages/Login";
import { Principal } from "./pages/Principal";
import { PageUsuarios } from "./pages/PageUsuarios";
import { Inicio } from "./pages/PageInicio";
import { PageTiendas } from "./pages/PageTiendas";
import {PageRequerimientos} from"./pages/PageRequerimientos";
// Asegúrate de que este nombre sea correcto
// Asegúrate de importar PaginaImportar si la vas a usar
// import { PaginaImportar } from "./pages/PaginaImportar"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta raíz redirige a dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Rutas Protegidas (El diseño Principal se queda fijo gracias a estas rutas anidadas) */}
        <Route path="/dashboard" element={<PrivateRoute><Principal /></PrivateRoute>}>
          
          {/* Este es el que se ve al entrar a /dashboard */}
          <Route index element={<Inicio />} /> 
        
          {/* Estas secciones se cargan DENTRO del Outlet de Principal */}
          <Route path="usuarios" element={<PageUsuarios />} />
          <Route path="horarios" element={<div>pagina de horarios</div>} />
          <Route path="importar" element={<PageRequerimientos/>} /> 
          <Route path="tiendas" element={<PageTiendas/>}/> 
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;