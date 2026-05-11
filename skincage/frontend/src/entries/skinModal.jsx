import React from 'react'
import ReactDOM from 'react-dom/client'
import SkinDetailModal from '../components/SkinModal/SkinDetailModal'

const rootElement = document.getElementById('react-skin-modal-root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SkinDetailModal />
    </React.StrictMode>,
  )
}
