const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegStatic);

const inputVideo = 'D:\\Aplicatia Munchotella\\Video tranzitie\\Crepe_toppings_float_in_air_4k.mp4';
const outputFolder = path.join(__dirname, 'public', 'frames');

console.log('Incepem extragerea cadrelor din video...');
console.log('Video sursă:', inputVideo);
console.log('Destinație:', outputFolder);

// Extragem la calitatea originală (fără resize agresiv)
ffmpeg(inputVideo)
  .outputOptions([
    // '-vf', 'scale=1280:-1', <-- am scos scalarea ca să păstrăm claritatea
    '-qscale:v', '2' // 2 este o calitate excelentă pentru JPEG (foarte aproape de original)
  ])
  .output(path.join(outputFolder, 'frame_%04d.jpg'))
  .on('end', () => {
    console.log('Extragerea cadrelor s-a terminat cu succes!');
  })
  .on('error', (err) => {
    console.error('A apărut o eroare:', err.message);
  })
  .run();
