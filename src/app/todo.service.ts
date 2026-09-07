import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

const DB_NAME = 'todo_db';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private platform = Capacitor.getPlatform();

  /** Promise resolvida quando o banco está pronto (tabela criada). */
  private ready: Promise<void>;

  constructor() {
    this.ready = this.initDatabase();
  }

  /**
   * Inicializa a conexão com o SQLite.
   * - No Android/iOS: usa o SQLite nativo diretamente.
   * - No navegador (ng serve): usa o web component "jeep-sqlite" (sql.js
   *   + IndexedDB) para simular o SQLite, permitindo testar sem dispositivo.
   */
  private async initDatabase(): Promise<void> {
    try {
      if (this.platform === 'web') {
        // O componente "jeep-sqlite" é carregado via <script> no
        // index.html (não via import no TypeScript - ver comentário lá).
        // Aqui só garantimos que o elemento exista no DOM e aguardamos o
        // custom element terminar de ser definido antes de abrir o WebStore.
        if (!document.querySelector('jeep-sqlite')) {
          const jeepEl = document.createElement('jeep-sqlite');
          document.body.appendChild(jeepEl);
        }
        await customElements.whenDefined('jeep-sqlite');

        await this.sqlite.initWebStore();
      }

      const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;
      this.db = isConn
        ? await this.sqlite.retrieveConnection(DB_NAME, false)
        : await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);

      await this.db.open();

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0
        );
      `);

      const countResult = await this.db.query('SELECT COUNT(*) AS total FROM todos;');
      const total = countResult.values?.[0]?.total ?? 0;

      if (total === 0) {
        await this.seedInitialData();
      }

      await this.persist();
    } catch (err) {
      console.error('Erro ao iniciar o banco SQLite:', err);
      throw err;
    }
  }

  /** Popula a tabela com os itens iniciais (apenas na primeira execução). */
  private async seedInitialData(): Promise<void> {
    const seed = ['Fazer compras', 'Fazer deveres', 'Limpar a casa'];
    for (const title of seed) {
      await this.db.run('INSERT INTO todos (title, done) VALUES (?, ?);', [title, 0]);
    }
  }

  /** No navegador, persiste as mudanças no IndexedDB (jeep-sqlite). */
  private async persist(): Promise<void> {
    if (this.platform === 'web') {
      await this.sqlite.saveToStore(DB_NAME);
    }
  }

  async getTodos(): Promise<Todo[]> {
    await this.ready;
    const result = await this.db.query('SELECT id, title, done FROM todos ORDER BY id ASC;');
    return (result.values ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      done: !!row.done,
    }));
  }

  async addTodo(title: string): Promise<void> {
    await this.ready;
    await this.db.run('INSERT INTO todos (title, done) VALUES (?, ?);', [title, 0]);
    await this.persist();
  }

  async toggleDone(id: number, done: boolean): Promise<void> {
    await this.ready;
    await this.db.run('UPDATE todos SET done = ? WHERE id = ?;', [done ? 1 : 0, id]);
    await this.persist();
  }

  async editTodo(id: number, title: string): Promise<void> {
    await this.ready;
    await this.db.run('UPDATE todos SET title = ? WHERE id = ?;', [title, id]);
    await this.persist();
  }

  async deleteTodo(id: number): Promise<void> {
    await this.ready;
    await this.db.run('DELETE FROM todos WHERE id = ?;', [id]);
    await this.persist();
  }
}
