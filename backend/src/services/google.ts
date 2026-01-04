import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/integrations/google/callback';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function getGoogleAuthUrl(userId: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || '',
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    state: userId,
    prompt: 'consent',
  });

  return `${GOOGLE_AUTH_URL}?${params}`;
}

export async function handleGoogleCallback(code: string, userId: string): Promise<void> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google credentials not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google token error:', error);
    throw new Error('Failed to exchange Google code for token');
  }

  const data = await response.json();

  await prisma.user.update({
    where: { id: userId },
    data: {
      googleToken: data.access_token,
    },
  });
}

export async function getGoogleDocs(accessToken: string): Promise<any[]> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'&fields=files(id,name,modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Google Docs');
  }

  const data = await response.json();
  return data.files || [];
}

export async function getGoogleSheets(accessToken: string): Promise<any[]> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Google Sheets');
  }

  const data = await response.json();
  return data.files || [];
}

export async function importGoogleDoc(
  docId: string,
  accessToken: string
): Promise<{ title: string; content: string }> {
  // Get document metadata
  const metaResponse = await fetch(
    `https://docs.googleapis.com/v1/documents/${docId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!metaResponse.ok) {
    throw new Error('Failed to fetch document');
  }

  const doc = await metaResponse.json();

  // Extract text from document structure
  let content = '';
  
  function extractText(element: any): string {
    if (element.textRun?.content) {
      return element.textRun.content;
    }
    if (element.paragraph?.elements) {
      return element.paragraph.elements.map(extractText).join('');
    }
    if (element.table) {
      return element.table.tableRows
        ?.map((row: any) =>
          row.tableCells
            ?.map((cell: any) =>
              cell.content?.map((c: any) => extractText(c)).join('')
            )
            .join('\t')
        )
        .join('\n');
    }
    return '';
  }

  if (doc.body?.content) {
    content = doc.body.content.map(extractText).join('');
  }

  return {
    title: doc.title || 'Untitled Document',
    content: content.trim(),
  };
}

export async function importGoogleSheet(
  sheetId: string,
  accessToken: string
): Promise<{ title: string; content: string }> {
  // Get spreadsheet metadata and values
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?includeGridData=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch spreadsheet');
  }

  const sheet = await response.json();

  // Extract data from all sheets
  let content = '';

  sheet.sheets?.forEach((s: any) => {
    content += `## ${s.properties?.title || 'Sheet'}\n\n`;

    s.data?.[0]?.rowData?.forEach((row: any) => {
      const cells = row.values
        ?.map((cell: any) => cell.formattedValue || '')
        .join('\t');
      if (cells?.trim()) {
        content += cells + '\n';
      }
    });

    content += '\n';
  });

  return {
    title: sheet.properties?.title || 'Untitled Spreadsheet',
    content: content.trim(),
  };
}
