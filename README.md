# ConfraRachão 2026

Aplicativo web para os três organizadores. O painel registra atletas, categorias, confirmações de pagamento, sorteios e placares. Os três administradores têm as mesmas permissões no painel.

## Configuração

1. Crie um projeto Supabase exclusivo para o evento e aplique a migração em `supabase/migrations/`.
2. Desative novas inscrições públicas no Supabase Auth. Cadastre ou convide as três contas pelo painel Auth. Insira os três IDs dos usuários em `public.event_admins` pelo SQL Editor.
3. Preencha `docs/config.js` com a URL do projeto e a chave publishable. A chave secreta e as credenciais do banco ficam fora do repositório.
4. Configure GitHub Pages para publicar a pasta `/docs` da branch `main`. Cadastre o endereço publicado no Supabase Auth se for usado em convites ou recuperação de senha.
5. Após a publicação, entre com duas contas em navegadores separados. Confira cadastro, confirmação de pagamento e sincronização. Verifique que uma conta fora da lista de administradores fica sem acesso.

No iPhone, abra pelo Safari e use a opção de adicionar à Tela de Início. No Android, abra no Chrome e use a opção de adicionar à tela inicial.

O código mantém data, horário e valor do protótipo recebido. Revise os dados do evento antes da divulgação. O protótipo local pode conter inscrições exclusivas de um aparelho, que não são transferidas automaticamente.
