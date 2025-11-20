// import Swal from 'sweetalert2'
const Swal = require('sweetalert2')

const tglConvert = (tgl) => {
    var date = new Date(tgl);
    var getBulan = date.getMonth() + 1; var bulan = '';
    if (getBulan == '1') {bulan = 'Januari'} 
    else if(getBulan == '2') {bulan = 'Februari'}
    else if(getBulan == '3') {bulan = 'Maret'}
    else if(getBulan == '4') {bulan = 'April'}
    else if(getBulan == '5') {bulan = 'Mei'}
    else if(getBulan == '6') {bulan = 'Juni'}
    else if(getBulan == '7') {bulan = 'Juli'}
    else if(getBulan == '8') {bulan = 'Agustus'}
    else if(getBulan == '9') {bulan = 'September'}
    else if(getBulan == '10') {bulan = 'Oktober'}
    else if(getBulan == '11') {bulan = 'November'}
    else if(getBulan == '12') {bulan = 'Desember'}

    return date.getDate() + " " + bulan + " " + date.getFullYear();
}

const tglConvertx = (tgl, withTime = false) => {
  var date = new Date(tgl);
  var getBulan = date.getMonth() + 1; 
  var bulan = '';

  if (getBulan == 1) bulan = 'Januari';
  else if (getBulan == 2) bulan = 'Februari';
  else if (getBulan == 3) bulan = 'Maret';
  else if (getBulan == 4) bulan = 'April';
  else if (getBulan == 5) bulan = 'Mei';
  else if (getBulan == 6) bulan = 'Juni';
  else if (getBulan == 7) bulan = 'Juli';
  else if (getBulan == 8) bulan = 'Agustus';
  else if (getBulan == 9) bulan = 'September';
  else if (getBulan == 10) bulan = 'Oktober';
  else if (getBulan == 11) bulan = 'November';
  else if (getBulan == 12) bulan = 'Desember';

  let tglStr = date.getDate() + " " + bulan + " " + date.getFullYear() + " Pukul : ";

  if (withTime) {
      let jam = date.getHours().toString().padStart(2, '0');
      let menit = date.getMinutes().toString().padStart(2, '0');
      tglStr += ` ${jam}:${menit}`;
  }

  return tglStr;
}


function hitungUsia(tanggalLahir) {
    if (!tanggalLahir) return '-';
    const lahir = new Date(tanggalLahir);
    const sekarang = new Date();
    let usia = sekarang.getFullYear() - lahir.getFullYear();
  
    const belumUltah =
      sekarang.getMonth() < lahir.getMonth() ||
      (sekarang.getMonth() === lahir.getMonth() && sekarang.getDate() < lahir.getDate());
  
    if (belumUltah) usia--;
    return usia;
  }
const notifApprove = async ()=>{

    return new Promise(resolve=>{
  
      Swal.fire({
        title: 'Apakah anda yakin untuk menyetujui data ini?',
        text: "Pilih button Approve untuk menyetujui data ini!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Approve!'
      }).then((result) => {
        if (result.isConfirmed) {
         resolve('');
        }
      })
    })
  }


// =================== PAGINASI =========================

const btn_prev = (page_first) =>{

}


const btn_next = (page_first, page_last) => {

}






const replaceStr = (data) =>{
    var res = data.toString().replace(/\/|-| |@/g,'_X_');
      return res
  }

const ArrToObj = (data) =>{
    var obj = data.reduce(function(acc, cur, i) {
      acc[replaceStr(cur.route)] = {
        readx : cur.readx,
        updatex : cur.updatex,
        deletex : cur.deletex,
        addx : cur.addx,
      };
      return acc;
    }, {});
  
    return obj
  }



module.exports = {
    tglConvert : tglConvert,
    tglConvertx : tglConvertx,
    btn_prev : btn_prev,
    btn_next : btn_next,
    notifApprove : notifApprove,
    ArrToObj : ArrToObj,
    hitungUsia : hitungUsia
}