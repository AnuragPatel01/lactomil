import { useEffect, useState } from "react";
import "./index.css";

const formatToINR = (value, round = true) => {
  if (value >= 1e7) return (round ? (value / 1e7).toFixed(2) : value / 1e7) + " Cr";
  if (value >= 1e5) return (round ? (value / 1e5).toFixed(2) : value / 1e5) + " L";
  return round ? value.toFixed(2) : value;
};

const formatToUSD = (value, round = true) => {
  if (value >= 1e9) return (round ? (value / 1e9).toFixed(2) : value / 1e9) + "B";
  if (value >= 1e6) return (round ? (value / 1e6).toFixed(2) : value / 1e6) + "M";
  if (value >= 1e3) return (round ? (value / 1e3).toFixed(2) : value / 1e3) + "K";
  return round ? value.toFixed(2) : value;
};

const parseFlexibleInput = (input) => {
  input = input.trim().toUpperCase().replace(/\s/g, "");
  let multiplier = 1;

  if (input.endsWith("CR")) {
    multiplier = 1e7;
    input = input.replace("CR", "");
  } else if (input.endsWith("L") || input.endsWith("LAKH")) {
    multiplier = 1e5;
    input = input.replace("L", "").replace("LAKH", "");
  } else if (input.endsWith("B") || input.endsWith("BIL") || input.endsWith("BILLION")) {
    multiplier = 1e9;
    input = input.replace(/B(IL(LION)?)?/, "");
  } else if (input.endsWith("M") || input.endsWith("MIL") || input.endsWith("MILLION")) {
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

    if (isInrToUsd) {
      const converted = amount * rate;
      setResult(formatToUSD(converted, rounding));
    } else {
      const converted = amount / rate;
      setResult(formatToINR(converted, rounding));
    }
  };

  const swap = () => {
    setIsInrToUsd(!isInrToUsd);
    setInput("");
    setResult("");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-white text-center">
        ₹lac → $mil
      </h1>

      <div className="w-full max-w-sm sm:max-w-md bg-white/30 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-lg space-y-4 transition-all ease-in-out">
        <div className="flex justify-between items-center text-m">
          <span className="font-semibold text-gray-700">
            {isInrToUsd ? "INR → USD" : "USD → INR"}
          </span>
          <button
            onClick={swap}
            className="px-3 py-1 bg-black text-white rounded-full hover:bg-gray-800 transition"
          >
            Swap
          </button>
        </div>

        <div className="flex justify-between items-center text-sm">
          <label className="font-bold text-gray-700 ">
            Rounding: {rounding ? "On" : "Off"}
          </label>
          <button
            onClick={() => setRounding(!rounding)}
            className="px-3 py-1 bg-black text-white rounded-full hover:bg-gray-800 transition"
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
          className="w-full p-3 text-sm sm:text-base rounded-lg border bg-white/50 backdrop-blur-sm text-gray-800 font-semibold focus:outline-none"
        />

        <button
          onClick={convert}
          className="w-full font-bold bg-black hover:bg-gray-800 text-white py-2 rounded-lg shadow text-sm sm:text-base"
        >
          Convert
        </button>

        {result && (
          <div className="text-lg sm:text-xl text-center text-green-700 font-bold">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
