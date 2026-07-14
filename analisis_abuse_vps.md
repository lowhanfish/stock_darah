# 🚨 Analisis & Panduan Perbaikan: Abuse Report VPS (Port Scanning)

## Ringkasan Masalah

Server VPS Anda (IP `103.160.63.246`) terdeteksi melakukan **port scanning SSH** ke IP eksternal. Ini bukan masalah dari aplikasi stock_darah Anda secara langsung, melainkan **server VPS kemungkinan besar telah disusupi (compromised)**.

### Bukti dari Laporan

| Waktu | Dari IP Anda | Port Sumber | Tujuan | Port Tujuan |
|-------|-------------|-------------|--------|-------------|
| 09 Jun 00:47 | 103.160.63.246 | 56840 | 144.79.58.205 | **22** (SSH) |
| 09 Jun 02:37 | 103.160.63.246 | 51724 | 88.218.206.92 | **22** (SSH) |
| 09 Jun 03:04 | 103.160.63.246 | 44508 | 144.79.59.213 | **2022** (alt SSH) |
| 09 Jun 04:30 | 103.160.63.246 | 52356 | 82.24.200.196 | **222** (alt SSH) |

> [!CAUTION]
> Semua koneksi menargetkan **port SSH (22, 2022, 222)**. Ini adalah pola khas **malware SSH brute-force scanner** — server Anda kemungkinan besar sudah diretas dan digunakan untuk menyerang server lain.

---

## Penyebab yang Mungkin

### 1. 🔴 Server Diretas via SSH (Paling Mungkin)
- Password SSH lemah atau default
- Root login via SSH masih aktif
- Tidak ada rate limiting (fail2ban)
- Setelah masuk, attacker memasang malware port scanner

