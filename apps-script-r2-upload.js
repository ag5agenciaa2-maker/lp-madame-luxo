/**
 * FUNÇÃO PARA GOOGLE APPS SCRIPT - MADAME LUXO
 * 
 * INSTRUÇÕES DE INSTALAÇÃO:
 * 1. Copie TODAS as funções abaixo (exceto as que já existem no seu código)
 * 2. Cole no final do seu Apps Script existente
 * 3. Modifique o doPost() existente para incluir o upload R2 (veja exemplo abaixo)
 */

/* ============================================
   EXEMPLO DE COMO FICARÁ O SEU doPost():
   
function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '';
    var data;
    try { data = JSON.parse(raw); }
    catch(ex) { data = JSON.parse(e.parameter.payload || '{}'); }

    // NOVO: Upload para R2 (processa primeiro)
    if (data.action === 'upload_r2') {
      return handleR2Upload(data);
    }

    // SEU CÓDIGO EXISTENTE CONTINUA AQUI...
    var ss = SpreadsheetApp.openById('13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA');
    // ... resto do seu código ...

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
   ============================================ */

/**
 * Processa o upload de imagem para Cloudflare R2
 */
function handleR2Upload(payload) {
  try {
    const { filename, data, mimeType } = payload;

    if (!filename || !data) {
      throw new Error('Parâmetros incompletos: filename e data são obrigatórios');
    }

    // Credenciais ficam nas Script Properties (nunca no cliente).
    const props = PropertiesService.getScriptProperties();
    const accountId       = props.getProperty('R2_ACCOUNT_ID');
    const accessKeyId     = props.getProperty('R2_ACCESS_KEY_ID');
    const secretAccessKey = props.getProperty('R2_SECRET_ACCESS_KEY');
    const bucketName      = props.getProperty('R2_BUCKET_NAME');
    const publicUrl       = props.getProperty('R2_PUBLIC_URL');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Script Properties R2_* não configuradas no Apps Script');
    }
    
    // Decodifica Base64 para bytes
    const decodedBytes = Utilities.base64Decode(data);
    const blob = Utilities.newBlob(decodedBytes, mimeType, filename);
    
    // Gera assinatura AWS Signature V4 para upload
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${filename}`;
    const date = new Date();
    const dateStamp = formatDate(date, 'yyyyMMdd');
    const amzDate = formatDate(date, "yyyyMMdd'T'HHmmss'Z'");
    const region = 'auto';
    const service = 's3';
    
    // Headers da requisição
    const headers = {
      'Host': `${accountId}.r2.cloudflarestorage.com`,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      'x-amz-date': amzDate,
      'Content-Type': mimeType
    };
    
    // Gera a assinatura
    const signature = generateAWSSignature(
      secretAccessKey,
      dateStamp,
      region,
      service,
      'PUT',
      `/${bucketName}/${filename}`,
      headers,
      'UNSIGNED-PAYLOAD'
    );
    
    // Authorization header
    const credential = `${accessKeyId}/${dateStamp}/${region}/${service}/aws4_request`;
    const signedHeaders = Object.keys(headers).map(k => k.toLowerCase()).sort().join(';');
    headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    // Faz o upload para R2
    const options = {
      method: 'PUT',
      headers: headers,
      payload: blob.getBytes(),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(endpoint, options);
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`R2 retornou ${response.getResponseCode()}: ${response.getContentText()}`);
    }
    
    // Retorna a URL pública
    const fileUrl = publicUrl ? `${publicUrl}/${filename}` : endpoint;
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: fileUrl,
      filename: filename
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Gera assinatura AWS Signature V4
 */
function generateAWSSignature(secretKey, dateStamp, region, service, method, canonicalUri, headers, payloadHash) {
  // Canonical request
  const canonicalHeaders = Object.keys(headers)
    .map(k => k.toLowerCase() + ':' + headers[k].trim())
    .sort()
    .join('\n') + '\n';
  
  const signedHeaders = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()
    .join(';');
  
  const canonicalRequest = [
    method,
    canonicalUri,
    '', // query string (vazio)
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // String to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const amzDate = headers['x-amz-date'];
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, canonicalRequest, Utilities.Charset.UTF_8)
      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
      .join('')
  ].join('\n');
  
  // Signing key
  const kDate = hmacSha256('AWS4' + secretKey, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');
  
  // Signature
  const signature = hmacSha256(kSigning, stringToSign)
    .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
    .join('');
  
  return signature;
}

/**
 * HMAC-SHA256 helper
 */
function hmacSha256(key, message) {
  if (typeof key === 'string') {
    key = Utilities.newBlob(key).getBytes();
  }
  return Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, message, key);
}

/**
 * Formata data para string
 */
function formatDate(date, format) {
  const pad = (n) => n.toString().padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  const MM = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const HH = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  
  return format
    .replace('yyyy', yyyy)
    .replace('MM', MM)
    .replace('dd', dd)
    .replace('HH', HH)
    .replace('mm', mm)
    .replace('ss', ss);
}
