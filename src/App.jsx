import { useEffect, useState } from "react";
import "./index.css";

// Formatter for INR
const formatToINR = (value, round = true) => {
  if (value >= 1e7)
    return (round ? (value / 1e7).toFixed(2) : value / 1e7) + " Cr";
  if (value >= 1e5)
    return (round ? (value / 1e5).toFixed(2) : value / 1e5) + " L";
  return round ? value.toFixed(2) : value;
};

// Formatter for USD
const formatToUSD = (value, round = true) => {
  if (value >= 1e9)
    return (round ? (value / 1e9).toFixed(2) : value / 1e9) + "B";
  if (value >= 1e6)
    return (round ? (value / 1e6).toFixed(2) : value / 1e6) + "M";
  if (value >= 1e3)
    return (round ? (value / 1e3).toFixed(2) : value / 1e3) + "K";
  return round ? value.toFixed(2) : value;
};

// Flexible parser (e.g. 50L, 1.2Cr, 2M, 3.5B, 5K)
const parseFlexibleInput = (input) => {
  input = input.trim().toUpperCase().replace(/\s/g, "");
  let multiplier = 1;

  if (input.endsWith("CR")) {
    multiplier = 1e7;
    input = input.replace("CR", "");
  } else if (input.endsWith("L") || input.endsWith("LAKH")) {
    multiplier = 1e5;
    input = input.replace("L", "").replace("LAKH", "");
  } else if (
    input.endsWith("B") ||
    input.endsWith("BIL") ||
    input.endsWith("BILLION")
  ) {
    multiplier = 1e9;
    input = input.replace(/B(IL(LION)?)?/, "");
  } else if (
    input.endsWith("M") ||
    input.endsWith("MIL") ||
    input.endsWith("MILLION")
  ) {
    multiplier = 1e6;
    input = input.replace(/M(IL(LION)?)?/, "");
  } else if (input.endsWith("K") || input.endsWith("THOUSAND")) {
    multiplier = 1e3;
    input = input.replace(/K|THOUSAND/, "");
  }

  const num = parseFloat(input);
  return isNaN(num) ? 0 : num * multiplier;
};

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isInrToUsd, setIsInrToUsd] = useState(true);
  const [rounding, setRounding] = useState(true);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("conversion_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch(
          "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json"
        );
        const data = await res.json();
        setRate(data.inr.usd);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch exchange rate.");
        setLoading(false);
      }
    };
    fetchRate();
  }, []);

  const convert = () => {
    const amount = parseFlexibleInput(input);
    if (!rate || amount === 0) {
      setResult("Invalid input");
      return;
    }

    let converted, formatted;
    if (isInrToUsd) {
      converted = amount * rate;
      formatted = formatToUSD(converted, rounding);
    } else {
      converted = amount / rate;
      formatted = formatToINR(converted, rounding);
    }

    setResult(formatted);

    const newEntry = {
      id: Date.now(),
      input,
      result: formatted,
      date: new Date().toISOString().split("T")[0],
      direction: isInrToUsd ? "INR → USD" : "USD → INR",
    };

    const updatedHistory = [newEntry, ...history].slice(0, 15);
    setHistory(updatedHistory);
    localStorage.setItem("conversion_history", JSON.stringify(updatedHistory));
  };

  const swap = () => {
    setIsInrToUsd(!isInrToUsd);
    setResult("");
  };

  const clearHistory = () => {
    localStorage.removeItem("conversion_history");
    setHistory([]);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    alert("Result copied!");
  };

  const shareResult = async () => {
    if (!result || !navigator.share) return alert("Sharing not supported.");
    await navigator.share({
      title: "Currency Conversion Result",
      text: `Converted value: ${result}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg md:text-xl font-semibold text-gray-700">
        Loading exchange rate...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 text-lg md:text-xl font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br p-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-white text-center">
        ₹lac ↔ $mil
      </h1>

      <div className="w-full max-w-sm sm:max-w-md bg-white/30 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg space-y-4 transition-all ease-in-out scale-105">
        <div className="flex justify-between items-center text-m">
          <span className="font-semibold text-black">
            {isInrToUsd ? "INR → USD" : "USD → INR"}
          </span>
          <button onClick={swap} className="px-3 py-1 text-sm font-medium">
            Swap
          </button>
        </div>

        <div className="flex justify-between items-center text-sm">
          <label className="font-bold text-black">
            Rounding: {rounding ? "On" : "Off"}
          </label>
          <button
            onClick={() => setRounding(!rounding)}
            className="px-3 py-1 text-sm font-medium"
          >
            Toggle
          </button>
        </div>

        <input
          type="text"
          placeholder={
            isInrToUsd
              ? "e.g. 1Cr, 50L, 300000"
              : "e.g. 10K, 1.5M, 100Mil, 2.3B"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-3 text-sm sm:text-base rounded-lg border bg-white/50 backdrop-blur-sm text-gray-800 font-semibold focus:outline-none border-none"
        />

        <button
          onClick={convert}
          className="w-full bg-black text-white hover:bg-gray-900 py-2 rounded-md font-medium"
        >
          Convert
        </button>

        {result && (
          <div className="text-lg sm:text-xl text-center text-yellow-400 font-bold">
            {result}
          </div>
        )}

        {result && (
          <div className="flex justify-center gap-4 text-sm">
            <button onClick={copyToClipboard} className="px-3 py-1 text-white">
              Copy
            </button>
            <button
              onClick={
                navigator.share
                  ? shareResult
                  : () => alert("Sharing not supported in this device.")
              }
              className="px-3 py-1"
            >
              Share
            </button>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center text-sm">{error}</div>
        )}
      </div>

      {history.length > 0 && (
        <div className="w-full max-w-sm sm:max-w-md mt-6 bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Conversion History
            </h2>
            <button
              onClick={clearHistory}
              className="text-sm px-3 py-1 text-red-600 font-medium"
            >
              Clear
            </button>
          </div>
          <ul className="max-h-60 overflow-y-auto space-y-2 text-sm text-gray-800">
            {history.map((item) => (
              <li key={item.id} className="border-b border-gray-300 pb-1">
                <span className="font-medium">{item.input}</span> →{" "}
                <span className="font-bold">{item.result}</span>
                <div className="text-xs text-gray-600">
                  {item.direction}, {item.date}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
