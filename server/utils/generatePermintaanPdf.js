// utils/generatePermintaanPdf.js
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const db = require('../db/MySql/umum');
module.exports = async function generatePermintaanPdf(id) {



  // ================================
  // 1️⃣ AMBIL DATA DARI MYSQL (PROMISE MANUAL)
  // ================================
  const rows = await new Promise((resolve, reject) => {
    db.query(`
      SELECT p.*, r.nama_ruangan, k.nama_komponen
      FROM permintaan_darah p
      LEFT JOIN tenaga_medis r ON r.id = p.ruangan_id
      LEFT JOIN komponen_darah k ON k.id = p.komponen_id
      WHERE p.id = ?
      LIMIT 1
    `, [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });


  if (!rows || !rows.length) {
    throw new Error('Data tidak ditemukan');
  }

  // ================================
  // 2️⃣ RENDER TEMPLATE EJS
  // ================================
  const logoPath = path.join(process.cwd(), 'uploads', 'kop.png');

  let kopImageUrl = null;
  if (fs.existsSync(logoPath)) {
    kopImageUrl = `data:image/png;base64,${fs.readFileSync(logoPath, 'base64')}`;
  }

  // ================================
// 3️⃣ RENDER TEMPLATE EJS
// ================================
const html = await ejs.renderFile(
  path.join(__dirname, '../services/permintaan_darah.ejs'),
  {
    data: rows[0],
    kopImageUrl
  }
);

  // ================================
  // 3️⃣ SIAPKAN PATH FILE PDF
  // ================================
  const filename = `permintaan_darah_${id}.pdf`;
  const outputPath = path.join(process.cwd(), 'uploads', filename);

  // pastikan folder uploads ada
  if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
    fs.mkdirSync(path.join(process.cwd(), 'uploads'));
  }

  // ================================
  // 4️⃣ BUAT PDF DENGAN PUPPETEER
  // ================================
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const crypto = require('crypto')

  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: 'networkidle0',
    url: 'file://' + process.cwd() + '/'
  });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true
  });

  await browser.close();

  const pdfKey = crypto.randomBytes(16).toString('hex')

  await new Promise((resolve, reject) => {
    db.query(
      `UPDATE permintaan_darah
     SET file = ?,
         file_type = 'pdf',
         pdf_key = ?,
         pdf_key_expired = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
     WHERE id = ?`,
      [filename, pdfKey, id],
      (err) => {
        if (err) return reject(err)
        resolve()
      }
    )
  })

  // ================================
  // 5️⃣ KEMBALIKAN NAMA FILE
  // ================================
  return { filename, pdfKey };
};
