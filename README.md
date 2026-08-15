# 🚀 CareerVerse AI

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Framework-Flask-black.svg)](https://flask.palletsprojects.com/)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini-yellow.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Navigate Your Future with Universal AI Career Intelligence**  
> An all-in-one executive AI platform offering personalized learning roadmaps, multi-currency pay bands, 3-tier salary progression, side-by-side career comparisons, ATS resume scoring, and an interactive ChatGPT-style Career Mentor for **every real-world career field in the world**.

---

## 🌟 What's New in Version 2.7

- 📚 **Verified Resource Recommender & Direct Link Integration**: Prompts the AI engine to retrieve and return actual, verified, real-world learning links. Youtube channels (`https://www.youtube.com/@freecodecamp`), online courses (Coursera/edX), vetted books, and official documentation are returned with direct paths instead of generic homepages.
- 💼 **Universal "Practical Tasks & Applications" Section Renaming**: Changed references from "Projects" to "Hands-On Tasks & Practical Applications" across the UI, navigation tabs, month timeline cards, and the PDF export module. This makes the learning roadmap perfectly friendly for non-technical careers, medical students, and competitive exam preparation.
- 🛡️ **Resilient Exam & Acronym Validation Layer**: Refactored the universal validation engine to run word-by-word checks. Valid central and state-level competitive exams (e.g., UPSC, MPSC, BPSC, GPSC, GATE, JEE, NEET) can now successfully generate roadmaps without triggering unnatural consonant cluster or gibberish flags.
- 💰 **Dynamic Real-Time AI Salary Intelligence fallbacks**: Upgraded the core data layer (`salary_data_layer.py`) to leverage real-time Google Gemini inferences when a career or job role is not matched in the verified hardcoded database. It dynamically generates highly-accurate fresher, mid-level, and senior-level local salary brackets, percentiles, and market justifications.
- 💱 **Multi-Currency Salary Breakdown**: Displays **India Expected Pay Band** in Indian Rupees (`₹ Lakhs / yr`) alongside the **Target Country Pay Band** in its official local currency (`$`, `£`, `€`, `CA$`, `AU$`, `AED`, `SG$`, `¥`).
- 📈 **3-Tier Salary Progression Grid**: Interactive breakdown across `👨‍💻 Fresher (0-2 Yrs)`, `🚀 Mid-Level (2-5 Yrs)`, and `🏆 Experienced (5+ Yrs)`.
- 💬 **ChatGPT / Claude Executive AI Career Mentor**: Split-workspace interface featuring a collapsible sidebar, recent conversation history, prompt cards, auto-expanding textareas (`Shift + Enter`), rich markdown rendering, and animated 3-dot pulse typing indicators.
- ⚖️ **Resilient Career Compare Engine**: Instant side-by-side comparison for ANY two roles in the world (`AI ML` vs `NDA`, `ai` vs `police`, `Farmer` vs `Agronomist`, `Teacher` vs `Professor`).
- 🎨 **Corporate SaaS Footer Redesign**: Sleek, corporate aesthetic with high-contrast neutral titles and readable hover dynamics.

---

## ✨ Core Features & AI Modules

1. 🛣️ **AI Career Roadmap Generator & Executive PDF Exporter** (`/generate`)  
   Generates multi-phase learning paths, required skill sets, project blueprints, and high-impact multi-page PDF reports with automated page numbering (`Page X of Y`).

2. 💬 **ChatGPT-Style AI Career Mentor Workspace** (`/career-chat`)  
   Full-height split-pane interface providing 24/7 personalized career guidance, interview preparation, resume tuning, and strategic advice.

3. ⚖️ **Universal Career Compare Engine** (`/compare`)  
   Side-by-side comparison of earning potential, market demand scores, learning difficulty, growth velocity, and top hiring cities for any two roles globally.

4. 🪞 **Career Reality Check Engine** (`/career-reality`)  
   Unfiltered day-in-the-life realities, stress & burnout indices, work-life balance scores, and warning criteria for target roles.

5. 📊 **Career Intelligence Analytics Dashboard** (`/career-intelligence`)  
   Visualizes 6 dynamic Chart.js analytics graphs (Market Demand, Earning Tiers, Skill Heatmaps, Automation Risk, and 5-Year Growth Outlooks).

6. 📄 **Resume ATS Compatibility Evaluator** (`/resume`)  
   Parses PDF resumes using `pdfplumber`, scoring compatibility against job descriptions and providing line-by-line optimization feedback.

7. 🎯 **Career Match & Skill Gap Engine** (`/career-match` & `/skill-gap`)  
   Matches student profiles to optimal career roles and pinpoints missing tools, frameworks, and technologies.

8. 💰 **Salary Predictor** (`/salary-predictor`)  
   Predicts regional compensation based on experience level, location, and specialized skill sets.

9. 🌍 **195+ World Country Support**  
   Strict ISO world country validation engine with automatic local currency detection.

---

## 🏗️ Technical Architecture

```mermaid
graph TD
    Client["🎨 Client Browser (HTML5 / Vanilla CSS / ES6 JavaScript)"] <-->|JSON REST APIs / fetch()| Flask["🐍 Python Flask Application (app.py)"]
    Flask <-->|Google Generative AI SDK / Fallback Engine| Gemini["🤖 Google Gemini AI Engine"]
    Client -->|Client-Side Exporter| jsPDF["📄 jsPDF & AutoTable Engine"]
    Client -->|Dynamic Data Visualization| ChartJS["📊 Chart.js Dashboard Engine"]
    Flask -->|PDF Text Extraction| PDFPlumber["📄 pdfplumber Reader"]
```

---

## 🖥️ Tech Stack

| Component | Technology / Library |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Dark Glassmorphism Theme), JavaScript (ES6+) |
| **Data Viz & PDF** | Chart.js, jsPDF, jsPDF-AutoTable |
| **Backend Framework** | Python 3.9+, Flask |
| **AI Infrastructure** | Google Gemini API (`google.generativeai`) |
| **Document Processing**| `pdfplumber` |
| **Styling & Icons** | FontAwesome 6.6.0, Google Fonts (Inter / Outfit) |

