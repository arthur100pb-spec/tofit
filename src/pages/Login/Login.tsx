import { useState } from 'react';
import styles from './login.module.scss';

const Login = () => {
  const [modoCadastrando, setModoCadastro] = useState(false);

  return (
    <main className={styles.container}>
      <form className={styles.card} onSubmit={(e) => e.preventDefault()}>
        
        <nav className={styles.tabs}>
          <button 
            type="button"
            className={!modoCadastrando ? styles.active : ''} 
            onClick={() => setModoCadastro(false)}
          >
            Login

          </button>
          <button 
            type="button"
            className={modoCadastrando ? styles.active : ''} 
            onClick={() => setModoCadastro(true)}
          >
            Cadastrar
          </button>
        </nav>

        {modoCadastrando && (
          <input type="text" placeholder="Nome completo" required />
        )}
        <input type="email" placeholder="E-mail" required />
        <input type="password" placeholder="Senha" required />

        {!modoCadastrando && (
          <a href="#" className={styles.forgotPassword}>esqueci minha senha</a>
        )}
        
        <button type="submit" className={styles.bttn}>
          {modoCadastrando ? 'Criar Conta' : 'Entrar'}
        </button>

      </form>
    </main>
  );
};

export default Login;
