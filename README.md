# 💱 Currency Converter — ₹Lakh ↔ $Million

A sleek and responsive currency converter built with **React** and **Tailwind CSS**. Instantly convert between INR and USD using Indian (Lakh/Cr) and American (K/M/B) number systems. Smart input parsing, real-time exchange rates, and useful tools like history, rounding, copy, and share support.

---

## 🔥 Features

- 🇮🇳➡️🇺🇸 **Indian ↔ American Number System**
  - Supports values like `1Cr`, `50L`, `$2.3M`, `5K`, etc.
- 🔁 **Swap** conversion direction without clearing your input
- 🎯 **Smart Input Parsing**
  - Detects whether input is INR or USD and auto-configures direction
- 🧠 **Flexible Notations**
  - Interprets `L`, `Cr`, `K`, `M`, `B`, `Million`, `Billion`, `Lakh`, etc.
- 🔘 **Rounding Toggle**
  - Choose to display precise or rounded values
- 📈 **Real-Time Exchange Rate**
  - Fetched from [Fawaz Ahmed’s Currency API](https://github.com/fawazahmed0/currency-api)
- 📋 **Copy to Clipboard**
- 📤 **Share Result (Web Share API)**
- 🕓 **Recent History**
  - Stores the **last 15 conversions** with date and direction
- 💻 **Responsive Design**
  - Optimized for desktop and mobile
- 🌐 **Offline-safe UI**
  - Clean fallback if exchange rate fetch fails

---


## 🛠 Tech Stack

- React
- Tailwind CSS
- JavaScript (ES6+)
- [Fawaz Currency API](https://github.com/fawazahmed0/currency-api)
