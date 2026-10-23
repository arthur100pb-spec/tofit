import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Home.module.scss';
import bannerJpg from '../../assets/jpg/banner.jpg';
import banner2 from '../../assets/jpg/banner2.png';
import toptube from '../../assets/jpg/toptube.png';
import macaquinhoeve from '../../assets/jpg/macaquinhoeve.png';
import macaquinhoplus from '../../assets/jpg/macaquinhoplus.png';

const banners = [bannerJpg, banner2];

export function Home() {
  const [indexBanner, setIndexBanner] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndexBanner((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className={styles.principal}>
      <div className={styles.carrosselContainer}>
        <AnimatePresence mode="wait">
          <motion.img
            key={indexBanner}
            src={banners[indexBanner]}
            alt={indexBanner === 0 ? "banner principal da tô fit" : "banner 2 da tô fit"}
            className={styles.banner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>

        <div className={styles.indicadores}>
          {banners.map((_, i) => (
            <span
              key={i}
              className={`${styles.bolinha} ${i === indexBanner ? styles.ativa : ''}`}
              onClick={() => setIndexBanner(i)}
            />
          ))}
        </div>
      </div>

      <h2 className={styles.tituloSecao}>Novos Produtos</h2>
      
      <section className={styles.vitrine}>
        <article className={styles.card}>
          <span className={styles.tag}>Novo</span>
          <img src={toptube} alt="Top Tube - Coleção MOOD" className={styles.foto} />
          <div className={styles.conteudo}>
            <span className={styles.categoria}>Linha fiT</span>
            <h3 className={styles.titulo}>Top Tube - Coleção MOOD</h3>
            <div className={styles.precos}>
              <span className={styles.precoAntigo}>R$ 89,90</span>
              <span className={styles.preco}>R$ 65,90</span>
            </div>
            <a href="#" className={styles.botao}>Comprar</a>
          </div>
        </article>

        <article className={styles.card}>
          <span className={styles.tag}>Novo</span>
          <img src={macaquinhoeve} alt="Macaquinho EVE" className={styles.foto} />
          <div className={styles.conteudo}>
            <span className={styles.categoria}>Linha fiT</span>
            <h3 className={styles.titulo}>Macaquinho EVE</h3>
            <div className={styles.precos}>
              <span className={styles.precoAntigo}>R$ 185,90</span>
              <span className={styles.preco}>R$ 169,90</span>
            </div>
            <a href="#" className={styles.botao}>Comprar</a>
          </div>
        </article>

        <article className={styles.card}>
          <span className={styles.tag}>Novo</span>
          <img src={macaquinhoplus} alt="Macaquinho Plus Size na cor preto" className={styles.foto} />
          <div className={styles.conteudo}>
            <span className={styles.categoria}>Linha fiT</span>
            <h3 className={styles.titulo}>Macaquinho PLUS</h3>
            <div className={styles.precos}>
              <span className={styles.precoAntigo}>R$ 199,90</span>
              <span className={styles.preco}>R$ 175,90</span>
            </div>
            <a href="#" className={styles.botao}>Comprar</a>
          </div>
        </article>
      </section>
    </main>
  );
}
