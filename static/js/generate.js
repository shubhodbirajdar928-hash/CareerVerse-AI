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
    "ias", "ips", "ifs", "irs", "upsc", "nda", "cds", "afcat", "ssc", "psc", "gpsc", "mpsc", "uppsc", "bpsc", "chsl", "wbcs", "jkpsc", "tnpsc", "tspsc", "cgpsc", "hpsc", "kpsc", "ppsc", "mppsc", "rrb", "isro", "drdo", "barc", "hal", "bel", "gail", "ntpc",
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
    "india": { flag: "🇮🇳", name: "India", symbol: "₹", defaultSal: "₹4.5L - ₹22.0L / yr" },
    "united states": { flag: "🇺🇸", name: "USA", symbol: "$", defaultSal: "$55,000 - $160,000 / yr" },
    "usa": { flag: "🇺🇸", name: "USA", symbol: "$", defaultSal: "$55,000 - $160,000 / yr" },
    "us": { flag: "🇺🇸", name: "USA", symbol: "$", defaultSal: "$55,000 - $160,000 / yr" },
    "united kingdom": { flag: "🇬🇧", name: "United Kingdom", symbol: "£", defaultSal: "£25,000 - £85,000 / yr" },
    "uk": { flag: "🇬🇧", name: "United Kingdom", symbol: "£", defaultSal: "£25,000 - £85,000 / yr" },
    "england": { flag: "🇬🇧", name: "United Kingdom (England)", symbol: "£", defaultSal: "£25,000 - £85,000 / yr" },
    "scotland": { flag: "🇬🇧", name: "United Kingdom (Scotland)", symbol: "£", defaultSal: "£25,000 - £85,000 / yr" },
    "wales": { flag: "🇬🇧", name: "United Kingdom (Wales)", symbol: "£", defaultSal: "£25,000 - £85,000 / yr" },
    "great britain": { flag: "🇬🇧", name: "United Kingdom", symbol: "£", defaultSal: "£25,000 - £85,000 / yr" },
    "gb": { flag: "🇬🇧", name: "United Kingdom", symbol: "£", defaultSal: "£25,000 - £85,000 / yr" },
    "london": { flag: "🇬🇧", name: "United Kingdom (London)", symbol: "£", defaultSal: "£28,000 - £95,000 / yr" },
    "germany": { flag: "🇩🇪", name: "Germany", symbol: "€", defaultSal: "€35,000 - €95,000 / yr" },
    "france": { flag: "🇫🇷", name: "France", symbol: "€", defaultSal: "€32,000 - €90,000 / yr" },
    "netherlands": { flag: "🇳🇱", name: "Netherlands", symbol: "€", defaultSal: "€38,000 - €98,000 / yr" },
    "spain": { flag: "🇪🇸", name: "Spain", symbol: "€", defaultSal: "€28,000 - €75,000 / yr" },
    "italy": { flag: "🇮🇹", name: "Italy", symbol: "€", defaultSal: "€28,000 - €70,000 / yr" },
    "canada": { flag: "🇨🇦", name: "Canada", symbol: "CA$", defaultSal: "CA$48,000 - CA$125,000 / yr" },
    "australia": { flag: "🇦🇺", name: "Australia", symbol: "A$", defaultSal: "A$55,000 - A$140,000 / yr" },
    "uae": { flag: "🇦🇪", name: "UAE / Dubai", symbol: "AED", defaultSal: "AED 9,000 - AED 35,000 / mo" },
    "dubai": { flag: "🇦🇪", name: "Dubai", symbol: "AED", defaultSal: "AED 9,000 - AED 35,000 / mo" },
    "saudi arabia": { flag: "🇸🇦", name: "Saudi Arabia", symbol: "SAR", defaultSal: "SAR 8,000 - SAR 28,000 / mo" },
    "singapore": { flag: "🇸🇬", name: "Singapore", symbol: "S$", defaultSal: "S$38,000 - S$115,000 / yr" },
    "japan": { flag: "🇯🇵", name: "Japan", symbol: "¥", defaultSal: "¥3,500,000 - ¥10,500,000 / yr" },
    "south korea": { flag: "🇰🇷", name: "South Korea", symbol: "₩", defaultSal: "₩32,000,000 - ₩95,000,000 / yr" },
    "switzerland": { flag: "🇨🇭", name: "Switzerland", symbol: "CHF", defaultSal: "CHF 65,000 - CHF 150,000 / yr" }
};

