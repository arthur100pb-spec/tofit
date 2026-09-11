import { Link } from 'react-router-dom'
import styles from './header.module.scss'
import icon from '../../assets/jpg/iconperson.png'


export function Header() {
  return (
    <>
    <div className={styles.divspan}>
        <span>10%OFF na primeira compra | Use o cumpom: PRIMEIRA10</span>
    </div>
    <header className={styles.cabeçalho}>
      <h1>
        <Link to="/" title="Página Inicial">Tô fiT</Link>
      </h1>
      <nav>
          <ul className={styles.linksnav}>
            <li><a href="">Slim</a></li>
            <li><a href="">Plus Size</a></li>
            <li><a href="">Moda Praia</a></li>
            <li><Link to='/Trocas' title='Trocas e Devoluções'>Trocas e Devoluções</Link></li>
            <li><Link to='/Sobre'>Sobre</Link></li>
            <li>
              <Link to="/login" title="Entrar/Cadastrar">
                <img src={icon} alt="Ícone de login" />
              </Link>
            </li>
          </ul>
      </nav>
    </header>
    </>
  );
}