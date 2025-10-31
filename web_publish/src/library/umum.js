export const tglConvert = (tgl) => {
    const date = new Date(tgl);
    const getBulan = date.getMonth() + 1;
    let bulan = '';
  
    if (getBulan === 1) bulan = 'Jan';
    else if (getBulan === 2) bulan = 'Feb';
    else if (getBulan === 3) bulan = 'Mar';
    else if (getBulan === 4) bulan = 'Apr';
    else if (getBulan === 5) bulan = 'Mei';
    else if (getBulan === 6) bulan = 'Jun';
    else if (getBulan === 7) bulan = 'Jul';
    else if (getBulan === 8) bulan = 'Agt';
    else if (getBulan === 9) bulan = 'Sep';
    else if (getBulan === 10) bulan = 'Okt';
    else if (getBulan === 11) bulan = 'Nov';
    else if (getBulan === 12) bulan = 'Des';
  
    if (!tgl) {
      return { tgl: '-', time: '-' };
    }
  
    const tglku = `${date.getDate()} ${bulan} ${date.getFullYear()}`;
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  
    return { tgl: tglku, time };
  };
  
  // kalau ingin bisa di-import sebagai default juga:
  export default { tglConvert };
  