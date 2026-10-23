import { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import styles from './sobre.module.scss';

export default function Sobre() {
  const el = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [`Duas primas unidas pela paixão inabalável pelo mundo fitness! Acreditamos genuinamente que a autoestima e a confiança têm o poder de transformar mulheres, elevando sua força e fazendo-as sentirem-se ainda mais potentes em sua rotina e objetivos.
        Mais do que vestir, começamos este projeto com um grande propósito: criar uma comunidade real e acolhedora! É por isso que, dia após dia, estamos construindo a nossa tropa com muito carinho, conexão e parceria.
        A Tô fiT existe há 1 ano e meio e segue firme como uma marca que preza, acima de tudo, pela transparência, respeito e ética em cada detalhe. Nossos valores são profundamente fundamentados em uma comunicação aberta e humanizada, na excelência e qualidade dos nossos produtos, e no compromisso de caminhar lado a lado com cada mulher que escolhe fazer parte da nossa história.`],
      typeSpeed: 15,
      backSpeed: 20,
      loop: false,
      showCursor: false,
    });

    // Limpa a instância ao desmontar o componente
    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <main className={styles.stmain}>
      <h2>
        Quem somos nós?
        <span ref={el} />
      </h2>

      <p ref={el} className={styles.stp} />
    </main>
  );
}