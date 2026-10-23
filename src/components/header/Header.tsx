import { Link } from 'react-router-dom'
import styles from './header.module.scss'
import icon from '../../assets/jpg/iconperson.png'
import iconcoracao from '../../assets/jpg/favoritosicon.png'
import iconcarrinho from '../../assets/jpg/carrinhoicon.png'

export function Header() {
  return (
    <>
    <div className={styles.divspan}>
        <span>10%OFF na primeira compra | Use o cupom: PRIMEIRA10</span>
    </div>
    <header className={styles.cabeçalho}>
      <h1>
        <Link to="/" title="Página Inicial">Tô fiT</Link>
      </h1>
      <nav>
          <ul className={styles.linksnav}>
            <li><a href="">Slim</a></li>
            <li><a href="">Plus Size</a></li>
            <li><Link to='/Trocas' title='Trocas e Devoluções'>Trocas e Devoluções</Link></li>
            <li><Link to='/Sobre'>Sobre</Link></li>
            
            <div className={styles.iconsnav}>
              <Link to="/login" title="Entrar/Cadastrar">
              <img src={icon} alt="Ícone de login" />
              </Link>
              <img src={iconcoracao} alt="Ícone de coração" />
              <img src={iconcarrinho} alt="Ícone de carrinho de compras" />
            </div>
          </ul>
      </nav>
    </header>
    </>
  );
}