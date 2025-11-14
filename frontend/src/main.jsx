import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './Components/Login.jsx'
import Signup from './Components/SignUp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Signup/>
  </StrictMode>,
)
