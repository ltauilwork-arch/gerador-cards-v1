# Guia de Publicação (Deploy) - Gerador de Cards V1

Para colocar seu projeto na internet, a forma mais fácil e gratuita é usar a **Vercel**.

## Opção 1: Vercel (Recomendada)

Como você já tem o projeto salvo no Git localmente, o ideal é subir para o GitHub primeiro.

### Passo 1: Subir para o GitHub

1. Crie uma conta no [GitHub.com](https://github.com) (se não tiver).
2. Crie um **Novo Repositório** (botão "New").
3. Dê o nome `gerador-cards-v1`.
4. Não marque "Initialize with README".
5. Copie o código que aparece na seção **"…or push an existing repository from the command line"**.
   - Deve ser algo como:
     ```bash
     git remote add origin https://github.com/SEU_USUARIO/gerador-cards-v1.git
     git branch -M main
     git push -u origin main
     ```
6. Rode esses comandos no terminal do VS Code.

### Passo 2: Conectar na Vercel

1. Crie uma conta na [Vercel.com](https://vercel.com).
2. Clique em **"Add New..."** -> **"Project"**.
3. Selecione "Import Git Repository" e escolha o `gerador-cards-v1` que você acabou de criar.
4. Clique em **Deploy**.
5. Aguarde uns instantes e pronto! Você terá um link (ex: `gerador-cards-v1.vercel.app`) para compartilhar.

---

## Opção 2: Build Manual (Para rodar localmente ou em servidor próprio)

Se você quiser apenas gerar os arquivos finais para colocar em um servidor Apache/Nginx ou enviar para alguém:

1. No terminal, rode:
   ```bash
   npm run build
   ```
2. Isso vai criar uma pasta chamada `dist` no seu projeto.
3. Essa pasta `dist` contém o site pronto (HTML, CSS, JS). Você pode arrastar essa pasta para qualquer hospedagem estática.

---

## Próximos Passos (V2)

Depois de publicar a V1, para iniciar a V2:

1. Feche este VS Code.
2. Abra a pasta `d:\ANTIGRAVITY\GERADOR_CARDS_V2`.
3. Rode `npm install`.
4. Comece a programar as novidades!
