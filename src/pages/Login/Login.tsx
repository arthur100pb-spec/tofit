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

        {modoCadastrando ? (
          <button type="submit" className={styles.bttn}>
            Criar Conta
          </button>
        ) : (
          <div className={styles.actions}>
            <button type="submit" className={styles.bttn}>
              Entrar
            </button>
            <button type="button" className={styles.forgotPassword}>
              Esqueci minha senha
            </button>
          </div>
        )}

      </form>
    </main>
  );
};

export default Login;