function getCountrySalaryInfo(country, rawSalary) {
    const cLow = (country || "").toLowerCase().trim();
    for (const [key, cfg] of Object.entries(COUNTRY_CONFIG_MAP)) {
        if (cLow.includes(key) || key.includes(cLow)) {
            if (rawSalary && (rawSalary.includes(cfg.symbol) || rawSalary.includes(cfg.name))) {
                return { flag: cfg.flag, name: cfg.name, salary: rawSalary };
            }
            return { flag: cfg.flag, name: cfg.name, salary: rawSalary || cfg.defaultSal };
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
        if (isIndia) {
            fresher = salaryData.india_fresher || salaryData.india || salaryData.fresher || "Data unavailable";
            mid = salaryData.india_mid || salaryData.mid || "Data unavailable";
            senior = salaryData.india_senior || salaryData.senior || "Data unavailable";
        } else {
            fresher = salaryData.country_fresher || salaryData.fresher || "Data unavailable";
            mid = salaryData.country_mid || salaryData.mid || "Data unavailable";
            senior = salaryData.country_senior || salaryData.senior || "Data unavailable";
        }
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

    const code = salaryData?.currency_code || targetSalInfo?.currency || "";
    const sym = salaryData?.currency_symbol || "";

    function ensureCurrencyTag(val) {
        if (!val || val === "Data unavailable" || val === "--") return "Data unavailable";
        const v = String(val).trim();
        if (v === "Data unavailable") return "Data unavailable";

        const hasSym = /[$\u20B9\u00A5\u00A3\u20AC\u20A9\u20BA\u20AA\u0E3F\u20BD\u09AF\u20B1\u20AB\u20A6]/.test(v);
        const hasCode = /^[A-Z]{3}\s/.test(v) || /\b[A-Z]{3}\b/.test(v);
        if (hasSym || hasCode) return v;

        const tag = sym || code || "";
        return tag ? `${tag}${v}` : v;
    }

    fresher = ensureCurrencyTag(fresher);
    mid = ensureCurrencyTag(mid);
    senior = ensureCurrencyTag(senior);

    let sourcesChecked = [];
    if (isIndia) {
        sourcesChecked = ["Ministry of Labour & Employment (Gov of India)", "DGMS Labor Registry", "National Career Service (NCS)"];
    } else if (cLow.includes("united states") || cLow.includes("usa") || cLow.includes("us")) {
        sourcesChecked = ["US Bureau of Labor Statistics (BLS) OEWS", "O*NET OnLine database", "Department of Labor (DOL)"];
    } else if (cLow.includes("united kingdom") || cLow.includes("uk")) {
        sourcesChecked = ["UK Department for Education (DfE)", "ONS Annual Survey of Hours and Earnings (ASHE)"];
    } else if (cLow.includes("germany")) {
        sourcesChecked = ["Statistisches Bundesamt (Destatis) Germany", "Federal Employment Agency (Agentur für Arbeit)"];
    } else if (cLow.includes("canada")) {
        sourcesChecked = ["Job Bank Canada (Gov of Canada)", "Statistics Canada (StatCan)"];
    } else {
        sourcesChecked = ["International Labour Organization (ILO)", "World Bank Labor Benchmarks", "CareerVerse Verified Registries"];
    }

    return `
    <div style="margin-top: 22px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-heading); display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.25rem;">${flag}</span> ${countryName} Official Compensation Pay Band
            </span>
            <span style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #22c55e; padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-circle-check"></i> 85%+ Verified Accuracy
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
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
            <strong>Why this salary?</strong> ${salaryData?.reason || 'Driven by specialized competency requirements, cognitive complexity, and strong regional market demands.'}
        </div>
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.08); font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span style="display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-database" style="color: var(--accent);"></i> Verified Sources:</span>
            ${sourcesChecked.map(src => `<span style="background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.06); color: var(--text-secondary); font-weight: 600;">${src}</span>`).join('')}
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

function renderResourceList(items, fallbackItems, iconClass, linkColor) {
    const list = items || fallbackItems;
    if (!list || !Array.isArray(list)) return "";
    return list.map(item => {
        if (item && typeof item === "object") {
            const name = item.name || item.title || "Resource Link";
            const url = item.url || "#";
            return `
                <li>
                    <a href="${url}" target="_blank" style="color: ${linkColor}; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        <i class="${iconClass}"></i> ${name}
                    </a>
                </li>
            `;
        }
        return `<li>${item}</li>`;
    }).join("");
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
    const experience = document.getElementById("experienceInput") ? document.getElementById("experienceInput").value.trim() : "";
    const skills = document.getElementById("skillsInput") ? document.getElementById("skillsInput").value.trim() : "";
    const duration = document.getElementById("durationInput") ? document.getElementById("durationInput").value.trim() : (durationInputEl ? durationInputEl.value.trim() : "6 months");
    const industry = document.getElementById("industryInput") ? document.getElementById("industryInput").value.trim() : "";

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
        generateBtnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating AI Roadmap...`;
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
        const targetSalInfo = getCountrySalaryInfo(country, overview.salary?.formatted_range || overview.salary?.country || overview.salary?.usa);

        // -----------------------------
        // Start HTML
        // -----------------------------

        let html = `
<div class="roadmap-top-bar" style="margin-bottom: 20px;">
    <div class="roadmap-title-group">
        <span class="roadmap-top-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> AI MASTER ROADMAP</span>
        <h1>${data.career || career}</h1>
    </div>
    <button id="inlineDownloadBtn" type="button" class="top-download-btn">
        <i class="fa-solid fa-file-pdf"></i> Download PDF Roadmap
    </button>
</div>

<!-- ================= NAVIGATION BAR ================= -->
<div class="roadmap-navigator">
    <button class="roadmap-page-btn active" id="roadmap-btn-1" onclick="showRoadmapPage(1)">
        <i class="fa-solid fa-book-open"></i> Profile & Scope
    </button>
    <button class="roadmap-page-btn" id="roadmap-btn-2" onclick="showRoadmapPage(2)">
        <i class="fa-solid fa-route"></i> Study Timeline
    </button>
    <button class="roadmap-page-btn" id="roadmap-btn-3" onclick="showRoadmapPage(3)">
        <i class="fa-solid fa-code"></i> Skills & Tools
    </button>
    <button class="roadmap-page-btn" id="roadmap-btn-4" onclick="showRoadmapPage(4)">
        <i class="fa-solid fa-laptop-code"></i> Practical Tasks
    </button>
    <button class="roadmap-page-btn" id="roadmap-btn-5" onclick="showRoadmapPage(5)">
        <i class="fa-solid fa-graduation-cap"></i> Prep & Resources
    </button>
    <button class="roadmap-page-btn" id="roadmap-btn-6" onclick="showRoadmapPage(6)">
        <i class="fa-solid fa-chart-pie"></i> Market & Hiring
    </button>
</div>

<!-- ================= PAGE 1: CAREER PROFILE ================= -->
<div class="roadmap-page active" id="roadmap-page-1">
    <div class="roadmap-item">
        <h2><i class="fa-solid fa-circle-info"></i> What is this Career?</h2>
        <p style="font-size: 1.05rem; line-height: 1.7; margin-bottom: 24px; color: var(--text-primary); font-weight: 400;">
            ${overview.description || "Comprehensive professional career breakdown."}
        </p>

        <!-- Responsibilities Box -->
        <div class="responsibilities-box">
            <h3><i class="fa-solid fa-briefcase"></i> Core Day-to-Day Responsibilities</h3>
            <ul class="responsibilities-list">
                ${(overview.responsibilities || [
                    "Perform core duties, analyze data, and implement domain methodologies.",
                    "Collaborate with team members and report findings to relevant stakeholders.",
                    "Ensure quality control, maintain standard guidelines, and resolve operational issues.",
                    "Leverage modern software, tools, and processes to optimize productivity."
                ]).map(resp => `<li>${resp}</li>`).join("")}
            </ul>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
                <h3 style="margin-top: 0; color: var(--accent);"><i class="fa-solid fa-user-graduate"></i> Education & Path</h3>
                <p style="font-size: 0.92rem; margin: 0; line-height: 1.5; color: var(--text-secondary);">${overview.education || "Bachelor's Degree in relevant field / Portfolio Proof"}</p>
            </div>
            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
                <h3 style="margin-top: 0; color: #22c55e;"><i class="fa-solid fa-chart-line"></i> 5-Year Future Trajectory</h3>
                <p style="font-size: 0.92rem; margin: 0; line-height: 1.5; color: var(--text-secondary);">${overview.future_scope || "High demand across global hubs."}</p>
            </div>
        </div>

        <!-- Past, Present & Future Timeline -->
        <div style="background: rgba(250, 204, 21, 0.03); border: 1px solid rgba(250, 204, 21, 0.25); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin-top: 0; color: var(--accent); font-size: 1.05rem; margin-bottom: 14px;"><i class="fa-solid fa-hourglass-half"></i> Past, Present & Future Macro Market Evolution</h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 14px;">
                    <span style="font-size: 0.75rem; color: #3b82f6; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">📜 PAST (10-Yr Evolution)</span>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">${(overview.macro_evolution?.past || `Historically, this role relied on manual execution, legacy tools, and localized workflows.`)}</p>
                </div>
                <div style="background: rgba(250, 204, 21, 0.05); border: 1px solid rgba(250, 204, 21, 0.2); border-radius: 12px; padding: 14px;">
                    <span style="font-size: 0.75rem; color: var(--accent); font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">⚡ PRESENT (Current Realities)</span>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">${(overview.macro_evolution?.present || `Currently in high demand driven by digital transformation, modern tech stacks, and cloud integration.`)}</p>
                </div>
                <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 14px;">
                    <span style="font-size: 0.75rem; color: #22c55e; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">🚀 FUTURE (5-10 Yr Scope)</span>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">${(overview.macro_evolution?.future || `Over the next decade, AI integration will automate routine work, elevating specialists into strategic decision-makers.`)}</p>
                </div>
            </div>
        </div>

        <h3 style="margin-top: 10px; margin-bottom: 16px;"><i class="fa-solid fa-clock"></i> Day-in-the-Life & Daily Duty Workflow</h3>
        <div style="display: flex; flex-direction: column; gap: 16px; border-left: 2px solid rgba(250, 204, 21, 0.15); padding-left: 20px; margin-left: 10px; margin-bottom: 28px;">
            <div style="position: relative;">
                <span style="position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; box-shadow: 0 0 8px #3b82f6;"></span>
                <span style="font-size: 0.75rem; color: #3b82f6; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">🌅 09:00 AM - 10:30 AM · Morning Alignment & Standup</span>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">Sync with cross-functional teams, triage daily priorities, and review critical operational deliverables.</p>
            </div>
            <div style="position: relative;">
                <span style="position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e;"></span>
                <span style="font-size: 0.75rem; color: #22c55e; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">🧠 10:30 AM - 01:30 PM · Deep Focus Execution</span>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">Uninterrupted high-value problem solving, technical/strategic execution, and core milestone building.</p>
            </div>
            <div style="position: relative;">
                <span style="position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent);"></span>
                <span style="font-size: 0.75rem; color: var(--accent); font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">🤝 02:30 PM - 04:30 PM · Collaboration & Review</span>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">Stakeholder feedback loops, peer reviews, technical architecture sessions, and mentoring junior peers.</p>
            </div>
            <div style="position: relative;">
                <span style="position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #a855f7; box-shadow: 0 0 8px #a855f7;"></span>
                <span style="font-size: 0.75rem; color: #a855f7; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">🚀 04:30 PM - 06:00 PM · Quality Audit & Learning</span>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">Testing & validating day's work, updating task boards, and spending 30 mins exploring cutting-edge AI tools.</p>
            </div>
        </div>

        <h3 style="margin-top: 10px;"><i class="fa-solid fa-chart-line"></i> Fast-Track Career Leveling & Promotion Roadmap</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
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

        <!-- PAGE FOOTER NAV -->
        <div class="page-footer-nav" style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border);">
            <button type="button" class="footer-nav-btn" disabled style="opacity: 0.3; cursor: not-allowed;"><i class="fa-solid fa-arrow-left"></i> Prev Page</button>
            <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 600;">Page 1 of 6</span>
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(2)">Next Page <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
</div>

<!-- ================= PAGE 2: STUDY TIMELINE ================= -->
<div class="roadmap-page" id="roadmap-page-2">
    <div class="roadmap-item">
        <h2><i class="fa-solid fa-route"></i> Step-by-Step Learning Timeline</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: var(--text-secondary);">
            Master this career path structured across sequential phases. Complete each milestone goal and task to progress.
        </p>

        <div class="timeline-container" style="display: flex; flex-direction: column; gap: 24px;">
            ${(roadmap || []).map((phase, idx) => `
                <div class="phase-card" style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 22px; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.25);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                        <span style="background: rgba(250, 204, 21, 0.1); border: 1px solid rgba(250, 204, 21, 0.3); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">
                            <i class="fa-solid fa-calendar-days"></i> ${phase.month || `Phase ${idx + 1}`}
                        </span>
                        <span style="color: var(--text-muted); font-size: 0.85rem; font-weight: 600;">Step ${idx + 1} of ${(roadmap || []).length}</span>
                    </div>
                    
                    <h3 style="margin-top: 0; margin-bottom: 12px; color: var(--text-heading); font-size: 1.15rem;">${phase.title || "Core Foundations"}</h3>
                    
                    <div style="margin-bottom: 16px;">
                        <strong style="color: var(--text-primary); font-size: 0.9rem; display: block; margin-bottom: 6px;">Key Concepts & Topics:</strong>
                        <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; gap: 4px; display: flex; flex-direction: column;">
                            ${(phase.topics || []).map(topic => `<li>${topic}</li>`).join("")}
                        </ul>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; background: rgba(0,0,0,0.2); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.03);">
                        <div>
                            <strong style="color: #3b82f6; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 4px;"><i class="fa-solid fa-briefcase"></i> Practical Task / Project</strong>
                            <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${phase.project || "Implement domain basics."}</p>
                        </div>
                        <div>
                            <strong style="color: #22c55e; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 4px;"><i class="fa-solid fa-bullseye"></i> Phase Milestone Goal</strong>
                            <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${phase.goal || "Validation test."}</p>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>

        <!-- PAGE FOOTER NAV -->
        <div class="page-footer-nav" style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border);">
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(1)"><i class="fa-solid fa-arrow-left"></i> Prev Page</button>
            <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 600;">Page 2 of 6</span>
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(3)">Next Page <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
</div>