---

## 📁 Repository Structure

```text
CareerVerse-AI/
├── static/
│   ├── css/
│   │   ├── common.css               # Core design system & SaaS footer
│   │   ├── career_chat.css          # Executive ChatGPT-style workspace
│   │   ├── career_compare.css       # Compare engine cards & metrics
│   │   ├── career_intelligence.css  # 6-chart dashboard & salary tiers
│   │   ├── career_reality.css       # Reality check score meter
│   │   ├── generate.css             # Roadmap generator styling
│   │   └── home.css                 # Homepage landing styles
│   ├── js/
│   │   ├── generate.js              # Roadmap engine, validation & jsPDF
│   │   ├── career_chat.js           # Chat workspace, markdown & copy buttons
│   │   ├── career_compare.js        # Compare engine & resilient card renderer
│   │   ├── career_intelligence.js   # Chart.js visualization engine
│   │   ├── career_reality.js        # Reality check score logic
│   │   ├── resume_analyzer.js       # ATS resume evaluation client
│   │   └── ui-effects.js            # Interactive UI scroll animations
│   └── images/                      # Generated visual assets
├── templates/
│   ├── partials/
│   │   ├── navbar.html              # Navigation bar
│   │   └── footer.html              # SaaS corporate footer
│   ├── index.html                   # Homepage
│   ├── ai_tools.html                # AI Tools suite hub
│   ├── generate.html                # Roadmap generator & multi-currency pay
│   ├── career_chat.html             # Executive AI Career Mentor Chat
│   ├── career_compare.html          # Career Compare page
│   ├── career_reality.html          # Career Reality Check
│   ├── career_intelligence.html     # Intelligence Analytics Dashboard
│   ├── resume_analyzer.html         # Resume ATS Analyzer
│   ├── career_match.html            # Career Match Engine
│   ├── skill_gap.html               # Skill Gap Analyzer
│   ├── salary_predictor.html        # Salary Predictor
│   └── about.html                   # About page
├── app.py                           # Flask server, REST APIs & validation engine
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
└── README.md                        # Project documentation
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Python 3.9+**
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/shubhodbirajdar928-hash/CareerVerse-AI.git
cd CareerVerse-AI
```

### 3. Set Up Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure API Key
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 6. Run Application
```bash
python app.py
```
Open **`http://127.0.0.1:5000`** in your web browser.

---

## 👨‍💻 Developer & Author

**Shubhod Birajdar**  
*AI & Machine Learning Software Engineer*  
- **GitHub:** [@shubhodbirajdar928-hash](https://github.com/shubhodbirajdar928-hash)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.