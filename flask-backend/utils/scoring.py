import json
import re
import requests

STRAICO_API_URL = "https://api.straico.com/v1/prompt/completion"

def generate_prompt(jd_text, resume_text, tech_skills, soft_skills, custom_weights=None):
    tech_str = ", ".join([s.strip().lower() for s in tech_skills])
    soft_str = ", ".join([s.strip().lower() for s in soft_skills])

    weight_prompt = ""
    if custom_weights and any(v > 0.0 for v in custom_weights.values()):
        weight_prompt += "\n\n### Additional Section Weights:\n"
        for section, value in custom_weights.items():
            if value > 0.0:
                weight_prompt += f"- {section.capitalize()}: {value}\n"
        weight_prompt += "- Give slightly more importance to sections with higher weights.\n"
    else:
        weight_prompt += "\n\n### Use balanced default weighting across resume sections.\n"

    return f"""
You are an expert AI recruiter assistant.
Your task is to evaluate a candidate’s resume based on the following:

### Objective:
Evaluate the candidate's resume against the job description and calculate a **final score (0.0 - 1.0)**.

### Scoring Guidelines:
1. **Base Score:**  
   - Start by evaluating the overall alignment of the resume with the JD.
   - Consider roles, responsibilities, and requirements.

2. **Skill-based Improvement:**  
   - For each technical skill listed, if the candidate has it (explicitly or implied), increase the score slightly.
   - Do the same for soft skills.
   - Assign individual scores for each skill (0.0 to 1.0) based on strength and evidence.

3. **Custom Weights:**  
   - If custom section weights are provided, give additional scrutiny to these sections (skills, experience, education, projects, achievements).
   - Adjust the final score upward or downward slightly based on these weights.

4. **Location Penalty:**  
   - If the JD specifies a location and the candidate is in a different city or region, **slightly reduce** the final score.

5. **Final Score Adjustment:**  
   - Ensure the final score is between 0.0 and 1.0 after all adjustments.

### Output JSON (STRICT FORMAT):
{{
  "candidate_name": "Full name or Unknown",
  "tech_skills_scores": {{
    "skill_1": 0.0,
    "skill_2": 0.0
  }},
  "soft_skills_scores": {{
    "skill_1": 0.0,
    "skill_2": 0.0
  }},
  "final_score": 0.0,
  "analysis": "Brief explanation of strengths, weaknesses, and final score reasoning."
}}

### Technical Skills to Evaluate:
{tech_str or "None"}

### Soft Skills to Evaluate:
{soft_str or "None"}

### Job Description:
{jd_text}

### Resume:
{resume_text}
""".strip()


def _safe_json_from_llm(content: str):
    try:
        return json.loads(content)
    except Exception:
        pass
    start, end = content.find("{"), content.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(content[start:end + 1])
        except Exception:
            pass
    for block in re.findall(r"\{[\s\S]*\}", content):
        try:
            return json.loads(block)
        except Exception:
            continue
    raise ValueError("LLM response did not contain valid JSON.")


def score_resume_with_llm(resume_text, jd_text, api_key, tech_skills, soft_skills, custom_weights=None):
    prompt = generate_prompt(jd_text, resume_text, tech_skills, soft_skills, custom_weights)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "models": ["openai/gpt-4"],
        "message": prompt
    }
    try:
        response = requests.post(STRAICO_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        content = response.json()["data"]["completions"]["openai/gpt-4"]["completion"]["choices"][0]["message"]["content"]
        parsed = _safe_json_from_llm(content)
        print("🧠", parsed.get("candidate_name"), "→", parsed.get("final_score"), "—", parsed.get("analysis"))
        return {
            "candidate_name": parsed.get("candidate_name", "Unknown"),
            "tech_skills_scores": parsed.get("tech_skills_scores", {}),
            "soft_skills_scores": parsed.get("soft_skills_scores", {}),
            "final_score": round(parsed.get("final_score", 0.0), 2),
            "analysis": parsed.get("analysis", "")
        }
    except Exception as e:
        print("❌ LLM Error:", e)
        return {
            "candidate_name": "Unknown",
            "tech_skills_scores": {},
            "soft_skills_scores": {},
            "final_score": 0.0,
            "analysis": "LLM failed to respond"
        }

