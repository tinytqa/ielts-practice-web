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
    throw new Error(err.error?.message || `Google Docs error: ${createRes.statusText}`);
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

// 2. Google Sheets: Export Vocabulary Bank or Test Scores to Google Sheets
export async function createVocabSheetInGoogleSheets(
  accessToken: string,
  title: string,
  rows: string[][]
): Promise<WorkspaceExportResult> {
  // Create spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Sheets error: ${createRes.statusText}`);
  }

  const sheet = await createRes.json();
  const spreadsheetId = sheet.spreadsheetId;

  // Populate data
  if (rows && rows.length > 0) {
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: rows
        })
      }
    );

    if (!appendRes.ok) {
      console.warn("Could not append rows to spreadsheet.");
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

// 4. Google Meet: Create a Speaking Practice Meeting Space
export async function createGoogleMeetSpace(
  accessToken: string
): Promise<{ spaceName: string; meetingUri: string }> {
  const res = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Meet error: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    spaceName: data.name,
    meetingUri: data.meetingUri
  };
}
