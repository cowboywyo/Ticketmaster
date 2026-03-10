import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = knex(
  config.db.client === 'mysql2'
    ? {
        client: 'mysql2',
        connection: {
          host: config.db.host,
          port: config.db.port,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
        },
      }
    : {
        client: 'better-sqlite3',
        connection: {
          filename: path.resolve(__dirname, '../../', config.db.filename),
        },
        useNullAsDefault: true,
        pool: {
          afterCreate: (conn: any, cb: Function) => {
            conn.pragma('journal_mode = WAL');
            conn.pragma('foreign_keys = ON');
            cb();
          },
        },
      }
);

export default db;
