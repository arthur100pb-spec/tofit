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
      <h1>Tô fiT</h1>
      <nav>
        <ul className={styles.linksnav}>
          <a href=""><li>Slim</li></a>
          <a href=""><li>Plus Size</li></a>
          <a href=""><li>Moda Praia</li></a>
          <li><Link to='/Trocas' title='Trocas e Devoluções'>Trocas e Devoluções</Link></li>
          <a href=""><li>Sobre</li></a>

          <li>
            <Link to="/login" title="Entrar/Cadastrar">
              <img src={icon} alt="" />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
    </>
  );
}