import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiUser, FiInfo, FiArrowLeft, FiEdit3 } from 'react-icons/fi'
import { FaSchool } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'
import { reglasRut, formatearRut } from '../../validators/rutValidators'
import { reglasEmail, reglasPasswordLogin, reglasPasswordCrear, reglasConfirmPassword } from '../../validators/fieldValidators'
import { login as apiLogin, registerUser } from '../../services/authService'
import './Login.scss'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isRegistering, setIsRegistering] = useState(false)
  const [loginMethod, setLoginMethod] = useState('rut') // 'rut' | 'email'
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onTouched'
  })

  const passwordVal = watch('password')

  // Cambiar método de login y reiniciar el formulario
  const handleTabChange = (method) => {
    setLoginMethod(method)
    clearErrors()
    reset()
  }

  // Alternar entre Login y Registro
  const handleToggleMode = () => {
    setIsRegistering(!isRegistering)
    clearErrors()
    reset()
  }

  // Manejar cambio en input de RUT para formatearlo en tiempo real
  const handleRutChange = (e) => {
    const rawValue = e.target.value
    setValue('rut', formatearRut(rawValue), { shouldValidate: true })
  }

  // Submit del formulario. La autenticación es SIEMPRE contra el backend real
  // (ms-usuarios): no existe modo simulado ni bypass del lado del cliente.
  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      if (isRegistering) {
        const registerData = {
          nombreCompleto: data.nombreCompleto,
          rut: data.rut,
          email: data.email,
          password: data.password,
          rol: data.rol
        }
        const response = await registerUser(registerData)
        const registered = response.data.user || response.data
        toast.success(`¡Registro exitoso! Cuenta creada como ${registered.rol || data.rol}. Ya puedes ingresar.`)
        setIsRegistering(false)
        reset()
      } else {
        const loginData = {
          rut: loginMethod === 'rut' ? data.rut : '',
          email: loginMethod === 'email' ? data.email : '',
          password: data.password
        }
        const response = await apiLogin(loginData)
        const { token, user } = response.data

        login(token, user)
        toast.success(`¡Bienvenido(a), ${user.nombre}!`)

        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (error) {
      console.error('Auth error:', error)
      const status = error.response?.status
      const backendMsg = error.response?.data?.message || error.response?.data?.error

      if (status === 401) {
        toast.error('Credenciales incorrectas. Verifica tus datos e intenta nuevamente.')
      } else if (status === 409) {
        toast.error(backendMsg || 'El RUT o correo ya está registrado.')
      } else if (status === 400) {
        toast.error(backendMsg || 'Datos inválidos. Revisa el formulario.')
      } else if (error.response) {
        toast.error(backendMsg || 'Ocurrió un error en el servidor.')
      } else {
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <div className="logo-school">
            <FaSchool />
          </div>
          <h1>Colegio Bernardo O'Higgins</h1>
          <p>{isRegistering ? 'Formulario de Registro Digital' : 'Portal Escolar Digital'}</p>
        </header>

        {isRegistering ? (
          /* FORMULARIO DE REGISTRO */
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in">
            {/* Nombre Completo */}
            <div className="form-group">
              <label htmlFor="nombreCompleto">Nombre Completo</label>
              <div className="input-wrapper">
                <input
                  id="nombreCompleto"
                  type="text"
                  placeholder="Juan Pérez González"
                  {...register('nombreCompleto', { required: 'El nombre completo es obligatorio' })}
                  className={errors.nombreCompleto ? 'error' : ''}
                  disabled={isLoading}
                />
                <FiUser />
              </div>
              {errors.nombreCompleto && (
                <span className="error-message">
                  <FiInfo /> {errors.nombreCompleto.message}
                </span>
              )}
            </div>

            {/* RUT */}
            <div className="form-group">
              <label htmlFor="rut">RUT</label>
              <div className="input-wrapper">
                <input
                  id="rut"
                  type="text"
                  placeholder="12.345.678-5"
                  maxLength={12}
                  {...register('rut', {
                    ...reglasRut,
                    onChange: handleRutChange
                  })}
                  className={errors.rut ? 'error' : ''}
                  disabled={isLoading}
                />
                <FiUser />
              </div>
              {errors.rut && (
                <span className="error-message">
                  <FiInfo /> {errors.rut.message}
                </span>
              )}
            </div>

            {/* Correo Electrónico */}
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@colegio.cl"
                  {...register('email', reglasEmail)}
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
                <FiMail />
              </div>
              {errors.email && (
                <span className="error-message">
                  <FiInfo /> {errors.email.message}
                </span>
              )}
            </div>

            {/* Rol Solicitado */}
            <div className="form-group">
              <label htmlFor="rol">Tipo de Perfil / Rol</label>
              <div className="input-wrapper select-wrapper">
                <select
                  id="rol"
                  {...register('rol', { required: 'El rol es obligatorio' })}
                  className={errors.rol ? 'error' : ''}
                  disabled={isLoading}
                >
                  {/* Seguridad: el auto-registro público SOLO permite roles no privilegiados.
                      Las cuentas de personal (docente, inspector, directivo, etc.) las crea
                      un administrador; el backend rechaza cualquier otro rol en /auth/register. */}
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="APODERADO">Apoderado</option>
                </select>
                <FiEdit3 />
              </div>
              {errors.rol && (
                <span className="error-message">
                  <FiInfo /> {errors.rol.message}
                </span>
              )}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', reglasPasswordCrear)}
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                <FiLock />
              </div>
              {errors.password && (
                <span className="error-message">
                  <FiInfo /> {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword', reglasConfirmPassword(passwordVal))}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                />
                <FiLock />
              </div>
              {errors.confirmPassword && (
                <span className="error-message">
                  <FiInfo /> {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Cuenta'}
            </button>

            <button
              type="button"
              className="btn-toggle-mode"
              onClick={handleToggleMode}
              disabled={isLoading}
            >
              <FiArrowLeft /> Volver al Inicio de Sesión
            </button>
          </form>
        ) : (
          /* FORMULARIO DE INICIO DE SESIÓN */
          <div className="animate-fade-in">
            {/* Pestañas de Método de Inicio de Sesión */}
            <div className="login-tabs">
              <button
                type="button"
                className={loginMethod === 'rut' ? 'active' : ''}
                onClick={() => handleTabChange('rut')}
              >
                Iniciar con RUT
              </button>
              <button
                type="button"
                className={loginMethod === 'email' ? 'active' : ''}
                onClick={() => handleTabChange('email')}
              >
                Iniciar con Correo
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {loginMethod === 'rut' && (
                <div className="form-group">
                  <label htmlFor="rut">RUT Institucional</label>
                  <div className="input-wrapper">
                    <input
                      id="rut"
                      type="text"
                      placeholder="12.345.678-5"
                      maxLength={12}
                      {...register('rut', {
                        ...reglasRut,
                        onChange: handleRutChange
                      })}
                      className={errors.rut ? 'error' : ''}
                      disabled={isLoading}
                    />
                    <FiUser />
                  </div>
                  {errors.rut && (
                    <span className="error-message">
                      <FiInfo /> {errors.rut.message}
                    </span>
                  )}
                </div>
              )}

              {loginMethod === 'email' && (
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      placeholder="ejemplo@colegio.cl"
                      {...register('email', reglasEmail)}
                      className={errors.email ? 'error' : ''}
                      disabled={isLoading}
                    />
                    <FiMail />
                  </div>
                  {errors.email && (
                    <span className="error-message">
                      <FiInfo /> {errors.email.message}
                    </span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password', reglasPasswordLogin)}
                    className={errors.password ? 'error' : ''}
                    disabled={isLoading}
                  />
                  <FiLock />
                </div>
                {errors.password && (
                  <span className="error-message">
                    <FiInfo /> {errors.password.message}
                  </span>
                )}
              </div>

              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Ingresar al sistema'}
              </button>
            </form>

            <div className="register-redirect">
              <span>¿No tienes una cuenta aún? </span>
              <button type="button" onClick={handleToggleMode} disabled={isLoading}>
                Regístrate aquí
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
