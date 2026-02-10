const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const generatePermintaanPdf = require('../../../utils/generatePermintaanPdf');

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.query.key;

    if (!key) {
      return res.status(403).json({ message: 'Key tidak valid' });
    }

    // (opsional) validasi key di DB

    const { filename } = await generatePermintaanPdf(id);
    const filePath = path.join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File PDF tidak ditemukan' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);

  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ message: 'Gagal generate PDF' });
  }
});

module.exports = router;
