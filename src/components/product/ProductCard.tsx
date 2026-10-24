import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, money, type Product, type Variant } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import toptube from '../../assets/jpg/toptube.png';
import macaquinhoeve from '../../assets/jpg/macaquinhoeve.png';
import macaquinhoplus from '../../assets/jpg/macaquinhoplus.png';
import styles from './ProductCard.module.scss';

const images: Record<string, string> = { toptube, macaquinhoeve, macaquinhoplus };
export const productImage = (key: string) => images[key] || toptube;

export function ProductCard({ product, onRemoved }: { product: Product; onRemoved?: () => void }) {
  const { user, addToCart } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const buy = async () => {
    if (!user) { navigate('/login', { state: { from: '/' } }); return; }
    setBusy(true); setMessage('');
    try {
      const { product: detail } = await api<{ product: Product & { variants: Variant[] } }>(`/api/products/${product.id}`);
      const available = detail.variants.find((variant) => variant.stock > 0);
      if (!available) throw new Error('Produto sem estoque.');
      await addToCart(available.id);
      setMessage(`Adicionado (${available.size})`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível adicionar.'); }
    finally { setBusy(false); }
  };

  const favorite = async () => {
    if (!user) { navigate('/login'); return; }
    setBusy(true);
    try {
      if (onRemoved) { await api(`/api/favorites/${product.id}`, { method: 'DELETE' }); onRemoved(); }
      else { await api(`/api/favorites/${product.id}`, { method: 'POST' }); setMessage('Salvo nos favoritos'); }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar.'); }
    finally { setBusy(false); }
  };

  return <article className={styles.card}>
    <span className={styles.tag}>Novo</span>
    <button className={styles.favorite} onClick={favorite} disabled={busy} aria-label={onRemoved ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>♡</button>
    <img src={productImage(product.imageKey)} alt={product.name} className={styles.photo} />
    <div className={styles.content}>
      <span className={styles.category}>{product.category}</span>
      <h3>{product.name}</h3>
      <p className={styles.description}>{product.description}</p>
      <div className={styles.prices}>{product.comparePriceCents && <span>{money(product.comparePriceCents)}</span>}<strong>{money(product.priceCents)}</strong></div>
      <small>{product.stock > 0 ? `${product.stock} unidades em estoque` : 'Esgotado'}</small>
      <button className={styles.buy} disabled={busy || product.stock <= 0} onClick={buy}>{busy ? 'Aguarde...' : 'Adicionar ao carrinho'}</button>
      {message && <p className={styles.message} role="status">{message}</p>}
    </div>
  </article>;
}
