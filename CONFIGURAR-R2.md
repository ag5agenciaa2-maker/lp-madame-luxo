# Configuração do Cloudflare R2 para Upload de Imagens

## O que já está implementado

O painel admin agora tem upload de imagens direto para o Cloudflare R2:
- ✅ Botão "Escolher foto" + arrastar e soltar
- ✅ Preview da imagem após upload
- ✅ Barra de progresso durante upload
- ✅ Botão de remover imagem
- ✅ Campo de URL manual (compatibilidade)
- ✅ 3 campos: Imagem Destaque, Imagem 2, Imagem 3

## O que você precisa fazer agora

### 1. Criar o Bucket no R2

1. Acesse: https://dash.cloudflare.com → seu domínio → R2 Object Storage
2. Clique em **"Criar balde"**
3. Preencha:
   - **Nome do balde:** `madame-luxo-produtos`
   - **Localização:** `Automatic`
4. Clique **"Criar balde"**

### 2. Habilitar Acesso Público

1. Dentro do bucket `madame-luxo-produtos`, vá em **"Configurações"**
2. Em **"Acesso público"** → habilite **"Permitir acesso público"**
3. Anote a URL pública que aparecer (ex: `https://pub-xxx.r2.dev`)

### 3. Criar Token de API

1. No R2, clique em **"Gerenciar"** ao lado de **"Tokens de API"**
2. Clique **"Criar token de API"**
3. Preencha:
   - **Nome do token:** `madame-luxo-upload`
   - **Permissões:** `Object Read & Write`
   - **Buckets:** Selecione `madame-luxo-produtos`
4. Clique **"Criar token de API"**
5. **Copie e guarde:**
   - **Access Key ID** (ex: `xxxxx`)
   - **Secret Access Key** (ex: `yyyyy`) — só aparece uma vez!

### 4. Preencher as Credenciais no Código

Abra o arquivo `adm-catalogo.js` e localize a seção `CONFIG.R2` (linha ~35):

```javascript
R2: {
    ACCOUNT_ID: 'COLE_AQUI_SEU_ACCOUNT_ID',
    ACCESS_KEY_ID: 'COLE_AQUI_SEU_ACCESS_KEY',
    SECRET_ACCESS_KEY: 'COLE_AQUI_SEU_SECRET_KEY',
    BUCKET_NAME: 'madame-luxo-produtos',
    PUBLIC_URL: 'https://pub-xxx.r2.dev',  // URL que apareceu no passo 2
    REGION: 'auto'
}
```

Substitua os valores pelos seus.

### 5. Testar

1. Abra o painel admin (`adm-catalogo.html`)
2. Clique em **"Novo Produto"**
3. No campo de imagem, clique em **"Escolher foto"** ou arraste uma imagem
4. A imagem deve fazer upload e aparecer como preview
5. Salve o produto — a URL vai para a planilha normalmente

## Custos

| Recurso | Free | Se ultrapassar |
|---------|------|---------------|
| Armazenamento | 10 GB/mês | $0,015/GB |
| Operações de upload | 1 milhão/mês | $4,50/milhão |
| Operações de download | 10 milhões/mês | $0,36/milhão |
| Banda (entrega) | **GRÁTIS** | **GRÁTIS** |

**Madame Luxo (200 fotos):** ~$0/mês (dentro do free tier)

## Estrutura de pastas no R2

```
madame-luxo-produtos/
└── produtos/
    ├── 1234567890-abcdef.jpg
    ├── 1234567891-ghijkl.png
    └── ...
```

## Segurança

⚠️ **IMPORTANTE:** O `SECRET_ACCESS_KEY` dá acesso ao seu bucket. Nunca:
- Compartilhe em repositórios públicos
- Envie por email ou WhatsApp
- Deixe visível no código se for repositório público

Para repositórios públicos (GitHub), use variáveis de ambiente ou remova as credenciais antes de fazer commit.

## Suporte

Se tiver problemas:
1. Verifique se as credenciais estão corretas
2. Verifique se o bucket tem acesso público habilitado
3. Teste no console do navegador (F12 → Console)
4. Verifique a aba "Network" para ver o erro da requisição
