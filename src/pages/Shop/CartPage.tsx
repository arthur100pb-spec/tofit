import { Link } from 'react-router-dom';
import { money } from '../../lib/api';
import { productImage } from '../../components/product/ProductCard';
import { useStore } from '../../context/StoreContext';
import styles from './Shop.module.scss';
export default function CartPage() {
  const { user, cart, updateCart, removeFromCart } = useStore();
  return <main className={styles.page}><div className={styles.wrap}><div className={styles.heading}><div><h1>Seu carrinho</h1><p>{cart.count} item(ns)</p></div></div>
    {!user ? <div className={styles.empty}>Faça <Link to="/login">login</Link> para ver o carrinho.</div> : !cart.items.length ? <div className={styles.empty}>Seu carrinho está vazio. <Link to="/">Ver produtos</Link></div> : <div className={styles.panel}>{cart.items.map((item)=><article className={styles.item} key={item.variantId}><img src={productImage(item.imageKey)} alt={item.name}/><div><h3>{item.name}</h3><p className={styles.meta}>{item.size} / {item.color}</p><p className={styles.price}>{money(item.priceCents)}</p></div><div className={styles.controls}><label>Qtd. <input aria-label={`Quantidade de ${item.name}`} type="number" min="1" max={Math.min(10,item.stock)} value={item.quantity} onChange={(e)=>void updateCart(item.variantId,Number(e.target.value))}/></label><button className={styles.danger} onClick={()=>void removeFromCart(item.variantId)}>Remover</button></div></article>)}<div className={styles.summary}><strong>Total: {money(cart.totalCents)}</strong><Link className={styles.button} to="/finalizar">Finalizar pedido</Link></div></div>}
  </div></main>;
}
