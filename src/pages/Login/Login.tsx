import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import styles from './login.module.scss';

export default function Login() {
  const [registering, setRegistering] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (forgot) {
        const result = await api<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
        setMessage(result.message);
      } else {
        if (registering) await register({ name, email, password }); else await login({ email, password });
        const target = (location.state as { from?: string } | null)?.from || '/conta';
        navigate(target);
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível continuar.'); }
    finally { setBusy(false); }
  };

  const choose = (mode: 'login' | 'register') => { setRegistering(mode === 'register'); setForgot(false); setError(''); setMessage(''); };
  return <main className={styles.container}><form className={styles.card} onSubmit={submit}>
    <nav className={styles.tabs} aria-label="Acesso">
      <button type="button" className={!registering && !forgot ? styles.active : ''} onClick={() => choose('login')}>Login</button>
      <button type="button" className={registering ? styles.active : ''} onClick={() => choose('register')}>Cadastrar</button>
    </nav>
    <h2>{forgot ? 'Recuperar senha' : registering ? 'Crie sua conta' : 'Bem-vinda de volta'}</h2>
    {forgot && <p className={styles.help}>Informe seu e-mail. Em produção, as instruções serão enviadas por e-mail.</p>}
    {registering && <input aria-label="Nome completo" value={name} onChange={(event) => setName(event.target.value)} type="text" placeholder="Nome completo" autoComplete="name" required />}
    <input aria-label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="E-mail" autoComplete="email" required />
    {!forgot && <input aria-label="Senha" value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Senha (mínimo 8 caracteres)" minLength={8} autoComplete={registering ? 'new-password' : 'current-password'} required />}
    {error && <p className={styles.error} role="alert">{error}</p>}{message && <p className={styles.success} role="status">{message}</p>}
    {forgot ? <div className={styles.actions}><button className={styles.bttn} disabled={busy}>Enviar</button><button type="button" className={styles.forgotPassword} onClick={() => setForgot(false)}>Voltar</button></div> : registering ? <button className={styles.bttn} disabled={busy}>{busy ? 'Criando...' : 'Criar conta'}</button> : <div className={styles.actions}><button className={styles.bttn} disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button><button type="button" className={styles.forgotPassword} onClick={() => setForgot(true)}>Esqueci minha senha</button></div>}
  </form></main>;
}
