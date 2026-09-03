import styles from './trocas.module.scss';

export default function Trocas(){
    return(
        <main className={styles.main}>
            <header className={styles.header}>
                <h1>Política de Trocas e Devoluções</h1>
                <p className={styles.intro}>
                Olá, maravilhosas! A transparência com vocês é um dos nossos maiores pilares. Reunimos aqui os pontos essenciais da nossa política de trocas e devoluções — sempre em conformidade com o Código de Defesa do Consumidor para garantir a sua total tranquilidade.
                </p>
            </header>

            <section>
                <article className={styles.card}>
                   <h2>🏋️‍♀️ Linha fiT:</h2>
                    <p><strong>Prazo:</strong> Até 7 dias corridos após o recebimento para solicitar troca ou devolução (por tamanho, modelo ou defeito).</p>
                    <p><strong>Condições gerais:</strong> A peça deve estar impecável — sem indícios de uso, sem odores, sem ter sido lavada e com todas as etiquetas originais fixadas.</p>
                    <div className={styles.destaque}>
                        <strong>Atenção a peças claras e brancas:</strong> Faça a prova com cuidado (evitando contato com maquiagem, desodorantes e cremes). Peças com manchas não serão aceitas na triagem.
                    </div>
                </article>

                <article className={styles.card}>
                        <h2>👙 Linha Praia</h2>
                        <p><strong>Troca por tamanho ou modelo:</strong> Até 7 dias corridos, exclusivamente com o protetor higiênico e etiquetas originais intactos e inviolados.</p>
                        <p><strong>Defeito de fabricação:</strong> Notificar em até 7 dias corridos após a entrega, acompanhado de fotos comprobatórias.</p>
                        <div className={styles.destaque}>
                            Caso o lacre ou protetor higiênico tenha sido removido, a troca será recusada por normas sanitárias.
                        </div>
                </article>

                <article className={styles.card}>
                    <h2>⚠️ Como Funciona o Processo</h2>
                    <p><strong>Passo a passo:</strong> Acione nosso suporte informando o número do pedido, motivo e fotos (essencial em caso de defeito).</p>
                    <p><strong>Triagem de qualidade:</strong> Ao chegar, a peça passa por inspeção rigorosa. Sinais de uso, manchas, odores ou falta de etiquetas invalidam o pedido e a peça é devolvida ao remetente.</p>
                </article>
            </section>
        </main>
    )
}