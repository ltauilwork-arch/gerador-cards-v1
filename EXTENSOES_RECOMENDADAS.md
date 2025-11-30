# 🔧 Extensões e Ferramentas Recomendadas - Stitch Design

## ✅ Status Atual

### Dependências NPM Instaladas

Todas as dependências principais estão instaladas corretamente:

- ✅ React 19.2.0
- ✅ TypeScript 5.8.3
- ✅ Vite 6.4.1
- ✅ @google/genai 1.30.0 (Gemini AI API)
- ✅ pptxgenjs 3.12.0 (Geração de PowerPoint)
- ✅ jszip 3.10.1

### Ferramentas de Desenvolvimento Adicionadas

- ✅ ESLint (linting de código)
- ✅ Prettier (formatação de código)
- ✅ TypeScript ESLint plugins
- ✅ React ESLint plugins

## 📦 Extensões do VS Code Recomendadas

As seguintes extensões foram adicionadas ao arquivo `.vscode/extensions.json`:

### Essenciais

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Detecta problemas de código em tempo real
   - Integração com as regras do projeto

2. **Prettier** (`esbenp.prettier-vscode`)
   - Formatação automática ao salvar
   - Mantém consistência no estilo de código

3. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
   - Snippets úteis para React e TypeScript
   - Acelera o desenvolvimento

### Produtividade

4. **GitLens** (`eamodio.gitlens`)
   - Visualização avançada do histórico Git
   - Blame annotations inline

5. **Path Intellisense** (`christian-kohler.path-intellisense`)
   - Autocomplete de caminhos de arquivos
   - Essencial para imports

6. **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
   - Renomeia tags de fechamento automaticamente
   - Útil para JSX/TSX

7. **Color Highlight** (`naumovs.color-highlight`)
   - Destaca cores no código
   - Útil para desenvolvimento de UI

8. **Error Lens** (`usernamehw.errorlens`)
   - Exibe erros inline no código
   - Feedback visual imediato

9. **TODO Highlight** (`wayou.vscode-todo-highlight`)
   - Destaca comentários TODO, FIXME, etc.
   - Gerenciamento de tarefas pendentes

10. **Vite** (`antfu.vite`)
    - Suporte específico para Vite
    - Melhor integração com o bundler

## 📝 Arquivos de Configuração Criados

### `.vscode/extensions.json`

Lista de extensões recomendadas para o projeto.

### `.prettierrc`

Configuração do Prettier:

- Tabs de 2 espaços
- Uso de ponto e vírgula
- Aspas duplas
- Print width de 100 caracteres

### `eslint.config.js`

Configuração do ESLint com:

- Suporte a TypeScript
- Regras para React Hooks
- Regras para React Refresh
- Detecção de variáveis não utilizadas

## 🚀 Scripts NPM Disponíveis

Agora você pode usar os seguintes comandos:

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Prévia do build
npm run preview

# Verificar problemas de código (linting)
npm run lint

# Formatar código automaticamente
npm run format
```

## 📋 Como Instalar as Extensões

1. Abra o VS Code no diretório do projeto
2. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
3. Digite "Extensions: Show Recommended Extensions"
4. Clique em "Install All" ou instale individualmente

## 🎯 Próximos Passos Recomendados

1. **Instalar as extensões do VS Code** listadas acima
2. **Executar formatação**: `npm run format`
3. **Verificar problemas**: `npm run lint`
4. **Configurar auto-save** no VS Code (opcional):
   - File > Preferences > Settings
   - Procure por "auto save"
   - Configure para "onFocusChange" ou "afterDelay"

## ⚠️ Observações Importantes

### Problema Atual do Projeto

Baseado no histórico de conversas, você está trabalhando em:

- Correção de formatação de arquivos PPTX gerados
- Garantir que o preview e o arquivo baixado tenham a mesma formatação

### Específico para o Problema de Formatação PPTX

As ferramentas instaladas não resolverão diretamente o problema de formatação do PPTX, mas ajudarão a:

- Detectar erros de código mais rapidamente
- Manter código mais limpo e legível
- Facilitar debugging

Para resolver o problema de formatação PPTX, você precisará:

1. Verificar a lógica em `services/geminiService.ts`
2. Comparar os parâmetros de formatação entre preview e PPTX gerado
3. Possivelmente ajustar as configurações do PptxGenJS

## 🔍 Extensões Opcionais (Não Essenciais)

Se desejar ainda mais produtividade:

- **Import Cost** - Mostra tamanho dos imports
- **Better Comments** - Comentários coloridos
- **Bracket Pair Colorizer** - Cores para parênteses (built-in no VS Code mais recente)
- **Material Icon Theme** - Ícones bonitos para arquivos

---

**Data da configuração**: 2025-11-29
**Versão do Node**: Verifique com `node --version`
