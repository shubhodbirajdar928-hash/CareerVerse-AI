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

@app.after_request
def add_no_cache_headers(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

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

VALID_ACRONYMS = {
    "ai", "ml", "ui", "ux", "hr", "pr", "it", "qa", "seo", "sre", "cto", "ceo", "cfo", "vp", "dba", "erp", "crm", "bi", "ar", "vr", "3d", "2d", "5g", "cad", "gis", "pm", "dev", "ops", "sec", "mlops", "devops", "secops", "web3", "web2", "ios", "nlp", "llm", "genai", "ar/vr", "ui/ux", "ai/ml", "c++", "c#", ".net",
    # Medical & Health Acronyms
    "mbbs", "bds", "bams", "bhms", "bpt", "mch", "dnb", "bums", "brms", "md", "ms", "frcs", "mrcp", "mrcs", "pharmd", "gnm", "anm",
    # Law & Judicial Acronyms
    "llb", "llm", "bcl", "aibe", "clat",
    # Civil Services, Defense & Public Acronyms
    "ias", "ips", "ifs", "irs", "upsc", "nda", "cds", "afcat", "ssc", "psc", "gpsc", "mpsc", "uppsc", "bpsc",
    # Aviation Acronyms
    "cpl", "atpl", "ppl", "dgca", "faa",
    # Business, Finance & Accounting Acronyms
    "ca", "cfa", "cpa", "cfp", "cma", "acca", "cs", "frm",
    # Higher Education Degrees
    "btech", "mtech", "bca", "mca", "bba", "mba", "bsc", "msc", "phd", "bed", "med", "bdes", "mdes", "barch", "march"
}

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
    
GLOBAL_CURRENCY_DB = {
    # Asia & South Asia
    "india": ("₹", "L / yr", "₹6.5L - ₹10.0L / yr", "₹14.0L - ₹22.0L / yr", "₹25.0L - ₹48.0L / yr"),
    "japan": ("¥", "M / yr", "¥4.5M - ¥6.2M / yr", "¥7.0M - ¥10.5M / yr", "¥12.0M - ¥18.0M / yr"),
    "south korea": ("₩", "M / yr", "₩38M - ₩55M / yr", "₩65M - ₩95M / yr", "₩110M - ₩175M / yr"),
    "korea": ("₩", "M / yr", "₩38M - ₩55M / yr", "₩65M - ₩95M / yr", "₩110M - ₩175M / yr"),
    "china": ("¥", "k / yr", "¥120k - ¥180k / yr", "¥220k - ¥350k / yr", "¥400k - ¥650k / yr"),
    "taiwan": ("NT$", "k / yr", "NT$650k - NT$950k / yr", "NT$1.2M - NT$1.8M / yr", "NT$2.2M - NT$3.5M / yr"),
    "hong kong": ("HK$", "k / yr", "HK$220k - HK$320k / yr", "HK$380k - HK$580k / yr", "HK$680k - HK$1.1M / yr"),
    "singapore": ("S$", "k / yr", "S$48k - S$68k / yr", "S$72k - S$108k / yr", "S$115k - S$180k / yr"),
    "malaysia": ("RM ", "/ mo", "RM 4,500 - RM 7,000 / mo", "RM 8,500 - RM 14,000 / mo", "RM 16,000 - RM 28,000 / mo"),
    "thailand": ("฿", "/ mo", "฿35,000 - ฿55,000 / mo", "฿65,000 - ฿105,000 / mo", "฿120,000 - ฿210,000 / mo"),
    "indonesia": ("Rp ", "/ mo", "Rp 8,000,000 - Rp 14,000,000 / mo", "Rp 16,000,000 - Rp 28,000,000 / mo", "Rp 32,000,000 - Rp 55,000,000 / mo"),
    "vietnam": ("₫", "/ mo", "₫15,000,000 - ₫25,000,000 / mo", "₫30,000,000 - ₫50,000,000 / mo", "₫60,000,000 - ₫110,000,000 / mo"),
    "philippines": ("₱", "/ mo", "₱30,000 - ₱50,000 / mo", "₱60,000 - ₱95,000 / mo", "₱110,000 - ₱180,000 / mo"),
    "pakistan": ("PKR ", "/ mo", "PKR 85,000 - PKR 140,000 / mo", "PKR 160,000 - PKR 280,000 / mo", "PKR 320,000 - PKR 550,000 / mo"),
    "bangladesh": ("BDT ", "/ mo", "BDT 35,000 - BDT 60,000 / mo", "BDT 70,000 - BDT 120,000 / mo", "BDT 140,000 - BDT 250,000 / mo"),
    "sri lanka": ("LKR ", "/ mo", "LKR 75,000 - LKR 125,000 / mo", "LKR 140,000 - LKR 240,000 / mo", "LKR 280,000 - LKR 480,000 / mo"),

    # Americas & Caribbean
    "united states": ("$", "k / yr", "$70k - $95k / yr", "$120k - $160k / yr", "$180k - $270k / yr"),
    "usa": ("$", "k / yr", "$70k - $95k / yr", "$120k - $160k / yr", "$180k - $270k / yr"),
    "canada": ("CA$", "k / yr", "CA$55k - CA$75k / yr", "CA$80k - CA$115k / yr", "CA$125k - CA$185k / yr"),
    "mexico": ("MEX$", "/ mo", "MEX$ 18,000 - MEX$ 32,000 / mo", "MEX$ 38,000 - MEX$ 65,000 / mo", "MEX$ 75,000 - MEX$ 130,000 / mo"),
    "brazil": ("R$", "/ mo", "R$ 5,500 - R$ 9,000 / mo", "R$ 11,000 - R$ 18,000 / mo", "R$ 22,000 - R$ 38,000 / mo"),
    "argentina": ("ARS$", "/ mo", "ARS$ 650,000 - ARS$ 1,100,000 / mo", "ARS$ 1,300,000 - ARS$ 2,200,000 / mo", "ARS$ 2,500,000 - ARS$ 4,500,000 / mo"),
    "chile": ("CLP$", "/ mo", "CLP$ 950,000 - CLP$ 1,600,000 / mo", "CLP$ 1,800,000 - CLP$ 3,000,000 / mo", "CLP$ 3,500,000 - CLP$ 6,000,000 / mo"),

    # Europe & UK
    "united kingdom": ("£", "k / yr", "£32,000 - £48,000 / yr", "£52,000 - £80,000 / yr", "£85,000 - £140,000 / yr"),
    "uk": ("£", "k / yr", "£32,000 - £48,000 / yr", "£52,000 - £80,000 / yr", "£85,000 - £140,000 / yr"),
    "germany": ("€", "k / yr", "€42,000 - €58,000 / yr", "€62,000 - €88,000 / yr", "€95,000 - €150,000 / yr"),
    "france": ("€", "k / yr", "€40,000 - €55,000 / yr", "€58,000 - €82,000 / yr", "€90,000 - €140,000 / yr"),
    "netherlands": ("€", "k / yr", "€45,000 - €62,000 / yr", "€65,000 - €92,000 / yr", "€98,000 - €155,000 / yr"),
    "switzerland": ("CHF ", "k / yr", "CHF 75,000 - CHF 95,000 / yr", "CHF 105,000 - CHF 140,000 / yr", "CHF 150,000 - CHF 220,000 / yr"),

    # Middle East & Africa
    "united arab emirates": ("AED ", "/ mo", "AED 12,000 - AED 18,000 / mo", "AED 22,000 - AED 35,000 / mo", "AED 40,000 - AED 65,000 / mo"),
    "uae": ("AED ", "/ mo", "AED 12,000 - AED 18,000 / mo", "AED 22,000 - AED 35,000 / mo", "AED 40,000 - AED 65,000 / mo"),
    "dubai": ("AED ", "/ mo", "AED 12,000 - AED 18,000 / mo", "AED 22,000 - AED 35,000 / mo", "AED 40,000 - AED 65,000 / mo"),
    "saudi arabia": ("SAR ", "/ mo", "SAR 10,000 - SAR 16,000 / mo", "SAR 18,000 - SAR 28,000 / mo", "SAR 32,000 - SAR 55,000 / mo"),
    "qatar": ("QAR ", "/ mo", "QAR 11,000 - QAR 17,000 / mo", "QAR 20,000 - QAR 32,000 / mo", "QAR 38,000 - QAR 60,000 / mo"),
    "south africa": ("R ", "/ mo", "R 22,000 - R 38,000 / mo", "R 42,000 - R 68,000 / mo", "R 75,000 - R 130,000 / mo"),
    "nigeria": ("₦", "/ mo", "₦ 350,000 - ₦ 600,000 / mo", "₦ 700,000 - ₦ 1,200,000 / mo", "₦ 1,500,000 - ₦ 2,800,000 / mo"),
    "kenya": ("KSh ", "/ mo", "KSh 85,000 - KSh 140,000 / mo", "KSh 160,000 - KSh 260,000 / mo", "KSh 300,000 - KSh 520,000 / mo"),

    # Oceania
    "australia": ("A$", "k / yr", "A$65,000 - A$88,000 / yr", "A$92,000 - A$130,000 / yr", "A$140,000 - A$210,000 / yr"),
    "new zealand": ("NZ$", "k / yr", "NZ$60,000 - NZ$82,000 / yr", "NZ$85,000 - NZ$120,000 / yr", "NZ$130,000 - NZ$190,000 / yr")
}

def format_multi_currency_salary(country, base_usd_fresher="$70k - $95k / yr", base_usd_mid="$120k - $160k / yr", base_usd_senior="$180k - $270k / yr"):
    c_low = (country or "").lower().strip()
    
    for key, (symbol, unit, f_val, m_val, s_val) in GLOBAL_CURRENCY_DB.items():
        if key in c_low:
            return f"{f_val} (Fresher) -> {m_val} (Mid) -> {s_val} (Senior)"

    c_name = country.title() if country else "Target Country"
    return f"{c_name}: {base_usd_fresher} (Fresher) -> {base_usd_mid} (Mid) -> {base_usd_senior} (Senior)"

# =====================================================
# Fallback Roadmap Generator
# =====================================================

def get_fallback_roadmap(career, country, months=6):
    c_title = career.strip().title() if career else "Professional"
    c_low = career.lower() if career else ""
    is_india = "india" in (country or "").lower()

    # Sector Classification
    if any(w in c_low for w in ["doctor", "surgeon", "physician", "dentist", "nurse", "medical", "pharmacist"]):
        edu = "MBBS / MD / BDS / Nursing Degree + Clinical Internship & Medical Council Registration"
        sal_ind_f, sal_ind_m, sal_ind_s = "₹6.0L - ₹10.0L / yr", "₹15.0L - ₹28.0L / yr", "₹35.0L - ₹75.0L / yr"
        sal_cnt_f, sal_cnt_m, sal_cnt_s = "$75k - $110k / yr", "$150k - $240k / yr", "$280k - $450k / yr"
        roles = [f"Resident {c_title}", f"Junior Consultant {c_title}", f"Senior Consultant {c_title}", f"Head of Clinical Department", f"Medical Director"]
        sk_b = ["Human Anatomy & Physiology", "Medical Terminology", "Vital Signs & Triage", "First Aid & CPR", "Patient Empathy"]
        sk_i = ["Clinical Pharmacology", "Pathology & Diagnostics", "EMR/EHR Systems (Epic/Cerner)", "Emergency Resuscitation", "Surgical Hygiene"]
        sk_a = ["Advanced Surgical Protocols", "Critical ICU Management", "Complex Differential Diagnosis", "Clinical Research & Publishing", "Hospital Governance"]
        yt = [{"name": "Osmosis by Elseveir", "url": "https://www.youtube.com/@osmosis"}, {"name": "Ninja Nerd - Medicine", "url": "https://www.youtube.com/@NinjaNerdOfficial"}, {"name": "Doctor Mike", "url": "https://www.youtube.com/@DoctorMike"}, {"name": "Armando Hasudungan", "url": "https://www.youtube.com/@armandohasudungan"}, {"name": "Khan Academy Medicine", "url": "https://www.youtube.com/@khanacademy"}]
        courses = [{"name": "Harvard Medical School Online", "url": "https://online-learning.harvard.edu"}, {"name": "Coursera Clinical Medicine", "url": "https://www.coursera.org"}, {"name": "Stanford Health & Medicine", "url": "https://online.stanford.edu"}, {"name": "edX Anatomy & Physiology", "url": "https://www.edx.org"}, {"name": "Lecturio Medical Education", "url": "https://www.lecturio.com"}]
        docs = [{"name": "WHO Clinical Guidelines", "url": "https://www.who.int"}, {"name": "PubMed Central Literature", "url": "https://pmc.ncbi.nlm.nih.gov"}, {"name": "UpToDate Clinical Decision Support", "url": "https://www.uptodate.com"}, {"name": "CDC Health Protocols", "url": "https://www.cdc.gov"}, {"name": "ICMR Guidelines", "url": "https://www.icmr.gov.in"}]
        books = [{"name": "Harrison's Principles of Internal Medicine", "url": "https://amazon.com"}, {"name": "Gray's Anatomy for Students", "url": "https://amazon.com"}, {"name": "Robbins & Cotran Pathologic Basis of Disease", "url": "https://amazon.com"}, {"name": "Katzung Basic & Clinical Pharmacology", "url": "https://amazon.com"}, {"name": "Oxford Handbook of Clinical Medicine", "url": "https://amazon.com"}]
        projs_b = ["Patient Case Logbook Analysis", "Vital Signs Monitoring Study", "Pharmacology Dosage Calculation Chart", "First Aid Emergency Plan", "Basic Clinical Hygiene Audit"]
        projs_i = ["Diagnostic Case Study Portfolio", "EHR Clinical Workflow Design", "Hospital Ward Infection Control Audit", "Pharmacovigilance Adverse Event Study", "Emergency ICU Triage Simulation"]
        projs_a = ["Clinical Research Trial Design", "Complex Surgical Case Study Publication", "Hospital Departmental EMR System Upgrade", "Public Health Epidemic Response Protocol", "Medical Ethics Case Review"]
        certs = ["ACLS & BLS Certification", "Medical Board Registration / USMLE", "NEET PG / PLAB Specialist License", "Certified Electronic Health Record Specialist", "Critical Care Medicine Diploma"]
        tools = ["Diagnostic Stethoscope & Otoscope", "Epic / Cerner EMR Systems", "Medical Pulse Oximeter & ECG", "Surgical Instrument Set", "UpToDate Clinical Database"]
        top_orgs = ["Mayo Clinic", "AIIMS New Delhi", "Johns Hopkins Hospital", "NHS UK", "Apollo Hospitals"]
        hotspots = [{"city": "Delhi NCR", "demand": "Very High", "reason": "National premier medical institutes & super-specialty hospitals."}, {"city": "Boston / USA", "demand": "High", "reason": "Global hub for clinical research & Harvard teaching hospitals."}, {"city": "Mumbai", "demand": "High", "reason": "Leading private hospital networks & medical research hubs."}, {"city": "London / UK", "demand": "High", "reason": "NHS tertiary referral centers & medical universities."}, {"city": "Bengaluru", "demand": "Moderate-High", "reason": "Growing health-tech & multi-specialty hospital infrastructure."}]
        trend_skills = ["Robotic Surgery Protocols", "Digital EMR Data Analysis", "Telemedicine Consultation", "Precision Diagnostics", "Genomic Medicine"]
        daily_plan = ["Monday: 2 hrs Anatomy & Pathophysiology Deep Dive", "Tuesday: 2 hrs Clinical Case Study Analysis", "Wednesday: 2 hrs Pharmacology & Drug Interaction Review", "Thursday: 2 hrs EMR Documentation & Patient Simulation", "Friday: 2 hrs Clinical Rotations & Case Reviews", "Saturday: 3 hrs Diagnostic Rounds & Journal Review", "Sunday: 1 hr Weekly Medical Knowledge Assessment"]
    elif any(w in c_low for w in ["ias", "ips", "upsc", "police", "army", "navy", "air force", "nda", "civil servant", "government"]):
        edu = "Bachelor's Degree in any discipline + UPSC / State Public Service / SSB Selection Board Qualification"
        sal_ind_f, sal_ind_m, sal_ind_s = "₹7.0L - ₹11.0L / yr", "₹14.0L - ₹22.0L / yr", "₹25.0L - ₹40.0L / yr"
        sal_cnt_f, sal_cnt_m, sal_cnt_s = "$65k - $95k / yr", "$100k - $140k / yr", "$160k - $220k / yr"
        roles = [f"Assistant Magistrate / Probationary Officer", f"Sub-Divisional Magistrate / SP", f"District Collector / DIG", f"Joint Secretary / Inspector General", f"Chief Secretary / Director General of Police"]
        sk_b = ["Indian Polity & Constitution", "Indian History & Culture", "Geography & Environment", "Basic General Mental Ability", "Ethics & Integrity"]
        sk_i = ["Public Administration & Governance", "Economic & Social Development", "Internal Security & Disaster Management", "District Legal Frameworks", "Policy Drafting"]
        sk_a = ["International Relations & Strategy", "Cabinet-Level Policy Formulation", "Crisis Management & Law Enforcement", "Inter-Departmental Coordination", "Public Audit & Budgeting"]
        yt = [{"name": "StudyIQ IAS", "url": "https://www.youtube.com/@StudyIQEducation"}, {"name": "Unacademy UPSC", "url": "https://www.youtube.com/@UnacademyUPSC"}, {"name": "Vision IAS", "url": "https://www.youtube.com/@VisionIASdelhi"}, {"name": "Drishti IAS", "url": "https://www.youtube.com/@DrishtiIASvideos"}, {"name": "Sansad TV Official", "url": "https://www.youtube.com/@SansadTV"}]
        courses = [{"name": "Swayam Public Administration", "url": "https://swayam.gov.in"}, {"name": "NPTEL Governance & Policy", "url": "https://nptel.ac.in"}, {"name": "Coursera Global Public Policy", "url": "https://www.coursera.org"}, {"name": "IGNOU Public Governance", "url": "http://www.ignou.ac.in"}, {"name": "EdX International Relations", "url": "https://www.edx.org"}]
        docs = [{"name": "Constitution of India Portal", "url": "https://legislative.gov.in"}, {"name": "PIB (Press Information Bureau)", "url": "https://pib.gov.in"}, {"name": "NITI Aayog Official Reports", "url": "https://www.niti.gov.in"}, {"name": "Economic Survey of India", "url": "https://www.indiabudget.gov.in"}, {"name": "State Gazette Portal", "url": "https://egazette.gov.in"}]
        books = [{"name": "Indian Polity by M. Laxmikanth", "url": "https://amazon.com"}, {"name": "India's Struggle for Independence by Bipan Chandra", "url": "https://amazon.com"}, {"name": "Certificate Physical Geography by GC Leong", "url": "https://amazon.com"}, {"name": "Ethics, Integrity and Aptitude by Subba Rao", "url": "https://amazon.com"}, {"name": "Indian Economy by Ramesh Singh", "url": "https://amazon.com"}]
        projs_b = ["District Socio-Economic Profile Study", "Constitutional Rights Summary Report", "Local Sanitation Policy Review", "Basic Disaster Response Plan", "Public Grievance Redressal Audit"]
        projs_i = ["Urban Smart City Infrastructure Policy", "Rural Employment Scheme Implementation Audit", "District Crime Trend Analysis & Mitigation", "Environmental Impact Assessment", "Public Distribution System Optimization"]
        projs_a = ["State-Level Disaster Resilience Framework", "National E-Governance Policy Architecture", "Border Security & Inter-Agency Coordination Plan", "Fiscal Policy Reform Memorandum", "Cabinet Briefing Note"]
        certs = ["UPSC Civil Services Examination (CSE)", "State Public Service Commission (PSC)", "SSB Service Selection Board Clearance", "LBSNAA Officer Training Certification", "National Disaster Management Cert"]
        tools = ["e-Office Govt Workflow Portal", "GIS Geo-Spatial Mapping", "Crime & Criminal Tracking (CCTNS)", "Public Financial Management (PFMS)", "National Data & Analytics Platform"]
        top_orgs = ["Government of India", "State Civil Services Bureau", "Ministry of Home Affairs", "Indian Armed Forces", "NITI Aayog"]
        hotspots = [{"city": "New Delhi", "demand": "Very High", "reason": "Central Secretariat, Union Ministries & UPSC Headquarters."}, {"city": "State Capitals (Mumbai/Bengaluru/Lucknow)", "demand": "High", "reason": "State Secretariats, Police HQs & District Collectorates."}, {"city": "District HQs Nationwide", "demand": "High", "reason": "Field administration, public safety & revenue governance."}, {"city": "Dehradun / Mussoorie", "demand": "Moderate-High", "reason": "National Civil Services Academy & Defense Training Hubs."}, {"city": "Washington D.C. / UN HQs", "demand": "Moderate", "reason": "Diplomatic missions & international civil services."}]
        trend_skills = ["E-Governance Architecture", "Data-Driven Public Policy", "Disaster Resilience Planning", "Public Financial Transparency", "Crisis Leadership"]
        daily_plan = ["Monday: 2 hrs Indian Polity & Constitutional Law", "Tuesday: 2 hrs Current Affairs & PIB News Analysis", "Wednesday: 2 hrs Economic Policy & Budget Analysis", "Thursday: 2 hrs Ethics & Case Studies Practice", "Friday: 2 hrs Answer Writing & Essay Preparation", "Saturday: 3 hrs Mock Test & Revision", "Sunday: 1 hr Weekly Performance Review"]
    elif any(w in c_low for w in ["lawyer", "advocate", "judge", "legal", "solicitor", "paralegal"]):
        edu = "LLB / LLM (Bachelor / Master of Laws) + Bar Council Enrolment & All India Bar Examination (AIBE)"
        sal_ind_f, sal_ind_m, sal_ind_s = "₹5.0L - ₹9.0L / yr", "₹12.0L - ₹22.0L / yr", "₹30.0L - ₹65.0L / yr"
        sal_cnt_f, sal_cnt_m, sal_cnt_s = "$70k - $100k / yr", "$140k - $210k / yr", "$250k - $400k / yr"
        roles = [f"Junior Associate Lawyer", f"Senior Associate Advocate", f"Partner / Corporate Counsel", f"Additional District Judge", f"Senior Counsel / Magistrate"]
        sk_b = ["Constitutional & Criminal Law", "Contract & Property Law", "Legal Research & Citation", "Case Brief Writing", "Courtroom Etiquette"]
        sk_i = ["Corporate & Commercial Law", "Civil & Criminal Trial Procedure", "Legal Drafting & Conveyancing", "Intellectual Property Rights", "Arbitration & Mediation"]
        sk_a = ["Appellate Advocacy & Special Leave Petitions", "Cross-Border Mergers & Acquisitions Law", "Regulatory Compliance Architecture", "Constitutional Bench Litigation", "Judicial Decision Making"]
        yt = [{"name": "LegalEagle", "url": "https://www.youtube.com/@LegalEagle"}, {"name": "Bar & Bench Official", "url": "https://www.youtube.com/@barandbench"}, {"name": "LiveLaw India", "url": "https://www.youtube.com/@LiveLawIndia"}, {"name": "Finology Legal", "url": "https://www.youtube.com/@FinologyLegal"}, {"name": "Harvard Law School", "url": "https://www.youtube.com/@harvardlaw"}]
        courses = [{"name": "Coursera Contract Law", "url": "https://www.coursera.org"}, {"name": "edX International Law", "url": "https://www.edx.org"}, {"name": "Swayam Indian Legal System", "url": "https://swayam.gov.in"}, {"name": "NPTEL Legal Studies", "url": "https://nptel.ac.in"}, {"name": "LawSikho Executive Diploma", "url": "https://lawsikho.com"}]
        docs = [{"name": "India Code Portal", "url": "https://www.indiacode.nic.in"}, {"name": "Supreme Court Judgments Portal", "url": "https://main.sci.gov.in"}, {"name": "Law Commission Reports", "url": "https://lawcommissionofindia.nic.in"}, {"name": "Bar Council of India", "url": "http://www.barcouncilofindia.org"}, {"name": "Manupatra Legal Research", "url": "https://www.manupatrafast.in"}]
        books = [{"name": "Introduction to Constitution of India by D.D. Basu", "url": "https://amazon.com"}, {"name": "Law of Contract by Avtar Singh", "url": "https://amazon.com"}, {"name": "Black's Law Dictionary", "url": "https://amazon.com"}, {"name": "Ratanlal & Dhirajlal Indian Penal Code", "url": "https://amazon.com"}, {"name": "Garner's Modern Legal Usage", "url": "https://amazon.com"}]
        projs_b = ["Moot Court Argument Draft", "Basic Commercial Contract Review", "Legal Case Summary Analysis", "Client Interview Consultation Record", "Legal Notice Template Creation"]
        projs_i = ["Corporate NDA & Shareholders Agreement Draft", "Criminal Appeal Case File Preparation", "Pro-Bono Legal Aid Case Brief", "Arbitration Proceedings Strategy Memorandum", "IPR Patent Infringement Audit"]
        projs_a = ["Supreme Court Special Leave Petition Draft", "Cross-Border M&A Legal Due Diligence", "Constitutional Law Amicus Curiae Brief", "Corporate Environmental Compliance Plan", "Judicial Review Commentary"]
        certs = ["All India Bar Examination (AIBE) Certificate", "Certified Corporate Legal Counsel", "Post Graduate Diploma in Cyber Law", "Certified Arbitrator & Mediator", "IPR Specialist Certification"]
        tools = ["SCC Online / Manupatra", "Westlaw / LexisNexis", "Legal Contract Lifecycle Management (CLM)", "e-Courts Filing Portal", "Grammarly Legal Editor"]
        top_orgs = ["Supreme Court of India", "AZB & Partners", "Cyril Amarchand Mangaldas", "Trilegal", "Khaitan & Co"]
        hotspots = [{"city": "New Delhi", "demand": "Very High", "reason": "Supreme Court, Delhi High Court & major law firm HQs."}, {"city": "Mumbai", "demand": "High", "reason": "Financial capital, Bombay High Court & corporate law practices."}, {"city": "London / UK", "demand": "High", "reason": "Global commercial arbitration & International law firms."}, {"city": "New York / USA", "demand": "High", "reason": "Corporate M&A law & Federal Court litigation."}, {"city": "Bengaluru", "demand": "Moderate-High", "reason": "Tech startup legal compliance, IP law & High Court."}]
        trend_skills = ["Tech & AI Legal Compliance", "Cross-Border Arbitration", "Data Privacy & GDPR Law", "IP & Patent Prosecution", "ESG & Environmental Law"]
        daily_plan = ["Monday: 2 hrs Constitutional & Contract Law Study", "Tuesday: 2 hrs Legal Drafting & Case Analysis", "Wednesday: 2 hrs Court Procedure & Precedents Review", "Thursday: 2 hrs Client Consultation & Contract Review", "Friday: 2 hrs Moot Court & Advocacy Practice", "Saturday: 3 hrs Legal Research & Citation Study", "Sunday: 1 hr Weekly Legal Case Digest"]
    elif any(w in c_low for w in ["farmer", "agronomist", "botanist", "agriculture", "crop"]):
        edu = "B.Sc / M.Sc in Agricultural Science, Agronomy, Horticulture or Hands-On Farming Practice"
        sal_ind_f, sal_ind_m, sal_ind_s = "₹3.5L - ₹6.5L / yr", "₹8.0L - ₹14.0L / yr", "₹18.0L - ₹32.0L / yr"
        sal_cnt_f, sal_cnt_m, sal_cnt_s = "$45k - $65k / yr", "$80k - $120k / yr", "$140k - $220k / yr"
        roles = [f"Assistant Agronomist", f"Farm Operations Manager", f"Senior Agricultural Specialist", f"Agri-Business Director", f"Principal Soil & Crop Consultant"]
        sk_b = ["Soil Chemistry & Fertility", "Crop Rotation & Seasons", "Basic Irrigation Techniques", "Organic Farming Principles", "Farm Machinery Operation"]
        sk_i = ["Precision Agriculture & Drones", "Pest & Weed Management", "Agri-Market Pricing & Economics", "Hydroponics & Greenhouse Tech", "Water Conservation & Harvesting"]
        sk_a = ["Climate-Resilient Crop Breeding", "Large-Scale Agri-Supply Chain Tech", "Soil Microbiome Restoration", "Agricultural Export Compliance", "Agri-Fintech & Futures Trading"]
        yt = [{"name": "Krishi Darshan Official", "url": "https://www.youtube.com/@DoordarshanKisan"}, {"name": "Farming Leader", "url": "https://www.youtube.com/@FarmingLeader"}, {"name": "Discover Agriculture", "url": "https://www.youtube.com/@DiscoverAgriculture"}, {"name": "Cornell Small Farms", "url": "https://www.youtube.com/@CornellSmallFarms"}, {"name": "Agronomy TV", "url": "https://www.youtube.com/@AgronomyTV"}]
        courses = [{"name": "NPTEL Agriculture & Food Engineering", "url": "https://nptel.ac.in"}, {"name": "Swayam Organic Farming", "url": "https://swayam.gov.in"}, {"name": "Coursera Sustainable Agriculture", "url": "https://www.coursera.org"}, {"name": "edX Sustainable Food Systems", "url": "https://www.edx.org"}, {"name": "Wageningen University Agriculture", "url": "https://www.wur.nl"}]
        docs = [{"name": "ICAR Research Guidelines", "url": "https://icar.org.in"}, {"name": "Agmarknet Price Portal", "url": "https://agmarknet.gov.in"}, {"name": "FAO Agriculture Standards", "url": "https://www.fao.org"}, {"name": "Ministry of Agriculture India", "url": "https://agricoop.nic.in"}, {"name": "Kisan Call Centre Portal", "url": "https://dge.gov.in"}]
        books = [{"name": "Principles of Agronomy by Yellamanda Reddy", "url": "https://amazon.com"}, {"name": "Introductory Soil Science by D.K. Das", "url": "https://amazon.com"}, {"name": "Plant Breeding Principles by B.D. Singh", "url": "https://amazon.com"}, {"name": "Agricultural Economics by Subba Reddy", "url": "https://amazon.com"}, {"name": "The One-Straw Revolution by Masanobu Fukuoka", "url": "https://amazon.com"}]
        projs_b = ["Soil pH & Nutrient Testing Report", "Seasonal Crop Rotation Plan", "Basic Drip Irrigation Blueprint", "Organic Compost Preparation Study", "Farm Tool Maintenance Logbook"]
        projs_i = ["Drone-Based Crop Health Survey", "Hydroponic Vertical Farm Setup", "Integrated Pest Management Plan", "Farm-to-Market Supply Chain Model", "Water Harvesting Reservoir Design"]
        projs_a = ["Climate-Resilient Smart Agriculture Plan", "State-Level Agri-Cooperative Business Plan", "Biological Soil Restoration Trial", "Organic Export Compliance Portfolio", "Agri-Tech IoT Sensor Network"]
        certs = ["Certified Organic Farming Specialist", "Agricultural Drone Pilot License", "Soil Testing & Nutrient Management Cert", "Good Agricultural Practices (GAP) Cert", "Certified Crop Adviser (CCA)"]
        tools = ["Agricultural Drones & Multispectral Cameras", "Smart Drip Irrigation Telemetry", "Soil pH & NPK Testers", "Kisan Suvidha & Agmarknet Apps", "Tractor & Precision Seeder Tech"]
        top_orgs = ["ICAR (Indian Council of Agricultural Research)", "NABARD", "Mahindra Agri Business", "Syngenta India", "John Deere"]
        hotspots = [{"city": "Punjab & Haryana", "demand": "Very High", "reason": "Leading agricultural belt with high mechanized farming."}, {"city": "Wageningen / Netherlands", "demand": "Very High", "reason": "Global capital for high-tech greenhouse & agritech innovation."}, {"city": "Iowa / USA", "demand": "High", "reason": "Major corn & soybean precision agriculture hub."}, {"city": "Maharashtra", "demand": "High", "reason": "Pioneer in commercial horticulture & sugarcane farming."}, {"city": "Andhra Pradesh", "demand": "High", "reason": "Natural farming & aqua-agri export centers."}]
        trend_skills = ["Precision Drones & Satellite Mapping", "Hydroponics & Aeroponics", "Soil Microbiome Tech", "Agri-Market Analytics", "Climate-Resilient Farming"]
        daily_plan = ["Monday: 2 hrs Soil Science & Nutrient Management", "Tuesday: 2 hrs Crop Pest & Disease Diagnosis", "Wednesday: 2 hrs Precision Irrigation & Drone Mapping", "Thursday: 2 hrs Agri-Market Price & Economics Study", "Friday: 2 hrs Practical Field Demonstration & Work", "Saturday: 3 hrs Farm Tool Maintenance & Field Survey", "Sunday: 1 hr Weekly Crop Growth Review"]
    else:
        # Tech, Engineering, Business, General Professions
        sal_ind_f, sal_ind_m, sal_ind_s = "₹6.5L - ₹10.0L / yr", "₹14.0L - ₹22.0L / yr", "₹25.0L - ₹48.0L / yr"
        sal_cnt_f, sal_cnt_m, sal_cnt_s = "$70k - $95k / yr", "$120k - $160k / yr", "$180k - $270k / yr"
        edu = f"Bachelor's Degree in {c_title} or related field + Professional Portfolio & Industry Credentials"
        roles = [f"Junior {c_title}", f"Senior {c_title}", f"Lead {c_title} Specialist", f"Principal {c_title} Consultant", f"Director of {c_title}"]
        sk_b = [f"Basic {c_title} Concepts", "Industry Fundamentals", "Problem Solving", "Core Tool Setup", "Team Collaboration"]
        sk_i = [f"Advanced {c_title} Architecture", "Workflow Automation", "Quality Assurance", "Data & Metrics Analysis", "Project Execution"]
        sk_a = ["Strategic Leadership", "Enterprise Scale Management", "Compliance & Security", "Innovation Architecture", "Executive Decision Making"]
        yt = [{"name": "FreeCodeCamp / Core Channel", "url": "https://www.youtube.com/@freecodecamp"}, {"name": "TED Talks & Industry Insights", "url": "https://www.youtube.com/@TED"}, {"name": "CrashCourse Professional", "url": "https://www.youtube.com/@crashcourse"}, {"name": "Harvard Business Review", "url": "https://www.youtube.com/@harvardbusinessreview"}, {"name": "MIT OpenCourseWare", "url": "https://www.youtube.com/@mitocw"}]
        courses = [{"name": "Coursera Professional Specialization", "url": "https://www.coursera.org"}, {"name": "edX Professional Certificate", "url": "https://www.edx.org"}, {"name": "Udemy Masterclass Bootcamp", "url": "https://www.udemy.com"}, {"name": "LinkedIn Learning Executive Track", "url": "https://www.linkedin.com/learning"}, {"name": "Pluralsight Advanced Learning", "url": "https://www.pluralsight.com"}]
        docs = [{"name": f"Official {c_title} Industry Standards", "url": "https://developer.mozilla.org"}, {"name": "ISO International Standards", "url": "https://www.iso.org"}, {"name": "IEEE Xplore Digital Library", "url": "https://ieeexplore.ieee.org"}, {"name": "NIST Framework Guidelines", "url": "https://www.nist.gov"}, {"name": "Harvard Business Case Studies", "url": "https://hbr.org"}]
        books = [{"name": f"The Master Guide to {c_title}", "url": "https://amazon.com"}, {"name": "Designing High-Performance Systems", "url": "https://amazon.com"}, {"name": "The Lean Professional", "url": "https://amazon.com"}, {"name": "Execution: The Discipline of Getting Things Done", "url": "https://amazon.com"}, {"name": "Principles for Success by Ray Dalio", "url": "https://amazon.com"}]
        projs_b = [f"Basic {c_title} Foundational Project", "Operational Workflow Audit", "Interactive Utility Tool", "Data Analysis Dashboard", "Basic Portfolio Showcase"]
        projs_i = [f"Full-Scale {c_title} Implementation", "Cross-Functional Team Project", "Automated Process Optimization System", "Quality Assurance & Compliance Audit", "Integrated Service Solution"]
        projs_a = [f"Enterprise Distributed {c_title} Strategy", "High-Throughput Analytics Engine", "Global Operational Architecture", "AI-Powered Automation Framework", "Executive Strategic Roadmap"]
        certs = [f"Certified {c_title} Professional", f"PMI Project Management Professional (PMP)", f"Google Professional Certification", f"Six Sigma Black Belt Certification", f"International Executive Certificate"]
        tools = [f"Git & Version Control", f"Industry Analytics Tools", f"VS Code / JetBrains", f"Postman / API Suites", f"Docker & Cloud Suites"]
        top_orgs = ["Google", "Microsoft", "Amazon", "Tata Group", "Reliance Industries"]
        hotspots = [{"city": "Bengaluru" if is_india else "San Francisco", "demand": "Very High", "reason": "Global hub for technology, innovation & enterprise hiring."}, {"city": "Mumbai" if is_india else "New York", "demand": "High", "reason": "Commercial capital & corporate headquarters hub."}, {"city": "Hyderabad" if is_india else "Austin", "demand": "High", "reason": "Rapidly expanding technology & R&D centers."}, {"city": "Pune" if is_india else "Seattle", "demand": "Moderate-High", "reason": "Strong engineering, manufacturing & product development base."}, {"city": "Delhi NCR" if is_india else "London", "demand": "High", "reason": "Corporate headquarters, policy making & consulting hub."}]
        trend_skills = [f"Advanced {c_title} Automation", "AI & Data Analytics Integration", "Cloud-Native Systems", "Agile Project Delivery", "Strategic Leadership"]
        daily_plan = ["Monday: 2 hrs Core Principles & Industry Theory", "Tuesday: 2 hrs Practical Hands-On Tool Practice", "Wednesday: 2 hrs Case Studies & System Architecture", "Thursday: 2 hrs Building Portfolio Project Components", "Friday: 2 hrs Quality Audit & Process Refactoring", "Saturday: 3 hrs End-to-End Project Integration", "Sunday: 1 hr Weekly Performance Review"]

    phase_titles = [
        "Foundational Principles & Core Domain Mechanics",
        "Applied Workflows, Tooling & Practical Execution",
        "Advanced Methodologies & System Architecture",
        "Real-World Case Studies & Performance Optimization",
        "Enterprise Governance, Security & Quality Standards",
        "Leadership, Strategic Portfolio & Career Transition",
        "Advanced Specialization & Domain Innovation",
        "Cross-Functional Scaling & Global Operations",
        "Executive Leadership & Strategic Management",
        "Mastery Level Capstone & Industry Disruption",
        "Global Advisory & Senior Consultancy Practice",
        "Executive Boardroom Strategy & Future Governance"
    ]

    roadmap_months = []
    for m in range(1, months + 1):
        p_idx = (m - 1) % len(phase_titles)
        p_name = phase_titles[p_idx]
        roadmap_months.append({
            "month": f"Month {m}",
            "title": f"Phase {m}: {p_name}",
            "topics": [
                f"Core {c_title} Domain Knowledge & Operational Mechanics",
                f"Industry Best Practices & Standard Tooling for {c_title}",
                f"Workflow Automation, Quality Assurance & Data Metrics",
                f"Cross-Functional Collaboration & Field Case Studies",
                f"Regulatory Compliance, Safety & Professional Ethics"
            ],
            "project": f"Real-World {c_title} Milestone Project #{m}: {p_name}",
            "goal": f"Deliver a fully functional {c_title} milestone demonstrating practical expertise in {p_name}."
        })

    return {
        "success": True,
        "career": c_title,
        "country": country,
        "duration": f"{months} months",
        "overview": {
            "description": f"Comprehensive, professional career development path for becoming an elite {c_title}. This roadmap covers foundational knowledge, practical field execution, and senior leadership.",
            "roles": roles,
            "education": edu,
            "salary": {
                "india": f"{sal_ind_f} (Fresher) -> {sal_ind_m} (Mid) -> {sal_ind_s} (Senior)",
                "country": format_multi_currency_salary(country, sal_cnt_f, sal_cnt_m, sal_cnt_s)
            },
            "future_scope": f"Strong multi-year demand with high career trajectory across global hiring markets."
        },
        "skills": {
            "beginner": sk_b,
            "intermediate": sk_i,
            "advanced": sk_a
        },
        "roadmap": roadmap_months,
        "resources": {
            "youtube": yt,
            "courses": courses,
            "documentation": docs,
            "books": books
        },
        "projects": {
            "beginner": projs_b,
            "intermediate": projs_i,
            "advanced": projs_a
        },
        "certifications": certs,
        "tools": tools,
        "interview_preparation": [
            f"Master core domain principles and case study scenarios for {c_title}.",
            f"Prepare STAR-method behavioral stories highlighting leadership & problem solving.",
            f"Practice domain-specific practical challenges and mock technical interviews.",
            f"Review safety, compliance, and regulatory protocols relevant to {c_title}.",
            f"Conduct mock interviews focusing on trade-offs and decision making."
        ],
        "portfolio_tips": [
            f"Showcase live functional projects and detailed case studies online.",
            f"Maintain clear documentation and step-by-step problem-solving write-ups.",
            f"Highlight measurable real-world outcomes and performance metrics.",
            f"Include architectural blueprints, diagrams, or process flowcharts.",
            f"Record short video demonstrations explaining key project highlights."
        ],
        "ai_tips": [
            f"Use AI tools (Gemini / ChatGPT) to research complex industry case studies for {c_title}.",
            f"Leverage AI assistance for drafting documentation, reports, and communication.",
            f"Prompt AI to test your knowledge with mock interview questions.",
            f"Automate routine administrative and analysis tasks using AI workflows.",
            f"Stay updated on emerging AI trends transforming the {c_title} field."
        ],
        "market": {
            "job_demand": {"text": f"Extremely High demand with rapid growth across top hiring hubs for {c_title}.", "percentage": 90},
            "difficulty": {"text": "Moderate to High learning curve requiring dedicated practice.", "percentage": 75},
            "growth": {"text": "Projected 20%+ annual growth over the next 5 years.", "percentage": 88},
            "learning_time": {"text": f"Estimated {months} months of consistent 15-20 hrs/week study.", "percentage": 80},
            "salary": {
                "fresher": sal_ind_f if is_india else sal_cnt_f,
                "mid": sal_ind_m if is_india else sal_cnt_m,
                "senior": sal_ind_s if is_india else sal_cnt_s
            },
            "top_organizations": top_orgs,
            "hiring_hotspots": hotspots,
            "trending_skills": trend_skills,
            "daily_plan": daily_plan
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
  "skills": {
    "beginner": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "intermediate": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "advanced": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
  },
  "roadmap": [
    {
      "month": "Month 1",
      "title": "Phase 1: Core Technical Foundations",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
      "project": "Real-world Hands-On Project Name & Description",
      "goal": "Clear technical milestone for Month 1."
    }
  ],
  "resources": {
    "youtube": [
      {"name": "Verified Channel 1", "url": "https://www.youtube.com/@channel1"},
      {"name": "Verified Channel 2", "url": "https://www.youtube.com/@channel2"},
      {"name": "Verified Channel 3", "url": "https://www.youtube.com/@channel3"},
      {"name": "Verified Channel 4", "url": "https://www.youtube.com/@channel4"},
      {"name": "Verified Channel 5", "url": "https://www.youtube.com/@channel5"}
    ],
    "courses": [
      {"name": "Course 1", "url": "https://www.coursera.org"},
      {"name": "Course 2", "url": "https://www.udemy.com"},
      {"name": "Course 3", "url": "https://www.edx.org"},
      {"name": "Course 4", "url": "https://nptel.ac.in"},
      {"name": "Course 5", "url": "https://swayam.gov.in"}
    ],
    "documentation": [
      {"name": "Doc Portal 1", "url": "https://developer.mozilla.org"},
      {"name": "Doc Portal 2", "url": "https://docs.official.org"},
      {"name": "Doc Portal 3", "url": "https://standards.iso.org"},
      {"name": "Doc Portal 4", "url": "https://nist.gov"},
      {"name": "Doc Portal 5", "url": "https://ieee.org"}
    ],
    "books": [
      {"name": "Handbook 1", "url": "https://amazon.com"},
      {"name": "Handbook 2", "url": "https://amazon.com"},
      {"name": "Handbook 3", "url": "https://amazon.com"},
      {"name": "Handbook 4", "url": "https://amazon.com"},
      {"name": "Handbook 5", "url": "https://amazon.com"}
    ]
  },
  "projects": {
    "beginner": ["Beginner Project 1", "Beginner Project 2", "Beginner Project 3", "Beginner Project 4", "Beginner Project 5"],
    "intermediate": ["Intermediate Project 1", "Intermediate Project 2", "Intermediate Project 3", "Intermediate Project 4", "Intermediate Project 5"],
    "advanced": ["Enterprise Project 1", "Enterprise Project 2", "Enterprise Project 3", "Enterprise Project 4", "Enterprise Project 5"]
  },
  "certifications": ["Cert 1", "Cert 2", "Cert 3", "Cert 4", "Cert 5"],
  "tools": ["Tool 1", "Tool 2", "Tool 3", "Tool 4", "Tool 5"],
  "interview_preparation": [
    "Core Concept & Technical Scenario Question 1",
    "System Design & Architecture Scenario Question 2",
    "Behavioral & Decision Making Strategy Question 3",
    "Regulatory, Compliance & Safety Scenario Question 4",
    "Practical Problem Solving & Trade-off Scenario Question 5"
  ],
  "portfolio_tips": [
    "Portfolio Showcase Tip 1",
    "Portfolio Showcase Tip 2",
    "Portfolio Showcase Tip 3",
    "Portfolio Showcase Tip 4",
    "Portfolio Showcase Tip 5"
  ],
  "ai_tips": [
    "AI Tool Integration Strategy 1",
    "AI Tool Integration Strategy 2",
    "AI Tool Integration Strategy 3",
    "AI Tool Integration Strategy 4",
    "AI Tool Integration Strategy 5"
  ],
  "market": {
    "job_demand": {"text": "Extremely High demand with rapid growth.", "percentage": 88},
    "difficulty": {"text": "Moderate to High learning curve requiring dedicated practice.", "percentage": 75},
    "growth": {"text": "Multi-year compound annual growth rate of +22%.", "percentage": 90},
    "learning_time": {"text": "6 months of consistent 15 hrs/week study.", "percentage": 80},
    "salary": {
      "fresher": "₹6.5L - ₹10.0L / yr",
      "mid": "₹14.0L - ₹22.0L / yr",
      "senior": "₹25.0L - ₹45.0L / yr"
    },
    "top_organizations": ["Org 1", "Org 2", "Org 3", "Org 4", "Org 5"],
    "hiring_hotspots": [
      {"city": "City 1", "demand": "Very High", "reason": "Major Tech & Business Hub"},
      {"city": "City 2", "demand": "High", "reason": "Global Corporate Headquarters"},
      {"city": "City 3", "demand": "High", "reason": "R&D & Innovation Center"},
      {"city": "City 4", "demand": "High", "reason": "Regional Financial Capital"},
      {"city": "City 5", "demand": "Moderate-High", "reason": "Specialty Industry Cluster"}
    ],
    "trending_skills": ["Trending Skill 1", "Trending Skill 2", "Trending Skill 3", "Trending Skill 4", "Trending Skill 5"],
    "daily_plan": [
      "Monday: 2 hrs Core Principles & Industry Fundamentals",
      "Tuesday: 2 hrs Practical Tooling & Hands-on Practice",
      "Wednesday: 2 hrs Case Studies & System Architecture",
      "Thursday: 2 hrs Portfolio & Project Execution",
      "Friday: 2 hrs Quality Audit & Process Refactoring"
    ]
  }
}}

Rules:
- MANDATE: EVERY SINGLE ARRAY FIELD (roles, skills.beginner, skills.intermediate, skills.advanced, roadmap.topics, resources.youtube, resources.courses, resources.documentation, resources.books, projects.beginner, projects.intermediate, projects.advanced, certifications, tools, interview_preparation, portfolio_tips, ai_tips, market.top_organizations, market.hiring_hotspots, market.trending_skills, market.daily_plan) MUST CONTAIN AT LEAST 5 ACCURATE, ROLE-SPECIFIC ITEMS. Never output fewer than 5 items per list.
- CRITICAL DOMAIN MANDATE: Tailor ALL books, courses, YouTube channels, daily plans, tools, certifications, and projects specifically for "{career}". Never assume programming or software engineering if the role is a non-tech career (e.g. Doctor, Lawyer, Police Officer, IAS, Farmer, Pilot, Teacher, Chef, Mechanical/Civil Engineer, Architect, etc.).
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

def generate_fallback_skill_gap(career, user_skills=""):
    c_norm = career.strip().title()
    c_low = career.lower()
    sk_low = user_skills.lower() if user_skills else ""
    has_sk = bool(sk_low and "beginner" not in sk_low and len(sk_low) > 4)

    if any(w in c_low for w in ["doctor", "surgeon", "physician", "dentist", "nurse", "medical", "pharmacist"]):
        analysis = [
            {"skill": "Anatomy & Pathophysiology", "score": 75 if has_sk else 30},
            {"skill": "Clinical Diagnosis & Triage", "score": 60 if has_sk else 25},
            {"skill": "Pharmacology & Drug Interactions", "score": 50 if has_sk else 15},
            {"skill": "Emergency & Surgical Protocols", "score": 45 if has_sk else 10},
            {"skill": "Patient Ethics & Medical EMR", "score": 80 if has_sk else 40}
        ]
        existing = ["Basic Human Biology Fundamentals", "Patient Communication & Empathy", "First Aid & Vital Signs Monitoring", "Medical Terminology Basics", "High Ethics & Stress Resilience"] if has_sk else ["Interest in Health Sciences", "Basic Biology Understanding"]
        missing = ["Advanced Clinical Therapeutics", "Specialized Diagnostic EMR Systems", "Surgical & Emergency Procedures", "Pharmacology & Dosage Calculation", "Hospital Board Accreditation"]
        priority = ["1. Complete Formal Medical Degree (MBBS/MD/BDS)", "2. Master Pharmacology & Diagnostic Protocols", "3. Complete Clinical Hospital Internship Rotation", "4. Acquire Medical License & Board Registration", "5. Train on Advanced Hospital Diagnostic EMR Tools"]
        score = 68 if has_sk else 32
        level = "Intermediate" if has_sk else "Beginner"
        severity = "Medium Gap" if has_sk else "High Gap"
    elif any(w in c_low for w in ["engineer", "developer", "software", "ai", "data", "cloud", "code", "web"]):
        analysis = [
            {"skill": "Programming & Logic", "score": 80 if has_sk else 35},
            {"skill": "Data Structures & Algorithms", "score": 60 if has_sk else 20},
            {"skill": "System Architecture & Design", "score": 45 if has_sk else 10},
            {"skill": "Database & API Integration", "score": 70 if has_sk else 25},
            {"skill": "Cloud Deployment & DevOps", "score": 40 if has_sk else 10}
        ]
        existing = ["Core Language Syntax (Python/JS)", "Git Version Control Basics", "HTML/CSS / Front-End Fundamentals", "Basic Database & SQL Queries", "Logical Problem Solving"] if has_sk else ["Basic Computer Literacy", "Logical Aptitude"]
        missing = ["Advanced System Design & Scalability", "Production Microservices & REST APIs", "Cloud Infrastructure (AWS/GCP/Azure)", "CI/CD Pipeline Automation", "Unit Testing & Security Hardening"]
        priority = ["1. Master Data Structures & Algorithms", "2. Build & Deploy 2 Full-Stack Production Apps", "3. Master System Architecture Fundamentals", "4. Learn Cloud Deployment (AWS/GCP/Docker)", "5. Contribute to Open-Source Software Repos"]
        score = 72 if has_sk else 35
        level = "Intermediate" if has_sk else "Beginner"
        severity = "Low Gap" if has_sk else "High Gap"
    elif any(w in c_low for w in ["farmer", "agronomist", "botanist", "agriculture", "crop"]):
        analysis = [
            {"skill": "Crop Science & Soil Health", "score": 70 if has_sk else 30},
            {"skill": "AgriTech & Irrigation Systems", "score": 55 if has_sk else 20},
            {"skill": "Pest & Disease Management", "score": 65 if has_sk else 25},
            {"skill": "Supply Chain & Farm Economics", "score": 50 if has_sk else 15},
            {"skill": "Sustainable Farming Practices", "score": 75 if has_sk else 35}
        ]
        existing = ["Basic Soil & Crop Knowledge", "Organic Farming Principles", "Equipment Operation Basics", "Weather & Seasonal Awareness", "Practical Field Hardworking Attitude"] if has_sk else ["Interest in Agricultural Science", "Field Work Willingness"]
        missing = ["Precision Agriculture Sensors & Drones", "Modern Hydroponics & Smart Irrigation", "Agri-Market Futures & Supply Economics", "Biological Pest Control Protocols", "Govt Agricultural Subsidy & Export Standards"]
        priority = ["1. Study Modern Agronomy & Soil Chemistry", "2. Adopt Precision Irrigation & Drone Tech", "3. Learn Crop Pest Management Standards", "4. Master Agri-Business Economics & Logistics", "5. Get Certified in Sustainable Agriculture"]
        score = 65 if has_sk else 30
        level = "Intermediate" if has_sk else "Beginner"
        severity = "Medium Gap" if has_sk else "High Gap"
    else:
        analysis = [
            {"skill": f"{c_norm} Core Fundamentals", "score": 70 if has_sk else 30},
            {"skill": "Specialized Industry Tools", "score": 50 if has_sk else 20},
            {"skill": "Industry Compliance & Safety", "score": 60 if has_sk else 25},
            {"skill": "Practical Field Execution", "score": 65 if has_sk else 30},
            {"skill": "Strategic Leadership & Communication", "score": 75 if has_sk else 40}
        ]
        existing = [f"Foundational knowledge of {c_norm}", "Operational tool understanding", "Analytical reasoning & problem solving", "Team collaboration & communication", "Active interest in professional growth"] if has_sk else ["General Aptitude", "Motivation to Learn"]
        missing = ["Advanced specialized industry software", "Regulatory, safety & quality benchmarks", "End-to-end practical project management", "Quantitative metrics & decision frameworks", "Senior stakeholder communication"]
        priority = [f"1. Master core missing tools for {c_norm}", "2. Complete 2 practical hands-on projects", "3. Obtain recognized industry certifications", "4. Build a professional portfolio showcasing work", "5. Develop senior-level project leadership skills"]
        score = 68 if has_sk else 32
        level = "Intermediate" if has_sk else "Beginner"
        severity = "Medium Gap" if has_sk else "High Gap"

    return {
        "skill_gap_score": score,
        "career_level": level,
        "readiness_status": f"{'Target Role Ready' if score >= 70 else 'Moderately Prepared — Targeted Upskilling Recommended'}",
        "industry_demand_match": min(95, max(60, score + 18)),
        "gap_severity": severity,
        "skill_analysis": analysis,
        "existing_skills": existing,
        "missing_skills": missing,
        "priority_skills": priority,
        "recommendation": f"Based on your profile for {c_norm}, you have established a good foundation. Focus on bridging your critical missing skills over the next 3 to 6 months by building hands-on projects and obtaining specialized industry credentials."
    }

@app.route("/skill-gap-api", methods=["POST"])
def skill_gap_api():
    try:
        data = request.get_json() or {}

        career_raw = data.get("career", "").strip()
        is_v, err = validate_career_input(career_raw)
        if not is_v:
            return failure(err, 400)

        career = err
        skills = data.get("skills", "").strip()

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

Return ONLY valid JSON.

JSON Format:
{{
"skill_gap_score": 70,
"career_level": "Intermediate",
"readiness_status": "Moderately Prepared",
"industry_demand_match": 85,
"gap_severity": "Medium Gap",
"skill_analysis": [
  {{"skill": "Core Domain Knowledge", "score": 75}},
  {{"skill": "Specialized Tools", "score": 50}},
  {{"skill": "Industry Compliance", "score": 60}},
  {{"skill": "Practical Execution", "score": 65}},
  {{"skill": "Communication & Ethics", "score": 70}}
],
"existing_skills": [
  "Core domain understanding",
  "Basic tool operations",
  "Problem-solving aptitude",
  "Collaborative teamwork",
  "Learning willingness"
],
"missing_skills": [
  "Advanced industry software",
  "Regulatory compliance standards",
  "End-to-end practical execution",
  "Quantitative analysis frameworks",
  "Senior stakeholder leadership"
],
"priority_skills": [
  "1. Master core missing technical tools",
  "2. Complete 2 hands-on real-world projects",
  "3. Obtain recognized industry certifications",
  "4. Build a public portfolio showcasing work",
  "5. Develop project management leadership"
],
"recommendation": "Executive 3-4 line recommendation."
}}
"""
        try:
            text = generate_with_fallback(prompt)
            text = clean_json(text)
            result = json.loads(text)
            if not isinstance(result, dict) or "skill_gap_score" not in result:
                raise ValueError("Incomplete skill gap JSON from AI model")
        except Exception as e:
            print(f"[SKILL GAP FALLBACK ENGAGED] {e}. Generating fallback skill gap for {career}")
            result = generate_fallback_skill_gap(career, skills)

        return success(result)

    except Exception as e:
        print(f"Skill Gap API Error: {e}")
        return failure("Unable to analyze skills. Please try again.")
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