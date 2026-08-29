// Google Workspace API helper functions for Drive, Sheets, Docs, and Meet

export interface WorkspaceExportResult {
  id: string;
  url: string;
}

// 1. Google Docs: Export Writing Essay Feedback to Google Docs
export async function createIeltsDocInGoogleDocs(
  accessToken: string,
  title: string,
  contentMarkdownOrText: string
): Promise<WorkspaceExportResult> {
  // First create a document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi kết nối Google Docs (${createRes.status}): ${createRes.statusText}`);
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  // Insert text into the document
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: `${title}\n\n${contentMarkdownOrText}`
          }
        }
      ]
    })
  });

  if (!updateRes.ok) {
    console.warn("Could not insert text into doc, but document was created.");
  }

  return {
    id: documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`
  };
}

// Helper to format writing evaluation into a comprehensive report for Google Docs
export function formatWritingFeedbackReport(data: {
  taskTitle: string;
  taskLabel: string;
  bandScore: number;
  essayText: string;
  generalVerdict?: string;
  criteria?: { name: string; score: number; comment: string }[];
  errors?: { original_text: string; corrected_text: string; error_type: string; explanation: string; grammar_rule?: string }[];
  upgrades?: { original_sentence: string; upgraded_sentence: string; explanation: string }[];
  band8Essay?: { full_essay: string; why_band8_explanation: string; key_vocabulary_used?: { word: string; meaning: string }[] };
}): string {
  const lines: string[] = [];
  const dateStr = new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  lines.push(`========================================================================`);
  lines.push(`IELTS WRITING AI EVALUATION & CORRECTION REPORT`);
  lines.push(`Thời gian chấm: ${dateStr}`);
  lines.push(`Dạng bài: ${data.taskLabel}`);
  lines.push(`Ước tính Band Score: BAND ${data.bandScore.toFixed(1)} / 9.0`);
  lines.push(`========================================================================\n`);

  lines.push(`📌 ĐỀ BÀI (PROMPT / TOPIC):`);
  lines.push(`${data.taskTitle}\n`);

  lines.push(`📝 BÀI VIẾT CỦA THÍ SINH:`);
  lines.push(`${data.essayText}\n`);
  lines.push(`------------------------------------------------------------------------\n`);

  if (data.generalVerdict) {
    lines.push(`🎯 NHẬN XÉT TỔNG QUAN CỦA GIÁM KHẢO:`);
    lines.push(`${data.generalVerdict}\n`);
  }

  if (data.criteria && data.criteria.length > 0) {
    lines.push(`📊 ĐÁNH GIÁ CHI TIẾT 4 TIÊU CHÍ (IELTS OFFICIAL BAND DESCRIPTORS):`);
    data.criteria.forEach((c, idx) => {
      lines.push(`\n${idx + 1}. ${c.name.toUpperCase()} (Band ${typeof c.score === 'number' ? c.score.toFixed(1) : c.score})`);
      lines.push(`   ${c.comment}`);
    });
    lines.push(`\n------------------------------------------------------------------------\n`);
  }

  if (data.errors && data.errors.length > 0) {
    lines.push(`🔍 CHI TIẾT SỬA LỖI NGỮ PHÁP & TỪ VỰNG (${data.errors.length} lỗi phát hiện):`);
    data.errors.forEach((err, idx) => {
      lines.push(`\n[Lỗi #${idx + 1}] Loại lỗi: ${err.error_type}`);
      lines.push(`  • Đoạn gốc:     "${err.original_text}"`);
      lines.push(`  • Sửa chuẩn:    "${err.corrected_text}"`);
      lines.push(`  • Giải thích:   ${err.explanation}`);
      if (err.grammar_rule) {
        lines.push(`  • Quy tắc:      ${err.grammar_rule}`);
      }
    });
    lines.push(`\n------------------------------------------------------------------------\n`);
  }

  if (data.upgrades && data.upgrades.length > 0) {
    lines.push(`🚀 ĐỀ XUẤT NÂNG CẤP CÂU LÊN BAND 8.0+:`);
    data.upgrades.forEach((up, idx) => {
      lines.push(`\n[Nâng cấp #${idx + 1}]`);
      lines.push(`  • Câu gốc:      "${up.original_sentence}"`);
      lines.push(`  • Câu nâng cấp: "${up.upgraded_sentence}"`);
      lines.push(`  • Lý do:        ${up.explanation}`);
    });
    lines.push(`\n------------------------------------------------------------------------\n`);
  }

  if (data.band8Essay && data.band8Essay.full_essay) {
    lines.push(`⭐ BÀI MẪU NÂNG CAO BAND 8.5 - 9.0 THAM KHẢO:`);
    lines.push(`${data.band8Essay.full_essay}\n`);
    if (data.band8Essay.why_band8_explanation) {
      lines.push(`💡 Phân tích vì sao bài đạt Band cao:`);
      lines.push(`${data.band8Essay.why_band8_explanation}\n`);
    }
    if (data.band8Essay.key_vocabulary_used && data.band8Essay.key_vocabulary_used.length > 0) {
      lines.push(`📚 Từ vựng / Collocations nổi bật trong bài mẫu:`);
      data.band8Essay.key_vocabulary_used.forEach(kv => {
        lines.push(`  • ${kv.word}: ${kv.meaning}`);
      });
    }
  }

  lines.push(`\n========================================================================`);
  lines.push(`IELTS AI Master Suite • Chúc bạn đạt mục tiêu Target Band mong muốn!`);
  lines.push(`========================================================================`);

  return lines.join('\n');
}

