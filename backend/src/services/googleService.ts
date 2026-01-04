import { google } from 'googleapis';
import { logger } from '../utils/logger';

export class GoogleService {
  private static sheets: any;
  private static docs: any;

  static initialize() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/documents.readonly',
      ],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.docs = google.docs({ version: 'v1', auth });
  }

  static async getSheetData(sheetId: string): Promise<string> {
    try {
      if (!this.sheets) {
        this.initialize();
      }

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        includeGridData: true,
      });

      const sheets = response.data.sheets || [];
      const textParts: string[] = [];

      for (const sheet of sheets) {
        const title = sheet.properties?.title || 'Sheet';
        textParts.push(`Sheet: ${title}`);

        const rows = sheet.data?.[0]?.rowData || [];
        for (const row of rows) {
          const values = row.values?.map((cell: any) => cell.formattedValue || '').join('\t') || '';
          if (values.trim()) {
            textParts.push(values);
          }
        }
      }

      return textParts.join('\n');
    } catch (error) {
      logger.error('Error fetching Google Sheet:', error);
      throw error;
    }
  }

  static async getDocContent(docId: string): Promise<string> {
    try {
      if (!this.docs) {
        this.initialize();
      }

      const response = await this.docs.documents.get({
        documentId: docId,
      });

      const content = response.data.body?.content || [];
      const textParts: string[] = [];

      const extractText = (elements: any[]) => {
        for (const element of elements) {
          if (element.paragraph) {
            const paragraphText = element.paragraph.elements
              ?.map((e: any) => e.textRun?.content || '')
              .join('') || '';
            if (paragraphText.trim()) {
              textParts.push(paragraphText.trim());
            }
          }
          if (element.table) {
            // Handle tables if needed
          }
        }
      };

      extractText(content);
      return textParts.join('\n\n');
    } catch (error) {
      logger.error('Error fetching Google Doc:', error);
      throw error;
    }
  }
}
