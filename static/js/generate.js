// ==========================================
// CareerVerse AI - generate.js
// ==========================================

const generateBtn = document.getElementById("generateBtn");
const careerInput = document.getElementById("careerInput");
const countryInput = document.getElementById("countryInput");
const resultCard = document.getElementById("resultCard");
const downloadBtn = document.getElementById("downloadBtn");


// ==========================================
// Generate Roadmap
// ==========================================

generateBtn.addEventListener("click", async () => {

    const career = careerInput.value.trim();
    const country = countryInput.value.trim();
    const duration = document.getElementById("duration").value.trim();

    if (!career) {
    alert("Please enter a career.");
    return;
    }

    // Loading Screen
    resultCard.innerHTML = `
<div class="loading-card">
    <div class="ai-loader"></div>
    <h2>🤖 CareerVerse AI is Working...</h2>
    <div class="loading-steps">
        <p id="loadingText">🧠 Analyzing Career...</p>
    </div>
</div>
`;
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const steps = [
        "🧠 Analyzing Career...",
        "📚 Finding Best Learning Resources...",
        "🛠 Building Personalized Roadmap...",
        "💼 Preparing Projects & Certifications...",
        "📄 Finalizing Your Career Report..."
    ];

    let index = 0;
    const loadingInterval = setInterval(() => {
        const text = document.getElementById("loadingText");
        if(text){
            text.textContent = steps[index];
            index = (index + 1) % steps.length;
        }
    }, 800);

    try {
        const response = await fetch("/roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ career, country, duration })
        });

        const data = await response.json();
        window.currentRoadmap = data;

        if (!response.ok || data.success === false) {
            clearInterval(loadingInterval);
            resultCard.innerHTML = `
                <div class="roadmap-item">
                    <h2>❌ Error</h2>
                    <p>${data.error || "Something went wrong generating the roadmap."}</p>
                </div>
            `;
            return;
        }
        console.log(data);

        // -----------------------------
        // Extract Data
        // -----------------------------

        const overview = data.overview || {};

        const skills = data.skills || {};

        const roadmap = data.roadmap || [];

        const resources = data.resources || {};

        const projects = data.projects || {};

        const certifications = data.certifications || [];

        const tools = data.tools || [];

        const interview = data.interview_preparation || [];

        const portfolio = data.portfolio_tips || [];

        const aiTips = data.ai_tips || [];

        const market = data.market || {};

        // -----------------------------
        // Start HTML
        // -----------------------------

        let html = `
       

<!-- ================= TITLE & DOWNLOAD HEADER ================= -->

<div class="roadmap-top-bar">
    <div class="roadmap-title-group">
        <span class="roadmap-top-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> AI MASTER ROADMAP</span>
        <h1>${data.career || career}</h1>
    </div>
    <button id="inlineDownloadBtn" type="button" class="top-download-btn">
        <i class="fa-solid fa-file-pdf"></i> Download PDF Roadmap
    </button>
</div>

<!-- ================= OVERVIEW ================= -->

<div class="roadmap-item">

    <h2>📖 Career Overview</h2>

    <p>${overview.description || "Not Available"}</p>

    <h3>🎯 Roles & Responsibilities</h3>

    <ul>

        ${(overview.roles || []).map(role => `
        <li>${role}</li>
        `).join("")}

    </ul>

    <h3>🎓 Education</h3>

    <p>${overview.education || "Not Available"}</p>

    <h3>💰 Salary</h3>

    <p>

<b>🇮🇳 India:</b>
${overview.salary?.india || "Not Available"}

<br><br>

<b>🇺🇸 USA:</b>
${overview.salary?.usa || "Not Available"}

</p>

    <h3>📈 Future Scope</h3>

    <p>${overview.future_scope || "Not Available"}</p>

</div>

<!-- ================= SKILLS ================= -->

<div class="roadmap-item">

    <h2>🛠 Skills</h2>

    <h3>Beginner</h3>

    <ul>

        ${(skills.beginner || []).map(skill => `
        <li>${skill}</li>
        `).join("")}

    </ul>

    <h3>Intermediate</h3>

    <ul>

        ${(skills.intermediate || []).map(skill => `
        <li>${skill}</li>
        `).join("")}

    </ul>

    <h3>Advanced</h3>

    <ul>

        ${(skills.advanced || []).map(skill => `
        <li>${skill}</li>
        `).join("")}

    </ul>

</div>

<!-- ================= ROADMAP ================= -->

<div class="roadmap-item">

   <h2>🗓️ ${data.roadmap_title || "Career Roadmap"}</h2>

    ${roadmap.map(month => `

        <h3>${month.month}</h3>

        <ul>

        ${(month.topics || []).map(topic => `
            <li>${topic}</li>
        `).join("")}

        </ul>

    `).join("")}

</div>
<!-- ================= LEARNING RESOURCES ================= -->

<div class="roadmap-item">

    <h2>📚 Learning Resources</h2>

    <h3>📺 YouTube Channels</h3>

    <ul>

        ${(resources.youtube || []).map(item => `<li>
   <a href="${item.url}"
   target="_blank"
   rel="noopener noreferrer"
   class="resource-link">
   ▶ ${item.name}
</a>
</li>
`).join("")}

    </ul>

    <h3>🎓 Courses</h3>

    <ul>

       ${(resources.courses || []).map(item => `
<li>
    <a href="${item.url}"
   target="_blank"
   rel="noopener noreferrer"
   class="resource-link">
   🎓 ${item.name}
</a>
</li>
`).join("")}

    </ul>

    <h3>📄 Documentation</h3>

    <ul>
 ${(resources.documentation || []).map(item => `
<li>
    <a href="${item.url}"
   target="_blank"
   rel="noopener noreferrer"
   class="resource-link">
   📄 ${item.name}
</a>
</li>
`).join("")}

  <h3>📚 Books</h3>

<ul>

${(resources.books || []).map(item => `
<li>
    <a href="${item.url}"
       target="_blank"
       class="resource-link">
       📖 ${item.name}
    </a>
</li>
`).join("")}

</ul>

</div>

<!-- ================= PROJECTS ================= -->

<div class="roadmap-item">

    <h2>💼 Projects</h2>

    <h3>Beginner</h3>

    <ul>

        ${(projects.beginner || []).map(item => `
            <li>${item}</li>
        `).join("")}

    </ul>

    <h3>Intermediate</h3>

    <ul>

        ${(projects.intermediate || []).map(item => `
            <li>${item}</li>
        `).join("")}

    </ul>

    <h3>Advanced</h3>

    <ul>

        ${(projects.advanced || []).map(item => `
            <li>${item}</li>
        `).join("")}

    </ul>

</div>

<!-- ================= CERTIFICATIONS ================= -->

<div class="roadmap-item">

    <h2>🏆 Certifications</h2>

    <ul>

        ${certifications.map(item => `
            <li>${item}</li>
        `).join("")}

    </ul>

</div>

<!-- ================= TOOLS ================= -->

<div class="roadmap-item">

    <h2>🧰 Tools & Technologies</h2>

    <ul>

        ${tools.map(item => `
            <li>${item}</li>
        `).join("")}

    </ul>

</div>

<!-- ================= INTERVIEW ================= -->

<div class="roadmap-item">

    <h2>💬 Interview Preparation</h2>

    <ul>

        ${interview.map(item => `
            <li>${item}</li>
        `).join("")}

    </ul>

</div>

<!-- ================= PORTFOLIO ================= -->

<div class="roadmap-item">

    <h2>🎯 Portfolio Tips</h2>

    <ul>

        ${portfolio.map(item => `
            <li>${item}</li>
        `).join("")}

    </ul>

</div>

<!-- ================= AI TIPS ================= -->

<div class="roadmap-item">

    <h2>🤖 AI Tips</h2>

    <ul>

        ${aiTips.map(item => `
            <li>${item}</li>
        `).join("")}

    </ul>

</div>
<!-- ================= CAREER INTELLIGENCE ================= -->

<div class="roadmap-item">

    <h2>📊 Career Intelligence</h2>

    <div class="analytics-grid">

        <div class="analytics-card">

            <h3>🔥 Job Demand</h3>

            

         

<div class="progress">

    <div
        class="progress-fill"
        style="width:${market.job_demand?.percentage || 0}%">

        <span class="progress-text">
            ${market.job_demand?.percentage || 0}%
        </span>

    </div>

</div>

<p>${market.job_demand?.text || ""}</p>

        </div>

        <div class="analytics-card">

            <h3>🎯 Difficulty</h3>

            

      <div class="progress">

    <div class="progress-fill"
         style="width:${market.difficulty?.percentage || 0}%">

        <span class="progress-text">
            ${market.difficulty?.percentage || 0}%
        </span>

    </div>

</div>

<p>${market.difficulty?.text || ""}</p>

        </div>

        <div class="analytics-card">

            <h3>🚀 Growth</h3>

            

           <div class="progress">

    <div
        class="progress-fill"
        style="width:${market.learning_time?.percentage || 0}%">

        <span class="progress-text">
            ${market.learning_time?.percentage || 0}%
        </span>

    </div>

</div>

<p>${market.learning_time?.text || ""}</p>

        </div>

        <div class="analytics-card">

            <h3>📚 Learning Time</h3>

            

        
<div class="progress">

    <div
        class="progress-fill"
        style="width:${market.growth?.percentage || 0}%">

        <span class="progress-text">
            ${market.growth?.percentage || 0}%
        </span>

    </div>

</div>

<p>${market.growth?.text || ""}</p>
        </div>

    </div>

</div>

<!-- ================= SALARY ================= -->

<div class="roadmap-item">

    <h2>💰 Salary Progression</h2>

    <ul>

        <li>👨‍💻 Fresher :${market.salary?.fresher || ""} </li>

        <li>🚀 Mid Level :${market.salary?.mid || ""}</li>

        <li>🏆 Senior : ${market.salary?.senior || ""}</li>

    </ul>

</div>

<!-- ================= TOP COMPANIES ================= -->

<div class="roadmap-item">

    <h2>🏢 Top Organizations</h2>

    <ul>

        ${(market.top_organizations || []).map(company => `
<li>${company}</li>
`).join("")}

    </ul>

</div>

<!-- ================= HIRING HOTSPOTS ================= -->

<div class="roadmap-item">

    <h2>🏙️ Hiring Hotspots</h2>

    <div class="hotspots">

        ${(market.hiring_hotspots || []).map(city => `

        <div class="hotspot-card">

            <h3>📍 ${city.city}</h3>

            <p><strong>${city.demand}</strong></p>

            <p>${city.reason}</p>

        </div>

        `).join("")}

    </div>

</div> 

<!-- ================= TRENDING SKILLS ================= -->

<div class="roadmap-item">

    <h2>🔥 Trending Skills</h2>

    <ul>

        ${(market.trending_skills || []).map(skill => `
<li>${skill}</li>
`).join("")}

    </ul>

</div>

<!-- ================= WEEKLY PLAN ================= -->

<div class="roadmap-item">

    <h2>📅 Weekly Study Plan</h2>

    <ul>

        ${(market.daily_plan || []).map(day => `
<li>${day}</li>
`).join("")}
    </ul>

</div>

`;
clearInterval(loadingInterval);

html += `

<hr style="margin-top:40px">

<p style="
text-align:center;
font-size:14px;
color:#777;
margin-top:15px;">

Generated by <b>CareerVerse AI</b>

</p>

`;

resultCard.innerHTML = html;
resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

// Bind inline download button
const inlineBtn = document.getElementById("inlineDownloadBtn");
if (inlineBtn) {
    inlineBtn.addEventListener("click", generatePDFReport);
}

// Show action section
const actionSection = document.getElementById("actionSection");
if (actionSection) {
    actionSection.style.display = "flex";
}


} catch (error) {

    console.error(error);

    resultCard.innerHTML = `
    <div class="roadmap-item">
        <h2>❌ Error</h2>
        <p>${error.message}</p>
    </div>
    `;
}

});

