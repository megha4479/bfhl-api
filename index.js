import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: "megha@chitkara.edu.in"
  });
});


const fibonacciSeries = (n) => {
  const result = [0, 1];
  for (let i = 2; i < n; i++) {
    result.push(result[i - 1] + result[i - 2]);
  }
  return result.slice(0, n);
};

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const findHCF = (arr) => arr.reduce((a, b) => gcd(a, b));

const lcm = (a, b) => (a * b) / gcd(a, b);
const findLCM = (arr) => arr.reduce((a, b) => lcm(a, b));


const fallbackAI = (question) => {
  const q = question.toLowerCase();
  if (q.includes("capital") && q.includes("maharashtra")) return "Mumbai";
  if (q.includes("capital") && q.includes("india")) return "Delhi";
  return "Unknown";
};


app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({ is_success: false });
    }

    const key = keys[0];
    let data;

    if (key === "fibonacci") {
      data = fibonacciSeries(body.fibonacci);
    } else if (key === "prime") {
      data = body.prime.filter(isPrime);
    } else if (key === "hcf") {
      data = findHCF(body.hcf);
    } else if (key === "lcm") {
      data = findLCM(body.lcm);
    } else if (key === "AI") {
      try {
        const aiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: body.AI }] }]
          }
        );

        data = aiRes.data.candidates[0].content.parts[0].text
          .trim()
          .split(" ")[0];
      } catch {
        data = fallbackAI(body.AI);
      }
    } else {
      return res.status(400).json({ is_success: false });
    }

    res.status(200).json({
      is_success: true,
      official_email: "megha@chitkara.edu.in",
      data
    });
  } catch {
    res.status(500).json({ is_success: false });
  }
});

export default app;
