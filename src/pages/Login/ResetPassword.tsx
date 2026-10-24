import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import styles from '../Login/login.module.scss';
export default function ResetPassword() {
  const [params] = useSearchParams(); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); try { const result = await api<{message:string}>('/api/auth/reset-password', { method:'POST', body:JSON.stringify({ token:params.get('token'), password }) }); setMessage(result.message); } catch (e) { setError(e instanceof Error ? e.message : 'Link inválido.'); } };
  return <main className={styles.container}><form className={styles.card} onSubmit={submit}><h2>Definir nova senha</h2><input type="password" minLength={8} placeholder="Nova senha" value={password} onChange={(e)=>setPassword(e.target.value)} required />{error&&<p className={styles.error}>{error}</p>}{message&&<><p className={styles.success}>{message}</p><Link to="/login">Ir para login</Link></>}<button className={styles.bttn}>Salvar nova senha</button></form></main>;
}
