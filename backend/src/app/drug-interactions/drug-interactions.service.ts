import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';

interface DrugItem {
  item_id: number;
  name: string;
  generic_id: number;
  brand_id: number;
}

interface InteractionPair {
  monograph_id: number;
  risk: number;
  object_id: number;
  precipitant_id: number;
  text1: string;
  generic1: number;
  brand1: number;
  text2: string;
  generic2: number;
  brand2: number;
  filter: string;
}

interface MonographMeta {
  id: number;
  object_id: number;
  precipitant_id: number;
  risk: number;
  severity_id: number;
  reliability_id: number;
  onset_id: number;
  summary: string;
  management: string;
  discussion: string;
  footnotes: string;
  filter: string;
  object_name: string;
  precipitant_name: string;
}

interface CategoryMember {
  category_name: string;
  category_id: number;
  generic_name: string;
  generic_id: number;
  exception_id: number | null;
}

@Injectable()
export class DrugInteractionsService {
  private db: sqlite3.Database | null = null;
  private dbPath = process.env.DRUG_INTERACTIONS_DB_PATH || './interact.db';
  private dbInitialized = false;

  constructor() {
    console.log('DrugInteractionsService constructor', this.dbPath);
    if (this.dbPath) {
      this.initializeDatabase();
    }
  }

