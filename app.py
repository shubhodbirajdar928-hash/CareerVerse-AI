import os
import json
import traceback
import pdfplumber

from dotenv import load_dotenv
from google import genai
from flask import Flask, render_template, request, jsonify

# =====================================================
# Load Environment Variables
# =====================================================

load_dotenv()
# =====================================================
# Country Currency Database
# =====================================================

with open("static/data/countries_currency.json", "r", encoding="utf-8") as f:
    COUNTRY_CURRENCY = json.load(f)

API_KEY = os.getenv("GEMINI_API_KEY")
print("CURRENT KEY:", API_KEY[:20])

if not API_KEY:
    raise Exception("❌ GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=API_KEY)

# =====================================================
# Gemini Model Fallback
# =====================================================

GEMINI_MODELS = [
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
]


def generate_with_fallback(prompt):

    last_error = None

    for model in GEMINI_MODELS:

        try:

            print(f"Trying {model}")

            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            if response.text:
                print(f"Using {model}")
                return response.text.strip()

        except Exception as e:

            print(f"{model} failed")

            last_error = e

            continue

    raise Exception(f"All Gemini models failed.\n{last_error}")


# =====================================================
# Flask Configuration
# =====================================================

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# =====================================================
# Global Chat Memory
# =====================================================

chat_history = []


# =====================================================
# Helper Functions
# =====================================================

def clean_json(text):

    text = text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "", 1)

    if text.startswith("```"):
        text = text.replace("```", "", 1)

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


def success(data):
    data["success"] = True
    return jsonify(data)


def failure(message, code=500):
    return jsonify({
        "success": False,
        "error": message
    }), code
# =====================================================
# Gemini Error Handler
# =====================================================

def handle_gemini_error(e):

    error = str(e)

    if "RESOURCE_EXHAUSTED" in error or "429" in error:

        return failure(
            "🚫 Gemini API quota exceeded. Please wait 1 minute and try again, or use another API key.",
            429
        )

    if "401" in error or "UNAUTHENTICATED" in error:

        return failure(
            "🔑 Invalid Gemini API Key.",
            401
        )

    return failure(error)

    

# =====================================================
# Debug (Run Once)
# =====================================================

try:

    print("\n===============================")
    print("CareerVerse AI Started")
    print("===============================")

    print("Available Models:\n")

    for model in client.models.list():
        print(model.name)

    print("\n===============================\n")

except Exception as e:

    print(e)


# =====================================================
# Home
# =====================================================

@app.route("/")
def home():
    return render_template("index.html")


# =====================================================
# Generate Roadmap Page
# =====================================================

@app.route("/generate")
def generate():
    return render_template("generate.html")


# =====================================================
# About
# =====================================================

@app.route("/about")
def about():
    return render_template("about.html")


# =====================================================
# AI Hub
# =====================================================

@app.route("/ai-tools")
def ai_tools():
    return render_template("ai_tools.html")


# =====================================================
# AI Career Assistant
# =====================================================

@app.route("/career-chat")
def career_chat():
    return render_template("career_chat.html")


# =====================================================
# Resume Analyzer
# =====================================================

@app.route("/resume")
def resume():
    return render_template("resume_analyzer.html")


# =====================================================
# Skill Gap Analyzer
# =====================================================

@app.route("/skill-gap")
def skill_gap():
    return render_template("skill_gap.html")
# =====================================================
# Career Reality
# =====================================================

@app.route("/career-reality")
def career_reality_page():
    return render_template("career_reality.html")


# =====================================================
# Career Match
# =====================================================

@app.route("/career-match")
def career_match():
    return render_template("career_match.html")


# =====================================================
# Career Comparison
# =====================================================

@app.route("/compare")
def compare():
    return render_template("career_compare.html")


# =====================================================
# Salary Predictor
# =====================================================

@app.route("/salary-predictor")
def salary_predictor():
    return render_template("salary_predictor.html")


# =====================================================
# Clear Chat
# =====================================================

