# Instalação da Função de Upload R2 no Google Apps Script

## O que você precisa fazer

### 1. Abra seu Google Apps Script existente

1. Acesse: https://script.google.com
2. Abra o projeto que já salva na planilha da Madame Luxo
3. Você verá o código atual (provavelmente tem uma função `doPost` ou similar)

### 2. Adicione a nova função

No editor do Apps Script, **adicione o código do arquivo `apps-script-r2-upload.js`** ao final do código existente.

**NÃO apague o código que já existe!** Apenas cole o novo código no final.

### 3. Permissões CORS (IMPORTANTE)

Se seu Apps Script ainda não aceita requisições POST de outros domínios, adicione esta função no início do código:

```javascript
function doGet(e) {
  // Seu código existente do doGet...
}

function doPost(e) {
  // NOVO: Tenta processar upload R2 primeiro
  try {
    const payload = JSON.parse(e.postData.contents);
    
    if (payload.action === 'upload_r2') {
      return handleR2Upload(payload);
    }
    
    // Se não for upload R2, processa normalmente (seu código existente)
    // ... seu código atual do doPost ...
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 4. Permissões do Apps Script

Certifique-se de que o Apps Script tem permissões para:
- ✅ Acessar URLs externas (UrlFetchApp)
- ✅ Ser acessado por qualquer pessoa (Deploy → Manage deployments → Web app → Execute as: Me, Who has access: Anyone)

### 5. Deploy

1. Clique em **Deploy** → **New deployment**
2. Tipo: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Clique **Deploy**
6. Copie a nova URL e atualize no `adm-catalogo.js` (CONFIG.APPS_SCRIPT_URL)

### 6. Teste

1. Abra o painel admin
2. Tente fazer upload de uma imagem
3. Verifique no console do navegador (F12) se há erros
4. Verifique no bucket R2 se a imagem aparece

## Solução de problemas

### Erro "Cross-Origin Request Blocked"
O Apps Script precisa retornar headers CORS. Se der erro de CORS, adicione esta função no início do Apps Script:

```javascript
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
```

### Erro "Unauthorized"
Verifique se as credenciais R2 estão corretas no painel admin (CONFIG.R2).

### Erro "Bucket not found"
Verifique se o bucket `madame-luxo-produtos` existe e o token tem permissão.
