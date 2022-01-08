import fs from 'fs';
import qr from 'qrcode';
import PDF from 'pdfkit';

// import PDF from 'pdfkit';

const DataPath = 'data';
const CodePath = [DataPath, 'codes'].join('/');
const PdfPath = [DataPath, 'pdfs'].join('/');
const FontPath = [DataPath, 'fonts', 'msyh.ttf'].join('/');


const Prefix = '001-00-211001';

const pageNum = 1000;
// styles
const textFontSize = 45;
const codeFontSize = 35;

const pageWidth = 1040;
const pageHeight = 1600;

const pageTopMargin = 0;
const pageLeftMargin = 0;

const cardWidth = 520;
const cardHeight = 320;
const cardNumX = 2;
const cardNumY = 5;

const cardTopMargin = 60;
const cardLeftMargin = 60;

const cardImageSize = 150;

const cardMeterXOffset = 220;
const cardMeterYOffset = 50;

const cardColorXOffset = 220;
const cardColorYOffset = 130;

const cardCodeYOffset = 220;


const generateQR = async text => {
  try {
    // qr.toFile('data/codes/' + text + '.png', text, {
    //   type: 'image/png',
    //   errorCorrectionLevel: 'H',
    //   margin: 0,
    //   scale: 4,
    // })
    return await qr.toDataURL(text, {
      type: 'image/png',
      errorCorrectionLevel: 'H',
      margin: 0,
      scale: 4,
    })
  } catch (err) {
    console.error(err)
  }
}

const generateCode = (page, num) => {
  const ps = ("0000000000000000" + page).substr(-3);
  const ns = ("0000000000000000" + num).substr(-2);
  return Prefix + '-' + ps + ns;
}


(async () => {
  try {
    await fs.mkdirSync(DataPath);
    await fs.mkdirSync(CodePath);
    await fs.mkdirSync(PdfPath);
  } catch (e) {
    // Nothing
  }

  const doc = await new PDF({ size: [pageWidth, pageHeight], margin: 0 });
  doc.font(FontPath).fontSize(textFontSize);
  doc.pipe(fs.createWriteStream([PdfPath, Prefix + '.pdf'].join('/')));


  for (let page = 0; page < pageNum; page++) {
    for (let i = 0; i < cardNumX; i++) {
      for (let j = 0; j < cardNumY; j++) {

        const startX = pageLeftMargin + i * cardWidth;
        const startY = pageTopMargin + j * cardHeight;

        const code = generateCode(page, i + j * cardNumX);

        // render box
        //await doc.rect(startX, startY, cardWidth, cardHeight).stroke()

        // render qrcode
        const qrimage = await generateQR(code);
        await doc.image(qrimage, startX + cardLeftMargin, startY + cardTopMargin, {
          width: cardImageSize,
          height: cardImageSize
        })

        // render code
        doc.fontSize(codeFontSize);
        await doc.text(code, startX + cardLeftMargin, startY + cardCodeYOffset);

        // render text
        doc.fontSize(textFontSize);
        await doc.text('米数', startX + cardMeterXOffset, startY + cardMeterYOffset);
        await doc.text('花号', startX + cardColorXOffset, startY + cardColorYOffset);
      }
    }
    console.log('完成', page + 1, '/', pageNum);
    if (page < pageNum - 1) doc.addPage({ size: [pageWidth, pageHeight], margin: 0 })
  }

  doc.end();
})();
