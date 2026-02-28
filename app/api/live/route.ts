import { NextResponse } from "next/server";

let logs: string[] = [];
let history: { time: string; errorRate: number }[] = [];

function classify(errorRate: number) {
  if (errorRate > 70) return { risk: "Critical", health: "RED" };
  if (errorRate > 50) return { risk: "Severe", health: "ORANGE" };
  if (errorRate > 25) return { risk: "High", health: "YELLOW" };
  if (errorRate > 10) return { risk: "Moderate", health: "GREEN" };
  return { risk: "Stable", health: "GREEN" };
}

// More realistic weighted generation
function generateLogLevel() {
  const random = Math.random();

  if (random < 0.55) return "INFO";
  if (random < 0.80) return "WARNING";
  return "ERROR";
}

export async function GET() {
  logs.push(generateLogLevel());

  if (logs.length > 300) logs.shift();

  // Rolling window (last 30 logs)
  const recentLogs = logs.slice(-30);

  let info = 0,
    warning = 0,
    error = 0;

  recentLogs.forEach((level) => {
    if (level === "INFO") info++;
    if (level === "WARNING") warning++;
    if (level === "ERROR") error++;
  });

  const total = recentLogs.length || 1;
  const errorRate = (error / total) * 100;

  history.push({
    time: new Date().toLocaleTimeString(),
    errorRate: Number(errorRate.toFixed(2)),
  });

  if (history.length > 25) history.shift();

  const classification = classify(errorRate);

  return NextResponse.json({
    total,
    info,
    warning,
    error,
    infoRate: ((info / total) * 100).toFixed(2),
    warningRate: ((warning / total) * 100).toFixed(2),
    errorRate: errorRate.toFixed(2),
    risk: classification.risk,
    health: classification.health,
    history,
  });
}