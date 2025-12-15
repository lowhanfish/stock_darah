const db = require('../MySql/umum'); // PATH SUDAH BENAR DARI library

const sql = `
  UPDATE permintaan_darah
  SET
    status = 5,
    status_keterangan = 'Ditolak otomatis karena darah sudah kadaluarsa',
    updated_at = NOW()
  WHERE
    status = 3
    AND exp IS NOT NULL
    AND DATE(exp) < CURDATE()
`;

db.query(sql, (err, result) => {
  if (err) {
    console.error('[AUTO-REJECT-EXP] Error:', err);
  }
  // selesai → keluar
  process.exit(0);
});
