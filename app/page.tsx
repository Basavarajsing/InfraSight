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

  // Live Polling
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

  // Upload Handler with strict validation
  const upload = async (e: any) => {
    e.preventDefault();

    const file = e.target.file.files[0];

    if (!file) {
      alert("Please select a file.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".log")) {
      alert("Only .log files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setUploadData(data);
    setLiveMode(false);
  };

  const pieColors = ["#22c55e", "#f59e0b", "#ef4444"];

  const getHealthColor = (health: string) => {
    switch (health) {
      case "RED":
        return "#ef4444";
      case "ORANGE":
        return "#f97316";
      case "YELLOW":
        return "#facc15";
      default:
        return "#22c55e";
    }
  };

  const Card = ({ title, value }: any) => (
    <div
      style={{
        backgroundColor: "#1e293b",
        padding: "20px",
        borderRadius: "12px",
        minWidth: "230px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: "14px" }}>{title}</div>
      <div style={{ fontSize: "22px", marginTop: "6px" }}>{value}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
        InfraSight Dashboard
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
        Real-time log analytics and infrastructure health visibility platform.
      </p>

      {/* Upload Section */}
      <div style={{ marginBottom: "25px" }}>
        <form onSubmit={upload}>
          <input type="file" name="file" accept=".log" />
          <button
            style={{
              marginLeft: "12px",
              padding: "8px 18px",
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
      </div>

      {/* Live Button */}
      <button
        onClick={() => {
          setLiveMode(!liveMode);
          setUploadData(null);
        }}
        style={{
          padding: "10px 20px",
          backgroundColor: liveMode ? "#ef4444" : "#10b981",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        {liveMode ? "Stop Live Monitoring" : "Start Live Monitoring"}
      </button>

      {/* Initializing Notice */}
      {initializing && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            color: "#fbbf24",
          }}
        >
          Initializing telemetry stream... collecting rolling window metrics.
          Please wait.
        </div>
      )}

      {/* Upload Analysis */}
      {uploadData && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ marginBottom: "20px" }}>Upload Analysis</h2>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Card title="Total Logs" value={uploadData.total} />
            <Card title="Error Rate" value={`${uploadData.errorRate}%`} />
            <Card title="Warning Rate" value={`${uploadData.warningRate}%`} />
            <Card title="Risk Level" value={uploadData.risk} />
            <Card
              title="System Health"
              value={
                <span style={{ color: getHealthColor(uploadData.health) }}>
                  {uploadData.health}
                </span>
              }
            />
          </div>

          <div style={{ marginTop: "40px" }}>
            <PieChart width={420} height={320}>
              <Pie
                data={[
                  { name: "Info", value: uploadData.info },
                  { name: "Warning", value: uploadData.warning },
                  { name: "Error", value: uploadData.error },
                ]}
                dataKey="value"
                outerRadius={110}
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

      {/* Live Monitoring */}
      {liveMode && !initializing && liveData && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ marginBottom: "20px" }}>Live Monitoring</h2>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Card title="Rolling Window Logs" value={liveData.total} />
            <Card title="Error Rate" value={`${liveData.errorRate}%`} />
            <Card title="Warning Rate" value={`${liveData.warningRate}%`} />
            <Card title="Risk Level" value={liveData.risk} />
            <Card
              title="System Health"
              value={
                <span style={{ color: getHealthColor(liveData.health) }}>
                  {liveData.health}
                </span>
              }
            />
          </div>

          <div style={{ marginTop: "40px" }}>
            <PieChart width={420} height={320}>
              <Pie
                data={[
                  { name: "Info", value: liveData.info },
                  { name: "Warning", value: liveData.warning },
                  { name: "Error", value: liveData.error },
                ]}
                dataKey="value"
                outerRadius={110}
              >
                {pieColors.map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          <div style={{ marginTop: "50px" }}>
            <h3>Error Trend (Rolling Window)</h3>

            <ResponsiveContainer width="100%" height={320}>
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

      {/* About Section */}
      <div
        style={{
          marginTop: "80px",
          padding: "30px",
          backgroundColor: "#1e293b",
          borderRadius: "12px",
        }}
      >
        <h2 style={{ marginBottom: "16px" }}>About InfraSight</h2>

        <p style={{ color: "#cbd5e1", marginBottom: "12px" }}>
          InfraSight is a modern observability and log analytics platform
          designed to simulate real-time infrastructure monitoring systems.
          It performs structured log analysis, rolling error density
          computation, and threshold-based system health classification.
        </p>

        <p style={{ color: "#cbd5e1" }}>
          Domain: Observability Engineering | Site Reliability Engineering
          (SRE) | DevOps Monitoring Systems.
        </p>
      </div>
    </div>
  );
}