@app.route("/clear-chat", methods=["POST"])
def clear_chat():

    global chat_history

    chat_history.clear()

    return jsonify({
        "success": True
    })
# =====================================================
# AI Career Chat API
# =====================================================

@app.route("/career-chat-api", methods=["POST"])
def career_chat_api():

    global chat_history

    try:

        data = request.get_json()

        question = data.get("question", "").strip()

        if question == "":
            return failure("Please enter a question.", 400)

        chat_history.append({
            "role": "user",
            "text": question
        })

        chat_history = chat_history[-10:]

        prompt = """
You are CareerVerse AI.

You are an intelligent AI Career Mentor.

Remember the previous conversation.

Answer naturally like ChatGPT.

You help with:

• Career Guidance
• Learning Roadmaps
• Resume Review
• Interview Preparation
• Salary Guidance
• Skill Gap Analysis
• Courses
• Books
• Certifications
• Official Documentation
• Government Exams
• Medical Careers
• Engineering Careers
• Business Careers

Always give practical advice.

Conversation:

"""
        for msg in chat_history:

            prompt += f"{msg['role']}: {msg['text']}\n"

        prompt += "\nAssistant:"

        answer = generate_with_fallback(prompt)

        chat_history.append({

            "role": "assistant",

            "text": answer

        })

        return success({

            "answer": answer

        })

    except Exception as e:

     traceback.print_exc()

     return handle_gemini_error(e)
    
    # =====================================================
# AI Roadmap API
# =====================================================

@app.route("/roadmap", methods=["POST"])
def roadmap():

    try:

        data = request.get_json()

        career = data.get("career", "").strip()
        country = data.get("country", "").strip()

        if career == "":
            return failure("Please enter a career.", 400)

        prompt = f"""
You are CareerVerse AI.

You are the world's best AI Career Mentor.

The user wants to become:

{career}

Preferred Country:

{country}

Generate a COMPLETE professional career roadmap.

The career may belong to ANY domain.

Examples:

Engineering
- AI Engineer
- Software Engineer
- Data Scientist
- Cyber Security Engineer
- Cloud Engineer
- DevOps Engineer
- Web Developer

Medical
- Doctor
- MBBS
- Nurse
- Dentist
- Pharmacist

Government
- UPSC
- IAS
- IPS
- IFS
- SSC CGL
- Banking
- Railway
- NDA
- CDS

Commerce
- CA
- CS
- CMA

Law
- Lawyer
- Judge

Business
- MBA
- Entrepreneur

Creative
- Graphic Designer
- UI/UX Designer
- Animator

Education
- Teacher
- Professor

Aviation
- Pilot
- Cabin Crew

Architecture
- Architect
- Interior Designer

Digital Marketing
- SEO Specialist
- Content Creator

IMPORTANT

Never assume every career is related to programming.

Generate ONLY for the selected career.

Return ONLY valid JSON.

JSON format:
{{
"career":"",

"overview":{{
"description":"",
"roles":[],
"education":"",
"salary":{{
"india":"",
"usa":""
}},
"future_scope":""
}},

"skills":{{
"beginner":[],
"intermediate":[],
"advanced":[]
}},

"roadmap":[
{{"month":"Month 1","topics":[]}},
{{"month":"Month 2","topics":[]}},
{{"month":"Month 3","topics":[]}},
{{"month":"Month 4","topics":[]}},
{{"month":"Month 5","topics":[]}},
{{"month":"Month 6","topics":[]}}
],

"resources":{{
"youtube":[{{"name":"","url":""}}],
"courses":[{{"name":"","url":""}}],
"documentation":[{{"name":"","url":""}}],
"books":[{{"name":"","url":""}}]
}},

"projects":{{
"beginner":[],
"intermediate":[],
"advanced":[]
}},

"certifications":[],
"tools":[],
"interview_preparation":[],
"portfolio_tips":[],
"ai_tips":[],

"market":{{
"job_demand":{{"text":"","percentage":0}},
"difficulty":{{"text":"","percentage":0}},
"growth":{{"text":"","percentage":0}},
"learning_time":{{"text":"","percentage":0}},
"salary":{{
"fresher":"",
"mid":"",
"senior":""
}},
"top_organizations":[],
"hiring_hotspots":[
{{
"city":"",
"demand":"",
"reason":""
}}
],
"trending_skills":[],
"daily_plan":[]
}}
}}

Rules:

- Return ONLY valid JSON.
- Never leave any percentage as 0.
- job_demand.percentage must be between 70 and 100.
- difficulty.percentage must be between 40 and 100.
- growth.percentage must be between 70 and 100.
- learning_time.percentage must be between 40 and 100.
- Every percentage must match its description.
- Every roadmap month must contain at least 5 topics.
- Every applicable list must contain exactly 5 items.
- Recommend official documentation whenever available.
- Recommend globally trusted YouTube channels and courses.
- books must contain exactly 5 books.
- Every book must have a real title and a valid author.
- Recommend internationally recognized books only.
- Do not leave the books array empty.
- Avoid duplicate books.
- Keep salaries realistic.
- Tailor everything to the selected career only.
- hiring_hotspots must contain exactly 5 cities.
- Every city must belong to the preferred country.
- Every hotspot must include:
  city
  demand
  reason
- No markdown.
- No explanation.
"""
        text = generate_with_fallback(prompt)

        text = clean_json(text)

        roadmap = json.loads(text)

        return success(roadmap)

    except json.JSONDecodeError:

        traceback.print_exc()

        return failure(
            "Gemini returned an invalid JSON response. Please try again."
        )

    except Exception as e:

        traceback.print_exc()

        return handle_gemini_error(e)

      
    # =====================================================
