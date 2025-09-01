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
    metadata: { 
      uploadedBy: "user@example.com", 
      uploadDate: new Date(),
      auditId: req.body.auditId || null
    },
  }),
});

// Límite: 50 MB
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ✅ Subir archivos (modificado para soportar archivo único)
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }
  
  console.log("✅ Archivo guardado en GridFS:", {
    fileId: req.file.id,
    filename: req.file.filename,
    auditId: req.body.auditId,
    size: req.file.size,
    metadata: req.file.metadata
  });
  
  res.json({
    message: "✅ Archivo subido correctamente",
    fileId: req.file.id,
    filename: req.file.filename,
    uploadDate: req.file.metadata.uploadDate,
    auditId: req.body.auditId,
    size: req.file.size
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

// ✅ Obtener archivos por auditId
router.get("/files/audit/:auditId", async (req, res) => {
  try {
    const { auditId } = req.params;
    console.log(`🔍 Buscando archivos para auditId: ${auditId}`);
    
    const files = await mongoose.connection.db
      .collection("uploads.files")
      .find({ "metadata.auditId": auditId })
      .toArray();

    console.log(`📁 Encontrados ${files.length} archivos para auditId: ${auditId}`);
    
    const response = files.map((f) => ({
      id: f._id,
      filename: f.filename,
      size: f.length,
      uploadDate: f.uploadDate,
      contentType: f.contentType,
      metadata: f.metadata,
    }));

    res.json(response);
  } catch (err) {
    console.error("❌ Error al obtener archivos por auditId:", err);
    res.status(500).json({ error: "Error al obtener archivos de la auditoría" });
  }
});

// ✅ Descargar archivo
router.get("/download/:fileId", async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.fileId);
    
    // Obtener información del archivo
    const fileInfo = await mongoose.connection.db
      .collection("uploads.files")
      .findOne({ _id: fileId });

    if (!fileInfo) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    // Crear stream de descarga
    const downloadStream = gfs.openDownloadStream(fileId);
    
    // Configurar headers
    res.set({
      'Content-Type': fileInfo.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileInfo.filename}"`,
      'Content-Length': fileInfo.length
    });

    // Pipe del stream al response
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error("❌ Error descargando archivo:", error);
      res.status(500).json({ error: "Error al descargar archivo" });
    });

  } catch (err) {
    console.error("❌ Error en descarga:", err);
    res.status(500).json({ error: "Error al descargar archivo" });
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
router.post("/process/:id", async (req, res) => {
  try {
    const { rows } = await readExcelFromGridFS(req.params.id);

    const importedRecords = rows.length;
    const warnings = rows.filter((row) =>
      Object.values(row).some((val) => !val)
    ).length;

    res.json({
      success: true,
      totalRows: importedRecords,
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

// ✅ Cruce de información (campo clave + campo resultado asignado)
router.post("/cross-check", async (req, res) => {
  try {
    const { fileIds, key, result } = req.body;
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
        const keyValue = row[key];
        const resultValue = row[result];
        if (!keyValue) return;

        if (!occurrences.has(keyValue)) {
          occurrences.set(keyValue, { archivos: new Set(), resultValue: resultValue || "N/A" });
        }
        occurrences.get(keyValue).archivos.add(dataset.filename);

        // Si hay valor del campo resultado, lo actualizamos
        if (resultValue) {
          occurrences.get(keyValue).resultValue = resultValue;
        }
      });
    });

    const results = [];
    occurrences.forEach((data, keyValue) => {
      results.push({
        valor: keyValue,
        resultado: data.archivos.size > 1 ? "hay coincidencia" : "no hay coincidencia",
        archivos: [...data.archivos],
        resultadoAsignado: data.resultValue,
      });
    });

    lastCrossResults = { key, result, results };

    res.json({
      key,
      result,
      totalFiles: datasets.length,
      totalValues: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ Error en cruce de información - upload.js:179", err);
    res.status(500).json({ error: "Error en cruce de información" });
  }
});

// ✅ Generar reporte Excel con valor de clave y resultado asignado
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
      [lastCrossResults.result]: r.resultadoAsignado || "N/A",
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
    console.error("❌ Error generando reporte Excel - upload.js:221", err);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});

// ✅ Generar informe PDF del cruce de información
router.get("/cross-check/report-pdf", (req, res) => {
  try {
    if (!lastCrossResults) {
      return res.status(400).json({ error: "No hay resultados previos de cruce" });
    }

    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentTime = new Date().toLocaleTimeString('es-ES');
    
    // Generar HTML del informe
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Informe de Cruce de Información - AudiconFlow</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0078D4; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0078D4; margin-bottom: 10px; }
            .title { font-size: 20px; margin-bottom: 5px; }
            .subtitle { color: #666; font-size: 14px; }
            .info-section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #0078D4; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
            .info-item { display: flex; justify-content: space-between; padding: 5px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #0078D4; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .coincidence { color: #28a745; font-weight: bold; }
            .no-coincidence { color: #dc3545; }
            .summary { margin: 20px 0; padding: 15px; background-color: #e8f4fd; border-radius: 5px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🎯 AudiconFlow</div>
            <div class="title">Informe de Cruce de Información</div>
            <div class="subtitle">Análisis de Coincidencias de Datos</div>
        </div>

        <div class="info-section">
            <h3>📊 Información del Análisis</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">Campo Clave:</span>
                    <span class="value">${lastCrossResults.key}</span>
                </div>
                <div class="info-item">
                    <span class="label">Campo Resultado:</span>
                    <span class="value">${lastCrossResults.result}</span>
                </div>
                <div class="info-item">
                    <span class="label">Total de Registros:</span>
                    <span class="value">${lastCrossResults.results.length}</span>
                </div>
                <div class="info-item">
                    <span class="label">Fecha de Generación:</span>
                    <span class="value">${currentDate} ${currentTime}</span>
                </div>
            </div>
        </div>

        <div class="summary">
            <h3>📈 Resumen Ejecutivo</h3>
            <p><strong>Coincidencias encontradas:</strong> ${lastCrossResults.results.filter(r => r.resultado === 'hay coincidencia').length} registros</p>
            <p><strong>Sin coincidencias:</strong> ${lastCrossResults.results.filter(r => r.resultado === 'no hay coincidencia').length} registros</p>
            <p><strong>Tasa de coincidencia:</strong> ${((lastCrossResults.results.filter(r => r.resultado === 'hay coincidencia').length / lastCrossResults.results.length) * 100).toFixed(1)}%</p>
        </div>

        <h3>📋 Resultados Detallados</h3>
        <table>
            <thead>
                <tr>
                    <th>${lastCrossResults.key}</th>
                    <th>Estado</th>
                    <th>Archivos</th>
                    <th>${lastCrossResults.result}</th>
                </tr>
            </thead>
            <tbody>
                ${lastCrossResults.results.map(r => `
                    <tr>
                        <td>${r.valor}</td>
                        <td class="${r.resultado === 'hay coincidencia' ? 'coincidence' : 'no-coincidence'}">
                            ${r.resultado === 'hay coincidencia' ? '✅ Hay coincidencia' : '❌ No hay coincidencia'}
                        </td>
                        <td>${r.archivos.join(', ')}</td>
                        <td>${r.resultadoAsignado || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p>Informe generado por AudiconFlow - Sistema de Auditoría y Análisis de Datos</p>
            <p>© ${new Date().getFullYear()} - Todos los derechos reservados</p>
        </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename=informe_cruce_${currentDate.replace(/\//g, '-')}.html`);
    res.send(htmlContent);

  } catch (err) {
    console.error("❌ Error generando informe PDF - upload.js", err);
    res.status(500).json({ error: "Error al generar informe" });
  }
});

export default router;
