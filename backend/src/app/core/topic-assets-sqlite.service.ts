import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';

@Injectable()
export class TopicAssetsSqliteService {
  private db: sqlite3.Database;
  private dbPath = 'topic_assets.sqlite';

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database:', this.dbPath);
      }
    });
  }

  private async query(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  private async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getTopicById(id: number): Promise<any> {
    return await this.get(
      'SELECT * FROM topic_summary WHERE topicInfo_id = ?',
      [id],
    );
  }

  async getTopicByTitle(title: string): Promise<any> {
    return this.get(
      'SELECT * FROM topic_summary WHERE topicInfo_title LIKE ?',
      [title.replace(/-/g, ' ')],
    );
  }

  async preSearch(query: string): Promise<any> {
    const result = await this.query(
      'SELECT topicInfo_title FROM topic_summary WHERE topicInfo_title LIKE ?',
      [`%${query}%`],
    );
    return result.map((item) => item.topicInfo_title);
  }
}