# Career Match API
# =====================================================

@app.route("/career-match-api", methods=["POST"])
def career_match_api():

    try:

        data = request.get_json()

        career = data.get("career", "").strip()
        country = data.get("country", "").strip()
        qualification = data.get("qualification", "").strip()
        skills = data.get("skills", "").strip()
        strengths = data.get("strengths", "").strip()
        experience = data.get("experience", "").strip()
        country = data.get("country", "").strip()

        score = 0

        if qualification:
            score += 20

        skill_count = len([s for s in skills.split(",") if s.strip()])
        score += min(skill_count * 5, 30)

        strength_count = len([s for s in strengths.split(",") if s.strip()])
        score += min(strength_count * 4, 20)

        if experience:
            score += 20

        if country:
            score += 10

        score = min(score, 100)

        prompt = f"""
You are CareerVerse AI.

Evaluate the user's profile for the selected career.

Career:
{career}

Qualification:
{qualification}

Skills:
{skills}

Strengths:
{strengths}

Experience:
{experience}

Country:
{country}
IMPORTANT

If the country name contains a spelling mistake, first identify the most likely intended country.

Examples:
Cannada → Canada
Unted States → United States
Austraila → Australia
Germeny → Germany
Indai → India

If the country cannot be identified confidently, return this JSON:

{{
"error":"Invalid country name. Please enter a valid country."
}}

Otherwise continue normally.

Career Match Score = {score}

Return ONLY JSON.

JSON Format:
{{
"match_percentage":0,

"career_identity":"",

"match_status":"",

"profile_summary":"",

"skill_match_score":0,

"interest_match_score":0,

"industry_demand_score":0,

"strengths":[],

"missing_skills":[],

"career_advantages":[],

"career_risks":[],

"recommended_actions":[],

"career_readiness":"",

"personalized_advice":""
}}

Rules:

Rules:

- Use Career Match Score = {score}

- Analyze skills based on career relevance.

- Do not judge only by number of skills.

- skill_match_score must be between 0-100.

- interest_match_score must be between 0-100.

- industry_demand_score must be between 0-100.

- career_identity should describe the user's professional personality.

Examples:
Future AI Builder
Creative Problem Solver
Business Strategist
Healthcare Professional

- match_status should be one of:

Excellent Match
Good Match
Needs Improvement
Career Mismatch


- strengths must contain exactly 5 points.

- missing_skills must contain exactly 5 points.

- career_advantages must contain exactly 3 points.

- career_risks must contain exactly 3 points.

- recommended_actions must contain exactly 5 points.

- Return ONLY valid JSON.
- career_readiness must be one of:
  Beginner
  Intermediate
  Job Ready
  Highly Competitive
- recommendation should be 5–7 lines.
- Return ONLY valid JSON.
"""

        text = generate_with_fallback(prompt)

        text = clean_json(text)

        result = json.loads(text)

        result["match_percentage"] = score

        return success(result)

    except json.JSONDecodeError:

        traceback.print_exc()

        return failure(
            "Gemini returned invalid JSON."
        )

    except Exception as e:

     traceback.print_exc()

    return handle_gemini_error(e)
   # =====================================================
