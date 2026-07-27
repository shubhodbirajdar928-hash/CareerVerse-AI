// ======================================================
// CAREERVERSE AI
// CAREER EVOLUTION DASHBOARD
// ======================================================

// -------------------------
// DOM ELEMENTS
// -------------------------

const input = document.getElementById("careerInput");
const analyzeBtn = document.getElementById("analyzeBtn");

const loader = document.getElementById("loader");
const dashboard = document.getElementById("dashboard");

// -------------------------
// CHART VARIABLES
// -------------------------

let careerDemandChart;
let salaryChart;
let industryChart;
let radarChart;
let hiringChart;
let riskChart;
let globalChart;
let confidenceChart;
let futureChart;

// -------------------------
// EVENTS
// -------------------------

analyzeBtn.addEventListener("click", analyzeCareer);

input.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        analyzeCareer();

    }

});

// -------------------------
// MAIN FUNCTION
// -------------------------

async function analyzeCareer(){

    const career=input.value.trim();

    if(!career){

        alert("Please enter a career.");

        return;

    }

    showLoader();

    try{

        const response=await fetch("/career-evolution-ai",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                career:career

            })

        });

        const data=await response.json();

        if(!data.success){

            throw new Error("Analysis failed");

        }

        hideLoader();

        dashboard.classList.remove("hidden");

        populateDashboard(data);

    }

    catch(error){

        console.error(error);

        hideLoader();

        alert("Unable to analyze career.");

    }

}

// -------------------------
// LOADER
// -------------------------

function showLoader(){

    loader.classList.remove("hidden");

    dashboard.classList.add("hidden");

}

function hideLoader(){

    loader.classList.add("hidden");

}

// -------------------------
// POPULATE EVERYTHING
// -------------------------

function populateDashboard(data){

    updateMetrics(data);

    updateOverview(data);

    updateSkills(data);

    updateCompanies(data);

    updateCountries(data);

    updateTimeline(data);

    updateRecommendations(data);

    createCharts(data);

}
// ======================================================
// UPDATE METRICS
// ======================================================

function updateMetrics(data){

    animateValue("careerDemandScore",0,data.career_demand||0,1200);
    animateValue("salaryScore",0,data.salary||0,1200);
    animateValue("growthScore",0,data.growth||0,1200);
    animateValue("globalScore",0,data.global||0,1200);
    animateValue("riskScore",0,data.risk||0,1200);
    animateValue("stabilityScore",0,data.stability||0,1200);
    animateValue("hiringScore",0,data.hiring||0,1200);
    animateValue("confidenceScore",0,data.confidence||0,1200);

}

// ======================================================
// COUNTER ANIMATION
// ======================================================

function animateValue(id,start,end,duration){

    const element=document.getElementById(id);

    if(!element) return;

    let startTime=null;

    function animation(currentTime){

        if(!startTime) startTime=currentTime;

        const progress=Math.min((currentTime-startTime)/duration,1);

        element.innerHTML=Math.floor(progress*(end-start)+start)+"%";

        if(progress<1){

            requestAnimationFrame(animation);

        }

    }

    requestAnimationFrame(animation);

}

// ======================================================
// OVERVIEW
// ======================================================

function updateOverview(data){

    document.getElementById("careerOverview").innerHTML=
    data.overview || "No overview available.";

    const insightList=document.getElementById("marketInsights");

    insightList.innerHTML="";

    if(data.insights){

        data.insights.forEach(item=>{

            const li=document.createElement("li");

            li.innerHTML=item;

            insightList.appendChild(li);

        });

    }

}

// ======================================================
// SKILLS
// ======================================================

function updateSkills(data){

    const container=document.getElementById("skillsContainer");

    container.innerHTML="";

    if(!data.skills) return;

    data.skills.forEach(skill=>{

        const div=document.createElement("div");

        div.className="skill";

        div.innerHTML=skill;

        container.appendChild(div);

    });

}

// ======================================================
// COMPANIES
// ======================================================

function updateCompanies(data){

    const container=document.getElementById("companyGrid");

    container.innerHTML="";

    if(!data.companies) return;

    data.companies.forEach(company=>{

        container.innerHTML+=`

        <div class="company">

            <h3>${company.name}</h3>

            <p>${company.description}</p>

            <span>${company.country}</span>

        </div>

        `;

    });

}

// ======================================================
// COUNTRIES
// ======================================================

function updateCountries(data){

    const container=document.getElementById("countryGrid");

    container.innerHTML="";

    if(!data.countries) return;

    data.countries.forEach(country=>{

        container.innerHTML+=`

        <div class="country">

            <h3>${country.name}</h3>

            <p>${country.jobs} Jobs</p>

        </div>

        `;

    });

}

// ======================================================
// TIMELINE
// ======================================================

function updateTimeline(data){

    const timeline=document.getElementById("timeline");

    timeline.innerHTML="";

    if(!data.timeline) return;

    data.timeline.forEach(step=>{

        timeline.innerHTML+=`

        <div class="timeline-item">

            <h3>${step.year}</h3>

            <p>${step.description}</p>

        </div>

        `;

    });

}

// ======================================================
// RECOMMENDATIONS
// ======================================================

