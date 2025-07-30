from flask import Flask, request, jsonify
from flask_cors import CORS
import os, traceback

# Custom modules
from resume_analyzer import analyze_resume_with_llm
from resume_parser import extract_text
from utils.parser import extract_text_and_email
from utils.scoring import score_resume_with_llm

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Config
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Function to check allowed file
def allowed_file(filename):
    return '.' in filename and os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

# ✅ Analyze a single resume
@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files.get("resume")
    if file and allowed_file(file.filename):
        filename = file.filename
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        try:
            resume_text = extract_text(filepath)
            result = analyze_resume_with_llm(resume_text)
            os.remove(filepath)
            return jsonify({"success": True, "data": result})
        except Exception as e:
            print("❌ Error analyzing resume:", e)
            return jsonify({"success": False, "error": "Error during resume analysis"}), 500
    else:
        return jsonify({"success": False, "error": "Invalid file format"}), 400

# ✅ Rank multiple resumes based on a JD
@app.route("/rank", methods=["POST"])
def rank_resumes():
    try:
        jd_text = request.form.get("jd_text", "").strip()
        tech_skills_raw = request.form.get("tech_skills", "")
        soft_skills_raw = request.form.get("soft_skills", "")
        top_n_raw = request.form.get("top_n")

        weight_skills = float(request.form.get("weight_skills", 0.0))
        weight_experience = float(request.form.get("weight_experience", 0.0))
        weight_education = float(request.form.get("weight_education", 0.0))
        weight_projects = float(request.form.get("weight_projects", 0.0))
        weight_achievements = float(request.form.get("weight_achievements", 0.0))

        files = request.files.getlist("resumes")

        if not jd_text or not files:
            return jsonify({"error": "Job description or resume files missing"}), 400

        tech_list = [s.strip().lower() for s in tech_skills_raw.split(",") if s.strip()]
        soft_list = [s.strip().lower() for s in soft_skills_raw.split(",") if s.strip()]
        top_n = int(top_n_raw) if top_n_raw else None

        custom_weights = {
            "skills": weight_skills,
            "experience": weight_experience,
            "education": weight_education,
            "projects": weight_projects,
            "achievements": weight_achievements,
        }

        results = []

        for file in files:
            print(f"🔍 Processing file: {getattr(file, 'filename', 'unknown')}")
            parsed = extract_text_and_email(file)
            print(f"   ↳ email: {parsed['email']} | text length: {len(parsed['text'])}")
            score = score_resume_with_llm(
                resume_text=parsed["text"],
                jd_text=jd_text,
                api_key=os.getenv("API_KEY"),
                tech_skills=tech_list,
                soft_skills=soft_list,
                custom_weights=custom_weights
            )
            score["file_name"] = parsed["file_name"]
            score["email"] = parsed["email"]
            results.append(score)

        results = sorted(results, key=lambda x: x.get("final_score", 0.0), reverse=True)
        sliced_results = results[:top_n] if top_n else results

        return jsonify({
            "results": sliced_results,
            "tech_skills": tech_list,
            "soft_skills": soft_list
        })

    except Exception as e:
        print("❌ ERROR:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# ✅ Health check route
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})

# ✅ Run the app on a single port
if __name__ == "__main__":
    app.run(port=3000, debug=True)