// ==========================================
// PROFESSIONAL PDF EXPORT - PHASE 1
// ==========================================

if (downloadBtn) {
    downloadBtn.addEventListener("click", generatePDFReport);
}

function generatePDFReport() {
    if (!window.currentRoadmap) {
        alert("Please generate a roadmap first.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    // Palette
    const NAVY = [15, 23, 42];        // #0f172a
    const GOLD = [202, 138, 4];       // #ca8a04
    const SLATE = [30, 41, 59];       // #1e293b
    const MUTED = [100, 116, 139];     // #64748b
    const LIGHT_BG = [248, 250, 252];  // #f8fafc
    const BORDER = [226, 232, 240];    // #e2e8f0

    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2); // 180mm
    let y = 0;

    const data = window.currentRoadmap;

    // Helper: Safe string sanitizer
    function sanitize(str) {
        if (!str) return "";
        return String(str)
            .replace(/₹/g, "INR ")
            .replace(/[^\x00-\x7F]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    // Helper: Check Page Break
    function checkPageBreak(neededSpace = 25) {
        if (y + neededSpace > 275) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    }

    // Helper: Section Title Header
    function drawSectionHeader(title) {
        checkPageBreak(18);
        doc.setFillColor(15, 23, 42);
        doc.rect(margin, y, 3.5, 6.5, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(sanitize(title).toUpperCase(), margin + 6, y + 5);

        y += 8;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
    }

    // ==========================================
    // 1. TOP HEADER BANNER (Page 1)
    // ==========================================
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageWidth, 28, "F");

    // Gold Accent Line under Header
    doc.setFillColor(...GOLD);
    doc.rect(0, 28, pageWidth, 1.5, "F");

    // Brand Name & Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CareerVerse AI", margin, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text("AUTONOMOUS CAREER INTELLIGENCE & MASTER ROADMAP REPORT", margin, 22);

    // Date
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(today, pageWidth - margin, 22, { align: "right" });

    y = 38;

    // ==========================================
    // 2. DOCUMENT TITLE BLOCK
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...SLATE);
    const careerTitle = sanitize(data.career || "Target Career Role");
    doc.text(careerTitle, margin, y);

    y += 6;
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const locText = data.country ? `Target Region: ${sanitize(data.country)} | Timeline: ${sanitize(data.duration || '6 Months')}` : `Personalized Action Plan & Industry Benchmarks`;
    doc.text(locText, margin, y);

    y += 10;

}

    doc.save(`${data.career}_Roadmap.pdf`);

}