# Skill Gap Analyzer API
# =====================================================

@app.route("/skill-gap-api", methods=["POST"])
def skill_gap_api():

    try:

        data = request.get_json()

        career = data.get("career", "").strip()
        skills = data.get("skills", "").strip()


        if not career:

            return failure(
                "Please enter your dream career.",
                400
            )


        if not skills:

            skills = "Beginner level. No skills provided yet."


        prompt = f"""

You are CareerVerse AI.

You are an expert career skill analyst.

Analyze the user's skill gap for the selected career.

Dream Career:

{career}


Current Skills:

{skills}


The user can select ANY career:

Engineering
Medical
Government
Business
Finance
Law
Design
Education
Creative fields
Sports
Aviation

Never assume programming career.


Return ONLY valid JSON.


JSON Format:

{{
"skill_gap_score":0,

"career_level":"",

"skill_analysis":[
{{
"skill":"",
"score":0
}}
],

"existing_skills":[],

"missing_skills":[],

"priority_skills":[],

"readiness_status":"",

"industry_demand_match":0,

"gap_severity":"",

"recommendation":""

}}


Rules:

- skill_gap_score must be between 0-100.

- skill_analysis must contain exactly 5 skills with scores.

- existing_skills must contain exactly 5 points.

- missing_skills must contain exactly 5 points.

- priority_skills must contain exactly 5 points.

- industry_demand_match must be between 0-100.

- gap_severity must be one of:
Low Gap
Medium Gap
High Gap

- career_level must be one of:
Beginner
Intermediate
Advanced
Professional

- If user provides no skills:
  - Treat user as beginner.
  - Do not create fake existing skills.
  - Mention beginner status.

- Do not create roadmap.
- Do not give courses.
- Do not give books.
- Focus only on skill analysis.

- recommendation should be 5 concise lines.

Return ONLY JSON.

"""


        text = generate_with_fallback(prompt)

        text = clean_json(text)

        result = json.loads(text)


        return success(result)



    except json.JSONDecodeError:

        traceback.print_exc()

        return failure(
            "Gemini returned invalid JSON."
        )


    except Exception as e:

        traceback.print_exc()

        return handle_gemini_error(e)
    # =====================================================
# Salary Predictor API
# =====================================================

