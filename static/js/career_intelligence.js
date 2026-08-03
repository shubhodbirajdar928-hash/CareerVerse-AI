// ==========================================
// Career Intelligence Dashboard
// ==========================================

const analyzeBtn = document.getElementById("analyzeBtn");
const careerInput = document.getElementById("career");
const countryInput = document.getElementById("country");
const dashboard = document.getElementById("dashboard");
const loading = document.getElementById("loading");

const futureRating = document.getElementById("futureRating");
const averageSalary = document.getElementById("averageSalary");
const confidence = document.getElementById("confidence");
const education = document.getElementById("education");
const overview = document.getElementById("overview");

if (analyzeBtn) {
    analyzeBtn.addEventListener("click", analyzeCareer);
}

async function analyzeCareer() {
    const career = careerInput.value.trim();
    const country = countryInput.value.trim() || "India";

    if (!career) {
        alert("Please enter a target career role.");
        return;
    }

    loading.classList.remove("hidden");
    dashboard.classList.add("hidden");

    try {
        const response = await fetch("/career-intelligence-api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ career, country })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to generate market intelligence report.");
        }

        loading.classList.add("hidden");
        dashboard.classList.remove("hidden");

        renderDashboard(data);

        // Smooth scroll to results
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        loading.classList.add("hidden");
        alert(error.message);
        console.error(error);
    }
}

function renderDashboard(data) {
    renderSummary(data);
    renderCharts(data);
    renderLists(data);
    renderTimeline(data);
    renderAdvice(data);
}

function renderSummary(data) {
    const summary = data.summary || {};
    futureRating.textContent = summary.future_rating || "--";
    averageSalary.textContent = summary.average_salary || "--";
    confidence.textContent = summary.confidence || "--";
    education.textContent = summary.education || "--";
    overview.textContent = summary.overview || "No market overview available.";

    const fresherEl = document.getElementById("fresherSalary");
    const midEl = document.getElementById("midSalary");
    const seniorEl = document.getElementById("seniorSalary");

    const isIndia = (countryInput?.value || "India").toLowerCase().includes("india") || (summary.average_salary || "").includes("₹");

    if (fresherEl) fresherEl.textContent = summary.fresher_salary && summary.fresher_salary !== "--" ? summary.fresher_salary : (isIndia ? "₹5L - ₹9L / yr" : "$65,000 - $90,000 / yr");
    if (midEl) midEl.textContent = summary.mid_salary && summary.mid_salary !== "--" ? summary.mid_salary : (isIndia ? "₹12L - ₹22L / yr" : "$110,000 - $155,000 / yr");
    if (seniorEl) seniorEl.textContent = summary.senior_salary && summary.senior_salary !== "--" ? summary.senior_salary : (isIndia ? "₹25L - ₹48L / yr" : "$165,000 - $250,000 / yr");
}

// Chart Instances
let demandChart = null;
let salaryChart = null;
let competitionChart = null;
let technologyChart = null;
let skillsChart = null;
let globalChart = null;

function destroyChart(chart) {
    if (chart) {
        chart.destroy();
    }
}

// Standard Dark Theme Options for Cartesian Charts (Line & Bar)
const commonCartesianOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 1200,
        easing: "easeOutQuart"
    },
    interaction: {
        mode: 'index',
        intersect: false
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true,
            backgroundColor: '#141414',
            titleColor: '#ffffff',
            bodyColor: '#a3a3a3',
            borderColor: '#facc15',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8
        }
    },
    scales: {
        x: {
            grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false },
            ticks: { color: "#a3a3a3", font: { size: 11 } }
        },
        y: {
            grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false },
            ticks: { color: "#a3a3a3", font: { size: 11 } },
            beginAtZero: true
        }
    }
};

function renderCharts(data) {
    const charts = data.charts || {};
    renderDemandChart(charts.career_demand || {});
    renderSalaryChart(charts.salary_growth || {});
    renderCompetitionChart(charts.competition || {});
    renderTechnologyChart(charts.technology || {});
    renderSkillsChart(charts.skills || {});
    renderGlobalChart(charts.global_demand || {});
    renderAutomation(charts.automation || {});
}

// 1. Demand Chart (Gold Line)
function renderDemandChart(chart) {
    destroyChart(demandChart);
    const canvas = document.getElementById("careerDemandChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    demandChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: chart.labels || [],
            datasets: [{
                label: "Demand Index",
                data: chart.values || [],
                borderColor: "#facc15",
                borderWidth: 3,
                backgroundColor: (context) => {
                    const chartArea = context.chart.chartArea;
                    if (!chartArea) return "rgba(250, 204, 21, 0.1)";
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, "rgba(250, 204, 21, 0.4)");
                    gradient.addColorStop(1, "rgba(250, 204, 21, 0.02)");
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#facc15",
                pointBorderColor: "#0a0a0a",
                pointRadius: 4,
                pointHoverRadius: 7
            }]
        },
        options: commonCartesianOptions
    });

    const reasonEl = document.getElementById("careerDemandReason");
    if (reasonEl) reasonEl.textContent = chart.reason || "";
}

