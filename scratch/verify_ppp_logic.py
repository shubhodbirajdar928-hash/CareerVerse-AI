# -*- coding: utf-8 -*-
import io
import sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r"c:\Users\Shubhod\OneDrive\project\CareerVerse AI")

from app import app, get_country_col_info

print("==================================================")
print("VERIFYING PPP SALARY ADJUSTER MATHEMATICS & LOGIC")
print("==================================================")

# Test 1: Math Verification of India to Ireland Conversion
print("1. Testing India to Ireland math parameters:")
india_info = get_country_col_info("India")
ireland_info = get_country_col_info("Ireland")

print(f"  India: Index={india_info['index']}, ExchangeRate={india_info['exchange_rate']}, PPPFactor={india_info['ppp_factor']}")
print(f"  Ireland: Index={ireland_info['index']}, ExchangeRate={ireland_info['exchange_rate']}, PPPFactor={ireland_info['ppp_factor']}")

# Math check
base_salary = 600000.0

# Nominal Currency conversion calculation
usd_salary = base_salary / india_info["exchange_rate"]
converted_salary = usd_salary * ireland_info["exchange_rate"]

# PPP conversion calculation
usd_ppp = base_salary / india_info["ppp_factor"]
ppp_salary = usd_ppp * ireland_info["ppp_factor"]

print(f"  Base salary: ₹{base_salary:,.2f}")
print(f"  Nominal Currency Equivalent in Ireland: €{converted_salary:,.2f}")
print(f"  PPP Purchasing Power Equivalent in Ireland: €{ppp_salary:,.2f}")

# Asserts to make sure math is completely correct and realistic
assert abs(converted_salary - 6610.778) < 10.0
assert abs(ppp_salary - 20936.17) < 10.0
assert ppp_salary < 30000.0  # Assures it is not €1,851,429!

print("  -> Math asserts passed: Currency equivalent and PPP salary are distinct and realistic!")

# Test 2: Endpoint API Verification
print("\n2. Testing Flask PPP Adjuster API Endpoint:")
client = app.test_client()

response = client.post("/col-calculator-api", json={
    "base_salary": "600,000",
    "base_country": "India",
    "target_country": "Ireland",
    "career": "Risk Analyst",
    "experience": "Entry Level",
    "target_city": "Dublin"
})

print("  API Status code:", response.status_code)
res = response.get_json()

# Assertions on returned segments
assert res["success"] is True
assert res["base_currency_code"] == "INR"
assert res["target_currency_code"] == "EUR"
assert res["base_salary"] == 600000.0

# Assert separate calculation blocks
conv_block = res["currency_conversion"]
ppp_block = res["ppp_comparison"]
market_block = res["market_salary"]
col_block = res["cost_of_living"]

print("\n  Returned API segments:")
print(f"    - Currency Conversion Converted Salary: {conv_block['converted_salary']} EUR")
print(f"    - PPP Adjusted Salary: {ppp_block['ppp_salary']} EUR")
print(f"    - Market Salary range: {market_block['min']} to {market_block['max']} EUR")
print(f"    - Cost of living overall diff: {col_block['percent_diff']}%")
print(f"    - Intelligent Relocation Analysis: {res['intelligent_analysis']}")

# Test values against Ireland stats
assert abs(conv_block["converted_salary"] - 6610.778) < 10.0
assert abs(ppp_block["ppp_salary"] - 20936.17) < 10.0
assert market_block["available"] is True
assert market_block["min"] >= 25000  # realistic lower bound for entry level Ireland
assert market_block["max"] > market_block["min"]  # realistic ordering check

print("\n3. Testing API Input Validation & Safeguards:")
# Invalid salary checks
res_invalid = client.post("/col-calculator-api", json={
    "base_salary": "-1000",
    "base_country": "India",
    "target_country": "Ireland"
})
print(f"  Negative salary check status: {res_invalid.status_code}")
assert res_invalid.status_code == 400

res_empty = client.post("/col-calculator-api", json={
    "base_salary": "",
    "base_country": "India",
    "target_country": "Ireland"
})
print(f"  Empty salary check status: {res_empty.status_code}")
assert res_empty.status_code == 400

print("\n[SUCCESS] PPP Salary Adjuster Accuracy Verification Completed Successfully!")
print("==================================================")
