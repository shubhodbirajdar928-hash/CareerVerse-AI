// ==========================================
// CareerVerse AI - generate.js
// ==========================================

const generateBtn = document.getElementById("generateBtn");
const careerInput = document.getElementById("careerInput");
const countryInput = document.getElementById("countryInput");
const resultCard = document.getElementById("resultCard");
const downloadBtn = document.getElementById("downloadBtn");


// Auto-trigger from URL parameters (e.g. /generate?role=AI+Engineer)
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get("role") || urlParams.get("career");
    if (roleParam && careerInput) {
        careerInput.value = roleParam;
        generateBtn.click();
    }
});

const VALID_ACRONYMS = [
    "ai", "ml", "ui", "ux", "hr", "pr", "it", "qa", "seo", "sre", "cto", "ceo", "cfo", "vp", "dba", "erp", "crm", "bi", "ar", "vr", "3d", "2d", "5g", "cad", "gis", "pm", "dev", "ops", "sec", "mlops", "devops", "secops", "web3", "web2", "ios", "nlp", "llm", "genai", "c++", "c#", ".net",
    "mbbs", "bds", "bams", "bhms", "bpt", "mch", "dnb", "bums", "brms", "md", "ms", "frcs", "mrcp", "mrcs", "pharmd", "gnm", "anm",
    "llb", "llm", "bcl", "aibe", "clat",
    "ias", "ips", "ifs", "irs", "upsc", "nda", "cds", "afcat", "ssc", "psc", "gpsc", "mpsc", "uppsc", "bpsc",
    "cpl", "atpl", "ppl", "dgca", "faa",
    "ca", "cfa", "cpa", "cfp", "cma", "acca", "cs", "frm",
    "btech", "mtech", "bca", "mca", "bba", "mba", "bsc", "msc", "phd", "bed", "med", "bdes", "mdes", "barch", "march"
];

const QWERTY_PATTERNS = [
    "qwertyuiop", "poiuytrewq", "asdfghjkl", "lkjhgfdsa", "zxcvbnm", "mnbvcxz",
    "qazwsx", "edcrfv", "tgbnhy", "ujmiko", "olp", "zaq", "xsw", "cde", "vfr", "bgt", "nhy", "mju", "lki", "plo",
    "1234567890", "0987654321"
];

const CAREER_KEYWORDS = new Set([
    // Engineering & Technology
    "engineer", "developer", "architect", "designer", "manager", "analyst", "consultant", "specialist",
    "lead", "administrator", "director", "officer", "scientist", "researcher", "coder", "programmer",
    "software", "web", "fullstack", "frontend", "backend", "cloud", "data", "ai", "ml", "machine",
    "learning", "cybersecurity", "network", "system", "database", "devops", "sre", "ui", "ux",
    "product", "project", "scrum", "agile", "qa", "tester", "security", "sysadmin", "infrastructure",
    "robotics", "embedded", "firmware", "mechatronics", "telecom", "hardware", "bioinformatics",

    // Healthcare, Medicine & Life Sciences
    "doctor", "physician", "surgeon", "nurse", "pharmacist", "therapist", "dentist", "psychiatrist",
    "psychologist", "counselor", "paramedic", "optometrist", "radiologist", "pathologist", "pediatrician",
    "dermatologist", "cardiologist", "neurologist", "oncologist", "veterinarian", "biologist", "chemist",
    "physicist", "microbiologist", "geneticist", "biochemist", "epidemiologist", "pharmacologist",
    "medical", "clinical", "nursing", "healthcare", "pharma", "biotech", "nutritionist", "dietitian",

    // Business, Finance, Law & Executive
    "accountant", "auditor", "lawyer", "attorney", "paralegal", "judge", "advocate", "solicitor",
    "banker", "trader", "investor", "broker", "underwriter", "actuary", "economist", "statistician",
    "mathematician", "evaluator", "appraiser", "hr", "recruiter", "founder", "ceo", "cto", "cfo",
    "coo", "cmo", "cio", "vp", "head", "executive", "administrator", "officer", "supervisor",
    "business", "sales", "marketing", "finance", "accounting", "banking", "insurance", "realestate",
    "realtor", "consulting", "strategy", "operations", "supply", "chain", "logistics", "procurement",

    // Education, Academia & Research
    "teacher", "professor", "instructor", "tutor", "lecturer", "educator", "principal", "dean",
    "academic", "scholar", "historian", "archaeologist", "anthropologist", "sociologist", "geologist",
    "astronomer", "meteorologist", "oceanographer", "philosopher", "linguist", "translator", "interpreter",

    // Media, Arts, Entertainment & Sports
    "artist", "animator", "illustrator", "painter", "sculptor", "designer", "photographer", "videographer",
    "filmmaker", "director", "producer", "editor", "cinematographer", "actor", "actress", "model",
    "musician", "composer", "singer", "dancer", "choreographer", "writer", "author", "journalist",
    "reporter", "copywriter", "content", "creator", "influencer", "streamer", "gamer",
    "athlete", "coach", "trainer", "referee", "sports", "fitness", "physiotherapist",

    // Architecture, Construction, Trades & Skilled Crafts
    "builder", "contractor", "carpenter", "electrician", "plumber", "welder", "machinist", "mechanic",
    "technician", "mason", "painter", "roofer", "glazier", "surveyor", "drafteur", "interior",
    "landscape", "craftsman", "artisan", "blacksmith", "jeweler", "tailor", "fashion",

    // Service, Culinary, Hospitality & Aviation/Maritime
    "chef", "cook", "baker", "barista", "sommelier", "waiter", "waitress", "bartender", "hotelier",
    "concierge", "pilot", "captain", "copilot", "navigator", "sailor", "mariner", "flight",
    "attendant", "steward", "driver", "chauffeur", "conductor", "dispatcher", "logistics",

    // Government, Public Safety, Agriculture & Environment
    "policeman", "detective", "firefighter", "soldier", "officer", "investigator", "inspector",
    "civil", "servant", "diplomat", "politician", "mayor", "governor", "ranger", "forester",
    "farmer", "agronomist", "botanist", "zoologist", "ecologist", "environmental", "conservationist",

    // General Role Standard Terms
    "lead", "senior", "junior", "principal", "chief", "head", "associate", "intern", "trainee",
    "freelancer", "consultant", "expert", "practitioner", "agent", "advisor", "coordinator",
    "planner", "strategist", "analyst", "specialist"
]);

const REAL_WORLD_COUNTRIES = new Set([
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
]);

function isQwertyMashing(text) {
    const clean = (text || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length < 3) return false;
    for (let i = 0; i <= clean.length - 4; i++) {
        const sub = clean.substring(i, i + 4);
        if (QWERTY_PATTERNS.some(p => p.includes(sub))) {
            return true;
        }
    }
    return false;
}

