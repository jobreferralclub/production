const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const { jsonrepair } = require("jsonrepair");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Google Sheets API
const { google } = require("googleapis");

// Custom LLM modules
const { analyzeResumeWithLLM } = require("./resumeAnalyzer");
const { extractText } = require("./resumeParser");
const { extractTextAndEmail } = require("./utils/parser");
const { scoreResumeWithLLM } = require("./utils/scoring");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const UPLOAD_FOLDER = "uploads";
fs.ensureDirSync(UPLOAD_FOLDER);

// File storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Filetype validator
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
function allowedFile(filename) {
  return ALLOWED_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

/* ================== RESUME ENDPOINTS ================== */

// ✅ Extract Text from Resume
app.post("/extract-text", upload.single("resume"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded." });

  try {
    let text = "";

    if (file.mimetype === "application/pdf") {
      const data = await pdfParse(fs.readFileSync(file.path));
      text = data.text;
    } else if (file.mimetype.includes("officedocument.wordprocessingml.document")) {
      const result = await mammoth.extractRawText({ buffer: fs.readFileSync(file.path) });
      text = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type." });
    }

    fs.unlinkSync(file.path);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to extract text" });
  }
});

// ✅ Enhance Resume with LLM
app.post("/enhance-resume", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || typeof resumeText !== "string")
    return res.status(400).json({ error: "Invalid or missing resumeText." });

  if (resumeText.length > 15000)
    return res.status(400).json({ error: "Resume too long. Limit to 15,000 characters." });

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
  "experience": [...],
  "education": [...],
  "skills": [...],
  "projects": [...]
}

⚠️ Do not include commentary or markdown. Only return clean JSON.
Here is the resume text:
${trimmedResume}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const content = (await result.response).text().trim().replace(/```json|```/g, "");

    const repairedJson = jsonrepair(content);
    const parsed = JSON.parse(repairedJson);

    return res.json(parsed);
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to enhance resume using Gemini." });
  }
});

// ✅ Format resume into structured JSON
app.post("/format-pdf", async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || typeof resumeText !== "string")
    return res.status(400).json({ error: "Invalid or missing resumeText." });

  if (resumeText.length > 15000)
    return res.status(400).json({ error: "Resume too long. Limit to 15,000 characters." });

  const trimmedResume = resumeText.slice(0, 3000);

  const prompt = `
You are a resume parsing expert.
Without changing any content, convert the following resume text into valid structured JSON.

{
  "personalInfo": {...},
  "experience": [...],
  "education": [...],
  "skills": [...],
  "projects": [...]
}

⚠️ Do not include commentary or markdown.
Resume text:
${trimmedResume}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const content = (await result.response).text().trim().replace(/```json|```/g, "");

    const repairedJson = jsonrepair(content);
    const parsed = JSON.parse(repairedJson);

    return res.json(parsed);
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to format resume using Gemini." });
  }
});

// ✅ Generate PDF from HTML
app.post("/generate-pdf", async (req, res) => {
  const { html } = req.body;

  if (!html || typeof html !== "string")
    return res.status(400).json({ error: "Invalid or missing HTML content." });

  try {
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="resume.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error.message);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
});

// ✅ LinkedIn Scraping (Basic Public Info)
app.post("/fetch-linkedin", async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes("linkedin.com/in/"))
    return res.status(400).json({ error: "Please provide a valid LinkedIn profile URL." });

  try {
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 Chrome/115.0.0.0 Safari/537.36");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));

    const profileData = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || null;

      return {
        name: getText("h1.text-heading-xlarge") || getText("h1"),
        headline: getText("div.text-body-medium.break-words"),
        location: getText("span.text-body-small.inline.t-black--light.break-words"),
        about: getText("#about ~ div p") || getText("#about ~ div span"),
      };
    });

    await browser.close();

    res.json({ message: "Profile fetched successfully.", profileData });
  } catch (err) {
    console.error("LinkedIn fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch LinkedIn page." });
  }
});

// ✅ Joke Endpoint
app.get("/give-joke", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Tell me a random funny joke.");
    const joke = (await result.response).text().trim();

    if (!joke) return res.status(500).json({ error: "No joke generated." });
    return res.json({ joke });
  } catch (err) {
    console.error("Joke generation error:", err);
    res.status(500).json({ error: "Failed to generate joke." });
  }
});

// ✅ Analyze Resume
app.post("/analyze", upload.single("resume"), async (req, res) => {
  const file = req.file;
  if (!file || !allowedFile(file.originalname))
    return res.status(400).json({ success: false, error: "Invalid file format" });

  try {
    const resumeText = await extractText(file.path);
    const result = await analyzeResumeWithLLM(resumeText);
    await fs.remove(file.path);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ success: false, error: "Error during resume analysis" });
  }
});

// ✅ Rank Resumes
app.post("/rank", upload.array("resumes"), async (req, res) => {
  const {
    jd_text = "",
    tech_skills = "",
    soft_skills = "",
    top_n,
    weight_skills = 0,
    weight_experience = 0,
    weight_education = 0,
    weight_projects = 0,
    weight_achievements = 0,
  } = req.body;

  if (!jd_text || !req.files || req.files.length === 0)
    return res.status(400).json({ error: "Job description or resume files missing" });

  try {
    const techList = tech_skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const softList = soft_skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const customWeights = {
      skills: parseFloat(weight_skills),
      experience: parseFloat(weight_experience),
      education: parseFloat(weight_education),
      projects: parseFloat(weight_projects),
      achievements: parseFloat(weight_achievements),
    };

    const results = [];

    for (const file of req.files) {
      const parsed = await extractTextAndEmail(file);
      const score = await scoreResumeWithLLM({
        resumeText: parsed.text,
        jdText: jd_text,
        apiKey: process.env.API_KEY,
        techSkills: techList,
        softSkills: softList,
        customWeights,
      });

      results.push({ ...score, file_name: parsed.file_name, email: parsed.email });
    }

    results.sort((a, b) => (b.final_score || 0) - (a.final_score || 0));
    const topResults = top_n ? results.slice(0, parseInt(top_n)) : results;

    res.json({ results: topResults, tech_skills: techList, soft_skills: softList });
  } catch (err) {
    console.error("Ranking error:", err);
    res.status(500).json({ error: err.message, trace: err.stack });
  }
});

/* ================== GOOGLE SHEETS ENDPOINT ================== */

const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, "credentials.json"), "utf-8"));
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const SHEET_ID = "1ZUTCPSQIZVM5fbdYQ3mUBnteQfN9N7rUAw8z1UX0T_g";
const RANGE = "Sheet1!B2:B9"; // Only fetch open role numbers

const JOB_TITLES = [
  "Product Management",
  "Program & Project Management",
  "Operations & Supply Chain Management",
  "Sales & Account Management",
  "Category & Vendor Management",
  "Analytics",
  "Strategy & Consulting",
  "Marketing Management",
];

app.get("/api", (req, res) => {
  res.end("Hello from the server!");
});

app.get("/api/roles", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values || [];

    const openRoles = JOB_TITLES.map((title, index) => ({
      title,
      count: Number(rows[index]?.[0] || 0),
    }));

    res.json({ openRoles });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

/* ================== HEALTH CHECK ================== */

app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.get("/", (req, res) => res.send("Hello from the unified backend! 🚀"));

app.listen(PORT, () => {
  console.log(`🚀 Unified server running on http://localhost:${PORT}`);
});
