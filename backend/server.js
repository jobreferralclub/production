const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();
const puppeteer = require("puppeteer");
const { jsonrepair } = require("jsonrepair");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Resume Text Extraction Endpoint
app.post("/extract-text", upload.single("resume"), async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded." });

  try {
    let text = "";

    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const buffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type." });
    }

    fs.unlinkSync(file.path); // Clean up temp file
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to extract text" });
  }
});

// Joke Generator via Straico API
app.get("/give-joke", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent("Tell me a random funny joke.");
    const response = await result.response;
    const joke = response.text().trim();

    if (!joke) {
      return res.status(500).json({ error: "No joke generated." });
    }

    return res.json({ joke });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Failed to generate joke." });
  }
});

// Replace the previous joke endpoint with this
app.post("/enhance-resume", async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || typeof resumeText !== "string") {
    return res.status(400).json({ error: "Invalid or missing resumeText." });
  }

  if (resumeText.length > 15000) {
    return res.status(400).json({
      error: "Your resume is too long. Please shorten it to under 15,000 characters.",
    });
  }

  const trimmedResume = resumeText.slice(0, 3000);

  const prompt = `
You are an AI resume enhancement expert.

Enhance the following resume content by improving grammar, clarity, and impact, without changing the meaning. 
Do NOT invent or add fictional information.

Only return valid, enhanced JSON matching this exact structure:

{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "summary": "string"
  },
  "experience": [
    {
      "id": 1,
      "company": "string",
      "position": "string",
      "startDate": "string(YYYY-MM-DD)",
      "endDate": "string(YYYY-MM-DD)",
      "description": "string",
      "current": false
    }
  ],
  "education": [
    {
      "id": 1,
      "school": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string(YYYY-MM-DD)",
      "endDate": "string(YYYY-MM-DD)",
      "gpa": "string"
    }
  ],
  "skills": [
    {
      "id": 1,
      "name": "string",
      "level": "string(Beginner/Intermediate/Advanced/Expert)"
    }
  ],
  "projects": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "technologies": "string",
      "url": "string"
    }
  ]
}

⚠️ Do not include any commentary, explanations, or markdown (like triple backticks). Only respond with clean, parsable JSON.

Here's the resume text to enhance:

${trimmedResume}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const content = (await result.response).text().trim();

    const cleaned = content.replace(/```json|```/g, "").trim();

    try {
      const repairedJson = jsonrepair(cleaned);
      const parsed = JSON.parse(repairedJson);
      return res.json(parsed);
    } catch (repairErr) {
      console.error("JSON repair failed:", repairErr);
      return res.status(500).json({
        error: "AI returned malformed JSON that couldn't be fixed.",
        raw: content,
      });
    }
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to enhance resume using Gemini." });
  }
});

app.post("/fetch-linkedin", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string" || !url.includes("linkedin.com/in/")) {
    return res.status(400).json({ error: "Please provide a valid LinkedIn profile URL." });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9"
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for dynamic content

    const profileData = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : null;
      };

      // These selectors are based on the current public profile structure
      const name = getText("h1.text-heading-xlarge") || getText("h1");
      const headline = getText("div.text-body-medium.break-words") || getText("div.text-body-medium");
      const location = getText("span.text-body-small.inline.t-black--light.break-words") || getText("span.text-body-small");
      const about = getText("#about ~ div p") || getText("#about ~ div span");

      return { name, headline, location, about };
    });

    await browser.close();

    res.json({
      message: "Public profile data fetched successfully.",
      profileData
    });
  } catch (error) {
    console.error("Error fetching LinkedIn page:", error.message);
    res.status(500).json({ error: "Failed to fetch LinkedIn page." });
  }
});

app.post("/format-pdf", async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || typeof resumeText !== "string") {
    return res.status(400).json({ error: "Invalid or missing resumeText." });
  }

  if (resumeText.length > 15000) {
    return res.status(400).json({
      error: "The resume is too long. Please reduce it under 15,000 characters.",
    });
  }

  const trimmedResume = resumeText.slice(0, 3000); // truncate for stability

  const prompt = `
You are a resume parsing expert.

Without changing any content, convert the following plain resume text into **valid structured JSON**.

DO NOT enhance or modify any text. Simply extract it into this structure exactly as it appears:

{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "summary": "string"
  },
  "experience": [
    {
      "id": 1,
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string",
      "current": false
    }
  ],
  "education": [
    {
      "id": 1,
      "school": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string"
    }
  ],
  "skills": [
    {
      "id": 1,
      "name": "string",
      "level": "string"
    }
  ],
  "projects": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "technologies": "string",
      "url": "string"
    }
  ]
}

⚠️ Do NOT add any commentary or explanation. Only return clean JSON.

Here is the resume text to convert:
${trimmedResume}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const content = (await result.response).text().trim();

    const cleaned = content.replace(/```json|```/g, "").trim();

    try {
      const repairedJson = jsonrepair(cleaned);
      const parsed = JSON.parse(repairedJson);
      return res.json(parsed);
    } catch (repairErr) {
      console.error("JSON repair failed:", repairErr);
      return res.status(500).json({
        error: "AI returned malformed JSON that couldn't be fixed.",
        raw: content,
      });
    }
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to format resume using Gemini." });
  }
});

app.post("/generate-pdf", async (req, res) => {
  const { html } = req.body;

  if (!html || typeof html !== "string") {
    return res.status(400).json({ error: "Invalid or missing HTML content." });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set the HTML content directly
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate the PDF buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Set headers and send PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="resume.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
});

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
})

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
