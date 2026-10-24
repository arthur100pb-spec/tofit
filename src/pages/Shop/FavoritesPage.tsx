import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Product } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/product/ProductCard';
import styles from './Shop.module.scss';
export default function FavoritesPage(){ const {user}=useStore(); const [products,setProducts]=useState<Product[]>([]); const [error,setError]=useState(''); const load=()=>api<{products:Product[]}>('/api/favorites').then(r=>setProducts(r.products)).catch(e=>setError(e instanceof Error?e.message:'Erro.')); useEffect(()=>{if(user)load()},[user]); return <main className={styles.page}><div className={styles.wrap}><div className={styles.heading}><div><h1>Favoritos</h1><p>As peças que você guardou.</p></div></div>{!user?<div className={styles.empty}>Faça <Link to="/login">login</Link> para usar favoritos.</div>:error?<p className={styles.error}>{error}</p>:!products.length?<div className={styles.empty}>Você ainda não salvou produtos.</div>:<section className={styles.grid}>{products.map(p=><ProductCard key={p.id} product={p} onRemoved={load}/>)}</section>}</div></main> }
