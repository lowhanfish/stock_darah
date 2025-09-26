const express = require('express');
var db = require('../../db//MySql/umum');


const fs = require('fs');

var multer=require("multer");
var upload = require('../../db/multer/image');

var uniqid = require('uniqid');
const { log } = require('console');
const router = express.Router();
const cron = require('node-cron');


router.get('/kecamatan', (req, res) => {

    var query = `
    SELECT master_kecamatan.nama_kecamatan,
    master_kecamatan.kecamatan_id
        
        FROM master_kecamatan

        WHERE master_kecamatan.kabupaten_id = 7405 
   
    `;
     db.query(query, (err, row)=>{
        if(err) {
            res.send(err);
            console.log(err)
        }else{
            res.send(row);
        }
    })
});

router.post('/kecamatan', (req, res) => {

    console.log("MASTER kecmatan DIPANGGIL");
    var userx = req.user.profile
    // console.log(userx); 
    console.log(userx.kecamatan_id);
    
    var filter_akses = ''

    if (userx.menu_klp == 1) {
        // console.log("BISA AKSES SEMUA");
        filter_akses = ``
    } else {
        // console.log("TIDAK BISA AKSES SEMUA");
        filter_akses = ` AND master_kecamatan.kecamatan_id = '`+userx.kecamatan_id+`'` ;
    }

    // console.log(filter_akses);
    
    let view = ` 
        SELECT * FROM master_kecamatan
        WHERE master_kecamatan.kabupaten_id = 7405
        `+filter_akses+`
        ORDER BY nama_kecamatan
    `;

    // console.log(view);

    db.query(view, (err, row)=>{
        if (err) {
            res.json(err)
        }else{
            res.json(row)
        }
    })
});

router.post('/desa', (req, res) => {

    var query = `
    SELECT master_des_kel.nama_des_kel,
    master_des_kel.des_kel_id
        
        FROM master_des_kel

        WHERE master_des_kel.kecamatan_id = '`+req.body.kecamatan_id+`' 
   
    `;
     db.query(query, (err, row)=>{
        if(err) {
            res.send(err);
            console.log(err)
        }else{
            res.send(row);
        }
    })
});

router.post('/viewData', (req, res) => {
    try {
      const { status, kecamatan_id, desa_id, bidang_csr_id, bidang_sub_csr_id, cari_value } = req.body;
      let page_first = parseInt(req.body.page_first || req.body.data_ke || 1);
      let page_limit = parseInt(req.body.page_limit || 9);
  
      let where = "WHERE 1=1 ";
  
      if(status) where += ` AND k.status = ${db.escape(status)} `;
      if(kecamatan_id) where += ` AND k.kecamatan_id = ${db.escape(kecamatan_id)} `;
      if(desa_id) where += ` AND k.desa_id = ${db.escape(desa_id)} `;
      if(bidang_csr_id) where += ` AND k.bidang_csr_id = ${db.escape(bidang_csr_id)} `;
      if(bidang_sub_csr_id) where += ` AND k.bidang_sub_csr_id = ${db.escape(bidang_sub_csr_id)} `;
      if(cari_value) where += ` AND k.nama_csr LIKE ${db.escape('%' + cari_value + '%')} `;
  
      const offset = (parseInt(page_first) - 1) * parseInt(page_limit);

  
      const countSql = `SELECT COUNT(*) as total FROM kegiatan_csr k ${where}`;
      db.query(countSql, (err, countResult) => {
        if(err) return res.status(500).json({ success: false, message: "DB Error", error: err });
        const total = countResult[0].total;
  
        const sql = `
          SELECT 
            k.*,
            kc.nama_kecamatan,
            ds.nama_des_kel AS nama_desa,
            b.uraian AS uraian_bidang_csr,
            bs.uraian AS uraian_bidang_sub_csr
          FROM kegiatan_csr k
          LEFT JOIN master_kecamatan kc ON k.kecamatan_id = kc.kecamatan_id
          LEFT JOIN master_des_kel ds ON k.desa_id = ds.des_kel_id
          LEFT JOIN master_bidang_csr b ON k.bidang_csr_id = b.id
          LEFT JOIN master_bidang_sub_csr bs ON k.bidang_sub_csr_id = bs.id
          ${where}
          ORDER BY k.createdAt DESC
          LIMIT ${parseInt(offset)}, ${parseInt(page_limit)}
        `;
  
        db.query(sql, (err, rows) => {
          if(err) return res.status(500).json({ success: false, message: "DB Error", error: err });
          res.json({ data: rows, total });
        });
      });
  
    } catch(error) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ success: false, message: "Server Error", error });
    }
  });
  
  

// router.post('/addData', (req, res) => {
//     try {
//       console.log("📩 Data diterima:", req.body);
  
//       const { form } = req.body;
//       const id = uniqid();
  
//       let insert = `
//         INSERT INTO kegiatan_csr (
//           id, bidang_csr_id, bidang_sub_csr_id, nama_csr, deskripsi,
//           jumlah, satuan, nilai, tanggal_mulai, tanggal_selesai,
//           kecamatan_id, desa_id, alamat,
//           status, createdBy, createdAt, editedBy, editedAt
//         ) VALUES (
//           '${id}',
//           '${form.bidang_csr_id}',
//           '${form.bidang_sub_csr_id}',
//           '${form.nama_csr}',
//           '${form.deskripsi}',
//           '${form.jumlah}',
//           '${form.satuan}',
//           '${form.nilai}',
//           '${form.tanggal_mulai}',
//           '${form.tanggal_selesai}',
//           '${form.kecamatan_id}',
//           '${form.desa_id}',
//           '${form.alamat}',
//           1,
//           '${req.user._id}',
//           NOW(),
//           '${req.user._id}',
//           NOW()
//         )
//       `;
  