  private initializeDatabase() {
    console.log('Initializing database:', this.dbPath);
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening drug interactions database:', err);
        this.db = null;
      } else {
        console.log('Connected to drug interactions SQLite database:', this.dbPath);
        this.dbInitialized = true;
      }
    });
  }

  private async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
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

  private async get(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
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

  private async exec(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async tableExists(name: string): Promise<boolean> {
    const result = await this.get(
      "SELECT 1 FROM sqlite_master WHERE type='table' AND name=? LIMIT 1;",
      [name],
    );
    return !!result;
  }

  private async lookupLabel(table: string, id: number): Promise<string> {
    if (!id) return '';
    if (!(await this.tableExists(table))) return '';

    const cols = await this.query(`PRAGMA table_info(${table});`);
    const colNames = cols.map((r: any) => r.name);
    const idCol = colNames.includes('id') ? 'id' : colNames[0] || 'id';
    const nameCandidates = ['name', 'title', 'text', 'label', 'value', 'display_name'];
    const nameCol = nameCandidates.find((c) => colNames.includes(c));
    if (!nameCol) return String(id);

    const rows = await this.query(
      `SELECT ${nameCol} AS label FROM ${table} WHERE ${idCol} = ? LIMIT 1;`,
      [id],
    );
    return rows.length ? rows[0].label || '' : '';
  }

  private async getCategoriesForGeneric(gid: number): Promise<number[]> {
    const rows = await this.query(
      'SELECT category_id FROM category_generic_xref WHERE generic_id = ? ORDER BY category_id;',
      [gid],
    );
    return rows.map((r: any) => r.category_id);
  }

  private async getExceptionTables(): Promise<{ brand: string; generic: string }> {
    const brand = (await this.tableExists('monograph_brand_exception_xref'))
      ? 'monograph_brand_exception_xref'
      : 'monograph_brand_exception';
    const generic = (await this.tableExists('monograph_generic_exception_xref'))
      ? 'monograph_generic_exception_xref'
      : 'monograph_generic_exception';
    return { brand, generic };
  }

  private riskLetter(n: number): string {
    return n === 5 ? 'X' : n === 4 ? 'D' : n === 3 ? 'C' : n === 2 ? 'B' : 'A';
  }

  /**
   * Search for drugs by name
   * @param query Search query string
   * @returns Array of drug items matching the query
   */
  async searchDrug(query: string): Promise<DrugItem[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const like = `%${query.trim()}%`;
    const rows = await this.query(
      `
      SELECT item.rowid AS item_id, item.name AS name, item.id AS generic_id, item.brand_id AS brand_id
      FROM item
      WHERE item.name LIKE ?
      ORDER BY item.name ASC
      LIMIT 100;
    `,
      [like],
    );

    // Remove duplicates by item_id
    const uniq = new Map<number, DrugItem>();
    for (const r of rows) {
      if (!uniq.has(r.item_id)) {
        uniq.set(r.item_id, r);
      }
    }

    return Array.from(uniq.values());
  }

  /**
   * Analyze drug interactions between selected drugs
   * @param selectedItems Array of selected drug items
   * @returns Array of interaction pairs
   */
  async analyze(selectedItems: DrugItem[]): Promise<InteractionPair[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    if (selectedItems.length === 0) {
      return [];
    }

    // Expand items to their categories
    const expanded: Array<{
      category_id: number;
      generic_id: number;
      brand_id: number;
    }> = [];

    for (const it of selectedItems) {
      const cats = await this.getCategoriesForGeneric(it.generic_id);
      for (const c of cats) {
        expanded.push({
          category_id: c,
          generic_id: it.generic_id,
          brand_id: it.brand_id,
        });
      }
    }

    // Create temporary table
    await this.exec('DROP TABLE IF EXISTS temp_provider_categories;');
    await this.exec(
      'CREATE TEMP TABLE temp_provider_categories (category_id INTEGER NOT NULL, generic_id INTEGER NOT NULL, brand_id INTEGER);',
    );

    // Insert expanded categories
    for (const r of expanded) {
      await this.exec(
        'INSERT INTO temp_provider_categories(category_id, generic_id, brand_id) VALUES(?,?,?);',
        [r.category_id, r.generic_id, r.brand_id],
      );
    }

    const exc = await this.getExceptionTables();
    const sql = `
      WITH pairs AS (
        SELECT m.id AS monograph_id, m.risk AS risk, m.object_id AS object_id, m.precipitant_id AS precipitant_id,
               c1.name AS text1, t1.generic_id AS generic1, t1.brand_id AS brand1,
               c2.name AS text2, t2.generic_id AS generic2, t2.brand_id AS brand2, m.filter AS filter
        FROM temp_provider_categories t1
        JOIN category c1 ON c1.id = t1.category_id
        JOIN monograph m ON m.object_id = c1.id
        JOIN category c2 ON c2.id = m.precipitant_id
        JOIN temp_provider_categories t2 ON t2.category_id = c2.id
        WHERE NOT EXISTS ( SELECT 1 FROM ${exc.brand} mbx WHERE mbx.brand_id = t1.brand_id AND mbx.monograph_id = m.id )
          AND NOT EXISTS ( SELECT 1 FROM ${exc.generic} mgx WHERE mgx.monograph_id = m.id AND mgx.category_id = c1.id AND mgx.generic_id = t1.generic_id )

        UNION
        SELECT m.id AS monograph_id, m.risk AS risk, m.object_id AS object_id, m.precipitant_id AS precipitant_id,
               c1.name AS text1, t1.generic_id AS generic1, t1.brand_id AS brand1,
               c2.name AS text2, t2.generic_id AS generic2, t2.brand_id AS brand2, m.filter AS filter
        FROM temp_provider_categories t1
        JOIN category c1 ON c1.id = t1.category_id
        JOIN monograph m ON m.precipitant_id = c1.id
        JOIN category c2 ON c2.id = m.object_id
        JOIN temp_provider_categories t2 ON t2.category_id = c2.id
        WHERE NOT EXISTS ( SELECT 1 FROM ${exc.brand} mbx WHERE mbx.brand_id = t1.brand_id AND mbx.monograph_id = m.id )
          AND NOT EXISTS ( SELECT 1 FROM ${exc.generic} mgx WHERE mgx.monograph_id = m.id AND mgx.category_id = c1.id AND mgx.generic_id = t1.generic_id )
      )
      SELECT * FROM pairs ORDER BY risk DESC, text1, text2;
    `;

    const rows = await this.query(sql);

    // Filter out self-interactions and deduplicate
    const filtered = rows.filter(
      (r: InteractionPair) => r.object_id !== r.precipitant_id,
    );
    const seen = new Set<string>();
    const out: InteractionPair[] = [];

    for (const r of filtered) {
      const key = `${r.monograph_id}::${[r.text1, r.text2].sort().join('|')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }

    return out;
  }

  /**
   * Get detailed monograph information
   * @param monographId Monograph ID
   * @returns Monograph details with members
   */
  async getMonographDetails(monographId: number): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const meta = (await this.get(
      `
      SELECT m.id AS id, m.object_id AS object_id, m.precipitant_id AS precipitant_id, m.risk AS risk,
             m.severity_id AS severity_id, m.reliability_id AS reliability_id, m.onset_id AS onset_id,
             m.summary AS summary, m.management AS management, m.discussion AS discussion, m.footnotes AS footnotes, m.filter AS filter,
             o.name AS object_name, p.name AS precipitant_name
      FROM monograph m
      JOIN category o ON o.id = m.object_id
      JOIN category p ON p.id = m.precipitant_id
      WHERE m.id = ? LIMIT 1;
    `,
      [monographId],
    )) as MonographMeta | undefined;

    if (!meta) {
      throw new Error('Monograph not found');
    }

    const members = (await this.query(
      `
      SELECT c.name AS category_name, c.id AS category_id, g.name AS generic_name, g.id AS generic_id, mgx.category_id AS exception_id
      FROM monograph m
      JOIN category c ON c.id = m.object_id
      JOIN category_generic_xref cgx ON cgx.category_id = c.id
      JOIN generic g ON g.id = cgx.generic_id
      LEFT JOIN monograph_generic_exception_xref mgx
             ON mgx.monograph_id = m.id AND mgx.category_id = c.id AND mgx.generic_id = g.id
      WHERE m.id = ?
      UNION
      SELECT c.name AS category_name, c.id AS category_id, g.name AS generic_name, g.id AS generic_id, mgx.category_id AS exception_id
      FROM monograph m
      JOIN category c ON c.id = m.precipitant_id
      JOIN category_generic_xref cgx ON cgx.category_id = c.id
      JOIN generic g ON g.id = cgx.generic_id
      LEFT JOIN monograph_generic_exception_xref mgx
             ON mgx.monograph_id = m.id AND mgx.category_id = c.id AND mgx.generic_id = g.id
      WHERE m.id = ?
      ORDER BY category_name, generic_name;
    `,
      [monographId, monographId],
    )) as CategoryMember[];

    const severity = await this.lookupLabel('severity', meta.severity_id);
    const reliability = await this.lookupLabel('reliability', meta.reliability_id);
    const onset = await this.lookupLabel('onset', meta.onset_id);

    const riskMap: Record<number, string> = {
      5: 'X — Avoid concomitant use',
      4: 'D — Consider therapy modification',
      3: 'C — Monitor therapy',
      2: 'B — No action needed',
      1: 'A — No known interaction',
    };

    const letter = this.riskLetter(meta.risk);

    // Group members by category
    const groups: Record<
      string,
      { all: string[]; exceptions: string[] }
    > = {};
    for (const m of members) {
      if (!groups[m.category_name]) {
        groups[m.category_name] = { all: [], exceptions: [] };
      }
      if (m.exception_id != null) {
        groups[m.category_name].exceptions.push(m.generic_name);
      } else {
        groups[m.category_name].all.push(m.generic_name);
      }
    }

    return {
      ...meta,
      riskLetter: letter,
      riskText: riskMap[meta.risk] || '',
      severity,
      reliability,
      onset,
      members: groups,
    };
  }
}

