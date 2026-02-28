"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [uploadData, setUploadData] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live polling
  useEffect(() => {
    let interval: any;

    if (liveMode) {
      setInitializing(true);

      setTimeout(() => {
        setInitializing(false);
      }, 8000);

      interval = setInterval(async () => {
        const res = await fetch("/api/live");
        const data = await res.json();
        setLiveData(data);
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [liveMode]);

  // Upload handler
  const upload = async (e: any) => {
    e.preventDefault();
    setErrorMessage(null);

    const file = e.target.file.files[0];

    if (!file) {
      setErrorMessage("Please select a file.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".log")) {
      setErrorMessage("Only .log files are allowed.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.error || "Upload failed.");
        return;
      }

      const data = await res.json();
      setUploadData(data);
      setLiveMode(false);

    } catch {
      setErrorMessage("Server error occurred.");
    }
  };

  const pieColors = ["#22c55e", "#f59e0b", "#ef4444"];

  const Card = ({ title, value }: any) => (
    <div
      style={{
        backgroundColor: "#1e293b",
        padding: "20px",
        borderRadius: "12px",
        minWidth: "220px",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: "14px" }}>{title}</div>
      <div style={{ fontSize: "20px", marginTop: "6px" }}>{value}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
        InfraSight Dashboard
      </h1>

      <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
        Real-time log analytics and infrastructure monitoring platform.
      </p>

      {/* Upload Section */}
      <form onSubmit={upload} style={{ marginBottom: "20px" }}>
        <input type="file" name="file" accept=".log" />
        <button
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Analyze Log
        </button>
      </form>

      {errorMessage && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px",
            backgroundColor: "#7f1d1d",
            borderRadius: "6px",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Live Button */}
      <button
        onClick={() => {
          setLiveMode(!liveMode);
          setUploadData(null);
        }}
        style={{
          padding: "8px 18px",
          backgroundColor: liveMode ? "#ef4444" : "#10b981",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        {liveMode ? "Stop Live Monitoring" : "Start Live Monitoring"}
      </button>

      {initializing && (
        <div style={{ marginTop: "20px", color: "#fbbf24" }}>
          Initializing telemetry stream... please wait.
        </div>
      )}

      {/* Upload Results */}
      {uploadData && (
        <div style={{ marginTop: "40px" }}>
          <h2>Upload Analysis</h2>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Card title="Total Logs" value={uploadData.total} />
            <Card title="Error Rate" value={`${uploadData.errorRate}%`} />
            <Card title="Risk Level" value={uploadData.risk} />
            <Card title="System Health" value={uploadData.health} />
          </div>

          <div style={{ marginTop: "40px" }}>
            <PieChart width={400} height={300}>
              <Pie
                data={[
                  { name: "Info", value: uploadData.info },
                  { name: "Warning", value: uploadData.warning },
                  { name: "Error", value: uploadData.error },
                ]}
                dataKey="value"
                outerRadius={100}
              >
                {pieColors.map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      )}

      {/* Live Results */}
      {liveMode && !initializing && liveData && (
        <div style={{ marginTop: "40px" }}>
          <h2>Live Monitoring</h2>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Card title="Rolling Logs" value={liveData.total} />
            <Card title="Error Rate" value={`${liveData.errorRate}%`} />
            <Card title="Risk Level" value={liveData.risk} />
            <Card title="System Health" value={liveData.health} />
          </div>

          <div style={{ marginTop: "40px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={liveData.history}>
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
