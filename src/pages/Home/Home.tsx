import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Home.module.scss';
import bannerJpg from '../../assets/jpg/banner.jpg';
import banner2 from '../../assets/jpg/banner2.png';
import { api, type Product } from '../../lib/api';
import { ProductCard } from '../../components/product/ProductCard';

const banners = [bannerJpg, banner2];

export function Home() {
  const [indexBanner, setIndexBanner] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  const category = params.get('category') || '';

  useEffect(() => {
    const timer = setInterval(() => setIndexBanner((current) => (current + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    api<{ products: Product[] }>(`/api/products${category ? `?category=${encodeURIComponent(category)}` : ''}`)
      .then(({ products }) => setProducts(products))
      .catch((error) => setError(error instanceof Error ? error.message : 'Não foi possível carregar a vitrine.'));
  }, [category]);

  const title = category === 'slim' ? 'Coleção Slim' : category === 'plus-size' ? 'Coleção Plus Size' : 'Novos Produtos';
  return <main className={styles.principal}>
    <div className={styles.carrosselContainer}>
      <AnimatePresence mode="wait"><motion.img key={indexBanner} src={banners[indexBanner]} alt="Coleção Tô fiT" className={styles.banner} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .8 }} /></AnimatePresence>
      <div className={styles.indicadores}>{banners.map((_, index) => <button aria-label={`Exibir banner ${index + 1}`} key={index} className={`${styles.bolinha} ${index === indexBanner ? styles.ativa : ''}`} onClick={() => setIndexBanner(index)} />)}</div>
    </div>
    <h2 className={styles.tituloSecao}>{title}</h2>
    {error && <p className={styles.feedback}>{error}</p>}
    {!error && products.length === 0 && <p className={styles.feedback}>Nenhum produto nesta categoria.</p>}
    <section className={styles.vitrine}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</section>
  </main>;
}
