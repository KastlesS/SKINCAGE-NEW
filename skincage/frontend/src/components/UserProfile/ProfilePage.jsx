import { useState, useEffect } from 'react';
import { getProfile, getReservas, cancelarReserva } from '../../api/skincageApi';
import { getWearInfo, formatFloat, RARITY_COLORS } from '../../utils/floatUtils';
import './ProfilePage.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, reservasData] = await Promise.all([
          getProfile(),
          getReservas()
        ]);
        setProfile(profileData);
        setReservas(reservasData);
      } catch (err) {
        setError('Error al cargar los datos del perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    try {
      await cancelarReserva(id);
      setReservas(reservas.filter(r => r.id !== id));
    } catch (err) {
      alert('Error al cancelar reserva.');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return <div className="profile-error">{error || 'No estás autenticado.'}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" />
          ) : (
            <span>{profile.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="profile-info">
          <h2>{profile.username}</h2>
          <p className="profile-email">{profile.email}</p>
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-label">Balance</span>
              <span className="stat-value">{profile.balance} €</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Reservas Activas</span>
              <span className="stat-value">{reservas.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <h3>Mis Reservas</h3>
        {reservas.length === 0 ? (
          <p className="no-reservas">No tienes skins reservadas actualmente.</p>
        ) : (
          <div className="reservas-grid">
            {reservas.map((reserva) => {
              const skin = reserva.skin;
              const wearInfo = getWearInfo(skin.desgaste);
              const rarityColor = RARITY_COLORS[skin.rareza] || '#6b7280';

              return (
                <div key={reserva.id} className="reserva-card">
                  <div className="reserva-status" data-status={reserva.estado}>
                    {reserva.estado}
                  </div>
                  <div className="reserva-skin-img">
                    <img src={skin.imagen_url || '/static/img/placeholder_skin.png'} alt={skin.nombre} />
                  </div>
                  <div className="reserva-details">
                    <h4>{skin.es_stattrak && <span style={{color:'#e87b1e'}}>ST™ </span>}{skin.nombre}</h4>
                    <p className="reserva-wear" style={{ color: wearInfo.color }}>
                      {wearInfo.label} ({formatFloat(skin.desgaste)})
                    </p>
                    <p className="reserva-price">{reserva.precio_reserva} €</p>
                    <p className="reserva-date">Reservado el: {new Date(reserva.fecha_reserva).toLocaleDateString()}</p>
                  </div>
                  <div className="reserva-actions">
                    <button className="btn-cancelar" onClick={() => handleCancelar(reserva.id)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