### 2. 🟡 Dependency Node.js Terkompromi
- Package `openssl` di [package.json](file:///Users/simplephi/Documents/riswan/stock_darah/server/package.json#L38) bukan library OpenSSL resmi — ini package npm pihak ketiga yang mencurigakan
- Versi lama dari beberapa dependencies bisa memiliki vulnerability

### 3. 🟡 Cron Job atau Proses Tersembunyi
- Attacker mungkin memasang cron job atau systemd service untuk persistence

---

## 🔧 Langkah Investigasi & Perbaikan (Jalankan di VPS)

### TAHAP 1: Investigasi — Cari Tahu Apa yang Terjadi

Jalankan perintah-perintah ini **di VPS Anda** (login via SSH):

#### 1.1 Cek Proses Mencurigakan
```bash
# Lihat semua proses yang berjalan
ps aux --sort=-%cpu | head -50

# Cari proses yang melakukan koneksi keluar ke port 22
ss -tnp | grep ':22'
netstat -tnp | grep ':22'

# Cari proses mencurigakan (miner, scanner, dll)
ps aux | grep -iE '(scan|brute|ssh|masscan|hydra|nmap|zmap|xmrig|miner|kworker|\.tmp|/tmp/)'
```

#### 1.2 Cek Koneksi Jaringan Aktif
```bash
# Lihat semua koneksi keluar (ESTABLISHED)
ss -tnp state established

# Cari koneksi ke port SSH eksternal
ss -tnp | awk '$5 ~ /:22$/ || $5 ~ /:2022$/ || $5 ~ /:222$/'
```

#### 1.3 Cek Cron Jobs (Semua User)
```bash
# Cek cron root
crontab -l

# Cek cron semua user
for user in $(cut -f1 -d: /etc/passwd); do
  echo "=== $user ===";
  crontab -u $user -l 2>/dev/null;
done

# Cek cron system-wide
ls -la /etc/cron.d/
cat /etc/cron.d/*
ls -la /etc/cron.daily/ /etc/cron.hourly/ /etc/cron.weekly/
```

#### 1.4 Cek File Mencurigakan di /tmp dan /var/tmp
```bash
# Ini lokasi favorit malware
ls -la /tmp/
ls -la /var/tmp/
ls -la /dev/shm/

# Cari file executable di /tmp
find /tmp /var/tmp /dev/shm -type f -executable 2>/dev/null
find /tmp /var/tmp /dev/shm -name "*.sh" -o -name "*.py" -o -name "*.pl" 2>/dev/null
```

#### 1.5 Cek Login History
```bash
# Siapa yang pernah login
last -20
lastb -20 2>/dev/null  # failed login attempts

# Cek authorized_keys (mungkin attacker menambah SSH key mereka)
cat ~/.ssh/authorized_keys
cat /root/.ssh/authorized_keys 2>/dev/null

# Cek semua user yang punya shell
grep -v '/nologin\|/false' /etc/passwd
```

#### 1.6 Cek File yang Baru Dimodifikasi
```bash
# File yang dimodifikasi dalam 7 hari terakhir di lokasi mencurigakan
find / -mtime -7 -type f \( -name "*.sh" -o -name "*.py" -o -name "*.pl" \) 2>/dev/null | grep -v '/node_modules/'

# Cek binary mencurigakan
find /usr/bin /usr/sbin /usr/local/bin -mtime -30 -type f 2>/dev/null
```

#### 1.7 Cek Systemd Services Mencurigakan
```bash
# List semua services aktif
systemctl list-units --type=service --state=running

# Cari service yang bukan bawaan
systemctl list-unit-files --type=service | grep enabled
```

---

### TAHAP 2: Hentikan Ancaman

```bash
# Kill semua proses mencurigakan yang ditemukan
# Contoh: kill -9 <PID>

# Hapus cron jobs mencurigakan
crontab -r  # hapus semua cron (hati-hati jika ada cron yang legitimate)

# Hapus file malware di /tmp
rm -rf /tmp/.* /tmp/scan* /tmp/ssh* 2>/dev/null
rm -rf /var/tmp/.* 2>/dev/null
rm -rf /dev/shm/.* 2>/dev/null
```

---

### TAHAP 3: Amankan Server (WAJIB)

#### 3.1 Amankan SSH
```bash
# Edit konfigurasi SSH
sudo nano /etc/ssh/sshd_config
```

Ubah/tambahkan baris berikut:
```
# Nonaktifkan root login
PermitRootLogin no

# Gunakan hanya SSH key (nonaktifkan password login)
PasswordAuthentication no
PubkeyAuthentication yes

# Ganti port default SSH (misal 2222)
Port 2222

# Batasi user yang boleh SSH
AllowUsers nama_user_anda

# Timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Nonaktifkan login kosong
PermitEmptyPasswords no
```

```bash
# Restart SSH
sudo systemctl restart sshd
```

> [!WARNING]
> **SEBELUM menonaktifkan PasswordAuthentication**, pastikan Anda sudah setup SSH key! Jika tidak, Anda bisa terkunci dari server.

#### 3.2 Install Fail2Ban (Anti Brute Force)
```bash
# Install
sudo apt update && sudo apt install fail2ban -y

# Buat konfigurasi
sudo nano /etc/fail2ban/jail.local
```

Isi dengan:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 3.3 Setup Firewall (UFW)
```bash
# Install UFW
sudo apt install ufw -y

# Default: block semua incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Block outgoing SSH scanning (PENTING!)
sudo ufw deny out 22/tcp comment "Block outbound SSH scan"

# Allow port yang dibutuhkan
sudo ufw allow 2222/tcp comment "SSH custom port"
sudo ufw allow 80/tcp comment "HTTP"
sudo ufw allow 443/tcp comment "HTTPS"
sudo ufw allow 5088/tcp comment "Node.js app stock_darah"

# Aktifkan
sudo ufw enable
sudo ufw status verbose
```

> [!IMPORTANT]
> Rule `deny out 22/tcp` akan **memblokir server Anda melakukan koneksi SSH ke luar**. Ini mencegah port scanning behavior yang dilaporkan. Jika Anda perlu SSH ke server lain, tambahkan rule allow spesifik.

#### 3.4 Ganti Semua Password
```bash
# Ganti password user
passwd

# Ganti password root
sudo passwd root

# Ganti password MySQL
mysql -u root -p
# Di dalam MySQL:
# ALTER USER 'root'@'localhost' IDENTIFIED BY 'password_baru_yang_kuat';
```

#### 3.5 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

---

### TAHAP 4: Perbaikan di Aplikasi stock_darah

#### 4.1 Hapus Package npm `openssl` yang Mencurigakan

Package `openssl` di [package.json](file:///Users/simplephi/Documents/riswan/stock_darah/server/package.json#L38) **bukan** library OpenSSL yang legitimate. Node.js sudah memiliki modul `crypto` bawaan. Package npm `openssl` adalah third-party yang jarang di-maintain dan berpotensi berbahaya.

```bash
cd /path/to/stock_darah/server
npm uninstall openssl
```

#### 4.2 Audit Dependencies
```bash
# Jalankan di folder server
npm audit

# Auto-fix yang bisa diperbaiki
npm audit fix

# Cek dependency yang outdated
npm outdated
```

#### 4.3 Perhatikan Keamanan Aplikasi

Beberapa hal yang perlu diperhatikan di kode Anda:

1. **CORS terlalu terbuka** — di [index.js:18](file:///Users/simplephi/Documents/riswan/stock_darah/server/index.js#L18) CORS diset `origin: '*'`. Sebaiknya batasi ke domain spesifik:
   ```javascript
   app.use(cors({
     origin: ['https://yourdomain.com', 'https://admin.yourdomain.com']
   }));
   ```

2. **Error handler menampilkan stack trace** — di [index.js:133-139](file:///Users/simplephi/Documents/riswan/stock_darah/server/index.js#L133-L139) stack trace dikirim ke client. Di production, jangan tampilkan:
   ```javascript
   function errorHandler(err, req, res, next) {
     res.status(res.statusCode || 500);
     res.json({
       message: err.message,
       // Jangan kirim stack trace di production
       ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
     });
   }
   ```

3. **Dependency versions sangat lama** — Express 4.16, Mongoose 5.x, Socket.IO 2.x memiliki known vulnerabilities.

---

## 📧 Template Balasan ke Herza

Setelah Anda melakukan investigasi dan perbaikan, kirimkan balasan seperti ini:

---

> Yth. Tim Support PT. Herza Digital Indonesia,
>
> Terima kasih atas informasinya. Kami telah melakukan investigasi dan perbaikan sebagai berikut:
>
> **Temuan:**
> - [Sebutkan apa yang Anda temukan — misal: ditemukan proses mencurigakan/malware di /tmp, cron job berbahaya, dll]
>
> **Tindakan yang sudah dilakukan:**
> 1. Menghentikan dan menghapus proses/malware yang ditemukan
> 2. Mengamankan akses SSH (nonaktifkan root login, ganti port, aktifkan SSH key only)
> 3. Menginstall dan mengkonfigurasi Fail2Ban
> 4. Mengkonfigurasi firewall (UFW) untuk memblokir outbound port scanning
> 5. Mengupdate seluruh system packages
> 6. Mengganti semua password
> 7. Melakukan audit dependency aplikasi
>
> Kami pastikan tidak akan terjadi lagi aktivitas serupa dari server kami.
>
> Mohon untuk tidak melakukan suspend pada layanan kami.
>
> Terima kasih,
> [Nama Anda]

---

## ⏰ Prioritas Tindakan

| Prioritas | Tindakan | Estimasi Waktu |
|-----------|----------|----------------|
| 🔴 **Segera** | Tahap 1: Investigasi | 15-30 menit |
| 🔴 **Segera** | Tahap 2: Hentikan ancaman | 5-10 menit |
| 🔴 **Segera** | Tahap 3.1-3.3: SSH + Fail2Ban + Firewall | 30-45 menit |
| 🟡 **Hari ini** | Tahap 3.4-3.5: Password + Update | 15 menit |
| 🟡 **Hari ini** | Tahap 4: Perbaikan aplikasi | 30 menit |
| 🟢 **Minggu ini** | Balas email ke Herza | 10 menit |

> [!IMPORTANT]
> Anda punya **1x24 jam** untuk merespons Herza sebelum layanan di-suspend. Segera lakukan investigasi dan kirim balasan konfirmasi meskipun perbaikan belum sepenuhnya selesai.
