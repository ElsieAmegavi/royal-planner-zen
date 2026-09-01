const { Pool } = require('pg');
const { DATABASE_URL, NODE_ENV } = require('../config');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err.message);
});

// SQLite used `?` placeholders; pg needs `$1, $2, ...`.
function toPositional(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// Compatibility layer matching the sqlite3 callback API the routes already
// use (db.get/run/all with `?` placeholders and a `this.lastID`/`this.changes`
// context in db.run's callback), so route files didn't need a rewrite when
// this moved from SQLite to Postgres. New code should prefer `pool.query`
// directly — this shim exists for the existing call sites only.
const db = {
  pool,

  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(toPositional(sql), params)
      .then((result) => callback(null, result.rows[0]))
      .catch((err) => callback(err));
  },

  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(toPositional(sql), params)
      .then((result) => callback(null, result.rows))
      .catch((err) => callback(err));
  },

  // Callers that need the new row's id must add `RETURNING id` to their SQL
  // — this.lastID is only populated when the query returns an `id` column.
  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(toPositional(sql), params)
      .then((result) => {
        const context = { lastID: result.rows[0]?.id, changes: result.rowCount };
        if (callback) callback.call(context, null);
      })
      .catch((err) => {
        if (callback) callback.call({}, err);
      });
  },

  close(callback) {
    pool.end()
      .then(() => { if (callback) callback(null); })
      .catch((err) => { if (callback) callback(err); });
  }
};

module.exports = db;