// 2. Salary Growth Chart (Green Bar)
function renderSalaryChart(chart) {
    destroyChart(salaryChart);
    const canvas = document.getElementById("salaryGrowthChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    salaryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: chart.labels || [],
            datasets: [{
                label: "Salary Index",
                data: chart.values || [],
                backgroundColor: "#22c55e",
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: commonCartesianOptions
    });

    const reasonEl = document.getElementById("salaryReason");
    if (reasonEl) reasonEl.textContent = chart.reason || "";
}

// 3. Competition Chart (Red Line)
function renderCompetitionChart(chart) {
    destroyChart(competitionChart);
    const canvas = document.getElementById("competitionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    competitionChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: chart.labels || [],
            datasets: [{
                label: "Competition Index",
                data: chart.values || [],
                borderColor: "#f43f5e",
                borderWidth: 3,
                backgroundColor: "rgba(244, 63, 94, 0.15)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#f43f5e",
                pointBorderColor: "#0a0a0a",
                pointRadius: 4
            }]
        },
        options: commonCartesianOptions
    });

    const reasonEl = document.getElementById("competitionReason");
    if (reasonEl) reasonEl.textContent = chart.reason || "";
}

// 4. Technology Chart (Teal Line)
function renderTechnologyChart(chart) {
    destroyChart(technologyChart);
    const canvas = document.getElementById("technologyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    technologyChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: chart.labels || [],
            datasets: [{
                label: "Tech Adoption %",
                data: chart.values || [],
                borderColor: "#06b6d4",
                borderWidth: 3,
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#06b6d4",
                pointBorderColor: "#0a0a0a",
                pointRadius: 4
            }]
        },
        options: commonCartesianOptions
    });

    const reasonEl = document.getElementById("technologyReason");
    if (reasonEl) reasonEl.textContent = chart.reason || "";
}

// 5. Skills Radar Chart
function renderSkillsChart(chart) {
    destroyChart(skillsChart);
    const canvas = document.getElementById("skillsChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    skillsChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["Technical", "Communication", "Leadership", "Management", "Problem Solving"],
            datasets: [{
                label: "Skill Weight",
                data: [
                    chart.technical || 70,
                    chart.communication || 60,
                    chart.leadership || 50,
                    chart.management || 55,
                    chart.problem_solving || 80
                ],
                backgroundColor: "rgba(250, 204, 21, 0.2)",
                borderColor: "#facc15",
                borderWidth: 2,
                pointBackgroundColor: "#facc15",
                pointBorderColor: "#0a0a0a",
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1200 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#141414',
                    titleColor: '#ffffff',
                    bodyColor: '#a3a3a3',
                    borderColor: '#facc15',
                    borderWidth: 1
                }
            },
            scales: {
                r: {
                    angleLines: { color: "rgba(255, 255, 255, 0.1)" },
                    grid: { color: "rgba(255, 255, 255, 0.08)" },
                    pointLabels: {
                        color: "#f5f5f5",
                        font: { size: 10, weight: "600" }
                    },
                    ticks: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });

    const reasonEl = document.getElementById("skillsReason");
    if (reasonEl) reasonEl.textContent = chart.reason || "";
}

// 6. Global Demand Chart (Purple Bar)
function renderGlobalChart(chart) {
    destroyChart(globalChart);
    const canvas = document.getElementById("globalDemandChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    globalChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: chart.countries || chart.labels || [],
            datasets: [{
                label: "Global Demand Index",
                data: chart.values || [],
                backgroundColor: "#a855f7",
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: commonCartesianOptions
    });

    const reasonEl = document.getElementById("globalReason");
    if (reasonEl) reasonEl.textContent = chart.reason || "";
}

// 7. Automation Risk
function renderAutomation(chart) {
    const scoreEl = document.getElementById("automationScore");
    const reasonEl = document.getElementById("automationReason");
    if (scoreEl) scoreEl.textContent = chart.score || "--";
    if (reasonEl) reasonEl.textContent = chart.reason || "";
}

// 8. Lists & Timeline
function renderLists(data) {
    populateList("topCompanies", data.top_companies || []);
    populateList("recommendedTools", data.recommended_tools || []);
    populateList("certifications", data.certifications || []);
    populateList("futureOpportunities", data.future_opportunities || []);
}

function populateList(id, items) {
    const ul = document.getElementById(id);
    if (!ul) return;
    ul.innerHTML = "";

    if (!items || !items.length) {
        ul.innerHTML = "<li>No data available</li>";
        return;
    }

    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
    });
}

function renderTimeline(data) {
    const container = document.getElementById("careerPath");
    if (!container) return;
    container.innerHTML = "";

    const path = data.career_path || [];

    if (!path.length) {
        container.innerHTML = "<p>No career path available.</p>";
        return;
    }

    path.forEach((step, index) => {
        const div = document.createElement("div");
        div.className = "timeline-step";
        div.innerHTML = `
            <h3>Step ${index + 1}</h3>
            <p>${step}</p>
        `;
        container.appendChild(div);
    });
}

function renderAdvice(data) {
    const adviceContainer = document.getElementById("aiAdvice");
    if (!adviceContainer) return;
    adviceContainer.innerHTML = "";

    const advice = data.ai_advice || [];

    if (!advice.length) {
        adviceContainer.innerHTML = "<div class='advice-item'>No specific advice available.</div>";
        return;
    }

    advice.forEach(item => {
        const div = document.createElement("div");
        div.className = "advice-item";
        div.textContent = item;
        adviceContainer.appendChild(div);
    });
}