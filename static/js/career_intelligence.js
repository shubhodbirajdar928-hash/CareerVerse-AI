// ==========================================
// Career Intelligence Dashboard
// ==========================================

// ---------- DOM ----------

const analyzeBtn = document.getElementById("analyzeBtn");

const careerInput = document.getElementById("career");
const countryInput = document.getElementById("country");

const dashboard = document.getElementById("dashboard");
const loading = document.getElementById("loading");


// ---------- Summary ----------

const futureRating = document.getElementById("futureRating");
const averageSalary = document.getElementById("averageSalary");
const confidence = document.getElementById("confidence");
const education = document.getElementById("education");

const overview = document.getElementById("overview");


// ==========================================
// Event
// ==========================================

analyzeBtn.addEventListener("click", analyzeCareer);


// ==========================================
// Main Function
// ==========================================

async function analyzeCareer() {

    const career = careerInput.value.trim();
    const country = countryInput.value.trim() || "India";

    if (!career) {
        alert("Please enter a career.");
        return;
    }

    loading.classList.remove("hidden");
    dashboard.classList.add("hidden");

    try {

        const response = await fetch("/career-intelligence-api", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                career,
                country
            })

        });

        const data = await response.json();

        if (!data.success) {

            throw new Error(data.error || "Unknown Error");

        }

        loading.classList.add("hidden");
        dashboard.classList.remove("hidden");

        renderDashboard(data);

    }

    catch (error) {

        loading.classList.add("hidden");

        alert(error.message);

        console.error(error);

    }

}


// ==========================================
// Render Dashboard
// ==========================================

function renderDashboard(data){

    renderSummary(data);

    renderCharts(data);

    renderLists(data);

    renderTimeline(data);

    renderAdvice(data);

}


// ==========================================
// Summary
// ==========================================

function renderSummary(data){

    const summary = data.summary || {};

    futureRating.textContent =
        summary.future_rating || "--";

    averageSalary.textContent =
        summary.average_salary || "--";

    confidence.textContent =
        summary.confidence || "--";

    education.textContent =
        summary.education || "--";

    overview.textContent =
        summary.overview || "No overview available.";

}



// ==========================================
// Charts
// ==========================================

let demandChart = null;
let salaryChart = null;
let competitionChart = null;
let technologyChart = null;
let skillsChart = null;
let globalChart = null;

function destroyChart(chart){
    if(chart){
        chart.destroy();
    }
}

function renderCharts(data){

    const charts = data.charts || {};

    renderDemandChart(charts.career_demand || {});
    renderSalaryChart(charts.salary_growth || {});
    renderCompetitionChart(charts.competition || {});
    renderTechnologyChart(charts.technology || {});
    renderSkillsChart(charts.skills || {});
    renderGlobalChart(charts.global_demand || {});
    renderAutomation(charts.automation || {});

}


// ==========================================
// Career Demand
// ==========================================

function renderDemandChart(chart){

    destroyChart(demandChart);

    const ctx = document
        .getElementById("careerDemandChart")
        .getContext("2d");

    demandChart = new Chart(ctx,{

        type:"line",

        data:{

            labels: chart.labels || [],

            datasets:[{

    label:"Demand",

    data:chart.values || [],

    borderColor:"#38bdf8",

    backgroundColor:(context)=>{

        const chart=context.chart;
        const {ctx,chartArea}=chart;

        if(!chartArea) return null;

        const gradient=ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
        );

        gradient.addColorStop(0,"rgba(56,189,248,.55)");
        gradient.addColorStop(1,"rgba(56,189,248,.05)");

        return gradient;

    },

    fill:true,

    tension:.45,
    cubicInterpolationMode:"monotone",

    pointHoverRadius:10,

    pointHoverBorderWidth:3,

    borderWidth:4,

    pointRadius:5,

    pointHoverRadius:8,

    pointBackgroundColor:"#38bdf8",

    pointBorderColor:"#ffffff"

}]

        },

        options:{
    responsive:true,
    maintainAspectRatio:false,
    animation:{
    duration:2000,
    easing:"easeOutQuart"
},

    interaction:{
        mode:'index',
        intersect:false
    },

    plugins:{
        legend:{
    display:false
},
        tooltip:{
            enabled:true,
            displayColors:true,
            backgroundColor:'#111827',
            titleColor:'#ffffff',
            bodyColor:'#ffffff',
            borderColor:'#3b82f6',
            borderWidth:1,
            padding:12
        }
    },

    scales:{
    r:{

        angleLines:{
            color:"rgba(255,255,255,.08)"
        },

        grid:{
            color:"rgba(255,255,255,.08)"
        },

        pointLabels:{
            color:"#ffffff",
            font:{
                size:13,
                weight:"bold"
            }
        },

        ticks:{
            display:false
        },

        suggestedMin:0,
        suggestedMax:100

    }
}
}

    });

    document.getElementById("careerDemandReason").textContent =
        chart.reason || "";

}

