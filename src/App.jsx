import { BrowserRouter, Routes, Route } from "react-router-dom"
import  {PrivateRoute} from "./routes/PrivateRoute"
import { Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Principal from "./pages/Principal"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/principal" element={ 
          <PrivateRoute>
            <Principal />
          </PrivateRoute>
          }
          />
      </Routes>
    </BrowserRouter>
  )
}

export default App
