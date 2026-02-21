import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';

interface DrugInfoItem {
  id: number;
  topic_id: number;
  name: string;
  url: string;
  category_id: number;
  content: unknown;
}

@Injectable()
export class DrugInformationService {
  private db: sqlite3.Database | null = null;
  private dbPath = process.env.DRUG_INFO_DB_PATH;

  constructor() {
    if (this.dbPath) {
      this.initializeDatabase();
    }
  }

  private initializeDatabase() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening drug information database:', err);
        this.db = null;
      } else {
        console.log('Connected to drug information SQLite database:', this.dbPath);
      }
    });
  }

  private async query(sql: string, params: unknown[] = []): Promise<unknown[]> {
    if (!this.db) {
      throw new Error('Drug information database is not initialized');
    }
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  private decodeHtmlString(value: string): string {
    return value
      .replace(/\\u003[Cc]/g, '<')
      .replace(/\\u003[Ee]/g, '>')
      .replace(/\\u0026/g, '&')
      .replace(/\\u0027/g, "'")
      .replace(/\\u0022/g, '"')
      .replace(/\\\//g, '/')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  private normalizeHtmlFields(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeHtmlFields(item));
    }

    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        if (
          typeof nestedValue === 'string' &&
          /(?:^|_)(?:outlineHtml|bodyHtml|translatedOutlineHtml|translatedBodyHtml)$/i.test(
            key,
          )
        ) {
          result[key] = this.decodeHtmlString(nestedValue);
        } else {
          result[key] = this.normalizeHtmlFields(nestedValue);
        }
      }
      return result;
    }

    return value;
  }

  private normalizeContent(rawContent: unknown): unknown {
    if (typeof rawContent !== 'string') {
      return rawContent;
    }

    const content = rawContent.trim();
    if (!content) {
      return content;
    }

    try {
      const firstParse = JSON.parse(content);
      if (typeof firstParse === 'string') {
        try {
          return this.normalizeHtmlFields(JSON.parse(firstParse));
        } catch {
          return this.decodeHtmlString(firstParse);
        }
      }
      return this.normalizeHtmlFields(firstParse);
    } catch {
      return rawContent;
    }
  }

  async searchDrugsByName(query: string): Promise<DrugInfoItem[]> {
    const term = query.trim();
    if (!term) {
      return [];
    }

    const rows = await this.query(
      `
      SELECT
        id,
        topic_id,
        name,
        url,
        category_id,
        content
      FROM drugs
      WHERE name LIKE ? COLLATE NOCASE
      ORDER BY name ASC;
      `,
      [`%${term}%`],
    );

    return (rows as DrugInfoItem[]).map((row) => ({
      ...row,
      content: this.normalizeContent(row.content),
    }));
  }
}
