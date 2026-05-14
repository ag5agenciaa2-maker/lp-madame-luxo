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
    // NOVO: Upload / Delete R2 (processa primeiro)
    // ============================================
    if (data.action === 'upload_r2') {
      return handleR2Upload(data);
    }
    if (data.action === 'delete_r2') {
      return handleR2Delete(data);
    }
    if (data.action === 'set_validation') {
      return handleSetValidation(data);
    }
    if (data.action === 'bulk_remove_option') {
      return handleBulkRemoveOption(data);
    }

    // ============================================
    // SEU CÓDIGO EXISTENTE (PLANILHA)
    // ============================================
    var ss = SpreadsheetApp.openById('13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA');
    var sheet = ss.getSheets()[0];

    if (data.action === 'update_skip_desconto') {
      // Planilha (24 colunas): A..U = sem desconto (21 cols), V = desconto (fórmula),
      // W..X = forma de pagamento + status (após desconto).
      sheet.getRange(data.row, 1, 1, data.valuesSemDesconto.length)
           .setValues([data.valuesSemDesconto]);
      sheet.getRange(data.row, 23, 1, data.valuesAposDesconto.length)
           .setValues([data.valuesAposDesconto]);
      // Reaplica formato BRL nas colunas T (Preço De) e U (Preço Por) — protege contra
      // a célula ter sido formatada manualmente como "#.##0,0000" ou similar.
      sheet.getRange(data.row, 20, 1, 2).setNumberFormat('[$R$ ]#,##0.00');

    } else if (data.action === 'update') {
      sheet.getRange(data.row, 1, 1, data.values.length)
           .setValues([data.values]);
      // Reaplica formato BRL em T e U (defensivo).
      sheet.getRange(data.row, 20, 1, 2).setNumberFormat('[$R$ ]#,##0.00');

    } else if (data.action === 'append') {
      // Garante o header da coluna Y "Data Criação" antes do append (idempotente).
      ensureDataCriacaoHeader(sheet);

      sheet.appendRow(data.values);
      var lastRow = sheet.getLastRow();
      // Formata Preço De (T=20) e Preço Por (U=21) como Moeda BRL (formato nativo
      // do Sheets — mesmo que o menu "Formatar → Número → Moeda → BRL" aplica).
      sheet.getRange(lastRow, 20, 1, 2).setNumberFormat('[$R$ ]#,##0.00');
      // Coluna V (22) = Desconto: fórmula ((T-U)/T) formatada como porcentagem.
      // IFERROR envolve só pra evitar #DIV/0! visual quando T (PreçoDe) está vazio.
      // O site público trata célula vazia ocultando o badge automaticamente.
      sheet.getRange(lastRow, 22).setFormula('=IFERROR((T'+lastRow+'-U'+lastRow+')/T'+lastRow+',"")');
      sheet.getRange(lastRow, 22).setNumberFormat('0%');
      // Coluna Y (25) = Data de criação. Preenchida automaticamente no momento do create.
      // Formato: dd/MM/yyyy HH:mm (timezone do projeto Apps Script).
      var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
      sheet.getRange(lastRow, 25).setValue(nowStr);

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
// VALIDAÇÃO DE DADOS (DROPDOWN NA PLANILHA)
// ============================================

/**
 * Atualiza a validação de dados (dropdown da célula) de uma coluna inteira da planilha.
 * Recebe { column: 'C', values: ['Vestidos','Blusas',...] }.
 * Aplica em C2:C1000 (mil linhas pré-validadas, pula o cabeçalho).
 */
function handleSetValidation(payload) {
  try {
    var columnLetter = (payload.column || '').toUpperCase();
    var values = payload.values || [];

    if (!/^[A-Z]$/.test(columnLetter)) {
      throw new Error('Coluna inválida (esperado letra A-Z): ' + columnLetter);
    }
    if (!Array.isArray(values)) {
      throw new Error('values deve ser um array');
    }

    var ss = SpreadsheetApp.openById('13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA');
    var sheet = ss.getSheets()[0];
    var range = sheet.getRange(columnLetter + '2:' + columnLetter + '1000');

    // Deduplica, remove vazios e itens que vieram já em CSV (split por vírgula),
    // ordena. Isso garante que o dropdown nativo tenha SÓ os valores individuais
    // (sem opções "Plus Size, Acessórios" gigantes que viriam por engano).
    var unique = [];
    var seen = {};
    values.forEach(function(v) {
      var raw = (v == null ? '' : String(v));
      // Divide por vírgula/ponto-e-vírgula/pipe — protege contra strings CSV
      // entrando como opção única do dropdown.
      raw.split(/[,;|]/).forEach(function(p) {
        var s = p.trim();
        if (s && !seen[s.toLowerCase()]) {
          seen[s.toLowerCase()] = true;
          unique.push(s);
        }
      });
    });
    unique.sort(function(a, b) { return a.localeCompare(b, 'pt-BR'); });

    if (unique.length === 0) {
      range.clearDataValidations();
    } else {
      // requireValueInList + setAllowInvalid(true):
      //  - mostra a seta de dropdown nativo na célula (pra escolher rápido)
      //  - permite valor fora da lista sem bloquear a edição (essencial pra CSV
      //    como "Shorts, Bermudas" — fica só com triângulo de aviso, salva normal)
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(unique, true)
        .setAllowInvalid(true)
        .build();
      range.setDataValidation(rule);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true, column: columnLetter, count: unique.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// HEADER DA COLUNA Y (Data Criação) — idempotente
// ============================================
/**
 * Garante que a coluna Y (25) tenha o header "Data Criação".
 * Procura a linha de cabeçalho (a primeira linha que contém "Categoria" + "ID/Nome")
 * e escreve o header em Y dessa linha se estiver vazio.
 * Idempotente: chamada várias vezes não duplica nem sobrescreve.
 */
function ensureDataCriacaoHeader(sheet) {
  try {
    // Acha a linha de header lendo as primeiras 5 linhas da coluna A-X.
    var lastRow = sheet.getLastRow();
    if (lastRow < 1) {
      sheet.getRange(1, 25).setValue('Data Criação');
      return;
    }
    var maxScan = Math.min(5, lastRow);
    var head = sheet.getRange(1, 1, maxScan, 24).getValues();
    var headerRow = 0;
    for (var i = 0; i < head.length; i++) {
      var joined = head[i].join(' ').toLowerCase();
      if (joined.indexOf('categoria') !== -1 && (joined.indexOf('id') !== -1 || joined.indexOf('nome') !== -1)) {
        headerRow = i + 1;
        break;
      }
    }
    if (!headerRow) headerRow = 2; // fallback
    var atual = sheet.getRange(headerRow, 25).getValue();
    if (!atual || String(atual).trim() === '') {
      sheet.getRange(headerRow, 25).setValue('Data Criação');
      // Replica formatação do header (bold) se conseguir.
      try {
        var sample = sheet.getRange(headerRow, 1);
        sheet.getRange(headerRow, 25).setFontWeight(sample.getFontWeight() || 'bold');
      } catch (_) { /* ignora estilo se não der */ }
    }
  } catch (e) {
    // best-effort: não bloqueia o append se algo falhar
  }
}

// ============================================
// REMOÇÃO EM MASSA DE UMA OPÇÃO (categoria/tipo)
// ============================================
/**
 * Lê a coluna inteira (C ou D), remove o valor `option` de cada célula CSV
 * sem tocar nos outros valores, e regrava só as células que mudaram.
 *
 * Recebe { column: 'C'|'D', option: 'TESTE' }.
 *
 * Vantagens sobre o loop client-side:
 *  - Atômico: lê o estado real da planilha (não confia em cache do navegador).
 *  - Só toca nas células que realmente mudam (preserva o resto).
 *  - Sem race condition entre N requisições.
 */
function handleBulkRemoveOption(payload) {
  try {
    var columnLetter = (payload.column || '').toUpperCase();
    var option = (payload.option || '').trim();

    if (!/^[CD]$/.test(columnLetter)) {
      throw new Error('Coluna inválida (esperado C ou D): ' + columnLetter);
    }
    if (!option) {
      throw new Error('option vazia');
    }

    var ss = SpreadsheetApp.openById('13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA');
    var sheet = ss.getSheets()[0];
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true, updated: 0, note: 'planilha vazia'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Lê todas as células da coluna a partir da linha 2 (pula header).
    var range = sheet.getRange(columnLetter + '2:' + columnLetter + lastRow);
    var values = range.getValues(); // [[val], [val], ...]

    var norm = function(s) {
      return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    };
    var optionNorm = norm(option);

    var updatedCount = 0;
    var alteredRows = []; // [{row:N, before:'x', after:'y'}]

    for (var i = 0; i < values.length; i++) {
      var original = values[i][0];
      if (original == null || original === '') continue;
      var str = String(original);
      // Quebra por vírgula, ponto-e-vírgula ou pipe.
      var partes = str.split(/[,;|]/).map(function(p) { return p.trim(); }).filter(Boolean);
      // Remove apenas o item que bate exatamente (normalizado).
      var filtradas = partes.filter(function(p) { return norm(p) !== optionNorm; });

      if (filtradas.length !== partes.length) {
        var novo = filtradas.join(', ');
        values[i][0] = novo;
        updatedCount++;
        alteredRows.push({ row: i + 2, before: str, after: novo });
      }
    }

    // Só regrava se houve mudança (evita escrita desnecessária).
    if (updatedCount > 0) {
      range.setValues(values);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      column: columnLetter,
      option: option,
      updated: updatedCount,
      details: alteredRows
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
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

    if (!filename || !base64Data) {
      throw new Error('Parâmetros incompletos: filename e data são obrigatórios');
    }

    // Credenciais vêm das Script Properties (Projeto → Configurações → Propriedades do script)
    var props = PropertiesService.getScriptProperties();
    var accountId       = props.getProperty('R2_ACCOUNT_ID');
    var accessKeyId     = props.getProperty('R2_ACCESS_KEY_ID');
    var secretAccessKey = props.getProperty('R2_SECRET_ACCESS_KEY');
    var bucketName      = props.getProperty('R2_BUCKET_NAME');
    var publicUrl       = props.getProperty('R2_PUBLIC_URL');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Script Properties R2_* não configuradas no Apps Script');
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
    
    // Headers que entram na assinatura AWS (Host é obrigatório aqui).
    var headersToSign = {
      'host': host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      'content-type': mimeType
    };

    // Gera assinatura AWS Signature V4
    var signature = generateAWSSignature(
      secretAccessKey,
      dateStamp,
      region,
      service,
      'PUT',
      '/' + bucketName + '/' + filename,
      headersToSign,
      payloadHash
    );

    var credential = accessKeyId + '/' + dateStamp + '/' + region + '/' + service + '/aws4_request';
    var signedHeaders = Object.keys(headersToSign).sort().join(';');

    // Headers que o UrlFetchApp pode enviar (não inclui Host — o Apps Script preenche sozinho).
    var requestHeaders = {
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      'Authorization': 'AWS4-HMAC-SHA256 Credential=' + credential + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature
    };

    var options = {
      method: 'put',
      contentType: mimeType,
      headers: requestHeaders,
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
 * Deleta um objeto do R2 a partir da URL pública (ou da chave/key direta).
 * Aceita { url: 'https://pub-xxxx.r2.dev/produtos/123.webp' } ou { key: 'produtos/123.webp' }.
 * Silenciosamente ignora URLs que não pertencem ao bucket configurado (segurança).
 */
function handleR2Delete(payload) {
  try {
    var props = PropertiesService.getScriptProperties();
    var accountId       = props.getProperty('R2_ACCOUNT_ID');
    var accessKeyId     = props.getProperty('R2_ACCESS_KEY_ID');
    var secretAccessKey = props.getProperty('R2_SECRET_ACCESS_KEY');
    var bucketName      = props.getProperty('R2_BUCKET_NAME');
    var publicUrl       = props.getProperty('R2_PUBLIC_URL');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Script Properties R2_* não configuradas');
    }

    // Resolve a key (caminho dentro do bucket): aceita URL pública ou key direta.
    var key = payload.key;
    if (!key && payload.url) {
      // Só aceita URLs do bucket configurado — evita ataque de deletar arquivo arbitrário.
      if (publicUrl && payload.url.indexOf(publicUrl) === 0) {
        key = payload.url.substring(publicUrl.length).replace(/^\//, '');
      }
    }

    if (!key) {
      // URL fora do bucket → não é erro, só ignora (ex.: imagem antiga de outro storage).
      return ContentService.createTextOutput(JSON.stringify({
        success: true, skipped: true, reason: 'URL fora do bucket configurado'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var date = new Date();
    var dateStamp = Utilities.formatDate(date, 'GMT', 'yyyyMMdd');
    var amzDate = Utilities.formatDate(date, 'GMT', "yyyyMMdd'T'HHmmss'Z'");
    var region = 'auto';
    var service = 's3';
    var host = accountId + '.r2.cloudflarestorage.com';
    var endpoint = 'https://' + host + '/' + bucketName + '/' + key;
    var payloadHash = 'UNSIGNED-PAYLOAD';

    var headersToSign = {
      'host': host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate
    };

    var signature = generateAWSSignature(
      secretAccessKey, dateStamp, region, service,
      'DELETE', '/' + bucketName + '/' + key,
      headersToSign, payloadHash
    );

    var credential = accessKeyId + '/' + dateStamp + '/' + region + '/' + service + '/aws4_request';
    var signedHeaders = Object.keys(headersToSign).sort().join(';');

    var response = UrlFetchApp.fetch(endpoint, {
      method: 'delete',
      headers: {
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
        'Authorization': 'AWS4-HMAC-SHA256 Credential=' + credential + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature
      },
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    // S3/R2 retorna 204 No Content em sucesso. 404 também tratamos como sucesso (já estava apagado).
    if (code !== 204 && code !== 200 && code !== 404) {
      throw new Error('R2 retornou ' + code + ': ' + response.getContentText());
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true, deleted: key
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: error.toString()
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
