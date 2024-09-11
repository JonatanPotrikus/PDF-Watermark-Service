const express = require("express");
const multer = require("multer");
const axios = require("axios");
const { PDFDocument, rgb, degrees } = require("pdf-lib"); // Importar degrees diretamente
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.URL || "http://localhost";
const env = process.env.ENV || "dev";
const url = env == "dev" ? `${host}:${port}` : host;

// Verifica se a pasta uploads existe, se não, cria
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

// Configurar armazenamento de arquivos temporários
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Servir arquivos estáticos da pasta downloads
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// Endpoint para adicionar marca d'água
app.post("/watermark", upload.single("pdf"), async (req, res) => {
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
        y: 70,
        size: 20,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(0), // Caso desejar rotacionar o texto adicionar em GRAUS
      });
      page.drawText(`Nome: ${nome}`, {
        x: 50,
        y: 50,
        size: 12,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(0), // Caso desejar rotacionar o texto adicionar em GRAUS
      });
    });

    // Salvar o PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();
    const downloadPath = path.join(__dirname, "downloads", `watermarked-${Date.now()}.pdf`);

    // Garantir que o diretório de saída exista
    if (!fs.existsSync("downloads")) {
      fs.mkdirSync("downloads");
    }

    fs.writeFileSync(downloadPath, modifiedPdfBytes);

    // Responder com o link para download
    res.json({ url: `${url}/downloads/${path.basename(downloadPath)}` });
  } catch (error) {
    console.error("Erro ao adicionar marca d'água:", error);
    res.status(500).json({ error: "Erro ao processar o PDF." });
  } finally {
    fs.unlinkSync(path.join(__dirname, "uploads", req.file.filename));
  }
});

// Checa se o arquivo existe antes de servir
app.get("/downloads/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, "downloads", fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("File not found");
    }
    res.download(filePath);
  });
});

// Exemplo arquivo = https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf
app.get("/download", async (req, res) => {
  // TODO: Tornar esses query params dinamicos
  const { email, name, arquivo } = req.query;

  if (!email || !name || !arquivo) {
    return res.status(412).send({ message: "Parametros inválidos! [email, name e arquivo]" });
  }

  try {
    const pdfResponse = await axios.get(arquivo, {
      responseType: "arraybuffer",
    });

    const originalPdf = pdfResponse.data;

    // Adiciona marca d'água ao PDF
    const watermarkedPdf = await addWatermark(originalPdf, email, name);

    // Envia o PDF com marca d'água de volta ao usuário
    // Define o header para download do PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="watermarked_${name}.pdf"`);

    // // Envia o PDF com marca d'água
    res.send(Buffer.from(watermarkedPdf));
  } catch (err) {
    res.status(500).send("Erro ao processar o PDF");
  }
});

// Função para adicionar marca d'água
// TODO: Usar esta função tambem no endpoint POST
async function addWatermark(pdfBuffer, email, name) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    page.drawText(`${email} - ${name}`, {
      x: 50,
      y: 50,
      size: 30,
      opacity: 0.5,
    });
  });

  return await pdfDoc.save();
}

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em ${host}:${port}`);
});
