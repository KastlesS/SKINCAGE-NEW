import React from 'react'
import ReactDOM from 'react-dom/client'
import RegisterForm from '../components/Auth/RegisterForm'

const rootElement = document.getElementById('react-register-root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RegisterForm />
    </React.StrictMode>,
  )
}
