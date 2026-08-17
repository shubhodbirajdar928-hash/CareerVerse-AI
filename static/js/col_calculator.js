// ==========================================
// Cost of Living & PPP Calculator Script
// ==========================================

(function () {
    'use strict';

    const calculateBtn = document.getElementById("calculateBtn");
    const baseSalaryInput = document.getElementById("baseSalary");
    const baseCountryInput = document.getElementById("baseCountry");
    const targetCountryInput = document.getElementById("targetCountry");
    
    const loading = document.getElementById("loading");
    const resultDashboard = document.getElementById("result");
    
    const adjustedSalaryDisplay = document.getElementById("adjustedSalaryDisplay");
    const comparisonExplanation = document.getElementById("comparisonExplanation");
    const baseCountryLabel = document.getElementById("baseCountryLabel");
    const targetCountryLabel = document.getElementById("targetCountryLabel");
    const meterFill = document.getElementById("meterFill");
    const insightsList = document.getElementById("insightsList");

    if (calculateBtn) {
        calculateBtn.addEventListener("click", calculatePPP);
    }

    async function calculatePPP() {
        const baseSalary = baseSalaryInput.value.trim();
        const baseCountry = baseCountryInput.value.trim() || "United States";
        const targetCountry = targetCountryInput.value.trim() || "India";

        if (!baseSalary) {
            alert("Please enter a base salary.");
            return;
        }

        loading.classList.remove("hidden");
        resultDashboard.classList.add("hidden");
        calculateBtn.disabled = true;

        try {
            const response = await fetch("/col-calculator-api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    base_salary: baseSalary,
                    base_country: baseCountry,
                    target_country: targetCountry
                })
            });

            const data = await response.json();
            calculateBtn.disabled = false;
            loading.classList.add("hidden");

            if (!response.ok || !data.success) {
                alert(data.error || "Unable to calculate Cost of Living adjustment. Please verify country names.");
                return;
            }

            // Render output dashboard
            resultDashboard.classList.remove("hidden");
            
            // Format target salary in target currency
            const formattedSalary = formatCurrency(data.target_salary, data.target_currency_code, data.target_currency_symbol);
            adjustedSalaryDisplay.textContent = formattedSalary;
            
            // Comparison explanation text
            comparisonExplanation.textContent = `${data.comparison_text} A salary of ${data.base_currency_symbol}${parseFloat(baseSalary).toLocaleString()} in ${data.base_country} is equivalent to a purchasing power of ${formattedSalary} in ${data.target_country}.`;
            
            // Render index labels
            baseCountryLabel.textContent = `${data.base_country}: ${data.base_col_index}`;
            targetCountryLabel.textContent = `${data.target_country}: ${data.target_col_index}`;
            
            // Meter fill ratio (cap index relative percentage)
            const fillRatio = Math.min(100, Math.max(5, (data.target_col_index / (data.base_col_index + data.target_col_index)) * 100));
            meterFill.style.width = `${fillRatio}%`;
            
            // Render tips list
            insightsList.innerHTML = "";
            (data.insights || []).forEach(tip => {
                const li = document.createElement("li");
                li.textContent = tip;
                insightsList.appendChild(li);
            });
            
            // Smooth scroll to results
            resultDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error(error);
            calculateBtn.disabled = false;
            loading.classList.add("hidden");
            alert("A network or server error occurred. Please try again.");
        }
    }

    function formatCurrency(val, code, symbol) {
        const rounded = Math.round(val);
        // Custom formatting for Indian Rupees (Lakhs)
        if (code === "INR") {
            if (rounded >= 100000) {
                const lakhs = rounded / 100000;
                return `${symbol}${lakhs.toFixed(2)} Lakhs / yr`;
            }
            return `${symbol}${rounded.toLocaleString('en-IN')} / yr`;
        }
        return `${symbol}${rounded.toLocaleString()} / yr`;
    }

})();