// ==========================================
// Salary Growth
// ==========================================

function renderSalaryChart(chart){

    destroyChart(salaryChart);

    const ctx=document
        .getElementById("salaryGrowthChart")
        .getContext("2d");

    salaryChart=new Chart(ctx,{

        type:"bar",

        data:{

            labels:chart.labels || [],

            datasets:[{

    label:"Salary",

    data:chart.values || [],

    backgroundColor:[
        "#8b5cf6",
        "#7c3aed",
        "#6366f1",
        "#3b82f6",
        "#06b6d4",
        "#22c55e",
        "#f59e0b"
    ],

    borderRadius:15,

    borderSkipped:false

}]

        },

      options:{
    responsive:true,
    maintainAspectRatio:false,

    animation:{
    duration:2000,
    easing:"easeOutQuart"
},

    interaction:{
        mode:'index',
        intersect:false
    },

    plugins:{
        legend:{
    display:false
},
        tooltip:{
            enabled:true,
            displayColors:true,
            backgroundColor:'#111827',
            titleColor:'#ffffff',
            bodyColor:'#ffffff',
            borderColor:'#3b82f6',
            borderWidth:1,
            padding:12
        }
    },

    scales:{
    r:{

        angleLines:{
            color:"rgba(255,255,255,.08)"
        },

        grid:{
            color:"rgba(255,255,255,.08)"
        },

        pointLabels:{
            color:"#ffffff",
            font:{
                size:13,
                weight:"bold"
            }
        },

        ticks:{
            display:false
        },

        suggestedMin:0,
        suggestedMax:100

    }
}
}

    });

    document.getElementById("salaryReason").textContent =
        chart.reason || "";

}


// ==========================================
// Competition
// ==========================================

function renderCompetitionChart(chart){

    destroyChart(competitionChart);

    const ctx=document
        .getElementById("competitionChart")
        .getContext("2d");

    competitionChart=new Chart(ctx,{

        type:"line",

        data:{

            labels:chart.labels || [],

            datasets:[{

    label:"Competition",

    data:chart.values || [],

    borderColor:"#ef4444",

    backgroundColor:"rgba(239,68,68,.20)",

    fill:true,

    tension:.45,

    cubicInterpolationMode:"monotone",

    pointHoverRadius:10,

    pointHoverBorderWidth:3,

    borderWidth:4,

    pointRadius:5,

    pointBackgroundColor:"#ef4444"

}]

        },

       options:{
    responsive:true,
    maintainAspectRatio:false,

    animation:{
    duration:2000,
    easing:"easeOutQuart"
},

    interaction:{
        mode:'index',
        intersect:false
    },

    plugins:{
        legend:{
    display:false
},
        tooltip:{
            enabled:true,
            displayColors:true,
            backgroundColor:'#111827',
            titleColor:'#ffffff',
            bodyColor:'#ffffff',
            borderColor:'#3b82f6',
            borderWidth:1,
            padding:12
        }
    },

    scales:{
    r:{

        angleLines:{
            color:"rgba(255,255,255,.08)"
        },

        grid:{
            color:"rgba(255,255,255,.08)"
        },

        pointLabels:{
            color:"#ffffff",
            font:{
                size:13,
                weight:"bold"
            }
        },

        ticks:{
            display:false
        },

        suggestedMin:0,
        suggestedMax:100

    }
}
}

    });

    document.getElementById("competitionReason").textContent =
        chart.reason || "";

}


