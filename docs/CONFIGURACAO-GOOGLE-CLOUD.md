# ConfiguraÃ§Ã£o do Google Cloud Console

## Objetivo
Habilitar a API do Google Sheets para que o painel administrativo possa ler e escrever na planilha.

---

## Passo a Passo

### 1. Acesse o Google Cloud Console
- VÃ¡ para: https://console.cloud.google.com/
- FaÃ§a login com a mesma conta Google da planilha

### 2. Crie um Novo Projeto
1. Clique no seletor de projetos (canto superior esquerdo)
2. Clique em **"Novo Projeto"**
3. Nome: `Madame Luxo - Admin`
4. Clique em **"Criar"**

### 3. Ative a Google Sheets API
1. No menu lateral, vÃ¡ em **"APIs e ServiÃ§os" â†’ "Biblioteca"**
2. Pesquise por **"Google Sheets API"**
3. Clique em **"Google Sheets API"**
4. Clique em **"Ativar"**

### 4. Configure a Tela de Consentimento OAuth
1. VÃ¡ em **"APIs e ServiÃ§os" â†’ "Tela de consentimento OAuth"**
2. Selecione **"Externo"** (se for conta pessoal) ou **"Interno"** (se for Workspace)
3. Clique em **"Criar"**
4. Preencha:
   - **Nome do app:** Madame Luxo Admin
   - **Email de suporte do usuÃ¡rio:** seu email
   - **Email de contato do desenvolvedor:** seu email
5. Clique em **"Salvar e continuar"**
6. Na tela "Escopos", clique em **"Adicionar ou remover escopos"**
7. Pesquise por `sheets` e marque:
   - `.../auth/spreadsheets` (Google Sheets API v4)
8. Clique em **"Atualizar"** e depois **"Salvar e continuar"**
9. Na tela "UsuÃ¡rios de teste", clique em **"Adicionar usuÃ¡rios"**
10. Adicione o email que vai usar o painel admin
11. Clique em **"Salvar e continuar"**

### 5. Crie as Credenciais OAuth 2.0
1. VÃ¡ em **"APIs e ServiÃ§os" â†’ "Credenciais"**
2. Clique em **"Criar credenciais" â†’ "ID do cliente OAuth"**
3. Tipo de aplicativo: **"Aplicativo da Web"**
4. Nome: `Madame Luxo Web Client`
5. Em **"Origens JavaScript autorizadas"**, adicione:
   ```
   https://www.madameluxorj.com.br
   http://localhost:5500
   http://localhost:3000
   ```
   > Nota: Adicione `localhost` para testar localmente
6. Em **"URIs de redirecionamento autorizados"**, adicione:
   ```
   https://www.madameluxorj.com.br/adm-catalogo.html
   ```
7. Clique em **"Criar"**
8. **Copie o Client ID** (vai parecer com: `123456789-abc123.apps.googleusercontent.com`)

### 6. Configure o Client ID no CÃ³digo
1. Abra o arquivo `adm-catalogo.js`
2. Encontre a linha:
   ```javascript
   CLIENT_ID: '',
   ```
3. Cole o Client ID:
   ```javascript
   CLIENT_ID: '123456789-abc123.apps.googleusercontent.com',
   ```

### 7. Compartilhe a Planilha
1. Abra a planilha no Google Sheets
2. Clique em **"Compartilhar"** (canto superior direito)
3. Em **"Acesso geral"**, selecione:
   - **"Qualquer pessoa com o link"**
   - Papel: **"Editor"** (necessÃ¡rio para o painel admin funcionar)
4. Ou: adicione o email do usuÃ¡rio como **"Editor"**

---

## Testando Localmente

### OpÃ§Ã£o 1: Live Server (VS Code)
1. Instale a extensÃ£o **"Live Server"** no VS Code
2. Clique com o botÃ£o direito no `adm-catalogo.html`
3. Selecione **"Open with Live Server"**
4. O navegador abrirÃ¡ em `http://localhost:5500`

### OpÃ§Ã£o 2: Python SimpleHTTPServer
```bash
# Na pasta do projeto
python -m http.server 5500
```
Acesse: http://localhost:5500/adm-catalogo.html

---

## Fluxo de Funcionamento

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  adm-catalogo   â”‚â”€â”€â”€â”€â–¶â”‚  Google OAuth    â”‚â”€â”€â”€â”€â–¶â”‚  Planilha       â”‚
â”‚  .html          â”‚     â”‚  (login Google)  â”‚     â”‚  Google Sheets  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚                                               â”‚
        â”‚                                               â”‚
        â”‚â—€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚              LÃª produtos via CSV
        â”‚
        â”‚â—€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚              Escreve via API v4 (OAuth)       â”‚
        â”‚                                               â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  index.html     â”‚â—€â”€â”€â”€â”€â”‚  Planilha CSV    â”‚     â”‚  Planilha       â”‚
â”‚  (site pÃºblico) â”‚     â”‚  (pÃºblico)       â”‚     â”‚  (atualizada)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## SoluÃ§Ã£o de Problemas

### Erro: "PermissÃ£o negada" ao salvar
- Verifique se a planilha estÃ¡ compartilhada como **"Editor"**
- Verifique se o email do usuÃ¡rio estÃ¡ na lista de usuÃ¡rios de teste do OAuth

### Erro: "Cliente OAuth nÃ£o configurado"
- Verifique se o `CLIENT_ID` foi colado corretamente no `adm-catalogo.js`
- Verifique se a origem `localhost` foi adicionada nas credenciais

### Erro: "Planilha nÃ£o encontrada"
- Verifique se o `SPREADSHEET_ID` estÃ¡ correto
- Verifique se a planilha estÃ¡ pÃºblica (mesmo que sÃ³ para visualizaÃ§Ã£o)

### O site principal nÃ£o atualiza
- O site principal lÃª o CSV a cada carregamento
- Aguarde alguns segundos apÃ³s salvar na planilha
- Limpe o cache do navegador (Ctrl+F5)

---

## SeguranÃ§a

âš ï¸ **Importante:**
- O painel admin (`adm-catalogo.html`) NÃƒO deve ser linkado no site pÃºblico
- Apenas pessoas com o link direto podem acessar
- O Client ID exposto no JavaScript Ã© seguro para OAuth (nÃ£o Ã© segredo)
- Para maior seguranÃ§a, considere adicionar uma senha simples no painel

---

## Contato
Em caso de dÃºvidas, entre em contato com a AG5 AgÃªncia.
