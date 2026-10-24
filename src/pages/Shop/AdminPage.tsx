import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money, type Product, type Variant } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import styles from './Shop.module.scss';

type AdminOrder = { id:number; status:string; totalCents:number; createdAt:string; name:string; email:string };
type Summary = { counts:{users:number;products:number;orders:number;revenueCents:number}; orders:AdminOrder[]; products:Product[] };
const statuses = ['pending','paid','preparing','shipped','delivered','cancelled'];

function InventoryEditor({ product }: { product: Product }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [open, setOpen] = useState(false);
  const load = async () => setVariants((await api<{variants:Variant[]}>(`/api/admin/products/${product.id}/variants`)).variants);
  const toggle = () => { setOpen((value) => !value); if (!open && !variants.length) void load(); };
  const save = async (variant: Variant, stock: number) => {
    await api(`/api/admin/products/${product.id}/stock`, { method:'PATCH', body:JSON.stringify({ variantId:variant.id, stock }) });
    setVariants((items) => items.map((item) => item.id === variant.id ? { ...item, stock } : item));
  };
  return <div className={styles.inventory}>
    <div className={styles.summary}><span>{product.name}</span><span><strong>{product.stock} unidades</strong> <button className={styles.secondary} onClick={toggle}>{open?'Fechar':'Editar'}</button></span></div>
    {open && variants.map((variant) => <div className={styles.variant} key={variant.id}><span>{variant.size} / {variant.color}</span><input aria-label={`Estoque ${product.name} ${variant.size}`} type="number" min="0" max="999" value={variant.stock} onChange={(event) => setVariants((items) => items.map((item) => item.id===variant.id ? {...item,stock:Number(event.target.value)} : item))}/><button className={styles.button} onClick={()=>void save(variant,variant.stock)}>Salvar</button></div>)}
  </div>;
}

export default function AdminPage(){
  const {user}=useStore(); const [data,setData]=useState<Summary|null>(null); const [error,setError]=useState('');
  const load=()=>api<Summary>('/api/admin/summary').then(setData).catch((e)=>setError(e instanceof Error?e.message:'Erro.'));
  useEffect(()=>{if(user?.role==='admin')load()},[user]);
  const update=async(id:number,status:string)=>{await api(`/api/admin/orders/${id}`,{method:'PATCH',body:JSON.stringify({status})});load()};
  if(!user||user.role!=='admin')return <main className={styles.page}><div className={styles.empty}>Área restrita. <Link to="/login">Entrar como administrador</Link></div></main>;
  return <main className={styles.page}><div className={styles.wrap}><div className={styles.heading}><div><h1>Administração</h1><p>Visão da loja, estoque e pedidos.</p></div></div>{error&&<p className={styles.error}>{error}</p>}{data&&<>
    <section className={styles.stats}><div className={styles.stat}><strong>{data.counts.users}</strong>clientes</div><div className={styles.stat}><strong>{data.counts.products}</strong>produtos</div><div className={styles.stat}><strong>{data.counts.orders}</strong>pedidos</div><div className={styles.stat}><strong>{money(data.counts.revenueCents)}</strong>em pedidos</div></section>
    <section className={styles.panel}><h2>Estoque por tamanho</h2>{data.products.map((product)=><InventoryEditor key={product.id} product={product}/>)}</section>
    <section className={styles.panel}><h2>Pedidos recentes</h2>{!data.orders.length?<p className={styles.meta}>Nenhum pedido.</p>:<div style={{overflowX:'auto'}}><table className={styles.table}><thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Status</th></tr></thead><tbody>{data.orders.map((order)=><tr key={order.id}><td>#{order.id}</td><td>{order.name}<br/><small>{order.email}</small></td><td>{money(order.totalCents)}</td><td><select value={order.status} onChange={(event)=>void update(order.id,event.target.value)}>{statuses.map((status)=><option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>}</section>
  </>}</div></main>;
}
