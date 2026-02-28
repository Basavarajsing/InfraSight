import { NextResponse } from "next/server";

function classify(errorRate: number) {
  if (errorRate > 70) return { risk: "Critical", health: "RED" };
  if (errorRate > 50) return { risk: "Severe", health: "ORANGE" };
  if (errorRate > 25) return { risk: "High", health: "YELLOW" };
  if (errorRate > 10) return { risk: "Moderate", health: "GREEN" };
  return { risk: "Stable", health: "GREEN" };
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".log")) {
    return NextResponse.json(
      { error: "Only .log files are allowed." },
      { status: 400 }
    );
  }

  const text = await file.text();
  const lines = text.split("\n");

  let info = 0,
    warning = 0,
    error = 0;

  lines.forEach((line) => {
    if (line.includes("INFO")) info++;
    if (line.includes("WARNING")) warning++;
    if (line.includes("ERROR")) error++;
  });

  const total = lines.length || 1;
  const errorRate = (error / total) * 100;
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
  });
}