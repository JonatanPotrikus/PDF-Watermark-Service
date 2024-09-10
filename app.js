const express = require('express');
const multer = require('multer');
const { PDFDocument, rgb, degrees } = require('pdf-lib'); // Importar degrees diretamente
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.URL || 'http://localhost';

// Configurar LIB - multer
const upload = multer({ dest: 'uploads/' });

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));


// Endpoint para adicionar marca d'água
app.post('/watermark', upload.single('pdf'), async (req, res) => {
  const { email, nome } = req.body;
  const filePath = req.file.path;

  try {
    // Ler o arquivo PDF
    // TODO: Pode ser alterado para em vez de receber um arquivo receber um link
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Adicionar marca d'água
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      page.drawText(`Email: ${email}`, {
        x: 50,
        y: 50,
        size: 20,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(0), // Caso desejar rotacionar o texto adicionar em GRAUS
      });
      page.drawText(`Nome: ${nome}`, {
        x: 50,
        y: 30,
        size: 12,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(0), // Caso desejar rotacionar o texto adicionar em GRAUS
      });
    });

    // Salvar o PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();
    const outputPath = path.join('downloads', `watermarked-${Date.now()}.pdf`);

    // Garantir que o diretório de saída exista
    if (!fs.existsSync('downloads')) {
      fs.mkdirSync('downloads');
    }

    fs.writeFileSync(outputPath, modifiedPdfBytes);

    // Responder com o link para download
    res.json({
      url: `${host}:${port}/${outputPath}`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar o PDF.' });
  }
});

// Servir arquivos estáticos da pasta downloads
app.use('/downloads', express.static('downloads'));

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em ${host}:${port}`);
});
