const fs = require('fs');
const zlib = require('zlib');

const pdf = fs.readFileSync('temp_scan.pdf');

let offset = 0;
while (true) {
  const streamIdx = pdf.indexOf('stream', offset);
  if (streamIdx === -1) break;
  const dictStart = pdf.lastIndexOf('<<', streamIdx);
  const dict = pdf.slice(dictStart, streamIdx).toString('binary');
  const endstreamIdx = pdf.indexOf('endstream', streamIdx);
  
  let dataStart = streamIdx + 6;
  if (pdf[dataStart] === 0x0d && pdf[dataStart + 1] === 0x0a) dataStart += 2;
  else if (pdf[dataStart] === 0x0a || pdf[dataStart] === 0x0d) dataStart += 1;
  let dataEnd = endstreamIdx;
  while (pdf[dataEnd - 1] === 0x0a || pdf[dataEnd - 1] === 0x0d) dataEnd--;
  
  const rawData = pdf.slice(dataStart, dataEnd);
  let content = '';
  if (dict.includes('FlateDecode')) {
    try {
      content = zlib.inflateSync(rawData).toString('latin1');
    } catch (e) {}
  } else {
    content = rawData.toString('latin1');
  }
  
  if (content.includes('d') || content.includes('re') || content.includes('S')) {
    const lines = content.split('\n');
    lines.forEach(l => {
      if (l.includes('re') || l.includes(' d ') || l.endsWith(' d') || l.includes('377') || l.includes('364') || l.includes('384')) {
        console.log('Stroke/Rect line:', l);
      }
    });
  }
  
  offset = streamIdx + 6;
}

