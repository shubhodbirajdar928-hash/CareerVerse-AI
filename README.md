# 🚀 CareerVerse AI

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Framework-Flask-black.svg)](https://flask.palletsprojects.com/)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini-yellow.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Navigate Your Future with Artificial Intelligence**  
> An all-in-one AI Career Intelligence Suite offering personalized learning roadmaps, PDF export reports, 3-tier salary benchmarks, ATS resume evaluations, and unfiltered real-world career reality checks.

---

## 🌟 Overview

**CareerVerse AI** is an intelligent web application engineered to guide students, graduates, and professionals through career planning, skill development, and market analysis. 

Powered by **Google Gemini AI**, **Chart.js**, and **jsPDF**, CareerVerse AI delivers 9 specialized AI modules—ranging from step-by-step learning roadmaps and executive PDF downloads to 195+ country market intelligence and interactive career reality scores.

---

## ✨ Features

- 🛣️ **AI Career Roadmap Generator & Executive PDF Export**  
  Generates multi-phase learning paths, required skills, project blueprints, and high-impact multi-page PDF reports with automated page numbering (`Page X of Y`).

- 🪞 **Career Reality Check Engine**  
  Provides unfiltered day-in-the-life facts, stress/burnout indices, 3-tier salary bands, and warning criteria for target roles.

- 📊 **Career Intelligence Analytics Dashboard**  
  Visualizes 6 dynamic Chart.js analytics graphs (Market Demand, Salary Bands, Skill Heatmaps, Automation Risk, and 5-Year Growth Outlooks).

- 💰 **3-Tier Salary Breakdown**  
  Delivers real-time compensation bands across **Entry Level (0-2 Yrs)**, **Mid Level (3-6 Yrs)**, and **Experienced (7+ Yrs)** tiers worldwide.

- 💬 **24/7 AI Career Chatbot**  
  Real-time interactive AI mentor for interview preparation, resume questions, and career strategy.

- 📄 **Resume ATS Compatibility Analyzer**  
  Evaluates uploaded PDF resumes against industry ATS benchmarks, providing actionable bullet-point improvements.

- 🎯 **Career Match & Skill Gap Engine**  
  Matches user profiles to optimal roles and pinpoints missing tools and technologies.

- ⚖️ **Side-by-Side Career Compare**  
  Compares two career options side-by-side on earning potential, difficulty, required skills, and future scope.

- 🌍 **195+ Country Global Support**  
  Normalized country detection supporting market data across all worldwide regions.

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

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Dark/Gold Theme), JavaScript (ES6+) |
| **Data Viz & PDF** | Chart.js, jsPDF, jsPDF-AutoTable |
| **Backend** | Python 3.9+, Flask |
| **AI Integration** | Google Gemini API (`google.generativeai`) |
| **PDF Extraction** | `pdfplumber` |
| **Icons & Fonts** | FontAwesome 6.6.0, Google Fonts |

---

## 📁 Project Structure

```text
CareerVerse-AI/
├── static/
│   ├── css/
│   │   ├── common.css               # Design tokens & layout foundation
│   │   ├── ai_tools.css             # AI Hub grid & card styles
│   │   ├── career_intelligence.css  # 6-chart dashboard & salary tiers
│   │   ├── career_reality.css       # Reality score meter & dashboard
│   │   └── generate.css             # Roadmap generator styling
│   └── js/
│       ├── generate.js              # Roadmap engine & jsPDF exporter
│       ├── career_intelligence.js   # Chart.js visualization engine
│       ├── career_reality.js        # Reality check score & logic
│       └── ui-effects.js            # Interactive UI animations
├── templates/
│   ├── partials/
│   │   ├── navbar.html              # Sticky navigation bar
│   │   └── footer.html              # Page footer
│   ├── index.html                   # Homepage
│   ├── ai_tools.html                # 9 AI tools hub
│   ├── generate.html                # Roadmap generator
│   ├── career_intelligence.html     # Intelligence dashboard
│   ├── career_reality.html          # Reality check page
│   ├── career_chat.html             # AI career chatbot
│   ├── resume.html                  # Resume ATS analyzer
│   ├── career_match.html            # Career match engine
│   ├── skill_gap.html               # Skill gap analyzer
│   ├── salary_predictor.html        # Salary predictor
│   └── career_compare.html          # Career compare page
├── app.py                           # Flask server & REST API endpoints
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
├── README.md                        # Documentation
└── LICENSE                          # MIT License
```

---

## ⚡ Getting Started

### 1. Prerequisites
Ensure you have **Python 3.9+** and **Git** installed on your system.

### 2. Clone Repository
```bash
git clone https://github.com/shubhodbirajdar928-hash/CareerVerse-AI.git
cd CareerVerse-AI
```

### 3. Setup Virtual Environment
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
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 6. Run the Application
```bash
python app.py
```
Open **`http://127.0.0.1:5000`** in your browser.

---

## 🤖 9 AI Intelligence Modules

1. **AI Career Roadmap Generator** (`/generate`): Custom learning paths with downloadable PDF reports.
2. **AI Career Chat Assistant** (`/career-chat`): 24/7 AI mentor for real-time guidance.
3. **Career Match Engine** (`/career-match`): Profile-to-career alignment analysis.
4. **Skill Gap Analyzer** (`/skill-gap`): Identifies missing technical skills.
5. **Salary Predictor** (`/salary-predictor`): Regional compensation estimates.
6. **Career Compare** (`/compare`): Side-by-side career comparison.
7. **Resume ATS Analyzer** (`/resume`): PDF resume scoring and optimization.
8. **Career Reality Check** (`/career-reality`): Unfiltered day-in-the-life realities & stress metrics.
9. **Career Intelligence AI** (`/career-intelligence`): 6 Chart.js graphs and 5-year growth outlooks.

---

## 👨‍💻 Developer

**Shubhod Birajdar**  
*AI & Machine Learning Developer*  
- **GitHub:** [@shubhodbirajdar928-hash](https://github.com/shubhodbirajdar928-hash)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.