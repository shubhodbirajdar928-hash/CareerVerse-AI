/* Scroll reveal, navbar, counters, mobile nav, FAQ, Live Hero Simulator, Quiz Modal, Quick Navigator */
(function () {
    'use strict';

    /* Navbar scroll effect */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    /* Mobile navigation */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    /* Scroll reveal */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => observer.observe(el));
    }

    /* Animated stat counters */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = el.dataset.count;
                const suffix = el.dataset.suffix || '';
                const prefix = el.dataset.prefix || '';

                if (target === '∞') {
                    el.textContent = '∞';
                    countObserver.unobserve(el);
                    return;
                }

                const num = parseInt(target, 10);
                if (isNaN(num)) {
                    el.textContent = prefix + target + suffix;
                    countObserver.unobserve(el);
                    return;
                }

                let current = 0;
                const step = Math.max(1, Math.floor(num / 40));
                const timer = setInterval(() => {
                    current += step;
                    if (current >= num) {
                        current = num;
                        clearInterval(timer);
                    }
                    el.textContent = prefix + current + suffix;
                }, 30);

                countObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(el => countObserver.observe(el));
    }

    /* FAQ accordion */
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                openItem.classList.remove('open');
            });

            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });

    /* Live Hero Simulator Widget Tab Switching */
    const simPills = document.querySelectorAll('.sim-role-pill');
    const simRoleTitle = document.getElementById('simRoleTitle');
    const simRoleSubtext = document.getElementById('simRoleSubtext');
    const simMatchBadge = document.getElementById('simMatchBadge');
    const simProgressValue = document.getElementById('simProgressValue');
    const simProgressFill = document.getElementById('simProgressFill');
    const simStepsContainer = document.getElementById('simStepsContainer');
    const simDemand = document.getElementById('simDemand');
    const simSalary = document.getElementById('simSalary');

    const roleData = {
        ai: {
            title: "AI & Machine Learning Engineer",
            subtext: "High-demand specialization in RAG, GenAI & LLM Ops",
            match: "98% Match",
            progress: "78%",
            demand: '<i class="fa-solid fa-arrow-trend-up"></i> Very High',
            salary: "₹14L - ₹32L / yr",
            steps: [
                { class: "completed", icon: "fa-check", title: "Phase 1: Python, Math & Data Structures", sub: "Completed • NumPy, Pandas, SQL & OOP" },
                { class: "active", icon: "fa-spinner fa-spin", title: "Phase 2: RAG, LangChain & Embeddings", sub: "In Progress • Vector DBs & Fine-Tuning" },
                { class: "upcoming", icon: "fa-lock", title: "Phase 3: Production MLOps & Deployment", sub: "Next Up • Docker, FastAPI, GCP & Triton" }
            ]
        },
        dev: {
            title: "Full Stack Web Architect",
            subtext: "High-volume hiring in React, Next.js, Node & Cloud Native",
            match: "95% Match",
            progress: "84%",
            demand: '<i class="fa-solid fa-fire"></i> Extremely High',
            salary: "₹10L - ₹24L / yr",
            steps: [
                { class: "completed", icon: "fa-check", title: "Phase 1: Modern JS, HTML5 & Tailwind", sub: "Completed • State Management & DOM APIs" },
                { class: "active", icon: "fa-spinner fa-spin", title: "Phase 2: Full Stack APIs & Databases", sub: "In Progress • Node, Express, PostgreSQL & ORM" },
                { class: "upcoming", icon: "fa-lock", title: "Phase 3: CI/CD & Cloud Deployment", sub: "Next Up • AWS Lambda, Vercel & Docker" }
            ]
        },
        data: {
            title: "Senior Data Scientist & Analytics Lead",
            subtext: "Enterprise analytics, predictive modeling & business AI",
            match: "92% Match",
            progress: "72%",
            demand: '<i class="fa-solid fa-chart-line"></i> High Demand',
            salary: "₹12L - ₹26L / yr",
            steps: [
                { class: "completed", icon: "fa-check", title: "Phase 1: Statistics & SQL Data Pipeline", sub: "Completed • A/B Testing & Query Optimization" },
                { class: "active", icon: "fa-spinner fa-spin", title: "Phase 2: Machine Learning & XGBoost", sub: "In Progress • Scikit-Learn, Feature Eng & EDA" },
                { class: "upcoming", icon: "fa-lock", title: "Phase 3: Big Data & Spark Streaming", sub: "Next Up • Databricks, PySpark & Tableau" }
            ]
        },
        cyber: {
            title: "Cyber Security Specialist",
            subtext: "Zero-trust architecture, ethical hacking & threat defense",
            match: "96% Match",
            progress: "68%",
            demand: '<i class="fa-solid fa-shield-halved"></i> Critical Need',
            salary: "₹11L - ₹28L / yr",
            steps: [
                { class: "completed", icon: "fa-check", title: "Phase 1: Networking & Linux Fundamentals", sub: "Completed • TCP/IP, Kali Linux & Shell" },
                { class: "active", icon: "fa-spinner fa-spin", title: "Phase 2: Penetration Testing & OWASP", sub: "In Progress • Metasploit, Burp Suite & Audit" },
                { class: "upcoming", icon: "fa-lock", title: "Phase 3: Cloud Security & SIEM", sub: "Next Up • Splunk, AWS IAM & SOC Ops" }
            ]
        }
    };

    if (simPills.length && simRoleTitle) {
        simPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const roleKey = pill.getAttribute('data-role');
                const data = roleData[roleKey];

                if (!data) return;

                simPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                simRoleTitle.textContent = data.title;
                simRoleSubtext.textContent = data.subtext;
                simMatchBadge.innerHTML = `<i class="fa-solid fa-fire"></i> ${data.match}`;
                simProgressValue.textContent = data.progress;
                simProgressFill.style.width = data.progress;
                simDemand.innerHTML = data.demand;
                simSalary.textContent = data.salary;

                simStepsContainer.innerHTML = data.steps.map(step => `
                    <div class="sim-step-item ${step.class}">
                        <div class="sim-step-badge"><i class="fa-solid ${step.icon}"></i></div>
                        <div class="sim-step-details">
                            <strong>${step.title}</strong>
                            <small>${step.sub}</small>
                        </div>
                    </div>
                `).join('');
            });
        });
    }

    /* Live Hero Quick Search Navigator */
    const heroQuickSearch = document.getElementById('heroQuickSearch');
    const heroQuickSearchBtn = document.getElementById('heroQuickSearchBtn');
    const suggestTags = document.querySelectorAll('.suggest-tag');

    if (heroQuickSearchBtn && heroQuickSearch) {
        const handleSearch = () => {
            const query = heroQuickSearch.value.trim();
            if (query) {
                window.location.href = `/generate?role=${encodeURIComponent(query)}`;
            } else {
                window.location.href = `/generate`;
            }
        };

        heroQuickSearchBtn.addEventListener('click', handleSearch);
        heroQuickSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });

        suggestTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const cleanText = tag.textContent.replace(/[^a-zA-Z\s]/g, '').trim();
                heroQuickSearch.value = cleanText;
                handleSearch();
            });
        });
    }

    /* Instant 30-Sec Quiz Modal Logic */
    const quizModal = document.getElementById('quizModal');
    const openQuizBtn = document.getElementById('openQuizBtn');
    const closeQuizBtn = document.getElementById('closeQuizBtn');
    const quizSteps = document.querySelectorAll('.quiz-step');
    const nextQuizStep = document.getElementById('nextQuizStep');
    const prevQuizStep = document.getElementById('prevQuizStep');
    const quizResultView = document.getElementById('quizResultView');
    const quizFooter = document.getElementById('quizFooter');
    const quizResultTitle = document.getElementById('quizResultTitle');
    const quizResultDesc = document.getElementById('quizResultDesc');
    const quizResultBtn = document.getElementById('quizResultBtn');

    let currentStep = 1;

    if (quizModal && openQuizBtn && closeQuizBtn) {
        const openModal = () => {
            quizModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            quizModal.classList.remove('open');
            document.body.style.overflow = '';
        };

        openQuizBtn.addEventListener('click', openModal);
        closeQuizBtn.addEventListener('click', closeModal);

        quizModal.addEventListener('click', (e) => {
            if (e.target === quizModal) closeModal();
        });

        if (nextQuizStep && prevQuizStep) {
            const updateStepUI = () => {
                quizSteps.forEach(step => {
                    const stepNum = parseInt(step.getAttribute('data-step'), 10);
                    step.classList.toggle('active', stepNum === currentStep);
                });

                prevQuizStep.style.visibility = currentStep > 1 && currentStep <= 3 ? 'visible' : 'hidden';

                if (currentStep === 3) {
                    nextQuizStep.innerHTML = 'Calculate Results <i class="fa-solid fa-wand-magic-sparkles"></i>';
                } else if (currentStep < 3) {
                    nextQuizStep.innerHTML = 'Next Question <i class="fa-solid fa-arrow-right"></i>';
                }
            };

            nextQuizStep.addEventListener('click', () => {
                if (currentStep < 3) {
                    currentStep++;
                    updateStepUI();
                } else if (currentStep === 3) {
                    // Compute quiz result
                    const bgChoice = document.querySelector('input[name="q_bg"]:checked')?.value || 'tech';
                    const goalChoice = document.querySelector('input[name="q_goal"]:checked')?.value || 'switch';

                    quizSteps.forEach(step => step.classList.remove('active'));
                    quizFooter.style.display = 'none';
                    quizResultView.style.display = 'block';

                    if (goalChoice === 'resume') {
                        quizResultTitle.textContent = 'ATS Resume Evaluator & Scanner';
                        quizResultDesc.textContent = 'Upload your resume to get instant ATS scores, missing keywords, and bullet point improvements.';
                        quizResultBtn.href = '/resume';
                        quizResultBtn.innerHTML = 'Launch Resume Analyzer <i class="fa-solid fa-arrow-right"></i>';
                    } else if (goalChoice === 'skills') {
                        quizResultTitle.textContent = 'AI Skill Gap & Career Readiness Engine';
                        quizResultDesc.textContent = 'Discover missing technical skills and get a personalized learning priority matrix.';
                        quizResultBtn.href = '/skill-gap';
                        quizResultBtn.innerHTML = 'Analyze My Skill Gaps <i class="fa-solid fa-arrow-right"></i>';
                    } else if (goalChoice === 'salary') {
                        quizResultTitle.textContent = 'AI Salary & Compensation Predictor';
                        quizResultDesc.textContent = 'Compare pay bands across locations, experience levels, and top tech hubs.';
                        quizResultBtn.href = '/salary-predictor';
                        quizResultBtn.innerHTML = 'Predict Salary Range <i class="fa-solid fa-arrow-right"></i>';
                    } else {
                        quizResultTitle.textContent = bgChoice === 'tech' ? 'AI & Data Engineering Master Roadmap' : 'Full Stack Tech & AI Transition Path';
                        quizResultDesc.textContent = 'Generate your step-by-step 3-phase learning roadmap with recommended tools & projects.';
                        quizResultBtn.href = bgChoice === 'tech' ? '/generate?role=AI%20Engineer' : '/generate?role=Full%20Stack';
                        quizResultBtn.innerHTML = 'Build My Master Roadmap <i class="fa-solid fa-arrow-right"></i>';
                    }
                }
            });

            prevQuizStep.addEventListener('click', () => {
                if (currentStep > 1) {
                    currentStep--;
                    updateStepUI();
                }
            });
        }
    }
})();