// 2. Google Sheets: Export Vocabulary Bank or Test Scores to Google Sheets
export async function createVocabSheetInGoogleSheets(
  accessToken: string,
  title: string,
  rows: string[][]
): Promise<WorkspaceExportResult> {
  const sheetTitle = "IELTS_Vocabulary";

  // 1. Create spreadsheet with explicitly named sheet "IELTS_Vocabulary" and frozen header row
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: sheetTitle,
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi kết nối Google Sheets (${createRes.status}): ${createRes.statusText}`);
  }

  const sheet = await createRes.json();
  const spreadsheetId = sheet.spreadsheetId;

  // 2. Write data directly via values.update (PUT)
  if (rows && rows.length > 0) {
    let targetSheetName = sheetTitle;
    if (sheet.sheets && sheet.sheets.length > 0 && sheet.sheets[0].properties?.title) {
      targetSheetName = sheet.sheets[0].properties.title;
    }

    const range = `'${targetSheetName}'!A1`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: range,
          majorDimension: 'ROWS',
          values: rows
        })
      }
    );

    if (!updateRes.ok) {
      // Fallback: Query metadata for sheet name
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (metaRes.ok) {
        const meta = await metaRes.json();
        const fallbackTitle = meta.sheets?.[0]?.properties?.title || 'Sheet1';
        const fallbackRange = `'${fallbackTitle}'!A1`;
        const retryRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(fallbackRange)}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              range: fallbackRange,
              majorDimension: 'ROWS',
              values: rows
            })
          }
        );

        if (!retryRes.ok) {
          const retryErr = await retryRes.json().catch(() => ({}));
          throw new Error(retryErr.error?.message || `Lỗi ghi dữ liệu từ vựng vào Google Sheets (${retryRes.status})`);
        }
      } else {
        const errJson = await updateRes.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Lỗi ghi dữ liệu vào Google Sheets (${updateRes.status})`);
      }
    }

    // 3. Apply professional visual formatting (Header in Emerald Green #047857, white bold text, auto-fit columns)
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.016, green: 0.47, blue: 0.34 },
                    textFormat: {
                      bold: true,
                      foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                      fontSize: 11
                    },
                    horizontalAlignment: "CENTER",
                    verticalAlignment: "MIDDLE"
                  }
                },
                fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)"
              }
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: "COLUMNS",
                  startIndex: 0,
                  endIndex: rows[0]?.length || 6
                }
              }
            }
          ]
        })
      });
    } catch (fmtErr) {
      console.warn("Could not apply formatting to sheet:", fmtErr);
    }
  }

  return {
    id: spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
}