function validateUserInput(career, country) {
    const cleanCareer = (career || "").trim().toLowerCase();
    const cleanCountry = (country || "").trim().toLowerCase();

    if (!cleanCareer) {
        return { valid: false, message: "⚠️ Please enter a career title." };
    }

    if (cleanCareer.length < 2) {
        return { valid: false, message: "⚠️ Career title is too short. Please enter a valid job title (at least 2 characters)." };
    }

    if (/^\d+$/.test(cleanCareer)) {
        return { valid: false, message: "⚠️ Invalid Career Title: Pure numbers are not allowed. Please enter a valid job title (e.g. 'Software Engineer', 'Data Scientist')." };
    }

    if (/^[^\w\s\+\#\.\/-]+$/.test(cleanCareer)) {
        return { valid: false, message: "⚠️ Career title contains invalid symbols. Please enter a real job title." };
    }

    if (isQwertyMashing(cleanCareer)) {
        return { valid: false, message: `⚠️ '${career}' appears to be keyboard mashing. Please enter a real job title (e.g. 'Software Engineer').` };
    }

    const words = cleanCareer.match(/[a-z0-9\+\#]+/g) || [];
    const ROLE_SUFFIXES = [
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
    ];

    for (const word of words) {
        if (VALID_ACRONYMS.includes(word) || /^\d+[a-z]?$/.test(word)) {
            continue;
        }

        if (word.length >= 3 && !/[aeiouy]/.test(word)) {
            return { valid: false, message: `⚠️ '${career}' contains unrecognized word patterns. Please check your spelling.` };
        }

        if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(word) && !word.includes("blockchain") && !word.includes("architect") && !word.includes("strength")) {
            return { valid: false, message: `⚠️ '${career}' contains invalid character combinations.` };
        }

        if (/(.)\1{3,}/.test(word)) {
            return { valid: false, message: `⚠️ '${career}' contains invalid repeating characters.` };
        }
    }

    if (!words.length) {
        return { valid: false, message: `⚠️ '${career}' is an unrecognized job title. Please enter a real career role.` };
    }

    if (cleanCountry) {
        if (/\d/.test(cleanCountry)) {
            return { valid: false, message: "⚠️ Country name cannot contain numbers. Please enter a valid country name (e.g. India, USA, Germany)." };
        }

        const isCountryValid = REAL_WORLD_COUNTRIES.has(cleanCountry) || Array.from(REAL_WORLD_COUNTRIES).some(c => cleanCountry.includes(c));
        if (!isCountryValid) {
            return { valid: false, message: `⚠️ Invalid Country: '${country}' is not a recognized world country. Please enter a valid country name (e.g. India, USA, Germany, UK, Canada).` };
        }
    }

    return { valid: true };
}

// ==========================================
// Salary & Currency Formatters
// ==========================================

function formatIndiaSalary(rawSal, fallback = "₹6.5L - ₹18.0L / yr") {
    if (!rawSal) return fallback;
    const str = String(rawSal);
    if (str.includes("₹") || str.toLowerCase().includes("lpa") || str.toLowerCase().includes("lakh") || str.toLowerCase().includes("l ")) {
        return str;
    }
    return fallback;
}

const COUNTRY_CONFIG_MAP = {
    "india": { flag: "🇮🇳", name: "India", symbol: "₹", defaultSal: "₹6.5L - ₹22.0L / yr" },
    "united states": { flag: "🇺🇸", name: "USA", symbol: "$", defaultSal: "$70,000 - $160,000 / yr" },
    "usa": { flag: "🇺🇸", name: "USA", symbol: "$", defaultSal: "$70,000 - $160,000 / yr" },
    "us": { flag: "🇺🇸", name: "USA", symbol: "$", defaultSal: "$70,000 - $160,000 / yr" },
    "united kingdom": { flag: "🇬🇧", name: "UK", symbol: "£", defaultSal: "£32,000 - £85,000 / yr" },
    "uk": { flag: "🇬🇧", name: "UK", symbol: "£", defaultSal: "£32,000 - £85,000 / yr" },
    "germany": { flag: "🇩🇪", name: "Germany", symbol: "€", defaultSal: "€42,000 - €95,000 / yr" },
    "france": { flag: "🇫🇷", name: "France", symbol: "€", defaultSal: "€40,000 - €90,000 / yr" },
    "netherlands": { flag: "🇳🇱", name: "Netherlands", symbol: "€", defaultSal: "€45,000 - €98,000 / yr" },
    "spain": { flag: "🇪🇸", name: "Spain", symbol: "€", defaultSal: "€35,000 - €75,000 / yr" },
    "italy": { flag: "🇮🇹", name: "Italy", symbol: "€", defaultSal: "€32,000 - €70,000 / yr" },
    "canada": { flag: "🇨🇦", name: "Canada", symbol: "CA$", defaultSal: "CA$55,000 - CA$125,000 / yr" },
    "australia": { flag: "🇦🇺", name: "Australia", symbol: "A$", defaultSal: "A$65,000 - A$140,000 / yr" },
    "uae": { flag: "🇦🇪", name: "UAE / Dubai", symbol: "AED", defaultSal: "AED 12,000 - AED 35,000 / mo" },
    "dubai": { flag: "🇦🇪", name: "Dubai", symbol: "AED", defaultSal: "AED 12,000 - AED 35,000 / mo" },
    "saudi arabia": { flag: "🇸🇦", name: "Saudi Arabia", symbol: "SAR", defaultSal: "SAR 10,000 - SAR 28,000 / mo" },
    "singapore": { flag: "🇸🇬", name: "Singapore", symbol: "S$", defaultSal: "S$48,000 - S$115,000 / yr" },
    "japan": { flag: "🇯🇵", name: "Japan", symbol: "¥", defaultSal: "¥4,500,000 - ¥10,500,000 / yr" },
    "south korea": { flag: "🇰🇷", name: "South Korea", symbol: "₩", defaultSal: "₩38,000,000 - ₩95,000,000 / yr" },
    "switzerland": { flag: "🇨🇭", name: "Switzerland", symbol: "CHF", defaultSal: "CHF 75,000 - CHF 150,000 / yr" },
    "brazil": { flag: "🇧🇷", name: "Brazil", symbol: "R$", defaultSal: "R$ 5,500 - R$ 18,000 / mo" },
    "mexico": { flag: "🇲🇽", name: "Mexico", symbol: "MEX$", defaultSal: "MEX$ 18,000 - MEX$ 65,000 / mo" },
    "south africa": { flag: "🇿🇦", name: "South Africa", symbol: "R", defaultSal: "R 22,000 - R 68,000 / mo" },
    "nigeria": { flag: "🇳🇬", name: "Nigeria", symbol: "₦", defaultSal: "₦ 350,000 - ₦ 1,200,000 / mo" },
    "pakistan": { flag: "🇵🇰", name: "Pakistan", symbol: "PKR", defaultSal: "PKR 85,000 - PKR 280,000 / mo" }
};

function getCountrySalaryInfo(country, rawSalary) {
    const cLow = (country || "").toLowerCase().trim();
    for (const [key, cfg] of Object.entries(COUNTRY_CONFIG_MAP)) {
        if (cLow.includes(key)) {
            if (rawSalary && (rawSalary.includes(cfg.symbol) || rawSalary.includes(cfg.name))) {
                return { flag: cfg.flag, name: cfg.name, salary: rawSalary };
            }
            return { flag: cfg.flag, name: cfg.name, salary: cfg.defaultSal };
        }
    }

    const displayName = country ? country.trim() : "USA / Global";
    const displayFlag = country ? "🌐" : "🇺🇸";
    const salaryVal = (rawSalary && (rawSalary.includes("$") || rawSalary.includes("€") || rawSalary.includes("£") || rawSalary.includes("₹"))) 
        ? rawSalary 
        : "$70,000 - $160,000 / yr";

    return { flag: displayFlag, name: displayName, salary: salaryVal };
}

function renderPayBandCard(salaryData, targetSalInfo, country) {
    const cLow = (country || "").toLowerCase().trim();
    const isIndia = cLow.includes("india") || !cLow;
    const flag = targetSalInfo.flag || (isIndia ? "🇮🇳" : "🌐");
    const countryName = targetSalInfo.name || (country ? country.trim() : "Target Market");
    
    let fresher = "Data unavailable";
    let mid = "Data unavailable";
    let senior = "Data unavailable";

    if (salaryData && typeof salaryData === "object") {
        fresher = salaryData.fresher || salaryData.india_fresher || salaryData.country_fresher || "Data unavailable";
        mid = salaryData.mid || salaryData.india_mid || salaryData.country_mid || "Data unavailable";
        senior = salaryData.senior || salaryData.india_senior || salaryData.country_senior || "Data unavailable";
    } else if (salaryData && typeof salaryData === "string") {
        const parts = salaryData.split("->").map(p => p.replace(/\((Fresher|Mid|Senior)\)/gi, "").trim());
        if (parts.length >= 3) {
            fresher = parts[0];
            mid = parts[1];
            senior = parts[2];
        } else if (parts.length === 1 && parts[0]) {
            fresher = parts[0];
        }
    }

    if (!fresher || fresher === "--") fresher = "Data unavailable";
    if (!mid || mid === "--") mid = "Data unavailable";
    if (!senior || senior === "--") senior = "Data unavailable";

    return `
    <div style="margin-top: 22px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
            <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-heading); display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.25rem;">${flag}</span> ${countryName} Official Compensation Pay Band
            </span>
            <span style="background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 0.72rem; padding: 3px 10px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-circle-check"></i> Industry Verified
            </span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
            <div style="background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 14px; text-align: center;">
                <span style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">🌱 Entry Level / Fresher</span>
                <h4 style="color: #22c55e; font-size: 1.05rem; margin: 6px 0 0; font-weight: 800;">${fresher}</h4>
            </div>
            <div style="background: rgba(250, 204, 21, 0.06); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 12px; padding: 14px; text-align: center;">
                <span style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">⚡ Mid-Level Professional</span>
                <h4 style="color: var(--accent); font-size: 1.05rem; margin: 6px 0 0; font-weight: 800;">${mid}</h4>
            </div>
            <div style="background: rgba(168, 85, 247, 0.06); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 14px; text-align: center;">
                <span style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">👑 Senior / Lead Specialist</span>
                <h4 style="color: #a855f7; font-size: 1.05rem; margin: 6px 0 0; font-weight: 800;">${senior}</h4>
            </div>
        </div>
    </div>
    `;
}

function getFresherSalary(market, country) {
    const c = (country || "").toLowerCase().trim();
    if (market.salary?.fresher) return market.salary.fresher;
    if (c.includes("india")) return "₹4.5L - ₹8.0L / yr";
    if (c.includes("uk")) return "£30,000 - £45,000 / yr";
    if (c.includes("germany") || c.includes("france")) return "€40,000 - €55,000 / yr";
    return "$60,000 - $85,000 / yr";
}

function getMidSalary(market, country) {
    const c = (country || "").toLowerCase().trim();
    if (market.salary?.mid) return market.salary.mid;
    if (c.includes("india")) return "₹8.0L - ₹18.0L / yr";
    if (c.includes("uk")) return "£45,000 - £75,000 / yr";
    if (c.includes("germany") || c.includes("france")) return "€55,000 - €80,000 / yr";
    return "$85,000 - $140,000 / yr";
}

function getSeniorSalary(market, country) {
    const c = (country || "").toLowerCase().trim();
    if (market.salary?.senior) return market.salary.senior;
    if (c.includes("india")) return "₹18.0L - ₹35.0L / yr";
    if (c.includes("uk")) return "£75,000 - £120,000 / yr";
    if (c.includes("germany") || c.includes("france")) return "€80,000 - €130,000 / yr";
    return "$140,000 - $220,000 / yr";
}

// ==========================================
// Generate Roadmap Global Handler
// ==========================================

async function generateRoadmapNow() {
    const careerInputEl = document.getElementById("careerInput");
    const countryInputEl = document.getElementById("countryInput");
    const durationInputEl = document.getElementById("duration");
    const resultCardEl = document.getElementById("resultCard");
    const generateBtnEl = document.getElementById("generateBtn");

    if (!careerInputEl || !resultCardEl) return;

    const career = careerInputEl.value.trim();
    const country = countryInputEl ? countryInputEl.value.trim() : "";
    const duration = durationInputEl ? durationInputEl.value.trim() : "6 months";

    const val = validateUserInput(career, country);
    if (!val.valid) {
        resultCardEl.innerHTML = `
            <div class="roadmap-item error-card" style="border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.06); padding: 28px; border-radius: 16px; margin-top: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 1.6rem; color: #ef4444;"></i>
                    <h3 style="color: var(--text-heading); margin: 0; font-size: 1.2rem;">Invalid Input Warning</h3>
                </div>
                <p style="color: var(--text-primary); font-size: 0.96rem; line-height: 1.6; margin-bottom: 18px;">${val.message}</p>
                <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 14px 18px; border-radius: 10px; font-size: 0.86rem; color: var(--text-secondary);">
                    💡 <strong>Suggested Careers:</strong> <code>Software Engineer</code>, <code>AI Engineer</code>, <code>Data Scientist</code>, <code>Cybersecurity Specialist</code>
                </div>
            </div>
        `;
        resultCardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    if (generateBtnEl) {
        generateBtnEl.disabled = true;
        generateBtnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating Roadmap...`;
    }

    // Loading Screen
    resultCardEl.innerHTML = `
<div class="loading-card">
    <div class="ai-loader"></div>
    <h2>🤖 CareerVerse AI is Working...</h2>
    <div class="loading-steps">
        <p id="loadingText">🧠 Analyzing Career...</p>
    </div>
</div>
`;
    resultCardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

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

        const responseData = await response.json();

        if (generateBtnEl) {
            generateBtnEl.disabled = false;
            generateBtnEl.innerHTML = `<i class="fa-solid fa-route"></i> Generate AI Roadmap`;
        }

        if (!response.ok || responseData.success === false) {
            clearInterval(loadingInterval);
            resultCardEl.innerHTML = `
                <div class="roadmap-item error-card" style="border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.08); padding: 26px; border-radius: 16px; margin-top: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <i class="fa-solid fa-circle-exclamation" style="font-size: 1.6rem; color: #ef4444;"></i>
                        <h3 style="color: var(--text-heading); margin: 0; font-size: 1.2rem;">Roadmap Generation Error</h3>
                    </div>
                    <p style="color: var(--text-primary); font-size: 0.96rem; line-height: 1.6;">${responseData.error || "Unable to generate roadmap. Please enter a valid job title."}</p>
                </div>
            `;
            return;
        }

        const data = responseData.data || responseData;
        window.currentRoadmap = data;
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
        const targetSalInfo = getCountrySalaryInfo(country, overview.salary?.country || overview.salary?.usa);

        // -----------------------------
        // Start HTML
        // -----------------------------

        let html = `
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
    <h2><i class="fa-solid fa-book-open"></i> Career Overview & Market Scope</h2>
    <p style="font-size: 1rem; line-height: 1.7; margin-bottom: 20px;">${overview.description || "Comprehensive professional career breakdown."}</p>

    <!-- AI Automation & Disruption Risk Meter -->
    <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.9rem; font-weight: 700; color: #3b82f6;"><i class="fa-solid fa-robot"></i> AI Disruption & Automation Risk Index</span>
            <span style="font-size: 0.85rem; font-weight: 800; color: #22c55e;">Low Risk (~12%) • High Human Judgement & Empathy Needed</span>
        </div>
        <div style="background: rgba(255,255,255,0.08); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="width: 12%; height: 100%; background: linear-gradient(90deg, #22c55e, #3b82f6);"></div>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
            <h3 style="margin-top: 0; color: var(--accent);"><i class="fa-solid fa-user-graduate"></i> Education & Path</h3>
            <p style="font-size: 0.92rem; margin: 0;">${overview.education || "Bachelor's Degree in STEM / Portfolio Proof"}</p>
        </div>
        <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
            <h3 style="margin-top: 0; color: #22c55e;"><i class="fa-solid fa-chart-line"></i> 5-Year Future Trajectory</h3>
            <p style="font-size: 0.92rem; margin: 0;">${overview.future_scope || "High demand across global hubs."}</p>
        </div>
    </div>

    <!-- Past, Present & Future Timeline Reason Card -->
    <div style="background: rgba(250, 204, 21, 0.03); border: 1px solid rgba(250, 204, 21, 0.25); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: var(--accent); font-size: 1rem; margin-bottom: 14px;"><i class="fa-solid fa-hourglass-half"></i> Past, Present & Future Macro Market Evolution</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
            <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 12px; padding: 14px;">
                <span style="font-size: 0.75rem; color: #3b82f6; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">📜 PAST (10-Yr Evolution)</span>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${(overview.macro_evolution?.past || `Historically, ${data.career || career} relied on manual execution, legacy tools, and localized workflows with minimal automation.`)}</p>
            </div>
            <div style="background: rgba(250, 204, 21, 0.05); border: 1px solid rgba(250, 204, 21, 0.25); border-radius: 12px; padding: 14px;">
                <span style="font-size: 0.75rem; color: var(--accent); font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">⚡ PRESENT (Current Realities)</span>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${(overview.macro_evolution?.present || `Currently in high demand driven by digital transformation, modern tech stacks, and cloud integration across global hiring hubs.`)}</p>
            </div>
            <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 12px; padding: 14px;">
                <span style="font-size: 0.75rem; color: #22c55e; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">🚀 FUTURE (5-10 Yr Scope)</span>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${(overview.macro_evolution?.future || `Over the next decade, AI co-pilots will eliminate routine work, elevating specialists into strategic decision-makers with top-tier earning potential.`)}</p>
            </div>
        </div>
    </div>

    <h3><i class="fa-solid fa-layer-group"></i> Top 5 Career Progression Roles</h3>
    <div class="chip-grid">
        ${(overview.roles || []).map(r => `<span class="chip-item">👔 ${r}</span>`).join("")}
    </div>

    ${renderPayBandCard(overview.salary, targetSalInfo, country)}
</div>

<!-- ================= SKILLS ================= -->

<div class="roadmap-item">
    <h2><i class="fa-solid fa-code"></i> Interactive Skill Checklist Matrix (Top 5 Per Level)</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div style="background: rgba(34, 197, 94, 0.04); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 18px;">
            <h3 style="color: #22c55e; margin-top: 0;"><i class="fa-solid fa-seedling"></i> Beginner</h3>
            <ul style="gap: 8px;">
                ${(skills.beginner || []).map(s => `<li style="border-color: rgba(34, 197, 94, 0.2); font-size: 0.86rem; display: flex; align-items: center; gap: 8px;"><input type="checkbox" style="accent-color: #22c55e; width: 15px; height: 15px; cursor: pointer;"> <span>${s}</span></li>`).join("")}
            </ul>
        </div>
        <div style="background: rgba(250, 204, 21, 0.04); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 14px; padding: 18px;">
            <h3 style="color: var(--accent); margin-top: 0;"><i class="fa-solid fa-gears"></i> Intermediate</h3>
            <ul style="gap: 8px;">
                ${(skills.intermediate || []).map(s => `<li style="border-color: rgba(250, 204, 21, 0.2); font-size: 0.86rem; display: flex; align-items: center; gap: 8px;"><input type="checkbox" style="accent-color: var(--accent); width: 15px; height: 15px; cursor: pointer;"> <span>${s}</span></li>`).join("")}
            </ul>
        </div>
        <div style="background: rgba(168, 85, 247, 0.04); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 18px;">
            <h3 style="color: #a855f7; margin-top: 0;"><i class="fa-solid fa-shield-halved"></i> Advanced</h3>
            <ul style="gap: 8px;">
                ${(skills.advanced || []).map(s => `<li style="border-color: rgba(168, 85, 247, 0.2); font-size: 0.86rem; display: flex; align-items: center; gap: 8px;"><input type="checkbox" style="accent-color: #a855f7; width: 15px; height: 15px; cursor: pointer;"> <span>${s}</span></li>`).join("")}
            </ul>
        </div>
    </div>
</div>

<!-- ================= ROADMAP TIMELINE ================= -->

<div class="roadmap-item">
    <h2><i class="fa-solid fa-route"></i> Step-by-Step Monthly Execution Roadmap</h2>
    <div style="display: flex; flex-direction: column; gap: 16px;">
        ${roadmap.map((month, idx) => `
            <div class="phase-card">
                <div class="phase-header">
                    <span class="phase-badge">${month.month || `Month ${idx + 1}`}</span>
                    <strong style="color: var(--text-heading); font-size: 1.05rem;">${month.title || `Phase ${idx + 1}: Core Development`}</strong>
                </div>
                <h4 style="font-size: 0.88rem; color: var(--accent); margin: 0 0 10px; font-weight: 700;">🧠 Core Tech Topics to Master:</h4>
                <ul style="margin-bottom: 14px; gap: 6px;">
                    ${(month.topics || []).map(topic => `<li style="font-size: 0.88rem; padding: 8px 14px;">⚡ ${topic}</li>`).join("")}
                </ul>
                ${month.project ? `
                    <div style="background: rgba(250, 204, 21, 0.06); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 10px; padding: 10px 14px; margin-bottom: 10px;">
                        <strong style="color: var(--accent); font-size: 0.86rem;">💼 Month Project:</strong>
                        <span style="color: var(--text-primary); font-size: 0.86rem;"> ${month.project}</span>
                    </div>
                ` : ''}
                ${month.goal ? `
                    <div style="background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 10px 14px;">
                        <strong style="color: #22c55e; font-size: 0.86rem;">🎯 Phase Goal:</strong>
                        <span style="color: var(--text-primary); font-size: 0.86rem;"> ${month.goal}</span>
                    </div>
                ` : ''}
            </div>
        `).map(item => item).join("")}
    </div>
</div>

<!-- ================= LEARNING RESOURCES ================= -->

<div class="roadmap-item">
    <h2><i class="fa-solid fa-graduation-cap"></i> Curated Learning Resources (Top 5 Per Category)</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
            <h3><i class="fa-brands fa-youtube" style="color: #ef4444;"></i> Top 5 Authentic YouTube Channels</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${(resources.youtube || []).map(item => `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="resource-link" style="display: flex; justify-content: space-between; align-items: center; text-decoration: none;">
                        <span><i class="fa-brands fa-youtube" style="color: #ef4444; margin-right: 6px;"></i> ${item.name}</span>
                        <span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-circle-check"></i> Verified
                        </span>
                    </a>
                `).join("")}
            </div>
        </div>
        <div>
            <h3><i class="fa-solid fa-certificate" style="color: var(--accent);"></i> Top 5 Courses & Bootcamps</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${(resources.courses || []).map(item => `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="resource-link" style="display: flex; justify-content: space-between; align-items: center; text-decoration: none;">
                        <span>🎓 ${item.name}</span>
                        <span style="background: rgba(250, 204, 21, 0.15); color: var(--accent); border: 1px solid rgba(250, 204, 21, 0.4); font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-circle-check"></i> Verified
                        </span>
                    </a>
                `).join("")}
            </div>
        </div>
        <div>
            <h3><i class="fa-solid fa-file-code" style="color: #3b82f6;"></i> Top 5 Official Docs</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${(resources.documentation || []).map(item => `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="resource-link" style="display: flex; justify-content: space-between; align-items: center; text-decoration: none;">
                        <span>📄 ${item.name}</span>
                        <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-circle-check"></i> Verified
                        </span>
                    </a>
                `).join("")}
            </div>
        </div>
        <div>
            <h3><i class="fa-solid fa-book" style="color: #a855f7;"></i> Top 5 Must-Read Books</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${(resources.books || []).map(item => `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="resource-link" style="display: flex; justify-content: space-between; align-items: center; text-decoration: none;">
                        <span>📖 ${item.name}</span>
                        <span style="background: rgba(168, 85, 247, 0.15); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.4); font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-circle-check"></i> Verified
                        </span>
                    </a>
                `).join("")}
            </div>
        </div>
    </div>
</div>

<!-- ================= PROJECTS / PRACTICAL MILESTONES ================= -->

${(() => {
    const isTechRole = /developer|engineer|coder|programmer|software|web|fullstack|frontend|backend|cloud|data|ai|ml|cybersecurity|devops|qa|sysadmin|blockchain/i.test(data.career_title || "");
    const projectSectionTitle = isTechRole ? "Real-World Technical Projects" : "Practical Milestones & Domain Case Studies";
    const projectIcon = isTechRole ? "fa-laptop-code" : "fa-briefcase";
    const beginnerLabel = isTechRole ? "Beginner Projects" : "Beginner Practicums & Case Logs";
    const intermediateLabel = isTechRole ? "Intermediate Projects" : "Intermediate Field Assignments";
    const advancedLabel = isTechRole ? "Advanced Enterprise Projects" : "Advanced Clinical & Strategic Case Studies";
    const beginnerIcon = isTechRole ? "fa-cubes" : "fa-seedling";
    const intermediateIcon = isTechRole ? "fa-network-wired" : "fa-diagram-project";
    const advancedIcon = isTechRole ? "fa-server" : "fa-award";

    return `
    <div class="roadmap-item">
        <h2><i class="fa-solid ${projectIcon}"></i> ${projectSectionTitle} (Top 5 Per Tier)</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
                <h3 style="color: #22c55e;"><i class="fa-solid ${beginnerIcon}"></i> ${beginnerLabel}</h3>
                <ul>${(projects.beginner || []).map(p => `<li>🟢 ${p}</li>`).join("")}</ul>
            </div>
            <div>
                <h3 style="color: var(--accent);"><i class="fa-solid ${intermediateIcon}"></i> ${intermediateLabel}</h3>
                <ul>${(projects.intermediate || []).map(p => `<li>🟡 ${p}</li>`).join("")}</ul>
            </div>
            <div>
                <h3 style="color: #a855f7;"><i class="fa-solid ${advancedIcon}"></i> ${advancedLabel}</h3>
                <ul>${(projects.advanced || []).map(p => `<li>🟣 ${p}</li>`).join("")}</ul>
            </div>
        </div>
    </div>
    `;
})()}

<!-- ================= CERTIFICATIONS & TOOLS ================= -->

<div class="roadmap-item">
    <h2><i class="fa-solid fa-award"></i> Top 5 Certifications & Essential Tools</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
            <h3><i class="fa-solid fa-trophy" style="color: var(--accent);"></i> Top 5 Certifications</h3>
            <div class="chip-grid">
                ${(certifications || []).map(c => `<span class="chip-item">🏆 ${c}</span>`).join("")}
            </div>
        </div>
        <div>
            <h3><i class="fa-solid fa-screwdriver-wrench" style="color: #3b82f6;"></i> Top 5 Tools & Tech Stack</h3>
            <div class="chip-grid">
                ${(tools || []).map(t => `<span class="chip-item">🧰 ${t}</span>`).join("")}
            </div>
        </div>
    </div>
</div>

<!-- ================= INTERVIEW & PORTFOLIO STRATEGY ================= -->

<div class="roadmap-item">
    <h2><i class="fa-solid fa-comments"></i> Interview, Portfolio & AI Productivity (Top 5 Each)</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
            <h3 style="margin-top: 0; color: var(--accent);"><i class="fa-solid fa-clipboard-question"></i> Top 5 Interview Qs</h3>
            <ul style="gap: 8px;">${(interview || []).map(i => `<li style="font-size: 0.84rem; padding: 8px 12px;">💬 ${i}</li>`).join("")}</ul>
        </div>
        <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
            <h3 style="margin-top: 0; color: #3b82f6;"><i class="fa-solid fa-bullseye"></i> Top 5 Portfolio Tips</h3>
            <ul style="gap: 8px;">${(portfolio || []).map(p => `<li style="font-size: 0.84rem; padding: 8px 12px;">🎯 ${p}</li>`).join("")}</ul>
        </div>
        <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
            <h3 style="margin-top: 0; color: #a855f7;"><i class="fa-solid fa-wand-magic-sparkles"></i> Top 5 AI Hacks</h3>
            <ul style="gap: 8px;">${(aiTips || []).map(a => `<li style="font-size: 0.84rem; padding: 8px 12px;">🤖 ${a}</li>`).join("")}</ul>
        </div>
    </div>
</div>

<!-- ================= CAREER INTELLIGENCE ================= -->

<div class="roadmap-item">
    <h2><i class="fa-solid fa-chart-pie"></i> Market Intelligence & Hiring Ecosystem</h2>
    
    <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; margin-bottom: 24px; align-items: center;">
        <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 0.88rem; font-weight: 800; color: var(--text-heading);"><i class="fa-solid fa-chart-radar" style="color: var(--accent); margin-right: 6px;"></i> Market Ecosystem Radar</span>
                <span style="font-size: 0.72rem; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.4); padding: 2px 10px; border-radius: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-circle-check"></i> Fact-Checked Market Statistics</span>
            </div>
            <div style="height: 230px; position: relative;">
                <canvas id="marketAnalyticsCanvas"></canvas>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 0.78rem; color: #22c55e; font-weight: 800;">🔥 JOB DEMAND</span>
                    <span style="font-size: 0.82rem; font-weight: 900; color: #22c55e; background: rgba(34, 197, 94, 0.15); padding: 2px 10px; border-radius: 10px;">${market.job_demand?.rating || (market.job_demand?.percentage ? (market.job_demand.percentage > 80 ? 'Very High' : 'High') : 'High')}</span>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.4;">${market.job_demand?.reason || market.job_demand?.text || `High market demand driven by enterprise hiring & talent shortage in ${country || 'this field'}.`}</p>
            </div>

            <div style="background: rgba(250, 204, 21, 0.05); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 14px; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 0.78rem; color: var(--accent); font-weight: 800;">🎯 LEARNING CURVE</span>
                    <span style="font-size: 0.82rem; font-weight: 900; color: var(--accent); background: rgba(250, 204, 21, 0.15); padding: 2px 10px; border-radius: 10px;">${market.difficulty?.level || 'Moderate to High'}</span>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.4;">${market.difficulty?.reason || market.difficulty?.text || "Moderate to high learning curve requiring structured hands-on practice."}</p>
            </div>

            <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 14px; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 0.78rem; color: #3b82f6; font-weight: 800;">🚀 CAREER GROWTH</span>
                    <span style="font-size: 0.82rem; font-weight: 900; color: #3b82f6; background: rgba(59, 130, 246, 0.15); padding: 2px 10px; border-radius: 10px;">${market.growth?.outlook || (market.growth?.percentage ? (market.growth.percentage > 80 ? 'Fast Growing' : 'Growing') : 'Growing')}</span>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.4;">${market.growth?.reason || market.growth?.text || "Strong multi-year expansion powered by technology integration and investments."}</p>
            </div>

            <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 0.78rem; color: #a855f7; font-weight: 800;">📚 TIME COMMITMENT</span>
                    <span style="font-size: 0.82rem; font-weight: 900; color: #a855f7; background: rgba(168, 85, 247, 0.15); padding: 2px 10px; border-radius: 10px;">${market.learning_time?.duration || '6 Months'}</span>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.4;">${market.learning_time?.details || market.learning_time?.text || "Estimated 15-20 hours/week of structured practice over 6 months."}</p>
            </div>
        </div>
    </div>

    <!-- Official Country Salary Pay Band Card -->
    ${renderPayBandCard(overview.salary || market.salary, targetSalInfo, country)}

    <h3 style="margin-top: 10px;"><i class="fa-solid fa-clock"></i> Day-in-the-Life & Daily Duty Workflow</h3>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px;">
        <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 14px; padding: 16px;">
            <div style="font-size: 0.75rem; color: #3b82f6; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">🌅 09:00 AM - 10:30 AM</div>
            <strong style="color: var(--text-heading); font-size: 0.92rem; display: block; margin-bottom: 4px;">Morning Alignment & Standup</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">Sync with cross-functional teams, triage daily priorities, and review critical operational deliverables.</p>
        </div>
        <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 16px;">
            <div style="font-size: 0.75rem; color: #22c55e; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">🧠 10:30 AM - 01:30 PM</div>
            <strong style="color: var(--text-heading); font-size: 0.92rem; display: block; margin-bottom: 4px;">Deep Focus Execution</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">Uninterrupted high-value problem solving, technical/strategic execution, and core milestone building.</p>
        </div>
        <div style="background: rgba(250, 204, 21, 0.05); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 14px; padding: 16px;">
            <div style="font-size: 0.75rem; color: var(--accent); font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">🤝 02:30 PM - 04:30 PM</div>
            <strong style="color: var(--text-heading); font-size: 0.92rem; display: block; margin-bottom: 4px;">Collaboration & Review</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">Stakeholder feedback loops, peer reviews, technical architecture sessions, and mentoring junior peers.</p>
        </div>
        <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 16px;">
            <div style="font-size: 0.75rem; color: #a855f7; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">🚀 04:30 PM - 06:00 PM</div>
            <strong style="color: var(--text-heading); font-size: 0.92rem; display: block; margin-bottom: 4px;">Quality Audit & Learning</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">Testing & validating day's work, updating task boards, and spending 30 mins exploring cutting-edge AI tools.</p>
        </div>
    </div>

    <h3 style="margin-top: 10px;"><i class="fa-solid fa-chart-line"></i> Fast-Track Career Leveling & Promotion Roadmap</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(34, 197, 94, 0.04); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.78rem; color: #22c55e; font-weight: 800; text-transform: uppercase;">🟢 Level 1: Junior (0 - 2 Yrs)</span>
                <span style="font-size: 0.7rem; background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Execution</span>
            </div>
            <strong style="color: var(--text-heading); font-size: 0.92rem; display: block; margin-bottom: 6px;">Task Reliability & Core Skills</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 10px; line-height: 1.4;">Deliver assigned deliverables on time with zero hand-holding and maintain clean documentation.</p>
            <div style="font-size: 0.75rem; color: #22c55e; font-weight: 700;">🎯 Promotion Trigger: <span style="color: var(--text-primary); font-weight: 400;">&lt;5% rework rate &amp; proactive daily updates.</span></div>
        </div>

        <div style="background: rgba(250, 204, 21, 0.04); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 14px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.78rem; color: var(--accent); font-weight: 800; text-transform: uppercase;">🟡 Level 2: Mid-Level (2 - 5 Yrs)</span>
                <span style="font-size: 0.7rem; background: rgba(250, 204, 21, 0.15); color: var(--accent); padding: 2px 8px; border-radius: 12px; font-weight: 700;">Ownership</span>
            </div>
            <strong style="color: var(--text-heading); font-size: 0.92rem; display: block; margin-bottom: 6px;">End-to-End System Design</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 10px; line-height: 1.4;">Own complex module features, lead technical reviews, and mentor junior team members.</p>
            <div style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">🎯 Promotion Trigger: <span style="color: var(--text-primary); font-weight: 400;">Leading 2+ major projects boosting team efficiency.</span></div>
        </div>

        <div style="background: rgba(168, 85, 247, 0.04); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.78rem; color: #a855f7; font-weight: 800; text-transform: uppercase;">🟣 Level 3: Senior / Lead (5+ Yrs)</span>
                <span style="font-size: 0.7rem; background: rgba(168, 85, 247, 0.15); color: #a855f7; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Strategy</span>
            </div>
            <strong style="color: var(--text-heading); font-size: 0.92rem; display: block; margin-bottom: 6px;">Enterprise Strategy &amp; Architecture</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 10px; line-height: 1.4;">Architect long-term technology roadmaps, resolve critical bottlenecks, and align goals with business ROI.</p>
            <div style="font-size: 0.75rem; color: #a855f7; font-weight: 700;">🎯 Promotion Trigger: <span style="color: var(--text-primary); font-weight: 400;">Driving strategic ROI &amp; shaping organizational standards.</span></div>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div>
            <h3><i class="fa-solid fa-building"></i> Top 5 Hiring Organizations</h3>
            <div class="chip-grid">
                ${(market.top_organizations || []).map(o => `<span class="chip-item">🏢 ${o}</span>`).join("")}
            </div>
        </div>
        <div>
            <h3><i class="fa-solid fa-fire"></i> Top 5 Trending Skills</h3>
            <div class="chip-grid">
                ${(market.trending_skills || []).map(s => `<span class="chip-item">🔥 ${s}</span>`).join("")}
            </div>
        </div>
    </div>

    <h3><i class="fa-solid fa-location-dot"></i> Top 5 Hiring Hotspots</h3>
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px;">
        ${(market.hiring_hotspots || []).map(city => `
            <div style="background: rgba(25, 25, 25, 0.8); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">
                <span style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">📍 ${city.city}</span>
                <h5 style="margin: 4px 0; color: var(--text-heading); font-size: 0.85rem;">${city.demand}</h5>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">${city.reason}</p>
            </div>
        `).join("")}
    </div>

    <h3><i class="fa-solid fa-calendar-check"></i> Top 5 Weekly Study Plan Steps</h3>
    <ul>
        ${(market.daily_plan || []).map(day => `<li>📅 ${day}</li>`).join("")}
    </ul>
</div>
            <hr style="margin-top:40px">
            <p style="text-align:center; font-size:14px; color:#777; margin-top:15px;">Generated by <b>CareerVerse AI</b></p>
`;
        clearInterval(loadingInterval);

        resultCardEl.innerHTML = html;
        resultCardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Initialize Professional Chart.js Radar Chart
        setTimeout(() => {
            const canvas = document.getElementById("marketAnalyticsCanvas");
            if (canvas && typeof Chart !== "undefined") {
                if (window.marketChartInstance) {
                    window.marketChartInstance.destroy();
                }
                const ctx = canvas.getContext("2d");
                const mapRatingToScore = (val, defaultScore = 80) => {
                    if (typeof val === "number") return val;
                    if (typeof val === "string") {
                        const v = val.toLowerCase();
                        if (v.includes("very high") || v.includes("fast growing")) return 92;
                        if (v.includes("high") || v.includes("growing")) return 78;
                        if (v.includes("moderate") || v.includes("stable")) return 55;
                        if (v.includes("low") || v.includes("declining")) return 30;
                    }
                    return defaultScore;
                };

                const demandVal = mapRatingToScore(market.job_demand?.rating || market.job_demand?.percentage, 85);
                const growthVal = mapRatingToScore(market.growth?.outlook || market.growth?.percentage, 88);
                const diffVal = mapRatingToScore(market.difficulty?.level || market.difficulty?.percentage, 75);
                const timeVal = mapRatingToScore(market.learning_time?.duration || market.learning_time?.percentage, 80);

                window.marketChartInstance = new Chart(ctx, {
                    type: "radar",
                    data: {
                        labels: ["Job Demand", "Growth Outlook", "Learning Curve", "Time Index", "Stability"],
                        datasets: [{
                            label: "Market Scope Score",
                            data: [demandVal, growthVal, diffVal, timeVal, 85],
                            backgroundColor: "rgba(250, 204, 21, 0.25)",
                            borderColor: "#fac515",
                            pointBackgroundColor: "#fac515",
                            pointBorderColor: "#fff",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "#fac515",
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                angleLines: { color: "rgba(255, 255, 255, 0.12)" },
                                grid: { color: "rgba(255, 255, 255, 0.12)" },
                                pointLabels: { color: "#e2e8f0", font: { size: 10, weight: "bold" } },
                                ticks: { display: false, backdropColor: "transparent" },
                                min: 0,
                                max: 100
                            }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            }
        }, 100);

        const inlineBtn = document.getElementById("inlineDownloadBtn");
        if (inlineBtn) {
            inlineBtn.addEventListener("click", generatePDFReport);
        }

        const actionSection = document.getElementById("actionSection");
        if (actionSection) {
            actionSection.style.display = "flex";
        }

    } catch (error) {
        console.error(error);
        if (generateBtnEl) {
            generateBtnEl.disabled = false;
            generateBtnEl.innerHTML = `<i class="fa-solid fa-route"></i> Generate AI Roadmap`;
        }
        resultCardEl.innerHTML = `
            <div class="roadmap-item error-card" style="border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.08); padding: 26px; border-radius: 16px; margin-top: 20px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 1.6rem; color: #ef4444;"></i>
                    <h3 style="color: var(--text-heading); margin: 0; font-size: 1.2rem;">Roadmap Generation Error</h3>
                </div>
                <p style="color: var(--text-primary); font-size: 0.96rem; line-height: 1.6;">${error.message || "Unable to generate roadmap. Please try again."}</p>
            </div>
        `;
    }
}

// Expose function globally for inline onclick
window.generateRoadmapNow = generateRoadmapNow;

// DOMContentLoaded listener for button binding and auto-trigger
document.addEventListener("DOMContentLoaded", () => {
    const generateBtnEl = document.getElementById("generateBtn");
    if (generateBtnEl) {
        generateBtnEl.onclick = generateRoadmapNow;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get("role") || urlParams.get("career");
    const careerInputEl = document.getElementById("careerInput");
    if (roleParam && careerInputEl) {
        careerInputEl.value = roleParam;
        generateRoadmapNow();
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

    const NAVY = [15, 23, 42];        // #0f172a
    const GOLD = [202, 138, 4];       // #ca8a04
    const SLATE = [30, 41, 59];       // #1e293b
    const MUTED = [100, 116, 139];     // #64748b

    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = 0;

    const data = window.currentRoadmap;

    function sanitize(str) {
        if (!str) return "";
        return String(str)
            .replace(/₹/g, "INR ")
            .replace(/[^\x00-\x7F]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function checkPageBreak(neededSpace = 25) {
        if (y + neededSpace > 275) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    }

    function drawSectionHeader(title) {
        checkPageBreak(18);
        doc.setFillColor(...NAVY);
        doc.rect(margin, y, 3.5, 6.5, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...NAVY);
        doc.text(sanitize(title).toUpperCase(), margin + 6, y + 5);

        y += 8;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
    }

    // 1. TOP HEADER BANNER
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setFillColor(...GOLD);
    doc.rect(0, 28, pageWidth, 1.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CareerVerse AI", margin, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text("AUTONOMOUS CAREER INTELLIGENCE & MASTER ROADMAP REPORT", margin, 22);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(today, pageWidth - margin, 22, { align: "right" });

    y = 38;

    // 2. DOCUMENT TITLE BLOCK
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...SLATE);
    const careerTitle = sanitize(data.career || "Target Career Role");
    doc.text(careerTitle, margin, y);

    y += 6;
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const locText = `Target Location / Region: ${sanitize(data.country || 'Global / India')}`;
    doc.text(locText, margin, y);
    y += 10;

    // SECTION 1: OVERVIEW
    const overview = data.overview || {};
    drawSectionHeader("1. Executive Career Overview");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE);
    const descLines = doc.splitTextToSize(sanitize(overview.description || "Comprehensive career development roadmap."), contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 4.5 + 4;

    doc.autoTable({
        startY: y,
        head: [['Education & Path', 'Expected Pay (India)', 'Expected Pay (USA / Global)', 'Future Scope']],
        body: [[
            sanitize(overview.education || "Bachelor's / STEM"),
            sanitize(overview.salary?.india || "INR 8L - 18L / yr"),
            sanitize(overview.salary?.usa || "$90k - 165k / yr"),
            sanitize(overview.future_scope || "High Demand")
        ]],
        styles: { fontSize: 8.5, cellPadding: 4 },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
        margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 8;

    // SECTION 2: SKILLS
    const skills = data.skills || {};
    drawSectionHeader("2. Technical Skill Mastery Matrix");
    
    const maxSkills = Math.max(
        (skills.beginner || []).length,
        (skills.intermediate || []).length,
        (skills.advanced || []).length
    );

    const skillRows = [];
    for (let i = 0; i < maxSkills; i++) {
        skillRows.push([
            sanitize(skills.beginner?.[i] || "-"),
            sanitize(skills.intermediate?.[i] || "-"),
            sanitize(skills.advanced?.[i] || "-")
        ]);
    }

    doc.autoTable({
        startY: y,
        head: [['Beginner Level', 'Intermediate Level', 'Advanced Level']],
        body: skillRows,
        styles: { fontSize: 8.5, cellPadding: 3.5 },
        headStyles: { fillColor: SLATE, textColor: [255, 255, 255], fontStyle: 'bold' },
        margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 8;

    // SECTION 3: MONTHLY ROADMAP TIMELINE
    const roadmap = data.roadmap || [];
    drawSectionHeader("3. Step-by-Step Monthly Execution Roadmap");

    const roadmapRows = roadmap.map(m => [
        sanitize(m.month || 'Phase') + '\n' + sanitize(m.title || ''),
        (m.topics || []).map(t => '• ' + sanitize(t)).join('\n'),
        'Project: ' + sanitize(m.project || 'N/A') + '\nGoal: ' + sanitize(m.goal || 'N/A')
    ]);

    doc.autoTable({
        startY: y,
        head: [['Month / Phase Title', 'Core Topics to Master', 'Hands-On Project & Goal']],
        body: roadmapRows,
        styles: { fontSize: 8, cellPadding: 3.5 },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 75 },
            2: { cellWidth: 60 }
        },
        margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 8;

    // SECTION 4: PROJECTS & CERTIFICATIONS
    const projects = data.projects || {};
    drawSectionHeader("4. Real-World Portfolio Projects");

    const projRows = [];
    const maxP = Math.max((projects.beginner || []).length, (projects.intermediate || []).length, (projects.advanced || []).length);
    for (let i = 0; i < maxP; i++) {
        projRows.push([
            sanitize(projects.beginner?.[i] || "-"),
            sanitize(projects.intermediate?.[i] || "-"),
            sanitize(projects.advanced?.[i] || "-")
        ]);
    }

    doc.autoTable({
        startY: y,
        head: [['Beginner Projects', 'Intermediate Projects', 'Advanced Enterprise Projects']],
        body: projRows,
        styles: { fontSize: 8.5, cellPadding: 3.5 },
        headStyles: { fillColor: SLATE, textColor: [255, 255, 255], fontStyle: 'bold' },
        margin: { left: margin, right: margin }
    });
    y = doc.lastAutoTable.finalY + 8;

    // SECTION 5: MARKET INTELLIGENCE
    const market = data.market || {};
    drawSectionHeader("5. Market Intelligence & Hiring Ecosystem");

    const demandRating = market.job_demand?.rating || (market.job_demand?.percentage ? (market.job_demand.percentage > 80 ? 'Very High' : 'High') : 'High');
    const growthOutlook = market.growth?.outlook || (market.growth?.percentage ? (market.growth.percentage > 80 ? 'Fast Growing' : 'Growing') : 'Growing');

    const freshSalary = market.salary?.fresher || 'Data unavailable';
    const midSalary = market.salary?.mid || 'Data unavailable';
    const senSalary = market.salary?.senior || 'Data unavailable';

    doc.autoTable({
        startY: y,
        head: [['Metric', 'Salary Pay Bands', 'Top Hiring Companies', 'Key Hiring Hotspots']],
        body: [[
            'Job Demand: ' + demandRating + '\nGrowth Outlook: ' + growthOutlook,
            'Fresher: ' + sanitize(freshSalary) + '\nMid: ' + sanitize(midSalary) + '\nSenior: ' + sanitize(senSalary),
            (market.top_organizations || []).slice(0, 5).join(', '),
            (market.hiring_hotspots || []).map(h => sanitize(h.city)).join(', ')
        ]],
        styles: { fontSize: 8.5, cellPadding: 4 },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
        margin: { left: margin, right: margin }
    });

    const safeFileName = sanitize(data.career || 'CareerVerse').replace(/\s+/g, '_');
    doc.save(`${safeFileName}_Roadmap.pdf`);
}


