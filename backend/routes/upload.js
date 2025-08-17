import express from "express";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import XLSX from "xlsx";
import { Readable } from "stream";

const router = express.Router();

// Acceso a GridFSBucket
let gfs;
mongoose.connection.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
});

// Configuración de almacenamiento GridFS
const storage = new GridFsStorage({
  url: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/audiconflow",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => ({
    filename: file.originalname,
    bucketName: "uploads",
    metadata: { uploadedBy: "user@example.com", uploadDate: new Date() },
  }),
});

// Límite: 50 MB
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ✅ Subir archivos
router.post("/upload", upload.array("files"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No se subieron archivos" });
  }
  res.json({
    message: "✅ Archivos subidos correctamente",
    files: req.files.map((f) => ({
      filename: f.filename,
      id: f.id,
      uploadDate: f.metadata.uploadDate,
    })),
  });
});

// ✅ Listar archivos
router.get("/files", async (req, res) => {
  try {
    const files = await mongoose.connection.db
      .collection("uploads.files")
      .find({})
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "No hay archivos subidos" });
    }

    res.json(
      files.map((f) => ({
        id: f._id,
        filename: f.filename,
        length: f.length,
        uploadDate: f.uploadDate,
        contentType: f.contentType,
        metadata: f.metadata,
      }))
    );
  } catch (err) {
    console.error("❌ Error al listar archivos: - upload.js:71", err);
    res.status(500).json({ error: "Error al obtener archivos" });
  }
});

// Helper para leer archivo Excel desde GridFS
const readExcelFromGridFS = async (fileId) => {
  const chunks = [];
  const downloadStream = gfs.openDownloadStream(new ObjectId(fileId));

  const buffer = await new Promise((resolve, reject) => {
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
    downloadStream.on("error", reject);
  });

  const fileInfo = await mongoose.connection.db
    .collection("uploads.files")
    .findOne({ _id: new ObjectId(fileId) });

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  return { rows, filename: fileInfo?.filename || "Archivo desconocido" };
};

// ✅ Procesar archivo
router.get("/process/:id", async (req, res) => {
  try {
    const { rows } = await readExcelFromGridFS(req.params.id);

    const importedRecords = rows.length;
    const warnings = rows.filter((row) =>
      Object.values(row).some((val) => !val)
    ).length;

    res.json({
      importedRecords,
      warnings,
      errors: 0,
      preview: rows.slice(0, 5),
      rows,
    });
  } catch (err) {
    console.error("❌ Error en /process/:id: - upload.js:116", err);
    res.status(500).json({ error: "Error procesando archivo" });
  }
});

// 🔄 Guardar últimos resultados
let lastCrossResults = null;

// ✅ Cruce de información
router.post("/cross-check", async (req, res) => {
  try {
    const { fileIds, key } = req.body;
    if (!fileIds || fileIds.length < 2) {
      return res.status(400).json({
        error: "Debes seleccionar al menos 2 archivos para cruzar",
      });
    }

    const datasets = [];
    for (const fileId of fileIds) {
      datasets.push(await readExcelFromGridFS(fileId));
    }

    const occurrences = new Map();

    datasets.forEach((dataset) => {
      dataset.rows.forEach((row) => {
        const value = row[key];
        if (!value) return;

        if (!occurrences.has(value)) {
          occurrences.set(value, new Set());
        }
        occurrences.get(value).add(dataset.filename);
      });
    });

    const results = [];
    occurrences.forEach((filesSet, value) => {
      results.push({
        valor: value,
        resultado: filesSet.size > 1 ? "hay coincidencia" : "no hay coincidencia",
        archivos: [...filesSet],
      });
    });

    lastCrossResults = { key, results };

    res.json({
      key,
      totalFiles: datasets.length,
      totalValues: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ Error en cruce de información - upload.js:171", err);
    res.status(500).json({ error: "Error en cruce de información" });
  }
});

// ✅ Generar reporte
router.get("/cross-check/report", (req, res) => {
  try {
    if (!lastCrossResults) {
      return res
        .status(400)
        .json({ error: "No hay resultados previos de cruce" });
    }

    const data = lastCrossResults.results.map((r) => ({
      [`${lastCrossResults.key}`]: r.valor,
      Resultado: r.resultado,
      Archivos: r.archivos.join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cruce");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reporte_cruce.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const stream = Readable.from(excelBuffer);
    stream.pipe(res);
  } catch (err) {
    console.error("❌ Error generando reporte Excel - upload.js:212", err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

export default router;