// 3. Google Drive: List files or Upload IELTS Prep Materials
export async function listGoogleDriveFiles(accessToken: string): Promise<any[]> {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink,iconLink)', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

// List user's Google Sheets specifically from Google Drive
export async function listUserGoogleSheets(accessToken: string): Promise<Array<{ id: string; name: string; modifiedTime?: string; webViewLink?: string }>> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=20&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,webViewLink)`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi lấy danh sách Sheets từ Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

// Extract Spreadsheet ID from standard Google Sheets URL or raw ID
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's already an ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export interface SheetVocabItem {
  word: string;
  ipa?: string;
  meaning_vi?: string;
  example_sentence?: string;
}

// Read vocabulary list from Google Sheet (via OAuth or public export)
export async function fetchVocabFromGoogleSheet(
  accessToken: string | null,
  spreadsheetIdOrUrl: string
): Promise<{ title: string; sheetName: string; words: SheetVocabItem[] }> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  if (!spreadsheetId) {
    throw new Error("Không tìm thấy ID Google Sheet hợp lệ từ đường dẫn hoặc ID bạn nhập.");
  }

  let rawValues: string[][] = [];
  let sheetTitle = "Google Sheet Vocabulary";
  let firstSheetName = "Sheet1";

  // Attempt 1: Using OAuth Token if available
  if (accessToken) {
    try {
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (metaRes.ok) {
        const meta = await metaRes.json();
        sheetTitle = meta.properties?.title || sheetTitle;
        if (meta.sheets && meta.sheets.length > 0) {
          firstSheetName = meta.sheets[0].properties?.title || 'Sheet1';
        }

        const dataRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`'${firstSheetName}'!A1:Z200`)}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        if (dataRes.ok) {
          const dataJson = await dataRes.json();
          rawValues = dataJson.values || [];
        }
      }
    } catch (authErr) {
      console.warn("Could not read sheet via authenticated API, trying public export CSV fallback:", authErr);
    }
  }

  // Attempt 2: If no data yet, try public CSV export / gviz endpoint
  if (rawValues.length === 0) {
    try {
      const csvRes = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`);
      if (csvRes.ok) {
        const csvText = await csvRes.text();
        // Parse CSV into rows
        const rows = csvText.split(/\r?\n/).filter(line => line.trim().length > 0).map(line => {
          // simple CSV tokenizer handling quotes
          const cells: string[] = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
              cells.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
              cur = '';
            } else {
              cur += ch;
            }
          }
          cells.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          return cells;
        });
        rawValues = rows;
      }
    } catch (csvErr) {
      console.warn("Public CSV fetch error:", csvErr);
    }
  }

  if (rawValues.length === 0) {
    throw new Error("Không thể tải dữ liệu từ Google Sheet này. Hãy đảm bảo bạn đã đăng nhập tài khoản Google có quyền truy cập bảng tính, hoặc bảng tính đã được mở quyền 'Bất kỳ ai có liên kết' (Anyone with link).");
  }

  // Parse columns: identify header row
  let headerRowIndex = -1;
  let wordColIdx = 0;
  let ipaColIdx = -1;
  let meaningColIdx = -1;
  let exampleColIdx = -1;

  for (let r = 0; r < Math.min(rawValues.length, 5); r++) {
    const row = rawValues[r].map(c => c.toLowerCase());
    const hasWordHeader = row.some(c => c.includes('từ') || c.includes('word') || c.includes('vocab') || c.includes('target') || c.includes('thuật ngữ'));
    const hasMeaningHeader = row.some(c => c.includes('nghĩa') || c.includes('meaning') || c.includes('định nghĩa') || c.includes('dịch'));
    if (hasWordHeader || hasMeaningHeader) {
      headerRowIndex = r;
      row.forEach((col, idx) => {
        if (col.includes('từ') || col.includes('word') || col.includes('vocab') || col.includes('thuật ngữ')) {
          if (!col.includes('nghĩa') && !col.includes('loại')) wordColIdx = idx;
        } else if (col.includes('ipa') || col.includes('phiên âm') || col.includes('pronunciation')) {
          ipaColIdx = idx;
        } else if (col.includes('nghĩa') || col.includes('meaning') || col.includes('định nghĩa') || col.includes('giải thích')) {
          meaningColIdx = idx;
        } else if (col.includes('ví dụ') || col.includes('example') || col.includes('câu')) {
          exampleColIdx = idx;
        }
      });
      break;
    }
  }

  // If no header found, guess based on row 0 structure
  const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
  const parsedWords: SheetVocabItem[] = [];

  for (let r = startRow; r < rawValues.length; r++) {
    const row = rawValues[r];
    if (!row || row.length === 0) continue;

    // Check if row[0] is just a number (STT)
    let actualWordIdx = wordColIdx;
    if (headerRowIndex === -1 && /^\d+$/.test(row[0]?.trim()) && row.length > 1) {
      actualWordIdx = 1;
      if (meaningColIdx === -1 && row.length > 2) meaningColIdx = 2;
    }

    const word = row[actualWordIdx]?.trim();
    if (!word || word.length < 2) continue;
    // Skip if it looks like header row repeated
    if (word.toLowerCase() === 'word' || word.toLowerCase() === 'từ vựng' || word.toLowerCase() === 'stt') continue;

    let ipa = ipaColIdx >= 0 ? row[ipaColIdx]?.trim() : '';
    let meaning = meaningColIdx >= 0 ? row[meaningColIdx]?.trim() : '';
    let example = exampleColIdx >= 0 ? row[exampleColIdx]?.trim() : '';

    // Smart fallback if indices weren't found
    if (!meaning) {
      if (row.length > actualWordIdx + 1 && row[actualWordIdx + 1]?.trim()) {
        const nextCell = row[actualWordIdx + 1]?.trim();
        if (nextCell.startsWith('/') && nextCell.endsWith('/')) {
          ipa = nextCell;
          if (row.length > actualWordIdx + 2) meaning = row[actualWordIdx + 2]?.trim();
        } else {
          meaning = nextCell;
        }
      }
    }

    if (!example && row.length > 3) {
      const candidateEx = row[row.length - 1]?.trim();
      if (candidateEx && candidateEx !== meaning && candidateEx !== word) {
        example = candidateEx;
      }
    }

    parsedWords.push({
      word,
      ipa,
      meaning_vi: meaning,
      example_sentence: example
    });
  }

  if (parsedWords.length === 0) {
    throw new Error("Không tìm thấy danh sách từ vựng hợp lệ trong Google Sheet. Hãy kiểm tra lại cấu trúc các cột (Từ vựng, Nghĩa tiếng Việt, Phiên âm, Ví dụ).");
  }

  return {
    title: sheetTitle,
    sheetName: firstSheetName,
    words: parsedWords
  };
}

// 4. Google Meet: Create a Speaking Practice Meeting Space
export async function createGoogleMeetSpace(
  accessToken: string
): Promise<{ spaceName: string; meetingUri: string; meetingCode: string }> {
  try {
    const res = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (res.ok) {
      const data = await res.json();
      const uri = data.meetingUri || (data.name ? `https://meet.google.com/${data.name.replace('spaces/', '')}` : 'https://meet.google.com/new');
      const code = data.meetingCode || (data.name ? data.name.replace('spaces/', '') : uri.split('/').pop() || 'ielts-speaking');
      return {
        spaceName: data.name || 'IELTS Speaking Room',
        meetingUri: uri,
        meetingCode: code
      };
    }
  } catch (e) {
    console.warn("Could not create via v2 spaces API, falling back to direct meet URI", e);
  }

  // Fallback to Google Meet new meeting room
  const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
  return {
    spaceName: 'IELTS Speaking Practice Room',
    meetingUri: `https://meet.google.com/${randomCode}`,
    meetingCode: randomCode
  };
}
