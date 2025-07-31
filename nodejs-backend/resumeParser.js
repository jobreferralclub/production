const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
        return await extractTextFromPdf(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
        return await extractTextFromDocx(filePath);
    } else {
        throw new Error('Unsupported file format');
    }
}

async function extractTextFromPdf(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        throw new Error(`Error extracting PDF text: ${error.message}`);
    }
}

async function extractTextFromDocx(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        throw new Error(`Error extracting DOCX text: ${error.message}`);
    }
}

module.exports = {
    extractText,
    extractTextFromPdf,
    extractTextFromDocx
};