// ==========================================
// Technology Adoption
// ==========================================

function renderTechnologyChart(chart){

    destroyChart(technologyChart);

    const ctx=document
        .getElementById("technologyChart")
        .getContext("2d");

    technologyChart=new Chart(ctx,{

        type:"line",

        data:{

            labels:chart.labels || [],

            datasets:[{

    label:"Technology",

    data:chart.values || [],

    borderColor:"#22c55e",

    backgroundColor:"rgba(34,197,94,.25)",

    fill:true,

    tension:.45,

    cubicInterpolationMode:"monotone",

    pointHoverRadius:10,

    pointHoverBorderWidth:3,

    borderWidth:4,

    pointRadius:5,

    pointBackgroundColor:"#22c55e"

}]

        },

       options:{
    responsive:true,
    maintainAspectRatio:false,

    animation:{
    duration:2000,
    easing:"easeOutQuart"
},

    interaction:{
        mode:'index',
        intersect:false
    },

    plugins:{
        legend:{
    display:false
},
        tooltip:{
            enabled:true,
            displayColors:true,
            backgroundColor:'#111827',
            titleColor:'#ffffff',
            bodyColor:'#ffffff',
            borderColor:'#3b82f6',
            borderWidth:1,
            padding:12
        }
    },

   scales:{
    r:{

        angleLines:{
            color:"rgba(255,255,255,.08)"
        },

        grid:{
            color:"rgba(255,255,255,.08)"
        },

        pointLabels:{
            color:"#ffffff",
            font:{
                size:13,
                weight:"bold"
            }
        },

        ticks:{
            display:false
        },

        suggestedMin:0,
        suggestedMax:100

    }
}
}

    });

    document.getElementById("technologyReason").textContent =
        chart.reason || "";

}


// ==========================================
// Skills Radar
// ==========================================

function renderSkillsChart(chart){

    destroyChart(skillsChart);

    const ctx=document
        .getElementById("skillsChart")
        .getContext("2d");

    skillsChart=new Chart(ctx,{

        type:"radar",

       data:{

    labels:[
        "Technical",
        "Communication",
        "Leadership",
        "Management",
        "Problem Solving"
    ],

    datasets:[{

    label:"Skills",

    data:[
        chart.technical || 0,
        chart.communication || 0,
        chart.leadership || 0,
        chart.management || 0,
        chart.problem_solving || 0
    ],

    backgroundColor:"rgba(168,85,247,.25)",

    borderColor:"#a855f7",

    borderWidth:3,

    pointBackgroundColor:[
        "#3b82f6",
        "#22c55e",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6"
    ],

    pointRadius:6

}]

},

       options:{
    responsive:true,
    maintainAspectRatio:false,

    animation:{
    duration:2000,
    easing:"easeOutQuart"
},

    interaction:{
        mode:'index',
        intersect:false
    },

    plugins:{
        legend:{
    display:false
},
        tooltip:{
            enabled:true,
            displayColors:true,
            backgroundColor:'#111827',
            titleColor:'#ffffff',
            bodyColor:'#ffffff',
            borderColor:'#3b82f6',
            borderWidth:1,
            padding:12
        }
    },

    scales:{
    r:{

        angleLines:{
            color:"rgba(255,255,255,.08)"
        },

        grid:{
            color:"rgba(255,255,255,.08)"
        },

        pointLabels:{
            color:"#ffffff",
            font:{
                size:13,
                weight:"bold"
            }
        },

        ticks:{
            display:false
        },

        suggestedMin:0,
        suggestedMax:100

    }
}
}
    });

    document.getElementById("skillsReason").textContent =
        chart.reason || "";

}


