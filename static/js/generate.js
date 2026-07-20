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

},800);
    try {

        const response = await fetch("/roadmap", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                career: career,
                country: country 
            })

        });

       const data = await response.json();
       window.currentRoadmap = data;

console.log(data);

if (!response.ok) {

    resultCard.innerHTML = `
        <div class="roadmap-item">
            <h2>❌ Error</h2>
            <p>${data.error || "Something went wrong."}</p>
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
       

<!-- ================= TITLE ================= -->

<h1>${data.career || career}</h1>

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

downloadBtn.addEventListener("click", () => {

    if (!window.currentRoadmap) {
        alert("Please generate a roadmap first.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF("p", "mm", "a4");
    doc.setFillColor(255,255,255);
doc.rect(0,0,210,297,"F");

    const pageWidth = 210;
    const margin = 15;

    let y = 20;

    const data = window.currentRoadmap;

    // ============================
    // HEADER
    // ============================

    doc.setFillColor(37,99,235);
    doc.rect(0,0,pageWidth,25,"F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(22);

    doc.text("CareerVerse AI",15,16);

    // ============================
    // TITLE
    // ============================

    y = 40;

    doc.setTextColor(37,99,235);
    doc.setFontSize(24);
    doc.text(data.career,margin,y);

    y += 12;

    doc.setTextColor(0,0,0);

    doc.setFontSize(12);

    doc.text(
        "Personalized Career Roadmap",
        margin,
        y
    );

    y += 18;

    // ============================
    // OVERVIEW
    // ============================

    doc.setFontSize(18);
    doc.setTextColor(37,99,235);

    doc.text("Career Overview",margin,y);

    y += 10;

    doc.setFontSize(13);
    doc.setTextColor(0,0,0);
    const overview =
        data.overview?.description ||
        "Not Available";

    const lines =
        doc.splitTextToSize(
            overview,
            180
        );

    doc.text(lines,margin,y);

    y += lines.length * 6 + 8;

    // ============================
    // EDUCATION
    // ============================

    doc.setFont("helvetica","bold");

    doc.text("Education",margin,y);

    y += 7;

    doc.setFont("helvetica","normal");

    doc.text(
        data.overview?.education || "Not Available",
        margin,
        y
    );

    y += 12;

    // ============================
    // SALARY
    // ============================

    doc.setFont("helvetica","bold");

    doc.text("Salary",margin,y);

    y += 7;

    doc.setFont("helvetica","normal");

    doc.text(
        "India : " +
        (data.overview?.salary?.india || "-"),
        margin,
        y
    );

    y += 7;

    doc.text(
        "USA : " +
        (data.overview?.salary?.usa || "-"),
        margin,
        y
    );

    y += 15;
// ============================================
// SKILLS
// ============================================

if (y > 230) {
    doc.addPage();
    y = 20;
}

doc.setFont("helvetica","bold");
doc.setFontSize(18);
doc.setTextColor(37,99,235);
doc.text("Skills",15,y);

y += 10;

const skills = data.skills || {};

["beginner","intermediate","advanced"].forEach(level=>{

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.setFont("helvetica","bold");

    doc.text(
        level.charAt(0).toUpperCase()+level.slice(1),
        15,
        y
    );

    y += 7;

    doc.setFont("helvetica","normal");
    doc.setFontSize(11);

    (skills[level] || []).forEach(skill=>{

        if(y>280){

            doc.addPage();
            y=20;

        }

      const lines = doc.splitTextToSize("• " + skill,170);

doc.text(lines,20,y);

y += lines.length * 7;

    });

    y += 5;

});


// ============================================
// ROADMAP
// ============================================

if(y>230){

    doc.addPage();

    y=20;

}

doc.setFont("helvetica","bold");
doc.setFontSize(18);
doc.setTextColor(37,99,235);

doc.text(data.roadmap_title || "Career Roadmap",15,y);

y += 10;

(data.roadmap || []).forEach(month=>{

    if(y>260){

        doc.addPage();

        y=20;

    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(14);

    doc.setTextColor(0);

    doc.text(month.month,15,y);

    y += 7;

    doc.setFont("helvetica","normal");
    doc.setFontSize(11);

    (month.topics || []).forEach(topic=>{

        if(y>280){

            doc.addPage();

            y=20;

        }

    const lines = doc.splitTextToSize("• " + topic,170);

doc.text(lines,20,y);

y += lines.length * 7;

    });

    y += 6;

});


// ============================================
// LEARNING RESOURCES
// ============================================

if(y>220){

    doc.addPage();

    y=20;

}

doc.setFont("helvetica","bold");
doc.setFontSize(18);

doc.setTextColor(37,99,235);

doc.text("Learning Resources",15,y);

y += 10;

const resources = data.resources || {};

doc.setFont("helvetica","bold");
doc.setTextColor(0);

doc.text("YouTube",15,y);

y += 7;

doc.setFont("helvetica","normal");

(resources.youtube || []).forEach(item=>{

    if(y>280){

        doc.addPage();

        y=20;

    }

    doc.text("• "+item.name,20,y);

    y += 6;

});

y += 5;

doc.setFont("helvetica","bold");

doc.text("Courses",15,y);

y += 7;

doc.setFont("helvetica","normal");

(resources.courses || []).forEach(item=>{

    if(y>280){

        doc.addPage();

        y=20;

    }

    doc.text("• "+item.name,20,y);

    y += 6;

});

y += 5;

doc.setFont("helvetica","bold");

doc.text("Documentation",15,y);

y += 7;

doc.setFont("helvetica","normal");

(resources.documentation || []).forEach(item=>{

    if(y>280){

        doc.addPage();

        y=20;

    }

    doc.text("• "+item.name,20,y);

    y += 6;

});
// ============================================
// PROJECTS
// ============================================

if (y > 220) {
    doc.addPage();
    y = 20;
}

doc.setFont("helvetica","bold");
doc.setFontSize(18);
doc.setTextColor(37,99,235);
doc.text("Projects",15,y);

y += 10;

const projects = data.projects || {};

["beginner","intermediate","advanced"].forEach(level=>{

    doc.setFont("helvetica","bold");
    doc.setFontSize(13);
    doc.setTextColor(0);

    doc.text(level.charAt(0).toUpperCase()+level.slice(1),15,y);

    y += 7;

    doc.setFont("helvetica","normal");
    doc.setFontSize(11);

    (projects[level] || []).forEach(project=>{

        if(y>280){
            doc.addPage();
            y=20;
        }

        doc.text("• "+project,20,y);
        y += 6;

    });

    y += 5;

});


// ============================================
// CERTIFICATIONS
// ============================================

if(y>240){
    doc.addPage();
    y=20;
}

doc.setFont("helvetica","bold");
doc.setFontSize(18);
doc.setTextColor(37,99,235);

doc.text("Certifications",15,y);

y += 10;

doc.setFont("helvetica","normal");
doc.setFontSize(11);

(data.certifications || []).forEach(item=>{

    if(y>280){
        doc.addPage();
        y=20;
    }

   const lines = doc.splitTextToSize("• " + item,170);

doc.text(lines,20,y);

y += lines.length * 7;
});


// ============================================
// TOOLS
// ============================================

if(y>240){
    doc.addPage();
    y=20;
}

doc.setFont("helvetica","bold");
doc.setFontSize(18);
doc.setTextColor(37,99,235);

doc.text("Tools & Technologies",15,y);

y += 10;

doc.setFont("helvetica","normal");

(data.tools || []).forEach(tool=>{

    if(y>280){
        doc.addPage();
        y=20;
    }

    const lines = doc.splitTextToSize("• " + tool,170);

    doc.text(lines,20,y);

    y += lines.length * 7;

});


// ============================================
// INTERVIEW PREPARATION
// ============================================

if(y>240){
    doc.addPage();
    y=20;
}

doc.setFont("helvetica","bold");
doc.setFontSize(18);
doc.setTextColor(37,99,235);

doc.text("Interview Preparation",15,y);

y += 10;

doc.setFont("helvetica","normal");

(data.interview_preparation || []).forEach(item=>{

    if(y>280){
        doc.addPage();
        y=20;
    }

    const lines = doc.splitTextToSize("• " + item,170);

doc.text(lines,20,y);

y += lines.length * 7;
});


// ============================================
// AI TIPS
// ============================================

if(y>240){
    doc.addPage();
    y=20;
}

doc.setFont("helvetica","bold");
doc.setFontSize(18);
doc.setTextColor(37,99,235);

doc.text("AI Tips",15,y);

y += 10;

doc.setFont("helvetica","normal");

(data.ai_tips || []).forEach(item=>{

    if(y>280){
        doc.addPage();
        y=20;
    }

    doc.text("• "+item,20,y);

    y += 6;

});


// ============================================
// MARKET
// ============================================

const market = data.market || {};

if(y>220){
    doc.addPage();
    y=20;
}

doc.setFont("helvetica","bold");
doc.setFontSize(18);
doc.setTextColor(37,99,235);

doc.text("Career Intelligence",15,y);

y += 10;

doc.setFontSize(11);
doc.setFont("helvetica","normal");
doc.setTextColor(0);

doc.text(
    `Job Demand : ${market.job_demand?.text} (${market.job_demand?.percentage}%)`,
    15,
    y
);
y += 7;

doc.text(
    `Difficulty : ${market.difficulty?.text} (${market.difficulty?.percentage}%)`,
    15,
    y
);
y += 7;

doc.text(
    `Growth : ${market.growth?.text} (${market.growth?.percentage}%)`,
    15,
    y
);
y += 7;

doc.text(
    `Learning Time : ${market.learning_time?.text} (${market.learning_time?.percentage}%)`,
    15,
    y
);
y += 12;


// ============================================
// TOP COMPANIES
// ============================================

doc.setFont("helvetica","bold");
doc.text("Top Organizations",15,y);

y+=7;

doc.setFont("helvetica","normal");

(market.top_organizations || []).forEach(company=>{

    if(y>280){
        doc.addPage();
        y=20;
    }

    doc.text("• "+company,20,y);

    y+=6;

});

y+=8;


// ============================================
// COUNTRIES
// ============================================

doc.setFont("helvetica","bold");

doc.text("Countries Hiring",15,y);

y+=7;

doc.setFont("helvetica","normal");

(market.countries || []).forEach(country=>{

    if(y>280){
        doc.addPage();
        y=20;
    }

    doc.text("• "+country,20,y);

    y+=6;

});

y+=8;


// ============================================
// WEEKLY PLAN
// ============================================

doc.setFont("helvetica","bold");

doc.text("Weekly Study Plan",15,y);

y+=7;

doc.setFont("helvetica","normal");

(market.daily_plan || []).forEach(day=>{

    if(y>280){
        doc.addPage();
        y=20;
    }

    doc.text("• "+day,20,y);

    y+=6;

});
    // ============================
    // FOOTER
    // ============================

  const pages = doc.getNumberOfPages();

for(let i=1;i<=pages;i++){

    doc.setPage(i);

    doc.setDrawColor(220);

    doc.line(15,285,195,285);

    doc.setFontSize(12);

    doc.setTextColor(0,0,0);
   

    doc.text("Generated by CareerVerse AI",15,291);

    doc.text(`Page ${i} of ${pages}`,170,291);

}

    doc.save(`${data.career}_Roadmap.pdf`);

});