@app.route("/salary-predictor-api", methods=["POST"])
def salary_predictor_api():

    try:

        data = request.get_json()

        role = data.get("role", "").strip()
        qualification = data.get("qualification", "").strip()
        experience = data.get("experience", "").strip()
        skills = data.get("skills", "").strip()
        country = data.get("country", "").strip()
        city = data.get("city", "").strip()

        if not role:
            return failure("Please enter a job role.", 400)

        prompt = f"""
You are CareerVerse AI.

Predict the salary based on this profile.

Role:
{role}

Qualification:
{qualification}

Experience:
{experience}

Skills:
{skills}

Country:
{country}

City:
{city}
If the city does not belong to the selected country, ignore the city and use the country's average salary.

Return ONLY valid JSON.

Never include markdown.
Never explain your answer.
Never wrap JSON inside ```json blocks.
You are an International AI Salary Expert.

Your salary predictions must be based on:

• Selected Job Role
• Qualification
• Experience
• Skills
• Preferred Country
• Preferred City

Always use the salary standards, cost of living, job demand, taxation, and currency of the selected country.

If the user provides a city, use that city's salary standards and cost of living when estimating the salary.

If the city is empty, use the national average salary of the selected country.

Never default to India or the USA unless the user selects them.

Use realistic salary ranges based on the latest market trends.

JSON Format:
{{
"country":"",
"currency":"",
"estimated_salary":"",
"confidence_score":0,
"market_demand":0,
"growth_score":0,

"top_companies":[],

"best_cities":[],

"recommended_skills":[],

"salary_progression":[
{{
"level":"",
"salary":""
}}
],

"recommendation":""
}}

Rules:

- Predict the salary ONLY for the Preferred Country entered by the user.
- Support ANY country in the world.
- Never default to India or the USA unless the user selected those countries.
- Use the official currency of the selected country.
- Show salary in yearly, monthly, or LPA format depending on local standards.
- confidence_score must be between 80 and 100.
- market_demand must be between 0 and 100.
- growth_score must be between 0 and 100.
- top_companies must contain exactly 5 companies from the selected country.
- best_cities must contain exactly 5 cities from the selected country.
- recommended_skills must contain exactly 5 skills that can improve salary.
- salary_progression must contain exactly 4 objects in this format:
  {{
    "level":"",
    "salary":""
  }}
- recommendation should contain 4–6 concise career tips.
- Return ONLY valid JSON.
- Do not include markdown or explanations.
"""

        text = generate_with_fallback(prompt)

        text = clean_json(text)

        result = json.loads(text)

        return success(result)

    except json.JSONDecodeError:

        traceback.print_exc()

        return failure(
            "Gemini returned invalid JSON."
        )

    except Exception as e:

     traceback.print_exc()

    return handle_gemini_error(e)
    # =====================================================
# Career Comparison API
# =====================================================

