import os
import json
import traceback
import pdfplumber

from dotenv import load_dotenv
from google import genai
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import re

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
print("Gemini API Loaded Successfully")

if not API_KEY:
    raise Exception("❌ GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=API_KEY)

# =====================================================
# Gemini Model Fallback System
# =====================================================

GEMINI_MODELS = [
    "gemma-4-26b-a4b-it",
    "gemma-4-31b-it",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite-001",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro-latest",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]


def get_active_models():
    models = list(GEMINI_MODELS)
    try:
        remote_models = [m.name.replace("models/", "") for m in client.models.list()]
        exclude = ['tts', 'image', 'imagen', 'veo', 'lyria', 'embedding', 'audio', 'robotics', 'banana', 'aqa', 'computer-use', 'live-translate']
        filtered = [m for m in remote_models if not any(x in m for x in exclude)]
        for m in reversed(filtered):
            if m not in models:
                models.insert(0, m)
    except Exception as e:
        print(f"Note: Could not fetch dynamic models list: {e}")
    return models


def generate_with_fallback(prompt):
    models_to_try = get_active_models()
    last_error = None

    for model in models_to_try:
        try:
            print(f"Trying Gemini model: {model}")
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            if response and hasattr(response, 'text') and response.text:
                print(f"[SUCCESS] Generated content using model: {model}")
                return response.text.strip()
        except Exception as e:
            print(f"[FAILED] Model {model} failed: {str(e)[:100]}")
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

VALID_ACRONYMS = {"ai", "ml", "ui", "ux", "hr", "pr", "it", "qa", "seo", "sre", "cto", "ceo", "cfo", "vp", "dba", "erp", "crm", "bi", "ar", "vr", "3d", "2d", "5g", "cad", "gis", "pm", "dev", "ops", "sec", "mlops", "devops", "secops", "web3", "web2", "ios", "nlp", "llm", "genai", "ar/vr", "ui/ux", "ai/ml", "c++", "c#", ".net"}

QWERTY_PATTERNS = [
    "qwertyuiop", "poiuytrewq", "asdfghjkl", "lkjhgfdsa", "zxcvbnm", "mnbvcxz",
    "qazwsx", "edcrfv", "tgbnhy", "ujmiko", "olp", "zaq", "xsw", "cde", "vfr", "bgt", "nhy", "mju", "lki", "plo",
    "1234567890", "0987654321"
]

CAREER_KEYWORDS = {
    # Engineering & Technology
    "engineer", "developer", "architect", "designer", "manager", "analyst", "consultant", "specialist",
    "lead", "administrator", "director", "officer", "scientist", "researcher", "coder", "programmer",
    "software", "web", "fullstack", "frontend", "backend", "cloud", "data", "ai", "ml", "machine",
    "learning", "cybersecurity", "network", "system", "database", "devops", "sre", "ui", "ux",
    "product", "project", "scrum", "agile", "qa", "tester", "security", "sysadmin", "infrastructure",
    "robotics", "embedded", "firmware", "mechatronics", "telecom", "hardware", "bioinformatics",

    # Healthcare, Medicine & Life Sciences
    "doctor", "physician", "surgeon", "nurse", "pharmacist", "therapist", "dentist", "psychiatrist",
    "psychologist", "counselor", "paramedic", "optometrist", "radiologist", "pathologist", "pediatrician",
    "dermatologist", "cardiologist", "neurologist", "oncologist", "veterinarian", "biologist", "chemist",
    "physicist", "microbiologist", "geneticist", "biochemist", "epidemiologist", "pharmacologist",
    "medical", "clinical", "nursing", "healthcare", "pharma", "biotech", "nutritionist", "dietitian",

    # Business, Finance, Law & Executive
    "accountant", "auditor", "lawyer", "attorney", "paralegal", "judge", "advocate", "solicitor",
    "banker", "trader", "investor", "broker", "underwriter", "actuary", "economist", "statistician",
    "mathematician", "evaluator", "appraiser", "hr", "recruiter", "founder", "ceo", "cto", "cfo",
    "coo", "cmo", "cio", "vp", "head", "executive", "administrator", "officer", "supervisor",
    "business", "sales", "marketing", "finance", "accounting", "banking", "insurance", "realestate",
    "realtor", "consulting", "strategy", "operations", "supply", "chain", "logistics", "procurement",

    # Education, Academia & Research
    "teacher", "professor", "instructor", "tutor", "lecturer", "educator", "principal", "dean",
    "academic", "scholar", "historian", "archaeologist", "anthropologist", "sociologist", "geologist",
    "astronomer", "meteorologist", "oceanographer", "philosopher", "linguist", "translator", "interpreter",

    # Media, Arts, Entertainment & Sports
    "artist", "animator", "illustrator", "painter", "sculptor", "designer", "photographer", "videographer",
    "filmmaker", "director", "producer", "editor", "cinematographer", "actor", "actress", "model",
    "musician", "composer", "singer", "dancer", "choreographer", "writer", "author", "journalist",
    "reporter", "copywriter", "content", "creator", "influencer", "streamer", "gamer",
    "athlete", "coach", "trainer", "referee", "sports", "fitness", "physiotherapist",

    # Architecture, Construction, Trades & Skilled Crafts
    "builder", "contractor", "carpenter", "electrician", "plumber", "welder", "machinist", "mechanic",
    "technician", "mason", "painter", "roofer", "glazier", "surveyor", "drafteur", "interior",
    "landscape", "craftsman", "artisan", "blacksmith", "jeweler", "tailor", "fashion",

    # Service, Culinary, Hospitality & Aviation/Maritime
    "chef", "cook", "baker", "barista", "sommelier", "waiter", "waitress", "bartender", "hotelier",
    "concierge", "pilot", "captain", "copilot", "navigator", "sailor", "mariner", "flight",
    "attendant", "steward", "driver", "chauffeur", "conductor", "dispatcher", "logistics",

    # Government, Public Safety, Agriculture & Environment
    "policeman", "detective", "firefighter", "soldier", "officer", "investigator", "inspector",
    "civil", "servant", "diplomat", "politician", "mayor", "governor", "ranger", "forester",
    "farmer", "agronomist", "botanist", "zoologist", "ecologist", "environmental", "conservationist",

    # General Role Standard Terms
    "lead", "senior", "junior", "principal", "chief", "head", "associate", "intern", "trainee",
    "freelancer", "consultant", "expert", "practitioner", "agent", "advisor", "coordinator",
    "planner", "strategist", "analyst", "specialist"
}

def is_qwerty_mashing(text):
    clean = re.sub(r'[^a-z0-9]', '', text.lower())
    if len(clean) < 3:
        return False
    for i in range(len(clean) - 3):
        sub = clean[i:i+4]
        if any(sub in pattern for pattern in QWERTY_PATTERNS):
            return True
    return False

def validate_career_input(career):
    if not career or not str(career).strip():
        return False, "⚠️ Career title cannot be empty. Please enter a valid target career role."

    c_raw = str(career).strip()
    c_clean = c_raw.lower()

    if len(c_clean) < 2:
        return False, "⚠️ Career title is too short. Please enter a valid job title (at least 2 characters)."

    if len(c_clean) > 70:
        return False, "⚠️ Career title is too long. Please enter a concise title."

    # Pure numbers
    if re.match(r'^\d+$', c_clean):
        return False, "⚠️ Invalid Career Role: Pure numbers are not allowed. Please enter a valid career title (e.g. 'Software Engineer', 'Data Scientist')."

    # Pure symbols
    if re.match(r'^[^\w\s\+\#\.\/-]+$', c_clean):
        return False, "⚠️ Invalid Career Role: Symbols only. Please enter a valid career title."

    # QWERTY keyboard mashing check
    if is_qwerty_mashing(c_clean):
        return False, f"⚠️ Invalid Career Role: '{c_raw}' appears to be keyboard mashing. Please enter a valid job role (e.g. 'Software Engineer')."

    # Extract words
    words = re.findall(r'[a-z0-9\+\#]+', c_clean)
    std_vowels = set("aeiouy")
    
    # Common professional role suffixes
    ROLE_SUFFIXES = (
        "ist", "er", "or", "ant", "ent", "ian", "ive", "ic", "eer", "man", "woman",
        "worker", "smith", "wright", "path", "grapher", "logist", "nomist", "metrician", "tech", "master",
        "keeper", "guard", "attendant", "clerk", "rep", "representative", "handler",
        "setter", "fitter", "turner", "molder", "caster", "welder", "cutter", "grinder",
        "polisher", "cleaner", "driver", "runner", "helper", "packer", "sorter", "checker",
        "loader", "feeder", "tender", "repairer", "installer", "maintainer", "servicer",
        "technician", "specialist", "analyst", "engineer", "developer", "designer",
        "manager", "director", "architect", "scientist", "assistant", "operator",
        "inspector", "supervisor", "executive", "builder", "trader", "broker",
        "evaluator", "practitioner", "counselor", "instructor", "teacher", "professor",
        "trainer", "coach", "pilot", "chef", "baker", "maker"
    )

    for word in words:
        if word in VALID_ACRONYMS or re.match(r'^\d+[a-z]?$', word):
            continue

        # Word >= 3 chars with 0 standard vowels
        if len(word) >= 3 and not any(char in std_vowels for char in word):
            return False, f"⚠️ Invalid Career Role: '{c_raw}' contains unrecognized word patterns. Please check your spelling."

        # 5+ consecutive consonants (allow known exceptions)
        if re.search(r'[bcdfghjklmnpqrstvwxz]{5,}', word) and "blockchain" not in word and "architect" not in word and "strength" not in word:
            return False, f"⚠️ Invalid Career Role: '{c_raw}' contains invalid character combinations."

        # 4+ repeating characters
        if re.search(r'(.)\1{3,}', word):
            return False, f"⚠️ Invalid Career Role: '{c_raw}' contains invalid repeating characters."

    if not words:
        return False, f"⚠️ Invalid Career Role: '{c_raw}' is an unrecognized job title. Please enter a real career role."

    return True, c_raw.title()

REAL_WORLD_COUNTRIES = {
    "afghanistan", "albania", "algeria", "andorra", "angola", "antigua and barbuda", "argentina", "armenia",
    "australia", "austria", "azerbaijan", "bahamas", "bahrain", "bangladesh", "barbados", "belarus",
    "belgium", "belize", "benin", "bhutan", "bolivia", "bosnia and herzegovina", "botswana", "brazil",
    "brunei", "bulgaria", "burkina faso", "burundi", "cambodia", "cameroon", "canada", "cape verde",
    "central african republic", "chad", "chile", "china", "colombia", "comoros", "congo", "costa rica",
    "croatia", "cuba", "cyprus", "czech republic", "czechia", "denmark", "djibouti", "dominica",
    "dominican republic", "ecuador", "egypt", "el salvador", "equatorial guinea", "eritrea", "estonia",
    "eswatini", "ethiopia", "fiji", "finland", "france", "gabon", "gambia", "georgia", "germany",
    "ghana", "greece", "grenada", "guatemala", "guinea", "guinea-bissau", "guyana", "haiti", "honduras",
    "hungary", "iceland", "india", "indonesia", "iran", "iraq", "ireland", "israel", "italy",
    "jamaica", "japan", "jordan", "kazakhstan", "kenya", "kiribati", "kuwait", "kyrgyzstan", "laos",
    "latvia", "lebanon", "lesotho", "liberia", "libya", "liechtenstein", "lithuania", "luxembourg",
    "madagascar", "malawi", "malaysia", "maldives", "mali", "malta", "marshall islands", "mauritania",
    "mauritius", "mexico", "micronesia", "moldova", "monaco", "mongolia", "montenegro", "morocco",
    "mozambique", "myanmar", "namibia", "nauru", "nepal", "netherlands", "new zealand", "nicaragua",
    "niger", "nigeria", "north korea", "north macedonia", "norway", "oman", "pakistan", "palau",
    "palestine", "panama", "papua new guinea", "paraguay", "peru", "philippines", "poland", "portugal",
    "qatar", "romania", "russia", "rwanda", "saint kitts and nevis", "saint lucia",
    "saint vincent and the grenadines", "samoa", "san marino", "sao tome and principe", "saudi arabia",
    "senegal", "serbia", "seychelles", "sierra leone", "singapore", "slovakia", "slovenia",
    "solomon islands", "somalia", "south africa", "south korea", "south sudan", "spain", "sri lanka",
    "sudan", "suriname", "sweden", "switzerland", "syria", "taiwan", "tajikistan", "tanzania", "thailand",
    "timor-leste", "togo", "tonga", "trinidad and tobago", "tunisia", "turkey", "turkmenistan",
    "tuvalu", "uganda", "ukraine", "united arab emirates", "uae", "dubai", "united kingdom", "uk",
    "england", "scotland", "wales", "united states", "united states of america", "usa", "us", "america",
    "uruguay", "uzbekistan", "vanuatu", "vatican city", "venezuela", "vietnam", "yemen", "zambia", "zimbabwe", "global"
}

def validate_country_strict(country):
    if not country or not str(country).strip():
        return True, "Global"

    c_str = str(country).strip()
    c_clean = c_str.lower()

    if re.search(r'\d', c_clean):
        return False, f"⚠️ Invalid Country: '{country}' contains numbers. Please enter a valid country name (e.g. India, USA, Germany, UK, Canada)."

    is_valid = (c_clean in REAL_WORLD_COUNTRIES) or any(valid_c in c_clean for valid_c in REAL_WORLD_COUNTRIES)
    if not is_valid:
        return False, f"⚠️ Invalid Country: '{country}' is not a recognized world country. Please enter a valid country name (e.g. India, USA, Germany, UK, Canada)."

    return True, c_str.title()

    return True, c_str[0].upper() + c_str[1:]

def validate_country(country):
    is_valid, res = validate_country_strict(country)
    if not is_valid:
        return "India"
    return res
def get_total_months(duration):

    duration = duration.lower().strip()

    if duration == "":
        return 6

    month = re.search(r"(\d+)\s*(month|months|m)", duration)

    if month:
        return int(month.group(1))

    year = re.search(r"(\d+)\s*(year|years|y)", duration)

    if year:
        return int(year.group(1)) * 12

    return 6
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
# Career Evolution AI
# =====================================================

@app.route("/career-intelligence")
def career_intelligence():
    return render_template("career_intelligence.html")


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

# =====================================================
# Fallback Roadmap Generator
# =====================================================

def get_fallback_roadmap(career, country, months=6):
    c_title = career.title() if career else "Career Professional"
    is_india = "india" in (country or "").lower()
    sal_india = "₹6.5L - ₹18L / yr"
    sal_usa = "$85k - $160k / yr"
    
    roadmap_months = []
    for m in range(1, months + 1):
        roadmap_months.append({
            "month": f"Month {m}",
            "title": f"Phase {m}: Core Skill Mastery & Real-World Execution",
            "topics": [
                f"Fundamental & Advanced Principles of {c_title}",
                f"Industry Best Practices & System Design for {c_title}",
                f"Tooling, Workflow Automation & Performance Tuning",
                f"Collaborative Development & Code Reviews",
                f"Security, Quality Assurance & Deployment Standards"
            ],
            "project": f"Production-grade {c_title} Portfolio Project #{m}",
            "goal": f"Master core competencies and deliver a functional project milestone."
        })

    return {
        "success": True,
        "career": c_title,
        "country": country,
        "duration": f"{months} months",
        "overview": {
            "description": f"Comprehensive career development path for becoming a top-tier {c_title}. This roadmap covers foundational knowledge, hands-on project creation, and production deployment.",
            "roles": [
                f"Junior {c_title}",
                f"Senior {c_title}",
                f"Lead {c_title} Specialist",
                f"Principal {c_title} Consultant",
                f"Director of {c_title} Engineering"
            ],
            "education": f"Bachelor's Degree in Computer Science, STEM, or relevant industry certifications & practical portfolio experience.",
            "salary": {
                "india": sal_india,
                "usa": sal_usa
            },
            "future_scope": f"High demand with strong multi-year compound annual growth across global tech markets."
        },
        "skills": {
            "beginner": [f"Basic {c_title} Concepts", "Core Tools & Environment Setup", "Git & Version Control", "Command Line & Workflows", "Problem Solving"],
            "intermediate": [f"Advanced {c_title} Architecture", "API Integration & Systems", "Testing & Debugging", "Database Management", "Performance Optimization"],
            "advanced": [f"Enterprise Architecture", "Production Scaling & MLOps/DevOps", "Security Hardening", "System Reliability", "Strategic Leadership"]
        },
        "roadmap": roadmap_months,
        "resources": {
            "youtube": [
                {"name": f"FreeCodeCamp - {c_title} Full Course", "url": "https://www.youtube.com/@freecodecamp"},
                {"name": f"Traversy Media - {c_title} Crash Course", "url": "https://www.youtube.com/@TraversyMedia"},
                {"name": f"Fireship - {c_title} in 100 Seconds & Deep Dive", "url": "https://www.youtube.com/@Fireship"},
                {"name": f"Web Dev Simplified - {c_title} Projects", "url": "https://www.youtube.com/@WebDevSimplified"},
                {"name": f"Hussein Nasser - Software Architecture & {c_title}", "url": "https://www.youtube.com/@HusseinNasser"}
            ],
            "courses": [
                {"name": f"Coursera - Specialized {c_title} Professional Certificate", "url": "https://www.coursera.org"},
                {"name": "Udemy - Complete Masterclass Bootcamp", "url": "https://www.udemy.com"},
                {"name": "edX - MicroMasters Program in Systems & Architecture", "url": "https://www.edx.org"},
                {"name": "Pluralsight - Advanced Engineering Learning Path", "url": "https://www.pluralsight.com"},
                {"name": "LinkedIn Learning - Executive Career Track", "url": "https://www.linkedin.com/learning"}
            ],
            "documentation": [
                {"name": f"Official {c_title} Developer Documentation", "url": "https://developer.mozilla.org"},
                {"name": "AWS Architecture Center & Best Practices", "url": "https://aws.amazon.com/architecture"},
                {"name": "Google Cloud Architecture Framework", "url": "https://cloud.google.com/architecture"},
                {"name": "Docker & Kubernetes Production Guides", "url": "https://docs.docker.com"},
                {"name": "System Design Primer & RFC Standards", "url": "https://github.com/donnemartin/system-design-primer"}
            ],
            "books": [
                {"name": f"The Pragmatic Programmer for {c_title}", "url": "https://amazon.com"},
                {"name": "Clean Code & Systems Architecture", "url": "https://amazon.com"},
                {"name": "Designing Data-Intensive Applications", "url": "https://amazon.com"},
                {"name": f"Enterprise {c_title} Design Patterns", "url": "https://amazon.com"},
                {"name": "Refactoring & High Performance Systems", "url": "https://amazon.com"}
            ]
        },
        "projects": {
            "beginner": [f"Personal {c_title} Portfolio Website", f"Interactive Command Line Utility", f"Basic Data Analysis & Visualization Suite", f"Task Management REST API", f"Weather Dashboard App"],
            "intermediate": [f"Full-Stack {c_title} Web Service", f"RESTful API & Database Integration", f"Automated CI/CD Pipeline Deployment", f"Authentication & Authorization Service", f"Real-Time Chat & Notification System"],
            "advanced": [f"Enterprise Distributed System", f"High-Throughput Analytics Engine", f"Production Real-Time Dashboard", f"AI-Powered Automation Pipeline", f"Microservices Cloud Architecture"]
        },
        "certifications": [
            f"AWS Certified Solutions Architect",
            f"Google Cloud Professional {c_title}",
            f"Meta Professional Certification",
            f"Certified System Security Professional",
            f"Red Hat Certified Engineer"
        ],
        "tools": [f"Git & GitHub", f"Docker & Kubernetes", f"VS Code / JetBrains", f"Postman & Insomnia", f"Linux & Bash"],
        "interview_preparation": [
            f"Master core Data Structures & System Design algorithms.",
            f"Prepare STAR-method behavioral stories for complex team projects.",
            f"Practice live coding exercises and architecture whiteboard challenges.",
            f"Review domain-specific security, concurrency, and API questions.",
            f"Conduct mock interviews focusing on trade-offs and design choices."
        ],
        "portfolio_tips": [
            f"Host live functional demos on Vercel, Netlify, or AWS.",
            f"Maintain clean GitHub commit history with well-documented README files.",
            f"Highlight real-world problem solving and performance metrics in project descriptions.",
            f"Include architectural diagrams and API specs in your documentation.",
            f"Record short video walkthroughs demonstrating key project features."
        ],
        "ai_tips": [
            f"Use Gemini AI & ChatGPT to accelerate code refactoring and test case generation.",
            f"Leverage AI code assistants (GitHub Copilot, Cursor) for boilerplate automation.",
            f"Prompt AI to explain complex algorithmic trade-offs and edge cases.",
            f"Automate documentation drafting and changelog summaries using AI.",
            f"Stay updated on emerging LLM frameworks and AI integration patterns."
        ],
        "market": {
            "job_demand": {"text": "Extremely High demand with rapid growth across global hiring hubs.", "percentage": 92},
            "difficulty": {"text": "Moderate to High difficulty requiring dedicated structured practice.", "percentage": 75},
            "growth": {"text": "Projected 25%+ annual market growth over the next 5 years.", "percentage": 88},
            "learning_time": {"text": f"Estimated {months} months of consistent 15-20 hrs/week study.", "percentage": 80},
            "salary": {
                "fresher": f"{'₹4.5L - ₹8L / yr' if is_india else '$65k - $85k / yr'}",
                "mid": f"{'₹12L - ₹20L / yr' if is_india else '$110k - $145k / yr'}",
                "senior": f"{'₹24L - ₹45L / yr' if is_india else '$160k - $240k / yr'}"
            },
            "top_organizations": ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
            "hiring_hotspots": [
                {"city": "Bengaluru" if is_india else "San Francisco", "demand": "High Demand", "reason": "Major global technology and startup ecosystem hub."},
                {"city": "Hyderabad" if is_india else "New York", "demand": "High Demand", "reason": "Rapidly expanding enterprise engineering centers."},
                {"city": "Pune" if is_india else "Seattle", "demand": "Moderate-High", "reason": "Strong concentration of cloud & product engineering R&D."},
                {"city": "Gurugram" if is_india else "Austin", "demand": "High Demand", "reason": "Thriving fintech, AI, and corporate headquarters presence."},
                {"city": "Mumbai" if is_india else "Boston", "demand": "Moderate-High", "reason": "Leading hub for enterprise tech, consulting, and finance."}
            ],
            "trending_skills": [f"{c_title} Architecture", "Cloud Native (AWS/GCP)", "Docker & Microservices", "CI/CD & MLOps", "GenAI & API Design"],
            "daily_plan": [
                "Monday: 2 hrs Core Theory & Concept Deep Dive",
                "Tuesday: 2 hrs Hands-on Coding & Problem Solving",
                "Wednesday: 2 hrs System Design & Tool Mastery",
                "Thursday: 2 hrs Building Portfolio Project Components",
                "Friday: 2 hrs Testing, Code Refactoring & Git Commits",
                "Saturday: 3 hrs End-to-End Integration & Open Source Review",
                "Sunday: 1 hr Weekly Progress Review & Goal Setting"
            ]
        }
    }

# =====================================================
# Generate Roadmap Endpoint
# =====================================================

@app.route("/roadmap", methods=["POST"])
def roadmap():

    try:

        data = request.get_json() or {}

        career_raw = data.get("career", "").strip()
        is_valid_career, career_res = validate_career_input(career_raw)
        if not is_valid_career:
            return failure(career_res, 400)

        career = career_res
        duration = data.get("duration", "").strip()
        if duration == "":
           duration = "6 months"
        months = get_total_months(duration)
        country_raw = data.get("country", "").strip()
        if country_raw:
            is_v_c, country_err = validate_country_strict(country_raw)
            if not is_v_c:
                return failure(country_err, 400)
            country = country_err
        else:
            country = "India"

        prompt = f"""
You are CareerVerse AI, a World-Class Executive Career Architect & Senior Technical Director.

EVALUATION TASK:
Create an accurate, highly detailed, step-by-step master career roadmap specifically for:

Target Career Role: "{career}"
Preferred Country: {country}
Roadmap Duration: {duration} ({months} Months)

CRITICAL ACCURACY RULES:
1. Provide DEEP, ROLE-SPECIFIC technical topics, tools, hands-on projects, and real-world salary ranges. Do NOT use generic placeholders like "Topic 1" or "Learn basics".
2. For each month ({months} months total), specify 4-5 exact technologies or skills to learn, 1 real-world portfolio project to build, and 1 clear milestone goal.
3. For salaries, ALWAYS provide India salary in Indian Rupees (e.g. "₹8.0L - ₹18.0L / yr") and Target Country salary in that country's official local currency (e.g. "$90,000 - $165,000 / yr" for USA, "£45,000 - £85,000 / yr" for UK, "€50,000 - €95,000 / yr" for Germany/Europe, "CA$75,000 - CA$135,000 / yr" for Canada).

Return ONLY valid JSON matching this exact structure:

{{
  "career": "{career}",
  "country": "{country}",
  "duration": "{duration}",
  "overview": {{
    "description": "Comprehensive professional breakdown of {career} in modern industry.",
    "roles": ["Junior Role", "Mid-Level Role", "Senior Role", "Lead Specialist", "Director / Architect"],
    "education": "Required degrees, certifications, or self-taught paths.",
    "salary": {{
      "india": "₹8.0L - ₹18.0L / yr",
      "country": "$90,000 - $165,000 / yr"
    }},
    "future_scope": "5-year growth trajectory, AI impact, and job market outlook."
  }},
  "skills": {{
    "beginner": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
    "intermediate": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
    "advanced": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"]
  }},
  "roadmap": [
    {{
      "month": "Month 1",
      "title": "Phase 1: Core Technical Foundations",
      "topics": ["Specific Tech Topic 1", "Specific Tech Topic 2", "Specific Tech Topic 3", "Specific Tech Topic 4"],
      "project": "Real-world Hands-On Project Name & Description",
      "goal": "Clear technical milestone for Month 1."
    }}
  ],
  "resources": {{
    "youtube": [
      {{"name": "FreeCodeCamp / Channel Name", "url": "https://www.youtube.com/@freecodecamp"}},
      {{"name": "Traversy Media / Core Channel", "url": "https://www.youtube.com/@TraversyMedia"}}
    ],
    "courses": [
      {{"name": "Coursera / Udemy Specialized Course", "url": "https://www.coursera.org"}},
      {{"name": "Professional Certification Bootcamp", "url": "https://www.udemy.com"}}
    ],
    "documentation": [
      {{"name": "Official Tech Documentation", "url": "https://developer.mozilla.org"}}
    ],
    "books": [
      {{"name": "Must-Read Industry Handbook", "url": "https://amazon.com"}}
    ]
  }},
  "projects": {{
    "beginner": ["Beginner Project 1", "Beginner Project 2"],
    "intermediate": ["Intermediate Project 1", "Intermediate Project 2"],
    "advanced": ["Production Enterprise Project 1", "Enterprise Project 2"]
  }},
  "certifications": ["Industry Cert 1", "Industry Cert 2", "Industry Cert 3"],
  "tools": ["Tool 1", "Tool 2", "Tool 3", "Tool 4", "Tool 5"],
  "interview_preparation": [
    "Core Technical Question & Concept 1",
    "System Design / Practical Scenario 2",
    "Behavioral & Problem Solving Strategy 3"
  ],
  "portfolio_tips": ["Portfolio Tip 1", "Portfolio Tip 2", "Portfolio Tip 3"],
  "ai_tips": ["AI Tool Integration Tip 1", "AI Tool Integration Tip 2"],
  "market": {{
    "job_demand": {{"text": "Extremely High demand with rapid growth.", "percentage": 88}},
    "difficulty": {{"text": "Moderate to High learning curve requiring dedicated practice.", "percentage": 75}},
    "growth": {{"text": "Multi-year compound annual growth rate of +22%.", "percentage": 90}},
    "learning_time": {{"text": "6 months of consistent 15 hrs/week study.", "percentage": 80}},
    "salary": {{
      "fresher": "₹6.5L - ₹10.0L / yr",
      "mid": "₹14.0L - ₹22.0L / yr",
      "senior": "₹25.0L - ₹45.0L / yr"
    }},
    "top_organizations": ["Top Company 1", "Top Company 2", "Top Company 3", "Top Company 4", "Top Company 5"],
    "hiring_hotspots": [
      {{"city": "Bangalore", "demand": "Very High", "reason": "Major Tech Hub & Startup Ecosystem"}},
      {{"city": "San Francisco / Remote", "demand": "High", "reason": "Global Product Headquarters"}}
    ],
    "trending_skills": ["Trending Skill 1", "Trending Skill 2", "Trending Skill 3"],
    "daily_plan": [
      "Monday: Theory & Core Concepts (2 hrs)",
      "Tuesday-Thursday: Hands-On Coding & Building (3 hrs)",
      "Friday: Code Review, Refactoring & Testing (2 hrs)",
      "Weekend: Project Deployment & Open Source (4 hrs)"
    ]
  }}
}}

Rules:
- CRITICAL MANDATE: EVERY list field (roles, skills.beginner, skills.intermediate, skills.advanced, resources.youtube, resources.courses, resources.documentation, resources.books, projects.beginner, projects.intermediate, projects.advanced, certifications, tools, interview_preparation, portfolio_tips, ai_tips, market.top_organizations, market.hiring_hotspots, market.trending_skills, market.daily_plan) MUST contain EXACTLY TOP 5 accurate, role-specific items.
- Generate exactly {months} objects in the roadmap array.
- Return ONLY valid JSON. No markdown fences.
"""
        try:
            text = generate_with_fallback(prompt)
            text = clean_json(text)
            roadmap_data = json.loads(text)
            if "error" in roadmap_data and roadmap_data.get("error"):
                return failure(roadmap_data["error"], 400)
            return success(roadmap_data)
        except Exception as api_err:
            print(f"Roadmap generation error for '{career}': {api_err}")
            traceback.print_exc()
            fallback_data = get_fallback_roadmap(career, country, months)
            return success(fallback_data)

    except Exception as e:
        traceback.print_exc()
        fallback_data = get_fallback_roadmap(career_raw, "India", 6)
        return success(fallback_data)

      
    # =====================================================
# Career Match API
# =====================================================

@app.route("/career-match-api", methods=["POST"])
def career_match_api():

    try:

        data = request.get_json()

        career = data.get("career", "").strip()
        if not career:
            return failure("Please enter your Target Career Role.", 400)

        is_v, err = validate_career_input(career)
        if not is_v:
            return failure(err, 400)

        country_raw = data.get("country", "")
        is_v_c, country_res = validate_country_strict(country_raw)
        if not is_v_c:
            return failure(country_res, 400)
        country = country_res

        qualification = data.get("qualification", "").strip()
        skills = data.get("skills", "").strip()
        strengths = data.get("strengths", "").strip()
        experience = data.get("experience", "").strip()

        currency = COUNTRY_CURRENCY.get(country.title(), "USD ($)")

        prompt = f"""
You are CareerVerse AI, a Senior Technical Career Advisor & Executive Hiring Strategist.

Evaluate the user's profile compatibility and skill fit for their target career role.

Target Career: {career}
Country: {country} (Official Currency: {currency})
Qualification: {qualification if qualification else 'Not Specified'}
Technical Skills: {skills if skills else 'Not Specified'}
Personal Strengths: {strengths if strengths else 'Not Specified'}
Experience Level: {experience if experience else 'Entry Level / Student'}

CRITICAL ACCURACY & EVALUATION INSTRUCTIONS:
1. Assess genuine technical alignment, educational foundation, and skill gaps for "{career}" in {country}.
2. Do NOT give fake high scores (100%) if critical core skills for "{career}" are missing.
3. Calculate realistic, uninflated scores for match_percentage, skill_match_score, qualification_match_score, and industry_demand_score.
4. Estimate realistic annual compensation in {currency} for {country}.

Return ONLY valid JSON in this exact structure:

{{
  "career": "{career}",
  "country": "{country}",
  "match_percentage": 0,
  "match_status": "High Profile Fit / Excellent Match",
  "career_identity": "",
  "profile_summary": "",
  "skill_match_score": 0,
  "qualification_match_score": 0,
  "industry_demand_score": 0,
  "salary_expectation": "",
  "strengths": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "missing_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "career_advantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
  "career_risks": ["Risk 1", "Risk 2", "Risk 3"],
  "recommended_actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
  "career_readiness": "Readiness level statement...",
  "personalized_advice": "Detailed strategic career advice..."
}}

Scoring & Format Rules:
- match_percentage, skill_match_score, qualification_match_score, and industry_demand_score MUST be realistic integers between 0 and 100.
- match_status must be one of: "Excellent Match", "Strong Potential", "Needs Skill Upskilling", or "Career Mismatch".
- strengths, missing_skills, and recommended_actions must contain exactly 5 actionable items each.
- career_advantages and career_risks must contain exactly 3 points each.
- Return ONLY valid JSON. No markdown fences.
"""

        text = generate_with_fallback(prompt)

        text = clean_json(text)
        result = json.loads(text)

        return success(result)

    except json.JSONDecodeError:
        traceback.print_exc()
        return failure("AI returned invalid format. Please try again.", 500)

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
        is_v, err = validate_career_input(career)
        if not is_v:
            return failure(err, 400)
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
        if not role:
            return failure("Please enter a target job role.", 400)

        is_v, err = validate_career_input(role)
        if not is_v:
            return failure(err, 400)

        qualification = data.get("qualification", "").strip()
        experience = data.get("experience", "").strip()
        skills = data.get("skills", "").strip()
        country_raw = data.get("country", "").strip()

        if country_raw:
            is_v_c, country_err = validate_country_strict(country_raw)
            if not is_v_c:
                return failure(country_err, 400)
            country = country_err
        else:
            country = "India"

        city = data.get("city", "").strip()
        currency = COUNTRY_CURRENCY.get(country.title(), "USD ($)")

        prompt = f"""
You are CareerVerse AI, a Senior Global Compensation Executive & Salary Benchmarking Specialist.

EVALUATION TASK:
Predict real-time annual compensation, percentile pay bands, and progression tiers specifically for:

Job Role: {role}
Target Country: {country} (Official Currency: {currency})
Target City: {city if city else 'National Average'}
Qualification: {qualification if qualification else 'Not Specified'}
Experience: {experience if experience else 'Not Specified'}
Key Technical Skills: {skills if skills else 'Not Specified'}

CRITICAL ACCURACY RULES:
1. Format ALL salaries in official local currency ({currency}). For India, use "₹ Lakhs / yr" (e.g. "₹8.5L - ₹16.0L / yr"). For USD/Global, use "$k / yr" (e.g. "$95,000 - $145,000 / yr").
2. Do NOT use fake static percentages or generic placeholder numbers. Base predictions on real-world compensation benchmarks for {role} in {country}.
3. Provide 4 percentile pay bands: 25th Percentile (Entry), 50th Percentile (Median), 75th Percentile (High Performer), and 90th Percentile (Top Tier Lead).

Return ONLY valid JSON in this exact structure:

{{
  "role": "{role}",
  "country": "{country}",
  "city": "{city if city else 'National Average'}",
  "currency": "{currency}",
  "estimated_salary": "₹12.0L - ₹22.0L / yr",
  "confidence_score": 88,
  "market_demand": 85,
  "growth_score": 82,
  "percentiles": {{
    "p25": "₹8.5L / yr",
    "p50": "₹15.0L / yr",
    "p75": "₹22.0L / yr",
    "p90": "₹35.0L / yr"
  }},
  "top_companies": ["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"],
  "best_cities": ["City 1", "City 2", "City 3", "City 4"],
  "recommended_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "salary_progression": [
    {{"level": "Entry Level (0-2 Yrs)", "salary": "₹6.0L - ₹10.0L / yr"}},
    {{"level": "Mid Level (3-5 Yrs)", "salary": "₹12.0L - ₹20.0L / yr"}},
    {{"level": "Senior Level (6-9 Yrs)", "salary": "₹22.0L - ₹38.0L / yr"}},
    {{"level": "Principal / Lead (10+ Yrs)", "salary": "₹40.0L - ₹65.0L / yr"}}
  ],
  "recommendation": "Executive salary negotiation & skill leverage advice..."
}}

Rules:
- All scores (confidence_score, market_demand, growth_score) MUST be realistic numbers between 0 and 100.
- Return ONLY valid JSON. No markdown fences.
"""

        text = generate_with_fallback(prompt)
        text = clean_json(text)
        result = json.loads(text)

        return success(result)

    except json.JSONDecodeError:
        traceback.print_exc()
        return failure("AI returned invalid format. Please try again.", 500)

    except Exception as e:
        traceback.print_exc()
        return handle_gemini_error(e)
    # =====================================================
# Career Comparison API
# =====================================================

def generate_fallback_compare(career1, career2, country="India"):
    country_clean = country.title() if country else "India"
    curr_info = COUNTRY_CURRENCY.get(country_clean, "INR (₹)")
    
    def get_role_data(name):
        n = name.lower()
        if any(w in n for w in ["doctor", "surgeon", "physician", "dentist", "anesthesiologist", "medical", "nurse", "pharmacist"]):
            sal = "₹12 - ₹35 Lakhs / yr" if country_clean == "India" else "$120,000 - $350,000 / yr"
            orgs = ["AIIMS / Major Govt Hospitals", "Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Cipla & Sun Pharma"]
            score = 92
        elif any(w in n for w in ["farmer", "agronomist", "botanist", "agriculture", "soil", "crop", "farm"]):
            sal = "₹4 - ₹14 Lakhs / yr" if country_clean == "India" else "$45,000 - $95,000 / yr"
            orgs = ["ICAR Agricultural Institutes", "Ministry of Agriculture", "AgriTech Startups", "NABARD", "National Seeds Corporation"]
            score = 81
        elif any(w in n for w in ["teacher", "professor", "lecturer", "educator", "tutor", "principal", "academic"]):
            sal = "₹4.5 - ₹16 Lakhs / yr" if country_clean == "India" else "$50,000 - $98,000 / yr"
            orgs = ["Central & State Universities", "NCERT / State School Boards", "IITs / NITs", "EdTech Enterprises", "International Academies"]
            score = 84
        elif any(w in n for w in ["police", "ias", "ips", "government", "officer", "diplomat", "civil", "collector", "bureaucrat"]):
            sal = "₹7 - ₹22 Lakhs / yr" if country_clean == "India" else "$60,000 - $130,000 / yr"
            orgs = ["Union Public Service Commission (UPSC)", "Ministry of Home Affairs", "State Civil Services Commission", "Public Sector Undertakings (PSUs)", "United Nations Agencies"]
            score = 88
        elif any(w in n for w in ["lawyer", "attorney", "advocate", "judge", "solicitor", "paralegal"]):
            sal = "₹6 - ₹28 Lakhs / yr" if country_clean == "India" else "$85,000 - $190,000 / yr"
            orgs = ["Supreme & High Courts", "Corporate Law Firms", "AZB & Partners", "Shardul Amarchand Mangaldas", "Corporate Legal Departments"]
            score = 89
        elif any(w in n for w in ["pilot", "captain", "aviation", "aeronautical", "flight"]):
            sal = "₹15 - ₹48 Lakhs / yr" if country_clean == "India" else "$95,000 - $240,000 / yr"
            orgs = ["Air India", "IndiGo Airlines", "Emirates", "Boeing & Airbus", "Directorate General of Civil Aviation"]
            score = 91
        elif any(w in n for w in ["chef", "cook", "baker", "culinary", "hotel"]):
            sal = "₹4.5 - ₹18 Lakhs / yr" if country_clean == "India" else "$42,000 - $95,000 / yr"
            orgs = ["Taj Hotels & Resorts", "Oberoi Group", "Marriott International", "Michelin Star Restaurants", "Luxury Cruise Lines"]
            score = 82
        elif any(w in n for w in ["engineer", "developer", "software", "data", "ai", "cloud"]):
            sal = "₹7 - ₹30 Lakhs / yr" if country_clean == "India" else "$80,000 - $180,000 / yr"
            orgs = ["Google", "Microsoft", "TCS / Infosys", "Amazon", "NVIDIA"]
            score = 93
        else:
            sal = "₹6 - ₹18 Lakhs / yr" if country_clean == "India" else "$60,000 - $130,000 / yr"
            orgs = ["Leading Industry Organizations", "Global Enterprise Corporations", "Specialized Research Institutes", "National Government Boards", "Top Sector Consultancies"]
            score = 85

        cities = [
            {"city": "New Delhi", "country": "India", "demand": "High", "companies": ["Govt Ministries", "Public Bodies"], "reason": "National administrative hub"},
            {"city": "Mumbai", "country": "India", "demand": "Very High", "companies": ["Corporate HQs", "Industry Leaders"], "reason": "Commercial capital of India"},
            {"city": "Bengaluru", "country": "India", "demand": "Very High", "companies": ["R&D Centers", "Innovation Hubs"], "reason": "Primary innovation city"},
            {"city": "Hyderabad", "country": "India", "demand": "High", "companies": ["Pharma & Sector Giants"], "reason": "Major industrial ecosystem"},
            {"city": "Pune", "country": "India", "demand": "High", "companies": ["Academic & Manufacturing Centers"], "reason": "Key educational & sector hub"}
        ] if country_clean == "India" else [
            {"city": "New York", "country": country_clean, "demand": "Very High", "companies": ["Global Leaders"], "reason": "International economic center"},
            {"city": "London", "country": country_clean, "demand": "Very High", "companies": ["Multinational Corps"], "reason": "Major global administrative center"},
            {"city": "San Francisco", "country": country_clean, "demand": "High", "companies": ["Innovation Pioneers"], "reason": "Technology & research hub"},
            {"city": "Tokyo", "country": country_clean, "demand": "High", "companies": ["Enterprise Giants"], "reason": "Leading Asian economic hub"},
            {"city": "Dubai", "country": country_clean, "demand": "High", "companies": ["Global Hubs"], "reason": "Middle East business capital"}
        ]

        return {
            "name": name,
            "salary": {
                "experience_level": "Fresher to Mid-Level",
                "country": country_clean,
                "amount": sal,
                "currency": curr_info
            },
            "overall_score": score,
            "salary_score": min(100, max(50, score + 2)),
            "demand": "High Growth Demand",
            "demand_score": min(100, max(60, score - 3)),
            "growth": "Strong 5-Year Outlook",
            "growth_score": min(100, max(65, score + 1)),
            "learning_time": "3 - 5 Years Degree / Professional Training",
            "personality_fit": [
                f"Strong interest in {name} domain",
                "Analytical & Problem Solving Mindset",
                "Dedicated Continuous Learning Ability",
                "Effective Communication & Leadership Skills"
            ],
            "future_timeline": [
                "Entry Level (0-2 Yrs): Core Fundamentals & Specialized Training",
                "Mid Level (2-5 Yrs): Independent Execution & Project Leadership",
                "Senior Level (5+ Yrs): Strategic Management & Executive Expert"
            ],
            "risks": [
                "Initial competitive selection & qualification benchmarks",
                "Evolving sector regulations & modern workflow adoption",
                "Workload and project delivery demands during peak periods"
            ],
            "learning_path": [
                "Stage 1: Foundational Academic Degree or Professional Certification",
                "Stage 2: Practical Field Internships & Real-World Projects",
                "Stage 3: Advanced Domain Specialization & Senior Leadership"
            ],
            "organizations": orgs,
            "top_cities": cities
        }

    c1_data = get_role_data(career1)
    c2_data = get_role_data(career2)
    
    winner_name = career1 if c1_data["overall_score"] >= c2_data["overall_score"] else career2
    loser_name = career2 if winner_name == career1 else career1

    return {
        "career1": c1_data,
        "career2": c2_data,
        "winner": winner_name,
        "reason": f"{winner_name} demonstrates outstanding sector resilience, structured compensation progression, and expansive long-term career growth opportunities in {country_clean}.",
        "recommendation": f"If you seek strong career stability, high sector growth, and high impact opportunities, pursuing a career in {winner_name} is highly recommended. However, if your personal passion aligns with {loser_name}, both fields offer excellent professional development."
    }

@app.route("/compare-api", methods=["POST"])
def compare_api():
    try:
        data = request.get_json() or {}

        career1_raw = data.get("career1", "").strip()
        career2_raw = data.get("career2", "").strip()
        country_raw = data.get("country", "").strip()

        is_v1, err1 = validate_career_input(career1_raw)
        if not is_v1:
            return failure(f"Career 1 Error: {err1}", 400)

        is_v2, err2 = validate_career_input(career2_raw)
        if not is_v2:
            return failure(f"Career 2 Error: {err2}", 400)

        if country_raw:
            is_vc, country_err = validate_country_strict(country_raw)
            if not is_vc:
                return failure(country_err, 400)
            country = country_err
        else:
            country = "India"

        career1 = err1
        career2 = err2
        currency = COUNTRY_CURRENCY.get(country.title(), "Detect official currency")

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
"""
        try:
            text = generate_with_fallback(prompt)
            text = clean_json(text)
            result = json.loads(text)
            if not isinstance(result, dict) or "career1" not in result or "career2" not in result:
                raise ValueError("Incomplete JSON structure from AI model")
        except Exception as e:
            print(f"[COMPARE FALLBACK ENGAGED] {e}. Generating dynamic fallback comparison for {career1} vs {career2}")
            result = generate_fallback_compare(career1, career2, country)

        if not result.get("winner"):
            c1_s = result.get("career1", {}).get("overall_score", 85)
            c2_s = result.get("career2", {}).get("overall_score", 80)
            result["winner"] = career1 if c1_s >= c2_s else career2

        # Normalize top_cities if strings were returned by Gemini
        for c_key in ["career1", "career2"]:
            if c_key in result and isinstance(result[c_key], dict):
                cities_raw = result[c_key].get("top_cities", [])
                normalized_cities = []
                for item in cities_raw:
                    if isinstance(item, str):
                        normalized_cities.append({
                            "city": item,
                            "country": country,
                            "demand": "High Demand",
                            "companies": ["Major Sector Employers"],
                            "reason": f"Key opportunity hub in {country}"
                        })
                    elif isinstance(item, dict):
                        normalized_cities.append(item)
                result[c_key]["top_cities"] = normalized_cities

        return success(result)

    except Exception as e:
        print(f"Compare API Error: {e}")
        return failure("Unable to compare careers. Please try again.")


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

        target_role = request.form.get("target_role", "").strip()
        if target_role:
            is_v_r, role_err = validate_career_input(target_role)
            if not is_v_r:
                return failure(role_err, 400)

        prompt = f"""
You are a Senior FAANG Executive Recruiter, ATS Optimization Specialist, and Technical Hiring Manager.

EVALUATION TASK:
Analyze the candidate's resume PDF text and perform a hyper-rigorous, accurate ATS evaluation specifically for the Target Job Role: "{target_role if target_role else 'General Role'}".

Candidate Resume Content:
{resume_text}

CRITICAL ACCURACY INSTRUCTIONS:
1. ATS Compatibility Score (ats_score): Measure exact keyword match, section formatting, and skill alignment for "{target_role if target_role else 'General Role'}". If key industry tools/keywords for "{target_role if target_role else 'General Role'}" are missing, penalize the score accurately.
2. Job Readiness Score (job_readiness_score): Evaluate real projects, internships, domain skills, and technical depth.
3. Recruiter Impact Score (recruiter_impact_score): Evaluate layout clarity, professional summary quality, and metric-driven bullet points.
4. Skill Evidence Score (skill_evidence_score): Check for quantifiable metrics (percentages, speed gains, user counts, code links, live project URLs).
5. Interview Confidence Score (interview_confidence_score): Determine if the resume projects sufficient technical depth to survive rigorous technical interview questioning for "{target_role if target_role else 'General Role'}".

Return ONLY valid JSON in this exact structure:

{{
  "target_role": "{target_role if target_role else 'General Role'}",
  "ats_score": 0,
  "job_readiness_score": 0,
  "recruiter_impact_score": 0,
  "skill_evidence_score": 0,
  "interview_confidence_score": 0,
  "quantified_metrics_score": 0,
  "google_xyz_compliance": "High / Medium / Low",
  "ats_pass_status": "High ATS Pass Probability",
  "experience_level": "Mid-Level",
  "recommended_roles": ["Role 1", "Role 2", "Role 3", "Role 4", "Role 5"],
  "strengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4", "Strength 5"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3", "Weakness 4", "Weakness 5"],
  "missing_skills": ["Missing Skill 1", "Missing Skill 2", "Missing Skill 3", "Missing Skill 4", "Missing Skill 5"],
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"],
  "final_verdict": "Detailed professional recruiter verdict statement..."
}}

Scoring & Format Rules:
- All scores (ats_score, job_readiness_score, recruiter_impact_score, skill_evidence_score, interview_confidence_score) MUST be realistic numbers between 0 and 100.
- ats_pass_status must be one of: "High ATS Pass Probability" (if ats_score >= 75), "Moderate ATS Compatibility" (if 55-74), or "ATS Revision Recommended" (if < 55).
- Do NOT inflate scores; base every point on explicit evidence in the resume text.
- recommended_roles, strengths, weaknesses, missing_skills, and suggestions must contain exactly 5 actionable items each.
- Return ONLY valid JSON. No markdown fences.
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
        is_v_c, career_err = validate_career_input(career)
        if not is_v_c:
            return failure(career_err, 400)

        country_raw = data.get("country", "").strip()
        if country_raw:
            is_v_cntry, country_err = validate_country_strict(country_raw)
            if not is_v_cntry:
                return failure(country_err, 400)
            country = country_err
        else:
            country = "Global"

        prompt = f"""
You are CareerVerse AI Career Reality Expert.

CRITICAL INITIAL CHECK:
Is "{career}" a real, recognizable job role or profession (such as Software Engineer, AI Engineer, Data Scientist, Doctor, Accountant, Graphic Designer, Lawyer, Teacher, Environmental Engineer, etc.)?
If "{career}" is NOT a real job role or profession (for example if it is random letters like "uwgyue", "jhdbeg", "asdf", numbers like "1234", or nonsensical text), you MUST return ONLY this JSON:
{{
  "error": "Invalid Career Name: '{career}' is not a recognized job role. Please enter a valid career title (e.g. Software Engineer, Data Scientist)."
}}

Otherwise, analyze the real-world truth of this career.

Career:
{career}

Country:
{country}


Return ONLY valid JSON.


Format:

{{
"reality_score":0,

"reality_status":"",

"stress_level":"",

"daily_work":[],

"hidden_truths":[],

"technical_difficulty":0,

"competition_level":0,

"learning_difficulty":0,

"salary_reality":"",

"fresher_salary":"",

"mid_salary":"",

"senior_salary":"",

"not_for_you":[],

"industry_reality":"",

"ai_verdict":""

}}


Rules:

- reality_score between 0-100.
- technical_difficulty between 0-100.
- competition_level between 0-100.
- learning_difficulty between 0-100.
- stress_level should be a realistic assessment (e.g., 'Moderate to High', 'High Burnout Risk', 'Balanced').

- daily_work exactly 5 points.
- hidden_truths exactly 5 points.
- not_for_you exactly 3 points.

- fresher_salary, mid_salary, senior_salary must be non-empty salary ranges for {country}.
- Explain real challenges with honesty and accuracy.
- Do not give fake motivation.
- Return only JSON.

"""


        text = generate_with_fallback(prompt)

        text = clean_json(text)

        result = json.loads(text)

        if "error" in result or result.get("error"):
            return failure(result["error"], 400)

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
# Career Intelligence Dashboard API
# =====================================================

@app.route("/career-intelligence-api", methods=["POST"])
def career_intelligence_api():

    try:

        data = request.get_json()

        career = data.get("career", "").strip()
        is_v, err = validate_career_input(career)
        if not is_v:
            return failure(err, 400)
        country_raw = data.get("country", "").strip()
        if country_raw:
            is_v_c, country_err = validate_country_strict(country_raw)
            if not is_v_c:
                return failure(country_err, 400)
            country = country_err
        else:
            country = "Global"

        if career == "":
            return failure("Please enter a career.", 400)

        current_year = datetime.now().year

        years = [
            current_year - 3,
            current_year - 2,
            current_year - 1,
            current_year,
            current_year + 1,
            current_year + 2,
            current_year + 3,
            current_year + 4,
            current_year + 5
        ]

        prompt = f"""
You are CareerVerse AI.
You are an expert Career Intelligence Analyst.

CRITICAL INITIAL CHECK:
Is "{career}" a real, recognizable job role or profession (such as Software Engineer, AI Engineer, Data Scientist, Doctor, Accountant, Graphic Designer, Lawyer, Teacher, Environmental Engineer, etc.)?
If "{career}" is NOT a real job role or profession (for example if it is random letters like "uwgyue", "jhdbeg", "asdf", numbers like "1234", or nonsensical text), you MUST return ONLY this JSON:
{{
  "error": "Invalid Career Name: '{career}' is not a recognized job role. Please enter a valid career title (e.g. Software Engineer, Data Scientist)."
}}

Otherwise, analyze ONLY the selected career.

Career:
{career}

Country:
{country if country else "Global"}

Current Year:
{current_year}

Timeline

Past:
{years[0]}, {years[1]}, {years[2]}

Present:
{years[3]}

Future:
{years[4]}, {years[5]}, {years[6]}, {years[7]}, {years[8]}

IMPORTANT RULES

- Never assume every career is related to programming.
- Analyse only the selected profession.
- Use realistic industry trends.
- Base the analysis on the selected country whenever possible.
- Past values should reflect historical trends.
- Present values should reflect the current market.
- Future values should be realistic predictions.
- Explain WHY every trend changes.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not write explanations outside JSON.

Return this JSON exactly:

{{
  "career":"",

  "summary":{{
    "overview":"",
    "difficulty":"",
    "education":"",
    "average_salary":"",
    "fresher_salary":"",
    "mid_salary":"",
    "senior_salary":"",
    "future_rating":0,
    "confidence":0
  }},

  "charts":{{

    "career_demand":{{
      "labels":{years},
      "values":[0,0,0,0,0,0,0,0,0],
      "reason":""
    }},

    "salary_growth":{{
      "labels":[
        "Student",
        "Intern",
        "Entry",
        "Junior",
        "Mid",
        "Senior",
        "Expert"
      ],
      "values":[0,0,0,0,0,0,0],
      "reason":""
    }},

    "competition":{{
      "labels":{years},
      "values":[0,0,0,0,0,0,0,0,0],
      "reason":""
    }},

    "technology":{{
      "labels":[
        "Past",
        "Present",
        "Future"
      ],
      "values":[0,0,0],
      "reason":""
    }},

    "automation":{{
      "score":0,
      "reason":""
    }},

    "skills":{{
      "technical":0,
      "communication":0,
      "leadership":0,
      "management":0,
      "problem_solving":0,
      "reason":""
    }},

    "global_demand":{{
      "countries":[],
      "values":[],
      "reason":""
    }}

  }},

  "career_path":[],

  "future_opportunities":[],

  "top_companies":[],

  "recommended_tools":[],

  "certifications":[],

  "ai_advice":[]

}}

Rules:

- confidence must be between 80 and 100.
- future_rating must be between 0 and 100.
- fresher_salary must be the realistic entry/fresher level compensation for {career} in {country} (e.g., '₹5L - ₹8L / yr' or '$70k - $90k / yr').
- mid_salary must be the realistic mid-level compensation (3-6 yrs) for {career} in {country} (e.g., '₹12L - ₹20L / yr' or '$110k - $150k / yr').
- senior_salary must be the realistic experienced/senior compensation (7+ yrs) for {career} in {country} (e.g., '₹25L - ₹45L / yr' or '$160k - $240k / yr').
- salary_growth.values must contain actual numeric compensation figures (NOT percentages). For India, return values in Lakhs/yr (e.g., [0, 3, 7, 12, 18, 30, 48]). For USD/Global, return values in $k/yr (e.g., [0, 25, 75, 105, 145, 195, 260]).
- Every chart must contain realistic values.
- career_path must contain exactly 5 stages.
- future_opportunities must contain exactly 5 points.
- top_companies must contain exactly 5 companies.
- recommended_tools must contain exactly 5 tools.
- certifications must contain exactly 5 certifications.
- ai_advice must contain exactly 5 personalised suggestions.
- Return ONLY valid JSON.
"""
        text = generate_with_fallback(prompt)

        text = clean_json(text)

        result = json.loads(text)

        if "error" in result or result.get("error"):
            return failure(result["error"], 400)

        # -------------------------------
        # Default Structure & Smart Fallbacks
        # -------------------------------

        result.setdefault("career", career)

        summary = result.setdefault("summary", {})
        summary.setdefault("overview", "")
        summary.setdefault("difficulty", "")
        summary.setdefault("education", "")
        summary.setdefault("average_salary", "")
        summary.setdefault("future_rating", 75)
        summary.setdefault("confidence", 90)

        # Smart fallbacks if Gemini leaves tier salaries empty
        is_india = "india" in country.lower() or "inr" in str(summary.get("average_salary", "")).lower() or "₹" in str(summary.get("average_salary", ""))

        if not summary.get("fresher_salary"):
            summary["fresher_salary"] = "₹5L - ₹9L / yr" if is_india else "$65,000 - $90,000 / yr"
        if not summary.get("mid_salary"):
            summary["mid_salary"] = "₹12L - ₹22L / yr" if is_india else "$110,000 - $155,000 / yr"
        if not summary.get("senior_salary"):
            summary["senior_salary"] = "₹25L - ₹48L / yr" if is_india else "$165,000 - $250,000 / yr"

        charts = result.setdefault("charts", {})

        charts.setdefault("career_demand", {
            "labels": years,
            "values": [70] * 9,
            "reason": ""
        })

        charts.setdefault("salary_growth", {
            "labels": [
                "Student",
                "Intern",
                "Entry",
                "Junior",
                "Mid",
                "Senior",
                "Expert"
            ],
            "values": [0, 15, 35, 55, 75, 90, 100],
            "reason": ""
        })

        charts.setdefault("competition", {
            "labels": years,
            "values": [60] * 9,
            "reason": ""
        })

        charts.setdefault("technology", {
            "labels": ["Past", "Present", "Future"],
            "values": [40, 70, 95],
            "reason": ""
        })

        charts.setdefault("automation", {
            "score": 35,
            "reason": ""
        })

        charts.setdefault("skills", {
            "technical": 80,
            "communication": 75,
            "leadership": 60,
            "management": 55,
            "problem_solving": 90,
            "reason": ""
        })

        charts.setdefault("global_demand", {
            "countries": [],
            "values": [],
            "reason": ""
        })

        result.setdefault("career_path", [])
        result.setdefault("future_opportunities", [])
        result.setdefault("top_companies", [])
        result.setdefault("recommended_tools", [])
        result.setdefault("certifications", [])
        result.setdefault("ai_advice", [])

        return success(result)

    except json.JSONDecodeError:

        traceback.print_exc()

        return failure(
            "Gemini returned invalid JSON. Please try again."
        )

    except Exception as e:

        traceback.print_exc()

        return handle_gemini_error(e)        
# =====================================================
# Run Flask
# =====================================================

import os

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )