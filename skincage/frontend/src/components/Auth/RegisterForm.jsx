import { useState } from 'react';
import { registerUser } from '../../api/skincageApi';
import './RegisterForm.css';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar errores al escribir
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setFieldErrors({});

    try {
      await registerUser(formData);
      // Auto-login success, redirect to home
      window.location.href = '/';
    } catch (err) {
      if (err.status === 400 && err.data) {
        setFieldErrors(err.data);
      } else {
        setErrorMsg('Error al intentar registrar. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="rf-form" onSubmit={handleSubmit}>
      <div className="rf-form-group">
        <label htmlFor="username">Nombre de Usuario</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={fieldErrors.username ? 'rf-input-error' : ''}
          placeholder="Ej: CoolSniper99"
          required
        />
        {fieldErrors.username && <span className="rf-error-text">{fieldErrors.username}</span>}
      </div>

      <div className="rf-form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={fieldErrors.email ? 'rf-input-error' : ''}
          placeholder="tu@email.com"
          required
        />
        {fieldErrors.email && <span className="rf-error-text">{fieldErrors.email}</span>}
      </div>

      <div className="rf-form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={fieldErrors.password ? 'rf-input-error' : ''}
          placeholder="Mínimo 8 caracteres"
          required
          minLength={8}
        />
        {fieldErrors.password && <span className="rf-error-text">{fieldErrors.password}</span>}
      </div>

      <div className="rf-form-group">
        <label htmlFor="password_confirm">Confirmar Contraseña</label>
        <input
          type="password"
          id="password_confirm"
          name="password_confirm"
          value={formData.password_confirm}
          onChange={handleChange}
          className={fieldErrors.password_confirm ? 'rf-input-error' : ''}
          placeholder="Repite tu contraseña"
          required
        />
        {fieldErrors.password_confirm && <span className="rf-error-text">{fieldErrors.password_confirm}</span>}
      </div>

      {errorMsg && <div className="rf-general-error">{errorMsg}</div>}

      <button type="submit" className="rf-submit-btn" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>
    </form>
  );
}
