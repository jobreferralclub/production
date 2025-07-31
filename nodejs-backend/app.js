const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Custom modules
const { analyzeResumeWithLLM } = require('./resumeAnalyzer');
const { extractText } = require('./resumeParser');
const { extractTextAndEmail } = require('./utils/parser');
const { scoreResumeWithLLM } = require('./utils/scoring');

const app = express();

// CORS configuration
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Config
const UPLOAD_FOLDER = 'uploads';
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

// Ensure upload folder exists
fs.ensureDirSync(UPLOAD_FOLDER);

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Function to check allowed file
function allowedFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
}

// ✅ Analyze a single resume
app.post('/analyze', upload.single('resume'), async (req, res) => {
    try {
        const file = req.file;
        
        if (!file || !allowedFile(file.filename)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file format'
            });
        }

        const filepath = file.path;
        
        try {
            const resumeText = await extractText(filepath);
            const result = await analyzeResumeWithLLM(resumeText);
            
            // Remove file after processing
            await fs.remove(filepath);
            
            return res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('❌ Error analyzing resume:', error);
            return res.status(500).json({
                success: false,
                error: 'Error during resume analysis'
            });
        }
    } catch (error) {
        console.error('❌ Error in analyze endpoint:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// ✅ Rank multiple resumes based on a JD
app.post('/rank', upload.array('resumes'), async (req, res) => {
    try {
        const jdText = (req.body.jd_text || '').trim();
        const techSkillsRaw = req.body.tech_skills || '';
        const softSkillsRaw = req.body.soft_skills || '';
        const topNRaw = req.body.top_n;

        const weightSkills = parseFloat(req.body.weight_skills || 0.0);
        const weightExperience = parseFloat(req.body.weight_experience || 0.0);
        const weightEducation = parseFloat(req.body.weight_education || 0.0);
        const weightProjects = parseFloat(req.body.weight_projects || 0.0);
        const weightAchievements = parseFloat(req.body.weight_achievements || 0.0);

        const files = req.files;

        if (!jdText || !files || files.length === 0) {
            return res.status(400).json({
                error: 'Job description or resume files missing'
            });
        }

        const techList = techSkillsRaw.split(',')
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0);
            
        const softList = softSkillsRaw.split(',')
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0);
            
        const topN = topNRaw ? parseInt(topNRaw) : null;

        const customWeights = {
            skills: weightSkills,
            experience: weightExperience,
            education: weightEducation,
            projects: weightProjects,
            achievements: weightAchievements
        };

        const results = [];

        for (const file of files) {
            console.log(`🔍 Processing file: ${file.originalname}`);
            
            const parsed = await extractTextAndEmail(file);
            console.log(`   ↳ email: ${parsed.email} | text length: ${parsed.text.length}`);
            
            const score = await scoreResumeWithLLM({
                resumeText: parsed.text,
                jdText: jdText,
                apiKey: process.env.API_KEY,
                techSkills: techList,
                softSkills: softList,
                customWeights: customWeights
            });
            
            score.file_name = parsed.file_name;
            score.email = parsed.email;
            results.push(score);
        }

        // Sort by final_score in descending order
        results.sort((a, b) => (b.final_score || 0.0) - (a.final_score || 0.0));
        
        // Slice results if topN is specified
        const slicedResults = topN ? results.slice(0, topN) : results;

        return res.json({
            results: slicedResults,
            tech_skills: techList,
            soft_skills: softList
        });

    } catch (error) {
        console.error('❌ ERROR:', error);
        console.error(error.stack);
        return res.status(500).json({
            error: error.message,
            trace: error.stack
        });
    }
});

// ✅ Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// ✅ Run the app on a single port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;