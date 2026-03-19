# Configuração Final no Vercel

O código da V2 foi enviado com sucesso! O deploy deve ter iniciado automaticamente.

**⚠️ Ação Necessária: Atualizar Chave de API**

Como chaves de API não são salvas no GitHub por segurança, você precisa atualizar manualmente no painel da Vercel para que a nova versão funcione.

1. Acesse seu projeto no [Vercel](https://vercel.com/dashboard).
2. Vá em **Settings** > **Environment Variables**.
3. Procure por `VITE_GEMINI_API_KEY`.
4. Clique em **Edit** e cole a nova chave:

   ```
   AIzaSyA1cmXL3G66GXrA6qp9J5MxOJxEueqcf1Q
   ```

5. Salve.
6. Vá na aba **Deployments**, clique nos três pontinhos do último deploy e selecione **"Redeploy"** para garantir que ele pegue a nova chave.

Pronto! Seu Gerador de Cards V2 estará no ar.
