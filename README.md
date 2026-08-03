# 🚀 CareerVerse AI

<p align="center">
  <img src="static/images/logo.png" alt="CareerVerse AI Logo" width="120" style="border-radius: 16px;"><br>
  <b>Navigate Your Future with Artificial Intelligence</b><br>
  <i>An All-in-One AI Career Intelligence Suite for Personal Learning Roadmaps, Salary Analytics, Resume Evaluations, and Unfiltered Real-World Career Insights.</i>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation--setup">Installation</a> •
  <a href="#-9-ai-intelligence-engines">AI Engines</a> •
  <a href="#-developer">Developer</a>
</p>

---

## 🌟 Overview

**CareerVerse AI** is an end-to-end AI-powered career intelligence platform designed to empower students, job seekers, and career switchers to make data-backed career decisions. 

Powered by **Google Gemini AI**, **Chart.js**, and **jsPDF**, CareerVerse AI delivers hyper-personalized 9-stage career intelligence—ranging from step-by-step learning roadmaps and interactive PDF downloads to 3-tier salary breakdowns, 195+ country market intelligence, and unfiltered career reality checks.

---

## ✨ Key Features

- 🛣️ **AI Career Roadmap Generator & Executive PDF Export**: Generates personalized skill milestones, curated courses, project blueprints, and high-impact multi-page PDF reports.
- 🪞 **Career Reality Check Engine**: Uncovers day-in-the-life realities, stress/burnout indices, 3-tier salary bands, and warning criteria before making a career pivot.
- 📊 **Career Intelligence Analytics Dashboard**: Features 6 dynamic Chart.js visualizations (Market Demand, Salary Distributions, Skill Heatmaps, Automation Risk, 5-Year Outlooks).
- 💰 **3-Tier Salary Breakdown**: Delivers accurate compensation metrics across **Entry Level (0-2 Yrs)**, **Mid Level (3-6 Yrs)**, and **Experienced (7+ Yrs)** tiers worldwide.
- 💬 **24/7 AI Career Chatbot**: Real-time interactive AI career mentor for interview prep, negotiation tactics, and career advice.
- 📄 **Resume ATS Compatibility Analyzer**: Instant PDF resume evaluation with bullet-point enhancement and formatting fixes.
- 🎯 **Career Match & Skill Gap Engine**: Matches technical profiles against target roles and pinpoints missing skills.
- ⚖️ **Side-by-Side Career Compare**: Compare two career trajectories on earning potential, difficulty, and future growth.
- 🌍 **195+ Country Global Support**: Full regional market normalization across all worldwide geographic locations.

---

## 🏗️ Architecture

```mermaid
graph TD
    Client["🎨 Client Browser (Frontend)"] <-->|JSON REST APIs / fetch()| Flask["🐍 Python Flask Server (Backend app.py)"]
    Flask <-->|Google Generative AI SDK| Gemini["🤖 Google Gemini AI Engine"]
    Client -->|Client PDF Export| jsPDF["📄 jsPDF & AutoTable Engine"]
    Client -->|Dynamic Data Visualization| ChartJS["📊 Chart.js Dashboard Engine"]
```

---

## 🖥️ Tech Stack

### Frontend
- **HTML5 & Vanilla CSS3**: Dark mode system (`#0a0a0a`) with vibrant gold accents (`#facc15`), glassmorphic containers, and dynamic animations.
- **JavaScript (ES6+)**: Asynchronous `fetch` calls, dynamic DOM manipulation, and responsive UI effects.
- **Chart.js**: Interactive canvas-based data visualizations.
- **jsPDF & jsPDF-AutoTable**: Client-side executive PDF report compilation with sanitized currency handling.
- **FontAwesome 6.6.0**: Modern vector icon suite.

### Backend
- **Python 3.x & Flask**: Lightweight RESTful web framework.
- **Google Generative AI SDK (`google.generativeai`)**: Gemini model integration with JSON schema enforcement and prompt fallback handlers.
- **pdfplumber**: Server-side PDF text extraction for resume parsing.
- **python-dotenv**: Environment key configuration.

