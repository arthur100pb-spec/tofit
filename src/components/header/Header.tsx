import { Link, NavLink } from 'react-router-dom';
import styles from './header.module.scss';
import icon from '../../assets/jpg/iconperson.png';
import iconcoracao from '../../assets/jpg/favoritosicon.png';
import iconcarrinho from '../../assets/jpg/carrinhoicon.png';
import { useStore } from '../../context/StoreContext';

export function Header() {
  const { user, cart, logout } = useStore();
  return <>
    <div className={styles.divspan}><span>10% OFF na primeira compra | Use o cupom: PRIMEIRA10</span></div>
    <header className={styles.cabecalho}>
      <h1><Link to="/" title="Página inicial">Tô fiT</Link></h1>
      <nav aria-label="Navegação principal"><ul className={styles.linksnav}>
        <li><NavLink to="/?category=slim">Slim</NavLink></li>
        <li><NavLink to="/?category=plus-size">Plus Size</NavLink></li>
        <li><Link to="/trocas">Trocas e Devoluções</Link></li>
        <li><Link to="/sobre">Sobre</Link></li>
        {user?.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
        <li className={styles.iconsnav}>
          <Link to={user ? '/conta' : '/login'} title={user ? `Conta de ${user.name}` : 'Entrar ou cadastrar'}><img src={icon} alt="Conta" /></Link>
          <Link to="/favoritos" title="Favoritos"><img src={iconcoracao} alt="Favoritos" /></Link>
          <Link className={styles.cartLink} to="/carrinho" title="Carrinho"><img src={iconcarrinho} alt="Carrinho" />{cart.count > 0 && <span>{cart.count}</span>}</Link>
          {user && <button className={styles.logout} onClick={() => void logout()}>Sair</button>}
        </li>
      </ul></nav>
    </header>
  </>;
}
