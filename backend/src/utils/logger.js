/**
 * Oddiy, bog'liqliksiz logger — vaqt belgisi va daraja bilan.
 */
const LEVELS = {
  info: { label: 'INFO ', color: '\x1b[36m' },
  warn: { label: 'WARN ', color: '\x1b[33m' },
  error: { label: 'ERROR', color: '\x1b[31m' },
  success: { label: 'OK   ', color: '\x1b[32m' },
  debug: { label: 'DEBUG', color: '\x1b[90m' },
};

const RESET = '\x1b[0m';

function stamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function write(level, args) {
  const { label, color } = LEVELS[level] || LEVELS.info;
  const prefix = `${color}[${stamp()}] ${label}${RESET}`;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(prefix, ...args);
}

const logger = {
  info: (...a) => write('info', a),
  warn: (...a) => write('warn', a),
  error: (...a) => write('error', a),
  success: (...a) => write('success', a),
  debug: (...a) => {
    if (process.env.NODE_ENV !== 'production') write('debug', a);
  },
  /** Xatolikni stack bilan chiroyli chiqarish */
  fail: (context, err) => {
    write('error', [`${context}:`, err && err.message ? err.message : err]);
    if (err && err.stack && process.env.NODE_ENV !== 'production') {
      console.error('\x1b[90m' + err.stack + '\x1b[0m');
    }
  },
};

module.exports = logger;