// ==========================================
// Global Demand
// ==========================================

function renderGlobalChart(chart){

    destroyChart(globalChart);

    const ctx=document
        .getElementById("globalDemandChart")
        .getContext("2d");

    globalChart=new Chart(ctx,{

        type:"bar",

        data:{

            labels:chart.countries || [],

            datasets:[{

    label:"Global Demand",

    data:chart.values || [],

    backgroundColor:[
        "#3b82f6",
        "#22c55e",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4"
    ],

    borderRadius:15,

    borderSkipped:false

}]

        },

        options:{
    responsive:true,
    maintainAspectRatio:false,

    animation:{
    duration:2000,
    easing:"easeOutQuart"
},

    interaction:{
        mode:'index',
        intersect:false
    },

    plugins:{
        legend:{
    display:false
},
        tooltip:{
            enabled:true,
            displayColors:true,
            backgroundColor:'#111827',
            titleColor:'#ffffff',
            bodyColor:'#ffffff',
            borderColor:'#3b82f6',
            borderWidth:1,
            padding:12
        }
    },

  scales:{
    r:{

        angleLines:{
            color:"rgba(255,255,255,.08)"
        },

        grid:{
            color:"rgba(255,255,255,.08)"
        },

        pointLabels:{
            color:"#ffffff",
            font:{
                size:13,
                weight:"bold"
            }
        },

        ticks:{
            display:false
        },

        suggestedMin:0,
        suggestedMax:100

    }
}
}

    });

    document.getElementById("globalReason").textContent =
        chart.reason || "";

}


// ==========================================
// Automation
// ==========================================

function renderAutomation(chart){

    document.getElementById("automationScore").textContent =
        chart.score || "--";

    document.getElementById("automationReason").textContent =
        chart.reason || "";

}
// ==========================================
// Lists
// ==========================================

function renderLists(data){

    populateList(
        "topCompanies",
        data.top_companies || []
    );

    populateList(
        "recommendedTools",
        data.recommended_tools || []
    );

    populateList(
        "certifications",
        data.certifications || []
    );

    populateList(
        "futureOpportunities",
        data.future_opportunities || []
    );

}


function populateList(id, items){

    const ul = document.getElementById(id);

    ul.innerHTML = "";

    if(!items.length){

        ul.innerHTML = "<li>No data available</li>";

        return;

    }

    items.forEach(item=>{

        const li = document.createElement("li");

        li.textContent = item;

        ul.appendChild(li);

    });

}


// ==========================================
// Career Timeline
// ==========================================

function renderTimeline(data){

    const container =
        document.getElementById("careerPath");

    container.innerHTML = "";

    const path = data.career_path || [];

    if(path.length===0){

        container.innerHTML =
            "<p>No career path available.</p>";

        return;

    }

    path.forEach((step,index)=>{

        const div = document.createElement("div");

        div.className = "timeline-step";

        div.innerHTML = `
            <h3>Step ${index+1}</h3>
            <p>${step}</p>
        `;

        container.appendChild(div);

    });

}


// ==========================================
// AI Advice
// ==========================================

function renderAdvice(data){

    const adviceContainer =
        document.getElementById("aiAdvice");

    adviceContainer.innerHTML = "";

    const advice = data.ai_advice || [];

    if(advice.length===0){

        adviceContainer.innerHTML =
            "<div class='advice-item'>No advice available.</div>";

        return;

    }

    advice.forEach(item=>{

        const div = document.createElement("div");

        div.className = "advice-item";

        div.textContent = item;

        adviceContainer.appendChild(div);

    });

}


// ==========================================
// Auto Fill Demo (Optional)
// Remove this block when using live data
// ==========================================

/*
careerInput.value = "AI Engineer";
countryInput.value = "India";
analyzeCareer();
*/