@app.route("/compare-api", methods=["POST"])
def compare_api():

    try:

        data = request.get_json()

        career1 = data.get("career1", "").strip()
        career2 = data.get("career2", "").strip()
        country = data.get("country", "").strip()
        currency = COUNTRY_CURRENCY.get(
        country.title(),
        "Detect official currency"
        )

        if not career1 or not career2:
            return failure("Please enter both careers.", 400)

        prompt = f"""
You are CareerVerse AI.

Compare these two careers professionally.

Career 1:
{career1}

Career 2:
{career2}

Student Selected Country:
{country if country else "Not Provided"}

Selected Country Currency:

{currency}

Return ONLY valid JSON.

JSON Format:
{{
"career1": {{
"name": "",

"salary": {{
"experience_level": "Fresher",
"country": "",
"amount": "",
"currency": ""
}},

"overall_score": 0,

"salary_score": 0,

"demand": "",
"demand_score": 0,

"growth": "",
"growth_score": 0,

"learning_time": "",

"personality_fit": [],

"future_timeline": [],

"risks": [],

"learning_path": [],

"organizations": [],

"top_cities": []
}},

"career2": {{
"name": "",

"salary": {{
"experience_level": "Fresher",
"country": "",
"amount": "",
"currency": ""
}},

"overall_score": 0,

"salary_score": 0,

"demand": "",
"demand_score": 0,

"growth": "",
"growth_score": 0,

"learning_time": "",

"personality_fit": [],

"future_timeline": [],

"risks": [],

"learning_path": [],

"organizations": [],

"top_cities": []
}},

"winner": "",
"reason": "",
"recommendation": ""
}}

Rules:

- Return ONLY valid JSON.
Salary Rules:

Salary Accuracy Rules:

- Act as a global salary research analyst.

- Salary must be realistic for the selected career and country.

- Consider:
  • Career role
  • Experience level (assume fresher/entry level unless specified)
  • Country economy
  • Cost of living
  • Industry demand
  • Current market trends

Salary Rules:

- Provide salary only according to the user's selected country.

- Use the official currency of the selected country.

- If selected country is India:
  Show salary in INR (₹).

- If selected country is another country:
  Show salary only in that country's currency.

- Never show India salary unless India is selected.

- Never convert salaries manually.

- Use realistic fresher/entry-level salary ranges.

Examples:

USA:
Use USD

Germany:
Use EUR

Japan:
Use JPY

UAE:
Use AED

India:
Use INR

For every other country:
Detect official currency and provide realistic salary.


Important:

- Never randomly generate extremely high salaries.
- Never use USA salary as default.
- Never convert India salary into foreign currency.
- Use realistic entry-level professional salaries.
- If career is medical, business, law, design, etc., use that industry's salary range.

- User can enter ANY country or city.

- If user enters a city, detect the country.

Examples:

Dubai → United Arab Emirates → AED

London → United Kingdom → GBP

New York → USA → USD

Tokyo → Japan → JPY

Singapore → Singapore → SGD


Always return:

country:
Selected country name

amount:
Salary range in selected country currency

currency:
Official currency code and symbol


Rules:

- Show salary only for the selected country.
- If India is selected, show INR salary.
- If another country is selected, show only that country's salary.
- Never add India salary as reference.
- Never show USA salary unless USA is selected.
salary_score should represent salary competitiveness compared to other careers in that country.
- demand_score must be between 0 and 100.
- growth_score must be between 0 and 100.
- organizations must contain exactly 5 names.
- top_cities must contain exactly 5 cities.
- Each city should include:
  - City name
  - Country
  - Demand level
  - Major companies
  - Career opportunity reason
- winner must be either career1 or career2.
- reason should be 3-5 concise lines.
- recommendation should be 4-5 concise lines.
- overall_score must be between 0 and 100.
- personality_fit must contain exactly 4 points.
- future_timeline must contain exactly 3 stages:
  Beginner
  Professional
  Expert Level

- risks must contain exactly 3 points.
- learning_path must contain exactly 3 stages.

Example:

learning_path:
[
"Foundation Skills",
"Advanced Skills",
"Real World Projects"
]
City Intelligence Rules:

- Recommend the best hiring cities for the selected career.
- Cities must be based on real industry demand.
- Consider:
  • Number of companies
  • Startup ecosystem
  • Salary opportunities
  • Technology/business hubs
  • Career growth

Example format:

Example format:

[
{{
"city":"San Francisco",
"country":"USA",
"demand":"Very High",
"companies":["Google","OpenAI","NVIDIA"],
"reason":"Major AI innovation hub"
}}
]

- Do not recommend random tourist cities.
- Give practical career advice.
- Compare careers based on future opportunities, not only salary.
"""

        text = generate_with_fallback(prompt)

        text = clean_json(text)


        try:

            result = json.loads(text)

        except Exception:

            print("Gemini Response:")
            print(text)

            return failure(
                "AI returned invalid JSON. Try again."
            )


        return success(result)


    except json.JSONDecodeError:

        traceback.print_exc()

        return failure(
            "Gemini returned invalid JSON."
        )


    except Exception as e:

        traceback.print_exc()

        return handle_gemini_error(e)
    # =====================================================
# Resume Analyzer API
# =====================================================

