const express = require('express');
const router = express.Router();
const db = require('../../db/MySql/umum');

router.post('/hit', (req, res) => {
  try {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '-';

    const ua = req.headers['user-agent'] || '-';

    db.query(
      'INSERT INTO website_visitors (ip_address, user_agent) VALUES (?, ?)',
      [ip, ua],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false });
        }
        res.json({ success: true });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ✅ AMBIL JUMLAH VISITOR
router.get('/total', (req, res) => {
    db.query(
      'SELECT COUNT(*) AS total FROM website_visitors',
      (err, rows) => {
        if (err) {
          return res.status(500).json({ total: 0 });
        }
        res.json({ total: rows[0].total });
      }
    );
  });

module.exports = router;