function updateRecommendations(data){

    const container=document.getElementById("recommendations");

    container.innerHTML="";

    if(!data.recommendations) return;

    data.recommendations.forEach(item=>{

        container.innerHTML+=`

        <div class="recommendation">

            <h3>${item.title}</h3>

            <p>${item.description}</p>

        </div>

        `;

    });

}
// ======================================================
// CHARTS
// ======================================================

function createCharts(data){

    destroyCharts();

    createCareerDemandChart(data);
    createSalaryChart(data);
    createIndustryChart(data);
    createRadarChart(data);
    createHiringChart(data);
    createRiskChart(data);
    createGlobalChart(data);
    createConfidenceChart(data);
    createFutureChart(data);

}

// ======================================================
// DESTROY OLD CHARTS
// ======================================================

function destroyCharts(){

    [
        careerDemandChart,
        salaryChart,
        industryChart,
        radarChart,
        hiringChart,
        riskChart,
        globalChart,
        confidenceChart,
        futureChart

    ].forEach(chart=>{

        if(chart){

            chart.destroy();

        }

    });

}

// ======================================================
// CAREER DEMAND
// ======================================================

function createCareerDemandChart(data){

careerDemandChart=new Chart(

document.getElementById("careerDemandChart"),

{

type:"doughnut",

data:{

labels:["Demand","Remaining"],

datasets:[{

data:[data.career_demand||0,100-(data.career_demand||0)],

backgroundColor:["#7C3AED","#1E293B"],

borderWidth:0

}]

},

options:{

responsive:true,

cutout:"75%",

plugins:{

legend:{display:false}

}

}

});

}

// ======================================================
// SALARY
// ======================================================

function createSalaryChart(data){

salaryChart=new Chart(

document.getElementById("salaryChart"),

{

type:"line",

data:{

labels:["2025","2026","2027","2028","2029","2030"],

datasets:[{

label:"Salary",

data:data.salary_trend||[30,40,50,60,70,80],

borderColor:"#3B82F6",

fill:false,

tension:.4

}]

},

options:{responsive:true}

});

}

// ======================================================
// INDUSTRY
// ======================================================

function createIndustryChart(data){

industryChart=new Chart(

document.getElementById("industryChart"),

{

type:"bar",

data:{

labels:data.industries||["IT","Finance","Health","AI"],

datasets:[{

label:"Adoption",

data:data.industry_scores||[85,70,90,95],

backgroundColor:"#7C3AED"

}]

}

});

}

// ======================================================
// RADAR
// ======================================================

function createRadarChart(data){

radarChart=new Chart(

document.getElementById("radarChart"),

{

type:"radar",

data:{

labels:["AI","Coding","Math","Communication","Leadership"],

datasets:[{

data:data.profile||[80,90,75,70,60],

backgroundColor:"rgba(124,58,237,.25)",

borderColor:"#7C3AED"

}]

}

});

}

// ======================================================
// HIRING
// ======================================================

function createHiringChart(data){

hiringChart=new Chart(

document.getElementById("hiringChart"),

{

type:"line",

data:{

labels:["Jan","Feb","Mar","Apr","May","Jun"],

datasets:[{

label:"Hiring",

data:data.hiring_trend||[30,45,52,65,72,90],

fill:true,

borderColor:"#22C55E",

backgroundColor:"rgba(34,197,94,.2)"

}]

}

});

}

// ======================================================
// AUTOMATION
// ======================================================

function createRiskChart(data){

riskChart=new Chart(

document.getElementById("riskChart"),

{

type:"doughnut",

data:{

labels:["Risk","Safe"],

datasets:[{

data:[data.risk||0,100-(data.risk||0)],

backgroundColor:["#EF4444","#1E293B"],

borderWidth:0

}]

},

options:{

cutout:"75%",

plugins:{legend:{display:false}}

}

});

}

// ======================================================
// GLOBAL
// ======================================================

function createGlobalChart(data){

globalChart=new Chart(

document.getElementById("globalChart"),

{

type:"polarArea",

data:{

labels:data.countries?.map(c=>c.name)||["USA","India","Germany"],

datasets:[{

data:data.countries?.map(c=>c.jobs)||[100,90,60],

backgroundColor:[

"#7C3AED",

"#3B82F6",

"#06B6D4",

"#22C55E",

"#F59E0B"

]

}]

}

});

}

// ======================================================
// CONFIDENCE
// ======================================================

function createConfidenceChart(data){

confidenceChart=new Chart(

document.getElementById("confidenceChart"),

{

type:"doughnut",

data:{

labels:["Confidence","Remaining"],

datasets:[{

data:[data.confidence||0,100-(data.confidence||0)],

backgroundColor:["#22C55E","#1E293B"],

borderWidth:0

}]

},

options:{

cutout:"75%",

plugins:{legend:{display:false}}

}

});

}

// ======================================================
// FUTURE DEMAND
// ======================================================

function createFutureChart(data){

futureChart=new Chart(

document.getElementById("futureChart"),

{

type:"bar",

data:{

labels:["2026","2027","2028","2029","2030"],

datasets:[{

label:"Demand",

data:data.future_demand||[75,82,88,93,97],

backgroundColor:"#06B6D4"

}]

},

options:{responsive:true}

});

}