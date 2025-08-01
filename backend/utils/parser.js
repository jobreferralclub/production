const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Extract PDF text
async function extractTextFromPdf(file) {
    try {
        let dataBuffer;
        
        if (file.buffer) {
            dataBuffer = file.buffer;
        } else if (file.path) {
            const fs = require('fs');
            dataBuffer = fs.readFileSync(file.path);
        } else {
            throw new Error('Invalid file object');
        }
        
        const data = await pdfParse(dataBuffer);
        return data.text || '';
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        return '';
    }
}

// Extract DOCX text
async function extractTextFromDocx(file) {
    try {
        let result;
        
        if (file.buffer) {
            result = await mammoth.extractRawText({ buffer: file.buffer });
        } else if (file.path) {
            result = await mammoth.extractRawText({ path: file.path });
        } else {
            throw new Error('Invalid file object');
        }
        
        return result.value || '';
    } catch (error) {
        console.error('Error extracting DOCX text:', error);
        return '';
    }
}

// Extract first email found
function extractEmail(text) {
    const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(pattern);
    return matches ? matches[0] : null;
}

// Extract text + email from file
async function extractTextAndEmail(file) {
    const fileName = file.originalname || file.filename || file.name || 'unknown';
    
    let text = '';
    
    if (fileName.toLowerCase().endsWith('.pdf')) {
        text = await extractTextFromPdf(file);
    } else if (fileName.toLowerCase().endsWith('.docx')) {
        text = await extractTextFromDocx(file);
    } else {
        return {
            file_name: fileName,
            email: 'Unsupported file type',
            text: ''
        };
    }
    
    const email = extractEmail(text);
    
    return {
        file_name: fileName,
        email: email || 'Not Found',
        text: text.trim()
    };
}

module.exports = {
    extractTextFromPdf,
    extractTextFromDocx,
    extractEmail,
    extractTextAndEmail
};