@app.route("/resume-api", methods=["POST"])
def resume_api():

    try:

        if "resume" not in request.files:
            return failure("Please upload a resume.", 400)

        file = request.files["resume"]

        if file.filename == "":
            return failure("No file selected.", 400)

        filepath = os.path.join(
            app.config["UPLOAD_FOLDER"],
            file.filename
        )

        file.save(filepath)

        resume_text = ""

        with pdfplumber.open(filepath) as pdf:

            for page in pdf.pages:

                text = page.extract_text()

                if text:
                    resume_text += text + "\n"

        if resume_text.strip() == "":
            return failure(
                "Unable to read the uploaded resume.",
                400
            )

        prompt = f"""
You are a Senior FAANG Recruiter,
ATS Expert and Career Coach.

Analyze this resume.

Resume:

{resume_text}

Return ONLY valid JSON.

JSON Format:
{{

"job_readiness_score":0,

"recruiter_impact_score":0,

"skill_evidence_score":0,

"interview_confidence_score":0,


"experience_level":"",

"recommended_roles":[],

"strengths":[],

"weaknesses":[],

"missing_skills":[],

"suggestions":[],

"final_verdict":""


}}

Rules:

SCORING RULES:

job_readiness_score:
Measure how ready the candidate is for real job applications.

Consider:
- Technical skills
- Projects
- Internships
- Experience
- Certifications
- Achievements


recruiter_impact_score:
Measure first impression of the resume.

Consider:
- Resume structure
- Clarity
- Professional summary
- Achievements
- Relevant keywords


skill_evidence_score:
Measure how strongly the resume proves skills.

Consider:
- Real projects
- GitHub links
- Metrics/results
- Certifications
- Practical implementation


interview_confidence_score:
Measure how well the resume can support interview questions.

Consider:
- Depth of projects
- Technical explanation
- Problem solving examples
- Practical experience


All scores must be between 0-100.

Do not give high scores without evidence.

A fresher with only courses but no projects should not score above 70.

Projects with measurable results should increase scores.

Return realistic evaluation.
- Experience Level should be one of:
  Fresher
  Junior
  Mid-Level
  Senior
- recommended_roles must contain exactly 5 roles.
- strengths must contain exactly 5 points.
- weaknesses must contain exactly 5 points.
- missing_skills must contain exactly 5 skills.
- suggestions must contain exactly 5 suggestions.
- final_verdict should be 5–7 concise lines.
- Return ONLY valid JSON.
"""

        text = generate_with_fallback(prompt)

        text = clean_json(text)


        try:

            result = json.loads(text)

        except Exception:

            print("Gemini Response:")
            print(text)

            return failure(
                "AI returned invalid JSON. Try again."
            )


        return success(result)


    except json.JSONDecodeError:

        traceback.print_exc()

        return failure(
            "Gemini returned invalid JSON."
        )


    except Exception as e:

        traceback.print_exc()

        return handle_gemini_error(e)
# =====================================================
# Career Reality AI API
# =====================================================

@app.route("/career-reality-api", methods=["POST"])
def career_reality_api():

    try:

        data = request.get_json()

        career = data.get("career","").strip()
        country = data.get("country","").strip()


        if career == "":
          return failure("Please enter a career.", 400)

        prompt = f"""

You are CareerVerse AI Career Reality Expert.

Analyze the real-world truth of this career.

Career:
{career}

Country:
{country if country else "Global"}


Return ONLY valid JSON.


Format:

{{
"reality_score":0,

"reality_status":"",

"daily_work":[],

"hidden_truths":[],

"technical_difficulty":0,

"competition_level":0,

"learning_difficulty":0,

"salary_reality":"",

"not_for_you":[],

"industry_reality":"",

"ai_verdict":""

}}


Rules:

- reality_score between 0-100.
- technical_difficulty between 0-100.
- competition_level between 0-100.
- learning_difficulty between 0-100.

- daily_work exactly 5 points.
- hidden_truths exactly 5 points.
- not_for_you exactly 3 points.

- Salary must match the selected country.
- Explain real challenges.
- Do not give fake motivation.
- Return only JSON.

"""


        text = generate_with_fallback(prompt)

        text = clean_json(text)

        result = json.loads(text)


        return success(result)



    except json.JSONDecodeError:

        traceback.print_exc()

        return failure(
            "Gemini returned invalid JSON."
        )


    except Exception as e:

        traceback.print_exc()

        return handle_gemini_error(e)

# =====================================================
# Run Flask
# =====================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)