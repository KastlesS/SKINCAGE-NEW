import { useState, useEffect, useCallback } from 'react'
import { getSkinDetail, crearReserva } from '../../api/skincageApi'
import { getWearInfo, formatFloat, RARITY_COLORS, CATEGORIA_LABELS } from '../../utils/floatUtils'
import './SkinDetailModal.css'

const config = window.SKINCAGE_CONFIG || {}

export default function SkinDetailModal() {
  const [skin, setSkin]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [visible, setVisible]   = useState(false)
  const [reservado, setReservado] = useState(false)
  const [reservaMsg, setReservaMsg] = useState('')

  const openModal = useCallback(async (skinId) => {
    setLoading(true)
    setVisible(true)
    setSkin(null)
    setReservado(false)
    setReservaMsg('')
    try {
      const data = await getSkinDetail(skinId)
      setSkin(data)
    } catch {
      setSkin(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const closeModal = useCallback(() => {
    setVisible(false)
    setTimeout(() => setSkin(null), 300)
  }, [])

  // Escuchar clicks en skin cards desde el DOM de Django
  useEffect(() => {
    const handleClick = (e) => {
      const card = e.target.closest('[data-skin-id]')
      if (card) {
        e.preventDefault()
        openModal(card.dataset.skinId)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openModal])

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeModal])

  const handleReservar = async () => {
    if (!config.isAuthenticated) {
      window.location.href = '/login/'
      return
    }
    try {
      await crearReserva(skin.id)
      setReservado(true)
      setReservaMsg('✓ Skin reservada correctamente')
    } catch (err) {
      setReservaMsg(err?.data?.detail || 'Error al reservar. Inténtalo de nuevo.')
    }
  }

  if (!visible) return null

  const wearInfo = skin ? getWearInfo(skin.desgaste) : null
  const rarityColor = skin ? (RARITY_COLORS[skin.rareza] || '#6b7280') : '#6b7280'

  return (
    <div className={`skm-overlay ${visible ? 'skm-overlay--visible' : ''}`}
         onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className={`skm-card ${visible && skin ? 'skm-card--in' : ''}`}>

        {/* Botón cerrar */}
        <button className="skm-close" onClick={closeModal} aria-label="Cerrar">×</button>

        {loading && (
          <div className="skm-loading">
            <div className="skm-spinner" />
            <p>Cargando skin...</p>
          </div>
        )}

        {!loading && skin && (
          <>
            {/* Barra de rareza superior */}
            <div className="skm-rarity-bar" style={{ background: rarityColor }} />

            <div className="skm-body">
              {/* Columna izquierda: imagen */}
              <div className="skm-left">
                <div className="skm-image-wrap">
                  <img
                    src={skin.imagen_url || '/static/img/placeholder_skin.png'}
                    alt={skin.nombre}
                    className="skm-image"
                  />
                </div>

                {/* Badges */}
                <div className="skm-badges">
                  {skin.es_stattrak && (
                    <span className="skm-badge skm-badge--stattrak">StatTrak™</span>
                  )}
                  <span className="skm-badge" style={{ background: rarityColor + '33', color: rarityColor, borderColor: rarityColor }}>
                    {skin.rareza.replace('_', '-')}
                  </span>
                  <span className="skm-badge skm-badge--cat">
                    {CATEGORIA_LABELS[skin.categoria] || skin.categoria}
                  </span>
                </div>
              </div>

              {/* Columna derecha: detalles */}
              <div className="skm-right">
                <h2 className="skm-nombre">
                  {skin.es_stattrak && <span className="skm-st-prefix">StatTrak™ </span>}
                  {skin.nombre}
                </h2>

                {/* Precio */}
                <div className="skm-precio-wrap">
                  <span className="skm-precio">{parseFloat(skin.precio).toFixed(2)} €</span>
                  <span className="skm-stock">Stock: {skin.stock}</span>
                </div>

                {/* Float */}
                <div className="skm-float-section">
                  <div className="skm-float-header">
                    <span className="skm-float-label">Float</span>
                    <span className="skm-float-wear" style={{ color: wearInfo.color }}>
                      {wearInfo.label} ({wearInfo.short})
                    </span>
                  </div>

                  {/* Barra de float con marcador */}
                  <div className="skm-float-bar">
                    <div className="skm-float-gradient" />
                    <div
                      className="skm-float-marker"
                      style={{ left: `${Math.min(parseFloat(skin.desgaste) * 100, 99)}%` }}
                    />
                  </div>

                  <div className="skm-float-labels">
                    <span>0.00</span>
                    <span style={{ color: wearInfo.color, fontWeight: 600, fontFamily: 'monospace' }}>
                      {formatFloat(skin.desgaste)}
                    </span>
                    <span>1.00</span>
                  </div>

                  {/* Rangos de wear */}
                  <div className="skm-wear-ranges">
                    {['FN', 'MW', 'FT', 'WW', 'BS'].map((w) => (
                      <span key={w}
                        className={`skm-wr-pill ${wearInfo.short === w ? 'skm-wr-pill--active' : ''}`}>
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Separador */}
                <hr className="skm-divider" />

                {/* Botón reservar */}
                <div className="skm-actions">
                  {!reservado ? (
                    <button className="skm-btn-reservar" onClick={handleReservar}>
                      {config.isAuthenticated ? '🛒 Reservar Skin' : '🔑 Inicia sesión para reservar'}
                    </button>
                  ) : (
                    <div className="skm-reserva-ok">
                      <span className="skm-check">✓</span> Reservada correctamente
                    </div>
                  )}
                  {reservaMsg && !reservado && (
                    <p className="skm-error-msg">{reservaMsg}</p>
                  )}
                </div>

                {/* Info extra */}
                <div className="skm-info-grid">
                  <div className="skm-info-item">
                    <span className="skm-info-key">Categoría</span>
                    <span className="skm-info-val">{CATEGORIA_LABELS[skin.categoria] || skin.categoria}</span>
                  </div>
                  <div className="skm-info-item">
                    <span className="skm-info-key">Rareza</span>
                    <span className="skm-info-val" style={{ color: rarityColor }}>{skin.rareza.replace('_', '-')}</span>
                  </div>
                  <div className="skm-info-item">
                    <span className="skm-info-key">StatTrak</span>
                    <span className="skm-info-val">{skin.es_stattrak ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="skm-info-item">
                    <span className="skm-info-key">Stock</span>
                    <span className="skm-info-val">{skin.stock} ud.</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
