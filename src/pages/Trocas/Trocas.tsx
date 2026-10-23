import { motion } from 'framer-motion';
import styles from './trocas.module.scss';


const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Trocas() {
  return (
    <motion.main 
      className={styles.main}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <motion.header className={styles.header} variants={fadeInUp}>
        <h1>Política de Trocas e Devoluções</h1>
        <p className={styles.intro}>
          Olá, maravilhosas! A transparência com vocês é um dos nossos maiores pilares. Reunimos aqui os pontos essenciais da nossa política de trocas e devoluções: sempre em conformidade com o Código de Defesa do Consumidor para garantir a sua total tranquilidade.
        </p>
      </motion.header>

      <section>
        
        <motion.article 
          className={styles.card}
          variants={fadeInUp}
          whileHover={{ scale: 1.01 }}
        >
          <details>
            <summary><h2>Linha fiT</h2></summary>
            <p><strong>Prazo:</strong> Até 7 dias corridos após o recebimento para solicitar troca ou devolução (por tamanho, modelo ou defeito).</p>
            <p><strong>Condições gerais:</strong> A peça deve estar impecável! (sem indícios de uso, sem odores, sem ter sido lavada e com todas as etiquetas originais fixadas.)</p>
            <div className={styles.destaque}>
              <strong>Atenção a peças claras e brancas:</strong> Faça a prova com cuidado (evitando contato com maquiagem, desodorantes e cremes). Peças com manchas não serão aceitas na triagem.
            </div>
          </details>
        </motion.article>

      
        <motion.article 
          className={styles.card}
          variants={fadeInUp}
          whileHover={{ scale: 1.01 }}
        >
          <details>
            <summary><h2>Linha Praia</h2></summary>
            <p><strong>Troca por tamanho ou modelo:</strong> Até 7 dias corridos, exclusivamente com o protetor higiênico e etiquetas originais intactos e inviolados.</p>
            <p><strong>Defeito de fabricação:</strong> Notificar em até 7 dias corridos após a entrega, acompanhado de fotos comprobatórias.</p>
            <div className={styles.destaque}>
              Caso o lacre ou protetor higiênico tenha sido removido, a troca será recusada por normas sanitárias.
            </div>
          </details>
        </motion.article>

      
        <motion.article 
          className={styles.card}
          variants={fadeInUp}
          whileHover={{ scale: 1.01 }}
        >
          <details>
            <summary><h2>Como Funciona o Processo</h2></summary>
            <p><strong>1. Passo a passo:</strong> Acione nosso suporte informando o número do pedido, motivo e fotos (essencial em caso de defeito).</p>
            <p><strong>2. Triagem de qualidade:</strong> Ao chegar, a peça passa por inspeção rigorosa. Sinais de uso, manchas, odores ou falta de etiquetas invalidam o pedido e a peça é devolvida ao remetente.</p>
          </details>
        </motion.article>

        <motion.section 
        className={styles.contactSupport}
        variants={fadeInUp}
        whileHover={{ scale: 1.01 }}
      >
        <h3>Precisa iniciar uma troca ou tirar dúvidas?</h3>
        <p>Clique no botão abaixo para falar direto com o nosso suporte.</p>
        <a 
          href="https://wa.me/5582998048249" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.btnPill}
        >
          Iniciar Atendimento no WhatsApp
        </a>
      </motion.section>
      </section>
    </motion.main>
  );
}