//       db.query(insert, (err, result) => {
//         if (err) {
//           console.error("❌ DB Error:", err.sqlMessage);
//           return res.status(500).json({ success: false, message: "DB Error", error: err });
//         }
//         console.log("✅ Insert sukses:", result);
//         res.json({ success: true, message: "Data berhasil disimpan", id });
//       });
  
//     } catch (error) {
//       console.error("❌ Server Error:", error);
//       res.status(500).json({ success: false, message: "Server Error", error });
//     }
//   });
  
router.post('/addData', upload.single("file"), (req, res) => {
    try {
      console.log("📩 Data diterima:", req.body);
      console.log("📂 File diterima:", req.file);
  
      const id = uniqid();
      const fileName = req.file ? req.file.filename : null;
  
      let insert = `
        INSERT INTO kegiatan_csr (
          id, bidang_csr_id, bidang_sub_csr_id, nama_csr, deskripsi,
          jumlah, jumlah_sisa, satuan, nilai, tanggal_mulai, tanggal_selesai,
          kecamatan_id, desa_id, alamat,
          file_name,
          status, createdBy, createdAt, editedBy, editedAt
        ) VALUES (
          '${id}',
          '${req.body.bidang_csr_id}',
          '${req.body.bidang_sub_csr_id}',
          '${req.body.nama_csr}',
          '${req.body.deskripsi}',
          '${req.body.jumlah}',
          '${req.body.jumlah}',
          '${req.body.satuan}',
          '${req.body.nilai}',
          '${req.body.tanggal_mulai}',
          '${req.body.tanggal_selesai}',
          '${req.body.kecamatan_id}',
          '${req.body.desa_id}',
          '${req.body.alamat}',
          ${fileName ? `'${fileName}'` : 'NULL'},
          1,
          '${req.user._id}',
          NOW(),
          '${req.user._id}',
          NOW()
        )
      `;
  
      db.query(insert, (err, result) => {
        if (err) {
          console.error("❌ DB Error:", err.sqlMessage);
          return res.status(500).json({ success: false, message: "DB Error", error: err });
        }
  
        console.log("✅ Insert sukses:", result);
        res.json({ success: true, message: "Data berhasil disimpan", id, file: fileName });
      });
  
    } catch (error) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ success: false, message: "Server Error", error });
    }
  });
  

  router.post('/removeData', (req, res)=> {
    const id = req.body.id;
    const query = `DELETE FROM kegiatan_csr WHERE id = '${id}'`;
    
    db.query(query, (err, result)=>{
      if (err) {
        res.status(500).json({ success: false, error: err });
      } else {
        res.json({ success: true, affectedRows: result.affectedRows });
      }
    });
  });


  // API untuk ambil informasi mitra (users + perusahaan)
router.get('/mitra/:user_id', (req, res) => {
  const userId = req.params.user_id;

  const sql = `
    SELECT 
      u.id AS user_id, 
      u.username, 
      u.nama AS nama_pj, 
      u.jabatan, 
      u.email AS email_pj, 
      u.hp AS hp_pj,
      p.nama AS nama_perusahaan, 
      p.email AS email_perusahaan, 
      p.hp AS telp_perusahaan, 
      p.alamat AS alamat_perusahaan
    FROM users u
    LEFT JOIN perusahaan p ON u.id = p.users_id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("❌ DB Error:", err.sqlMessage);
      return res.status(500).json({ success: false, message: "DB Error", error: err });
    }

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mitra tidak ditemukan" });
    }

    res.json({ success: true, data: rows[0] });
  });
});

// 📌 Mitra mengajukan pengambilan program
router.post("/addPengajuan", (req, res) => {
  try {
    const id = uniqid();
    const { kegiatan_id, perusahaan_id, jumlah_ambil, catatan_mitra } = req.body;

    // validasi sederhana
    if (!kegiatan_id || !perusahaan_id || !jumlah_ambil) {
      return res.status(400).json({ success: false, message: "Data tidak lengkap" });
    }

    // Insert ke kegiatan_mitra, status_pengajuan = 1 (menunggu persetujuan)
    let insert = `
      INSERT INTO kegiatan_mitra 
      (id, kegiatan_id, perusahaan_id, jumlah_ambil, catatan_mitra, status_pengajuan, catatan_admin, createdBy, createdAt, editedBy, editedAt)
      VALUES (
        '${id}',
        '${kegiatan_id}',
        '${perusahaan_id}',
        '${jumlah_ambil}',
        ${catatan_mitra ? `'${catatan_mitra}'` : "NULL"},
        1,
        'Menunggu persetujuan admin',
        '${req.user._id}',
        NOW(),
        '${req.user._id}',
        NOW()
      )
    `;

    db.query(insert, (err) => {
      if (err) {
        console.error("❌ DB Insert Error:", err.sqlMessage);
        return res.status(500).json({ success: false, message: "DB Error", error: err });
      }

      // Tidak update jumlah_sisa dan status program di sini
      res.json({ success: true, message: "Pengajuan berhasil dikirim, menunggu persetujuan admin", id });
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});



// Cron job setiap hari jam 00:00
cron.schedule('0 0 * * *', () => {
  const sql = `
    UPDATE kegiatan_csr
    SET status = 4
    WHERE tanggal_selesai < NOW()
      AND status != 4
  `;
  db.query(sql, (err, result) => {
    if(err) {
      console.error("❌ Error update status selesai:", err);
    } else {
      console.log(`✅ Cron update status selesai: ${result.affectedRows} program`);
    }
  });
});



module.exports = router;