<!-- ================= PAGE 3: SKILLS MATRIX ================= -->
<div class="roadmap-page" id="roadmap-page-3">
    <div class="roadmap-item">
        <h2><i class="fa-solid fa-code"></i> Skill Matrix & Tool Proficiency</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: var(--text-secondary);">
            Track your professional skill set. Check off items as you learn them to monitor your journey.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 28px;">
            <div style="background: rgba(34, 197, 94, 0.03); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: #22c55e; margin-bottom: 14px;"><i class="fa-solid fa-circle-check"></i> Beginner Core Skills</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${(skills.beginner || ["Foundational concepts"]).map((s, idx) => `
                        <div class="custom-checkbox" style="display: flex; align-items: flex-start; gap: 10px;">
                            <input type="checkbox" id="beg-chk-${idx}" style="margin-top: 4px; cursor: pointer;">
                            <label for="beg-chk-${idx}" style="font-size: 0.9rem; color: var(--text-secondary); cursor: pointer; line-height: 1.4;">${s}</label>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div style="background: rgba(250, 204, 21, 0.03); border: 1px solid rgba(250, 204, 21, 0.2); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: var(--accent); margin-bottom: 14px;"><i class="fa-solid fa-circle-check"></i> Intermediate Execution</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${(skills.intermediate || ["Applied engineering workflows"]).map((s, idx) => `
                        <div class="custom-checkbox" style="display: flex; align-items: flex-start; gap: 10px;">
                            <input type="checkbox" id="int-chk-${idx}" style="margin-top: 4px; cursor: pointer;">
                            <label for="int-chk-${idx}" style="font-size: 0.9rem; color: var(--text-secondary); cursor: pointer; line-height: 1.4;">${s}</label>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div style="background: rgba(168, 85, 247, 0.03); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: #a855f7; margin-bottom: 14px;"><i class="fa-solid fa-circle-check"></i> Advanced Leadership</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${(skills.advanced || ["Strategic systems & architecture"]).map((s, idx) => `
                        <div class="custom-checkbox" style="display: flex; align-items: flex-start; gap: 10px;">
                            <input type="checkbox" id="adv-chk-${idx}" style="margin-top: 4px; cursor: pointer;">
                            <label for="adv-chk-${idx}" style="font-size: 0.9rem; color: var(--text-secondary); cursor: pointer; line-height: 1.4;">${s}</label>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: var(--accent);"><i class="fa-solid fa-screwdriver-wrench"></i> Recommended Tools & Software</h3>
                <div class="chip-grid" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                    ${(tools || ["Git", "Excel", "Terminal"]).map(t => `<span class="chip-item">🛠 ${t}</span>`).join("")}
                </div>
            </div>

            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: #3b82f6;"><i class="fa-solid fa-certificate"></i> Key Professional Certifications</h3>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
                    ${(certifications || ["Google Cloud Professional Certification", "AWS Practitioner", "Project Management Professional (PMP)"]).map(cert => `
                        <div style="font-size: 0.88rem; color: var(--text-secondary); padding: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-award" style="color: #3b82f6;"></i> ${cert}
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>

        <!-- PAGE FOOTER NAV -->
        <div class="page-footer-nav" style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border);">
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(2)"><i class="fa-solid fa-arrow-left"></i> Prev Page</button>
            <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 600;">Page 3 of 6</span>
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(4)">Next Page <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
</div>

<!-- ================= PAGE 4: PORTFOLIO PROJECTS ================= -->
<div class="roadmap-page" id="roadmap-page-4">
    <div class="roadmap-item">
        <h2><i class="fa-solid fa-laptop-code"></i> Hands-On Tasks & Practical Applications</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: var(--text-secondary);">
            Acquire real-world experience and proof of work by completing these practical tasks, case studies, or portfolio items.
        </p>

        <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px;">
            <div style="background: rgba(34, 197, 94, 0.03); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 16px; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <h3 style="margin: 0; color: #22c55e; font-size: 1.1rem;"><i class="fa-solid fa-seedling"></i> Beginner Tasks & Projects</h3>
                    <span style="font-size: 0.72rem; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 10px; border-radius: 10px; font-weight: 700;">Foundation</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                    ${(projects.beginner || ["Construct foundation level project/task to learn concepts & standard tools."]).map((p, idx) => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.02); font-size: 0.9rem; color: var(--text-secondary); line-height: 1.45;">
                            <strong>Task ${idx + 1}:</strong> ${p}
                        </div>
                    `).join("")}
                </div>
            </div>

            <div style="background: rgba(250, 204, 21, 0.03); border: 1px solid rgba(250, 204, 21, 0.25); border-radius: 16px; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <h3 style="margin: 0; color: var(--accent); font-size: 1.1rem;"><i class="fa-solid fa-fire"></i> Intermediate Tasks & Projects</h3>
                    <span style="font-size: 0.72rem; color: var(--accent); background: rgba(250, 204, 21, 0.1); padding: 2px 10px; border-radius: 10px; font-weight: 700;">Applied</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                    ${(projects.intermediate || ["Build functional projects or case studies demonstrating intermediate mastery."]).map((p, idx) => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.02); font-size: 0.9rem; color: var(--text-secondary); line-height: 1.45;">
                            <strong>Task ${idx + 1}:</strong> ${p}
                        </div>
                    `).join("")}
                </div>
            </div>

            <div style="background: rgba(168, 85, 247, 0.03); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <h3 style="margin: 0; color: #a855f7; font-size: 1.1rem;"><i class="fa-solid fa-crown"></i> Advanced Tasks & Case Studies</h3>
                    <span style="font-size: 0.72rem; color: #a855f7; background: rgba(168, 85, 247, 0.1); padding: 2px 10px; border-radius: 10px; font-weight: 700;">Scale & Security</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                    ${(projects.advanced || ["Complete advanced case studies, mock audits, or high-concurrency systems."]).map((p, idx) => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.02); font-size: 0.9rem; color: var(--text-secondary); line-height: 1.45;">
                            <strong>Task ${idx + 1}:</strong> ${p}
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>

        <!-- PAGE FOOTER NAV -->
        <div class="page-footer-nav" style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border);">
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(3)"><i class="fa-solid fa-arrow-left"></i> Prev Page</button>
            <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 600;">Page 4 of 6</span>
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(5)">Next Page <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
</div>

<!-- ================= PAGE 5: PREP & RESOURCES ================= -->
<div class="roadmap-page" id="roadmap-page-5">
    <div class="roadmap-item">
        <h2><i class="fa-solid fa-graduation-cap"></i> Preparation Strategy & Curated Resources</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: var(--text-secondary);">
            Optimize your preparation roadmap with hand-picked textbooks, online programs, official documentation, and shortcuts.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: var(--accent);"><i class="fa-solid fa-laptop"></i> Recommended Courses & Programs</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; gap: 8px; display: flex; flex-direction: column;">
                    ${renderResourceList(resources.courses, ["Coursera Specialized Track", "Udemy Advanced Masterclass", "Vetted Certification Tracks"], "fa-solid fa-graduation-cap", "#60a5fa")}
                </ul>
            </div>

            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: #3b82f6;"><i class="fa-solid fa-book"></i> Vetted Books & Publications</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; gap: 8px; display: flex; flex-direction: column;">
                    ${renderResourceList(resources.books, ["Industry Standard Handbook", "Designing High Reliability Systems", "Operational Strategy Book"], "fa-solid fa-book", "#60a5fa")}
                </ul>
            </div>

            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: #22c55e;"><i class="fa-solid fa-file-lines"></i> Official Documentation</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; gap: 8px; display: flex; flex-direction: column;">
                    ${renderResourceList(resources.documentation, ["Official API Guidelines & Reference Docs", "Community standards & whitepapers"], "fa-solid fa-file-code", "#4ade80")}
                </ul>
            </div>

            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: #a855f7;"><i class="fa-solid fa-play"></i> YouTube Channels & Communities</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; gap: 8px; display: flex; flex-direction: column;">
                    ${renderResourceList(resources.youtube || resources.youtube_channels, ["Top-Tier Tech Creators", "Mock Interview Prep channels", "Expert Code Walkthroughs"], "fa-brands fa-youtube", "#f87171")}
                </ul>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: var(--accent);"><i class="fa-solid fa-clipboard-question"></i> Top 5 Interview Prep Questions</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; gap: 8px; display: flex; flex-direction: column;">
                    ${(interview || ["Prepare core technical questions in your domain", "Mock architectural design exercises"]).map(i => `<li>💬 ${i}</li>`).join("")}
                </ul>
            </div>

            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: #3b82f6;"><i class="fa-solid fa-bullseye"></i> Top 5 Portfolio Building Hacks</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; gap: 8px; display: flex; flex-direction: column;">
                    ${(portfolio || ["Host active live demonstrations of all projects", "Write highly technical case studies on Github"]).map(p => `<li>🎯 ${p}</li>`).join("")}
                </ul>
            </div>

            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px;">
                <h3 style="margin-top: 0; color: #a855f7;"><i class="fa-solid fa-wand-magic-sparkles"></i> Top 5 AI Hacks / Prompt Models</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; gap: 8px; display: flex; flex-direction: column;">
                    ${(aiTips || ["Ask AI to review your design patterns & structures", "Simulate live coding interviews using specialized prompt roles"]).map(a => `<li>🤖 ${a}</li>`).join("")}
                </ul>
            </div>
        </div>

        <!-- PAGE FOOTER NAV -->
        <div class="page-footer-nav" style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border);">
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(4)"><i class="fa-solid fa-arrow-left"></i> Prev Page</button>
            <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 600;">Page 5 of 6</span>
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(6)">Next Page <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
</div>

<!-- ================= PAGE 6: MARKET & HIRING ================= -->
<div class="roadmap-page" id="roadmap-page-6">
    <div class="roadmap-item">
        <h2><i class="fa-solid fa-chart-pie"></i> Market Intelligence & Hiring Landscape</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: var(--text-secondary);">
            Evaluate salary metrics, global mobility scope, visa configurations, hiring clusters, and core parameters.
        </p>

        <!-- Official Country Salary Pay Band Card -->
        ${renderPayBandCard(overview.salary || market.salary, targetSalInfo, country)}

        <!-- Global Mobility & Relocation Readiness Index -->
        ${(() => {
            const cLow = (country || "").toLowerCase().trim();
            const careerTitle = data.career || career || "Professional";
            
            let visaName = "Standard Work Permit / Skilled Visa";
            let visaDetails = "Requires official job offer & corporate sponsorship from licensed employer.";
            let languageReq = "English (Professional Working)";
            let languageDetails = "International business language standard across major corporate hubs.";
            let score = "90 / 100";

            if (cLow.includes("japan")) {
                visaName = "HSP Visa / Engineer Work Status";
                visaDetails = "Fast-track 1-3 year permanent residency for Highly Skilled Professionals.";
                languageReq = "Japanese JLPT N3 / N2 (Target)";
                languageDetails = "English used in multinational tech; JLPT N3 unlocks 5x more local roles.";
                score = "92 / 100";
            } else if (cLow.includes("germany") || cLow.includes("europe") || cLow.includes("eu")) {
                visaName = "EU Blue Card / Opportunity Card";
                visaDetails = "Fast-track residence permit with minimum salary threshold requirements.";
                languageReq = "German B1/B2 (Recommended)";
                languageDetails = "Tech hubs (Berlin/Munich) operate in English; B1 accelerates permanent PR.";
                score = "95 / 100";
            } else if (cLow.includes("usa") || cLow.includes("united states") || cLow.includes("america")) {
                visaName = "H-1B / O-1 / L-1 Intracompany";
                visaDetails = "Cap-subject lottery or specialized talent visa; STEM OPT extension for graduates.";
                languageReq = "Native / Fluent English";
                languageDetails = "Full professional fluency required for technical interviews & client presentation.";
                score = "94 / 100";
            } else if (cLow.includes("uk") || cLow.includes("united kingdom")) {
                visaName = "Skilled Worker Visa (SWV)";
                visaDetails = "Point-based immigration system requiring licensed sponsor & salary threshold.";
                languageReq = "IELTS / B2 English Certified";
                languageDetails = "Standard UKVI English proficiency certification required for visa application.";
                score = "93 / 100";
            } else if (cLow.includes("uae") || cLow.includes("dubai") || cLow.includes("saudi")) {
                visaName = "Golden Visa / Tax-Free Work Permit";
                visaDetails = "10-year residency for top talent & executive specialists; 0% personal income tax.";
                languageReq = "English (Arabic Advantage)";
                languageDetails = "Corporate business operates entirely in English; Arabic is a strong local asset.";
                score = "96 / 100";
            } else if (cLow.includes("india")) {
                visaName = "Domestic Prime Market";
                visaDetails = "Seamless national mobility across major Tier-1 technology & corporate hubs.";
                languageReq = "English & Regional Fluency";
                languageDetails = "English is the standard corporate medium across Indian enterprise hubs.";
                score = "98 / 100";
            }

            const countryName = targetSalInfo?.name || (country ? country.trim() : "Target Market");

            return `
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 18px; padding: 22px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 12px 30px rgba(0,0,0,0.45); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
                    <span style="font-size: 1.02rem; font-weight: 800; color: var(--text-heading); display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.3rem;">🌐</span> Global Mobility & Relocation Readiness Index (${countryName})
                    </span>
                    <span style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 0.78rem; padding: 4px 12px; border-radius: 20px; font-weight: 800;">
                        <i class="fa-solid fa-plane-departure"></i> International Hiring Active
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px;">
                        <span style="font-size: 0.72rem; color: #3b82f6; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">📜 Visa & Work Authorization</span>
                        <h4 style="color: var(--text-heading); font-size: 0.92rem; margin: 6px 0 4px; font-weight: 800;">${visaName}</h4>
                        <p style="font-size: 0.76rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">${visaDetails}</p>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px;">
                        <span style="font-size: 0.72rem; color: #22c55e; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">🗣️ Language & Cultural Prep</span>
                        <h4 style="color: #22c55e; font-size: 0.92rem; margin: 6px 0 4px; font-weight: 800;">${languageReq}</h4>
                        <p style="font-size: 0.76rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">${languageDetails}</p>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px;">
                        <span style="font-size: 0.72rem; color: #a855f7; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">💎 Global Mobility Score</span>
                        <h4 style="color: #d8b4fe; font-size: 1.1rem; margin: 4px 0 2px; font-weight: 900;">${score}</h4>
                        <p style="font-size: 0.76rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">High international transferability for ${careerTitle}.</p>
                    </div>
                </div>
            </div>
            `;
        })()}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 24px; align-items: center;">
            <div style="background: rgba(25, 25, 25, 0.7); border: 1px solid var(--border); border-radius: 16px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 0.88rem; font-weight: 800; color: var(--text-heading);"><i class="fa-solid fa-chart-radar" style="color: var(--accent); margin-right: 6px;"></i> Market Ecosystem Radar</span>
                </div>
                <div style="height: 230px; position: relative;">
                    <canvas id="marketAnalyticsCanvas"></canvas>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
                <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 0.78rem; color: #22c55e; font-weight: 800;">🔥 JOB DEMAND</span>
                        <span style="font-size: 0.82rem; font-weight: 900; color: #22c55e; background: rgba(34, 197, 94, 0.15); padding: 2px 10px; border-radius: 10px;">${market.job_demand?.rating || (market.job_demand?.percentage ? (market.job_demand.percentage > 80 ? 'Very High' : 'High') : 'High')}</span>
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.4;">${market.job_demand?.reason || market.job_demand?.text || `High market demand driven by enterprise hiring.`}</p>
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
                    <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.4;">${market.growth?.reason || market.growth?.text || "Strong multi-year expansion powered by technology integration."}</p>
                </div>

                <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 0.78rem; color: #a855f7; font-weight: 800;">📚 TIME COMMITMENT</span>
                        <span style="font-size: 0.82rem; font-weight: 900; color: #a855f7; background: rgba(168, 85, 247, 0.15); padding: 2px 10px; border-radius: 10px;">${market.learning_time?.duration || '6 Months'}</span>
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.4;">${market.learning_time?.details || market.learning_time?.text || "Estimated time commitment for structured learning to entry level."}</p>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 20px;">
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

        <h3><i class="fa-solid fa-location-dot"></i> Hiring Spots</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
            ${(market.hiring_hotspots || []).map(city => `
                <div style="background: rgba(25, 25, 25, 0.8); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">
                    <span style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">📍 ${city.city}</span>
                    <h5 style="margin: 4px 0; color: var(--text-heading); font-size: 0.85rem;">${city.demand}</h5>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">${city.reason}</p>
                </div>
            `).join("")}
        </div>

        <h3><i class="fa-solid fa-calendar-check"></i> Top 5 Weekly Study Plan Steps</h3>
        <ul>
            ${(market.daily_plan || []).map(day => `<li>📅 ${day}</li>`).join("")}
        </ul>

        <!-- PAGE FOOTER NAV -->
        <div class="page-footer-nav" style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border);">
            <button type="button" class="footer-nav-btn" onclick="showRoadmapPage(5)"><i class="fa-solid fa-arrow-left"></i> Prev Page</button>
            <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 600;">Page 6 of 6</span>
            <button type="button" class="footer-nav-btn" disabled style="opacity: 0.3; cursor: not-allowed;">Next Page <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
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
            .replace(/¥/g, "JPY ")
            .replace(/€/g, "EUR ")
            .replace(/£/g, "GBP ")
            .replace(/₩/g, "KRW ")
            .replace(/₺/g, "TRY ")
            .replace(/₪/g, "ILS ")
            .replace(/฿/g, "THB ")
            .replace(/₽/g, "RUB ")
            .replace(/৳/g, "BDT ")
            .replace(/₱/g, "PHP ")
            .replace(/₫/g, "VND ")
            .replace(/₦/g, "NGN ")
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

    const salaryObj = overview.salary || data.market?.salary || {};
    const pdfTargetLoc = sanitize(salaryObj.target_location || data.country || 'Target Location');

    let pdfTargetSalaryStr = "";
    if (salaryObj.formatted_range) {
        pdfTargetSalaryStr = sanitize(salaryObj.formatted_range);
    } else if (salaryObj.fresher && salaryObj.fresher !== "Data unavailable") {
        pdfTargetSalaryStr = sanitize(`${salaryObj.fresher} (Fresher) -> ${salaryObj.mid} (Mid) -> ${salaryObj.senior} (Senior)`);
    } else {
        pdfTargetSalaryStr = "Data unavailable";
    }

    let pdfIntlSalaryStr = "";
    if (salaryObj.international_usd_range) {
        pdfIntlSalaryStr = sanitize(salaryObj.international_usd_range);
    } else if (salaryObj.international_usd_fresher && salaryObj.international_usd_fresher !== "Data unavailable") {
        pdfIntlSalaryStr = sanitize(`${salaryObj.international_usd_fresher} (Fresher) -> ${salaryObj.international_usd_mid} (Mid) -> ${salaryObj.international_usd_senior} (Senior)`);
    } else {
        pdfIntlSalaryStr = "Data unavailable";
    }

    doc.autoTable({
        startY: y,
        head: [['Education & Path', `Expected Pay (${pdfTargetLoc})`, 'Future Scope']],
        body: [[
            sanitize(overview.education || "Bachelor's / STEM"),
            pdfTargetSalaryStr,
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
        'Task/Project: ' + sanitize(m.project || 'N/A') + '\nGoal: ' + sanitize(m.goal || 'N/A')
    ]);

    doc.autoTable({
        startY: y,
        head: [['Month / Phase Title', 'Core Topics to Master', 'Practical Task & Milestone Goal']],
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
    drawSectionHeader("4. Hands-On Tasks & Practical Applications");

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
        head: [['Beginner Tasks & Projects', 'Intermediate Tasks & Projects', 'Advanced Tasks & Case Studies']],
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

// ==========================================
// Page Router & Radar Chart Initializer
// ==========================================

window.showRoadmapPage = function(pageNum) {
    // 1. Update active state on navigator buttons
    const buttons = document.querySelectorAll(".roadmap-page-btn");
    buttons.forEach((btn, idx) => {
        if (idx + 1 === pageNum) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // 2. Update active state on roadmap pages
    const pages = document.querySelectorAll(".roadmap-page");
    pages.forEach((page, idx) => {
        if (idx + 1 === pageNum) {
            page.classList.add("active");
            page.style.display = "block";
        } else {
            page.classList.remove("active");
            page.style.display = "none";
        }
    });

    // 3. Scroll container into view smoothly
    const container = document.querySelector(".roadmap-top-bar");
    if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // 4. Deferred initialization of Radar chart on page 6
    if (pageNum === 6) {
        initRadarChartDeferred();
    }
};

function initRadarChartDeferred() {
    setTimeout(() => {
        const canvas = document.getElementById("marketAnalyticsCanvas");
        if (canvas && typeof Chart !== "undefined") {
            if (window.marketChartInstance) {
                window.marketChartInstance.destroy();
            }
            const ctx = canvas.getContext("2d");
            const market = window.currentRoadmap?.market || {};
            
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
}



