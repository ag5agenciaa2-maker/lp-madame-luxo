/**
 * GOOGLE APPS SCRIPT - MADAME LUXO (VERSÃO COMPLETA)
 * 
 * Este arquivo contém:
 * 1. Seu código original (planilha, histórico, etc.)
 * 2. NOVO: Upload de imagens para Cloudflare R2
 * 
 * INSTRUÇÕES:
 * 1. Copie TODO este código
 * 2. Cole no editor do Apps Script (substitua tudo)
 * 3. Salve (Ctrl+S)
 * 4. Faça novo deploy (Deploy → New deployment → Web app)
 * 5. Atualize a URL no adm-catalogo.js se necessário
 */

// ============================================
// HANDLER PRINCIPAL - POST
// ============================================
function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '';
    var data;
    try { data = JSON.parse(raw); }
    catch(ex) { data = JSON.parse(e.parameter.payload || '{}'); }

    // ============================================
    // NOVO: Upload para R2 (processa primeiro)
    // ============================================
    if (data.action === 'upload_r2') {
      return handleR2Upload(data);
    }

    // ============================================
    // SEU CÓDIGO EXISTENTE (PLANILHA)
    // ============================================
    var ss = SpreadsheetApp.openById('13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA');
    var sheet = ss.getSheets()[0];

    if (data.action === 'update_skip_desconto') {
      sheet.getRange(data.row, 1, 1, data.valuesSemDesconto.length)
           .setValues([data.valuesSemDesconto]);
      sheet.getRange(data.row, 16, 1, data.valuesAposDesconto.length)
           .setValues([data.valuesAposDesconto]);

    } else if (data.action === 'update') {
      sheet.getRange(data.row, 1, 1, data.values.length)
           .setValues([data.values]);

    } else if (data.action === 'append') {
      sheet.appendRow(data.values);
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 13, 1, 2).setNumberFormat('R$ #.##0,00');
      sheet.getRange(lastRow, 15).setFormula('=((M'+lastRow+'-N'+lastRow+')/M'+lastRow+')');
      sheet.getRange(lastRow, 15).setNumberFormat('0%');

    } else if (data.action === 'delete_row') {
      sheet.deleteRow(parseInt(data.row));

    } else if (data.action === 'append_historico') {
      var hSheet = ss.getSheetByName('Histórico');
      if (!hSheet) {
        hSheet = ss.insertSheet('Histórico');
        hSheet.getRange(1,1,1,4).setValues([['Data','Ação','Produto','Detalhe']]);
        hSheet.getRange(1,1,1,4).setFontWeight('bold');
        hSheet.setFrozenRows(1);
      }
      var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
      hSheet.insertRowAfter(1);
      hSheet.getRange(2,1,1,4).setValues([[now, data.tipo, data.produto, data.detalhe]]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// HANDLER PRINCIPAL - GET
// ============================================
function doGet(e) {
  try {
    var action = e.parameter.action;
    var ss = SpreadsheetApp.openById('13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA');

    if (action === 'get_historico') {
      var hSheet = ss.getSheetByName('Histórico');
      if (!hSheet || hSheet.getLastRow() < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, rows: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var rows = hSheet.getRange(2, 1, hSheet.getLastRow() - 1, 4).getValues();
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, rows: rows }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Ação desconhecida' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// NOVO: UPLOAD PARA CLOUDFLARE R2
// ============================================

/**
 * Processa o upload de imagem para Cloudflare R2
 * Recebe Base64 do painel admin, faz upload para R2, retorna URL pública
 */
function handleR2Upload(payload) {
  try {
    var filename = payload.filename;
    var base64Data = payload.data;
    var mimeType = payload.mimeType;
    var r2Config = payload.r2Config;
    
    // Validações
    if (!filename || !base64Data || !r2Config) {
      throw new Error('Parâmetros incompletos: filename, data e r2Config são obrigatórios');
    }
    
    var accountId = r2Config.accountId;
    var accessKeyId = r2Config.accessKeyId;
    var secretAccessKey = r2Config.secretAccessKey;
    var bucketName = r2Config.bucketName;
    var publicUrl = r2Config.publicUrl;
    
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Configuração R2 incompleta');
    }
    
    // Decodifica Base64 para bytes
    var decodedBytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decodedBytes, mimeType, filename);
    
    // Prepara data e headers para assinatura AWS V4
    var date = new Date();
    var dateStamp = Utilities.formatDate(date, 'GMT', 'yyyyMMdd');
    var amzDate = Utilities.formatDate(date, 'GMT', "yyyyMMdd'T'HHmmss'Z'");
    var region = 'auto';
    var service = 's3';
    var host = accountId + '.r2.cloudflarestorage.com';
    var endpoint = 'https://' + host + '/' + bucketName + '/' + filename;
    
    // Payload hash (UNSIGNED-PAYLOAD para PUT direto)
    var payloadHash = 'UNSIGNED-PAYLOAD';
    
    // Headers
    var headers = {
      'Host': host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      'Content-Type': mimeType
    };
    
    // Gera assinatura AWS Signature V4
    var signature = generateAWSSignature(
      secretAccessKey,
      dateStamp,
      region,
      service,
      'PUT',
      '/' + bucketName + '/' + filename,
      headers,
      payloadHash
    );
    
    // Authorization header
    var credential = accessKeyId + '/' + dateStamp + '/' + region + '/' + service + '/aws4_request';
    var signedHeaders = Object.keys(headers).map(function(k) { return k.toLowerCase(); }).sort().join(';');
    headers['Authorization'] = 'AWS4-HMAC-SHA256 Credential=' + credential + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;
    
    // Faz o upload para R2
    var options = {
      method: 'PUT',
      headers: headers,
      payload: blob.getBytes(),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(endpoint, options);
    
    if (response.getResponseCode() !== 200) {
      throw new Error('R2 retornou ' + response.getResponseCode() + ': ' + response.getContentText());
    }
    
    // Retorna a URL pública
    var fileUrl = publicUrl ? publicUrl + '/' + filename : endpoint;
    
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
  // Canonical headers
  var headerKeys = Object.keys(headers).map(function(k) { return k.toLowerCase(); }).sort();
  var canonicalHeaders = headerKeys.map(function(k) {
    var originalKey = Object.keys(headers).find(function(h) { return h.toLowerCase() === k; });
    return k + ':' + headers[originalKey].trim();
  }).join('\n') + '\n';
  
  var signedHeaders = headerKeys.join(';');
  
  // Canonical request
  var canonicalRequest = [
    method,
    canonicalUri,
    '', // query string (vazio)
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // String to sign
  var algorithm = 'AWS4-HMAC-SHA256';
  var amzDate = headers['x-amz-date'];
  var credentialScope = dateStamp + '/' + region + '/' + service + '/aws4_request';
  
  var canonicalRequestHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, canonicalRequest, Utilities.Charset.UTF_8);
  var canonicalRequestHashHex = canonicalRequestHash.map(function(b) {
    return (b < 0 ? b + 256 : b).toString(16).padStart(2, '0');
  }).join('');
  
  var stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHashHex
  ].join('\n');
  
  // Signing key
  var kDate = hmacSha256('AWS4' + secretKey, dateStamp);
  var kRegion = hmacSha256(kDate, region);
  var kService = hmacSha256(kRegion, service);
  var kSigning = hmacSha256(kService, 'aws4_request');
  
  // Signature
  var signatureBytes = hmacSha256(kSigning, stringToSign);
  var signature = signatureBytes.map(function(b) {
    return (b < 0 ? b + 256 : b).toString(16).padStart(2, '0');
  }).join('');
  
  return signature;
}

/**
 * HMAC-SHA256 helper
 * key pode ser string ou number[] (retorno de chamada anterior)
 * message deve ser string
 */
function hmacSha256(key, message) {
  var keyBytes;
  if (typeof key === 'string') {
    keyBytes = Utilities.newBlob(key).getBytes();
  } else {
    // number[] → converte para byte[] assinado que o Apps Script aceita
    keyBytes = key.map(function(b) { return b > 127 ? b - 256 : b; });
  }
  var msgBytes = Utilities.newBlob(message).getBytes();
  return Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, msgBytes, keyBytes);
}
