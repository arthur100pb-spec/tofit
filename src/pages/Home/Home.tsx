import styles from './Home.module.scss';
import bannerJpg from '../../assets/jpg/banner.jpg'

export function Home() {
  return (
    <main className={styles.principal}>
      <img className={styles.banner} src={bannerJpg} alt="banner principal da tô fit" />
    </main>
  );
}
