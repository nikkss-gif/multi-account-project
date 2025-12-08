import React, { useState, useEffect } from "react";
import axios from "axios";

// ALWAYS use AWS backend
const API = "http://43.204.238.92:8080";

export default function App() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [created, setCreated] = useState(null);
  const [getId, setGetId] = useState("");
  const [fetched, setFetched] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const [sqlData, setSqlData] = useState([]);
  const [redisData, setRedisData] = useState([]);
  const [bucketData, setBucketData] = useState([]);
  const [serviceStatus, setServiceStatus] = useState({});
  const [workerLogs, setWorkerLogs] = useState([]);
  const [cacheStats, setCacheStats] = useState({});
  const [rabbitMqStats, setRabbitMqStats] = useState({});

  // CREATE ITEM
  async function create() {
    try {
      const res = await axios.post(`${API}/v1/items`, {
        name,
        description: desc,
      });
      setCreated(res.data);
    } catch (e) {
      setCreated({ error: e.message });
    }
  }

  // GET ITEM
  async function getItem() {
    try {
      const res = await axios.get(`${API}/v1/items/${getId}`);
      setFetched(res.data);
    } catch {
      setFetched(null);
    }
  }

  // FILE UPLOAD
  async function uploadFile() {
    try {
      if (!selectedFile) {
        return setUploadStatus("Please select a file");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await axios.post(`${API}/v1/files/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadStatus(`✅ ${res.data.message}`);
      setSelectedFile(null);
      setTimeout(fetchAll, 300);
    } catch (e) {
      setUploadStatus(`❌ Upload failed: ${e.message}`);
    }
  }

  // FETCH DASHBOARD DATA
  const fetchAll = async () => {
    try {
      setSqlData((await axios.get(`${API}/v1/data/sql`)).data);
      setRedisData((await axios.get(`${API}/v1/data/redis`)).data);
      setBucketData((await axios.get(`${API}/v1/data/bucket`)).data);
      setWorkerLogs((await axios.get(`${API}/v1/worker/logs`)).data);
      setServiceStatus((await axios.get(`${API}/v1/status/services`)).data);
      setCacheStats((await axios.get(`${API}/v1/status/cache`)).data);
      setRabbitMqStats(
        (await axios.get(`${API}/v1/status/rabbitmq`)).data
      );
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- UI START -------------------

  return (
    <div style={{ padding: 20, background: "#f5f5f5" }}>
      <h1 style={{ textAlign: "center" }}>
        🚀 Multi-Account GCP Demo Dashboard
      </h1>

      {/* SERVICE STATUS */}
      <section
        style={{
          padding: 20,
          background: "white",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <h2>📊 Service Status</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ padding: 10, background: "#e8f5e8" }}>
            Backend: {serviceStatus.backend || "Online"}
          </div>

          <div style={{ padding: 10, background: "#e8f5e8" }}>
            DB: {serviceStatus.database || "Connected"}
          </div>

          <div
            style={{
              padding: 10,
              background:
                serviceStatus.redis === "Connected"
                  ? "#e8f5e8"
                  : "#ffdddd",
            }}
          >
            Redis: {serviceStatus.redis || "Unavailable"}
          </div>

          <div style={{ padding: 10, background: "#e8f5e8" }}>
            RabbitMQ: {serviceStatus.rabbitmq || "Connected"}
          </div>
        </div>
      </section>

      {/* CREATE ITEM */}
      <section
        style={{
          padding: 20,
          background: "white",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <h2>➕ Create Item</h2>

        <input
          placeholder="Item name"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Description"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button
          onClick={create}
          style={{
            padding: 10,
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          Create Item
        </button>

        <pre
          style={{ background: "#f9f9f9", padding: 10, marginTop: 10 }}
        >
          {created
            ? JSON.stringify(created, null, 2)
            : "Created item will appear here"}
        </pre>
      </section>

      {/* GET ITEM */}
      <section
        style={{
          padding: 20,
          background: "white",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <h2>🔍 Get Item</h2>

        <input
          placeholder="Item ID"
          style={{ padding: 8, marginRight: 10 }}
          value={getId}
          onChange={(e) => setGetId(e.target.value)}
        />

        <button
          onClick={getItem}
          style={{
            padding: 10,
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          Get Item
        </button>

        <pre
          style={{ background: "#f9f9f9", padding: 10, marginTop: 10 }}
        >
          {fetched
            ? JSON.stringify(fetched, null, 2)
            : "Fetched item will appear here"}
        </pre>
      </section>

      {/* REDIS TABLE */}
      <section
        style={{
          padding: 20,
          background: "white",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <h2>⚡ Redis Cache</h2>

        {redisData.length === 0 && <p>No Redis cache yet</p>}

        {redisData.length > 0 && (
          <table
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>TTL</th>
              </tr>
            </thead>

            <tbody>
              {redisData.map((r) => (
                <tr key={r.key}>
                  <td>{r.key}</td>
                  <td>{r.value}</td>
                  <td>{r.ttl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* FOOTER */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        Connected to backend: <strong>{API}</strong>
      </div>
    </div>
  );
}
