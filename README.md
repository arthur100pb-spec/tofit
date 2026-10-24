# Tô fiT — loja full-stack

Loja virtual acadêmica desenvolvida com React, TypeScript, Vite, Node.js, Express e SQLite.

## O que já funciona

- catálogo filtrado por Slim e Plus Size;
- cadastro, login, logout e sessão segura em cookie `HttpOnly`;
- senhas protegidas com bcrypt;
- favoritos por cliente;
- carrinho com quantidade, validação e controle de estoque;
- finalização e histórico de pedidos;
- recuperação de senha com token temporário;
- painel de administração com clientes, estoque, pedidos, faturamento e alteração de status;
- banco SQLite criado e populado automaticamente;
- validação de dados, headers de segurança e proteção das rotas privadas.

## Executar no VS Code

1. Instale o Node.js 24 ou mais recente.
2. Abra esta pasta no VS Code e confie no projeto (`Trust`).
3. No terminal, use `npm.cmd install`.
4. Copie `.env.example` para `.env` e troque as senhas/segredos. Nesta máquina já existe um `.env` local, que não vai para o GitHub.
5. Execute `npm.cmd run dev`.
6. Abra `http://localhost:5173`.

No PowerShell que bloqueia `npm.ps1`, use sempre `npm.cmd` como nos comandos acima.

## Administrador local

O usuário administrador é criado ao iniciar a API quando `ADMIN_EMAIL` e `ADMIN_PASSWORD` estão configurados no `.env`. O arquivo deve permanecer privado e nunca ser enviado ao GitHub.

## Banco de dados

O arquivo `data/tofit.db` é criado automaticamente e fica fora do Git. Tabelas:

- `users`: clientes e administradores;
- `categories`, `products`, `product_variants`: catálogo, tamanhos e estoque;
- `favorites`, `cart_items`: dados pessoais da compra;
- `orders`, `order_items`: pedidos e histórico;
- `password_reset_tokens`: recuperação de senha com validade.

## Comandos

- `npm.cmd run dev`: interface e API juntas;
- `npm.cmd run build`: gera a versão de produção da interface;
- `npm.cmd run check`: compila interface e verifica tipos da API;
- `npm.cmd run test:smoke`: testa cadastro, produtos, carrinho e pedido;
- `npm.cmd run start`: inicia somente a API.

## Para publicar de verdade

O projeto está funcional localmente. Para vendas reais ainda é necessário contratar/configurar:

- hospedagem para a interface e a API;
- banco persistente do servidor (recomenda-se PostgreSQL em produção);
- gateway de pagamento como Mercado Pago, PagSeguro ou Stripe;
- serviço de e-mail transacional para recuperação de senha;
- domínio, HTTPS, política de privacidade/LGPD, frete e regras comerciais.

Nunca armazene números completos de cartão ou código de segurança no banco da loja; isso deve ficar com o gateway de pagamento.