---

## 🛠️ Project Structure

```text
CareerVerse-AI/
│
├── static/
│   ├── css/
│   │   ├── common.css               # Core design tokens & global styles
│   │   ├── index.css                # Home page styles
│   │   ├── ai_tools.css             # AI Tools Hub grid styles
│   │   ├── career_intelligence.css  # 6-chart dashboard & 3-tier salary styles
│   │   ├── career_reality.css       # Reality score gauge & 2-column layout
│   │   ├── generate.css             # Roadmap generator & top bar styles
│   │   └── resume.css / salary.css  # Feature module styles
│   │
│   ├── js/
│   │   ├── generate.js              # Roadmap engine & jsPDF report generator
│   │   ├── career_intelligence.js   # Chart.js visualization engine
│   │   ├── career_reality.js        # Reality meter & pill selection logic
│   │   ├── career_chat.js           # 24/7 AI chat interaction
│   │   └── ui-effects.js            # Scroll reveals & interactive components
│   │
│   └── images/
│       └── logo.png                 # Educational brand emblem
│
├── templates/
│   ├── partials/
│   │   ├── navbar.html              # Sticky glassmorphic navbar
│   │   └── footer.html              # Unified footer
│   ├── index.html                   # Landing page
│   ├── ai_tools.html                # 9 AI tools hub
│   ├── generate.html                # Roadmap generator page
│   ├── career_intelligence.html     # Intelligence dashboard
│   ├── career_reality.html          # Reality check page
│   ├── career_chat.html             # AI career chat page
│   ├── resume.html                  # Resume analyzer page
│   ├── career_match.html            # Career match engine
│   ├── skill_gap.html               # Skill gap analyzer page
│   ├── salary_predictor.html        # Salary predictor page
│   └── career_compare.html          # Career compare page
│
├── app.py                           # Core Flask application & REST API routes
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
├── README.md                        # Documentation
└── LICENSE                          # MIT License
```

---

## ⚡ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shubhodbirajdar928-hash/CareerVerse-AI.git
cd CareerVerse-AI
```

### 2. Create & Activate Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
FLASK_ENV=development
```

### 5. Run the Application

```bash
python app.py
```

Open your browser and navigate to **`http://127.0.0.1:5000`**.

---

## 🤖 9 AI Intelligence Engines

1. 🛣️ **AI Career Roadmap Generator** (`/generate`): Generates 4-phase step-by-step career roadmaps with downloadable executive PDF reports.
2. 💬 **AI Career Chat Assistant** (`/career-chat`): 24/7 AI mentor for instant interview prep, negotiation tactics, and career strategy.
3. 🎯 **Career Match Engine** (`/career-match`): Matches your skills, profile, and interests with optimal career options.
4. 📊 **Skill Gap Analyzer** (`/skill-gap`): Identifies missing tools and technologies required for target job roles.
5. 💰 **Salary Predictor** (`/salary-predictor`): Estimates regional compensation bands based on experience and location.
6. ⚖️ **Career Compare** (`/compare`): Compares 2 career paths side-by-side on earning potential, difficulty, and scope.
7. 📄 **Resume ATS Analyzer** (`/resume`): Evaluates uploaded PDF resumes for ATS compliance scores and key improvements.
8. 🪞 **Career Reality Check** (`/career-reality`): Reveals unfiltered day-in-the-life facts, stress indices, 3-tier salary bands, and AI verdicts.
9. 📈 **Career Intelligence AI** (`/career-intelligence`): Delivers 6 dynamic Chart.js analytics graphs, hiring trends, and 5-year growth outlooks.

---

## 👨‍💻 Developer

**Shubhod Birajdar**  
*AI & Machine Learning Developer*  
- **GitHub:** [shubhodbirajdar928-hash](https://github.com/shubhodbirajdar928-hash)

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

<p align="center">
  <b>CareerVerse AI — Navigate Your Future with AI 🚀</b>
</p>