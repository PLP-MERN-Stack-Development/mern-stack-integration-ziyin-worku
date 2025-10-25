import React, { useState } from "react";
import { authService } from "../services/authService";

const DebugAuth = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await authService.register({
        username: "testuser123",
        email: "test123@example.com",
        password: "password123",
      });
      setResult(`Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(
        `Error: ${error.response?.status} - ${JSON.stringify(
          error.response?.data,
          null,
          2
        )}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser456",
          email: "test456@example.com",
          password: "password123",
        }),
      });
      const data = await response.json();
      setResult(
        `Direct Fetch - Status: ${response.status}, Data: ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    } catch (error) {
      setResult(`Direct Fetch Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Auth Debug Page</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testRegister}
          disabled={loading}
          style={{ marginRight: "10px" }}
        >
          Test Register via Service
        </button>
        <button onClick={testDirectFetch} disabled={loading}>
          Test Register via Direct Fetch
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <pre
        style={{
          background: "#f5f5f5",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          maxHeight: "400px",
          overflow: "auto",
        }}
      >
        {result || "Click a button to test..."}
      </pre>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#e8f4fd",
          borderRadius: "5px",
        }}
      >
        <h3>Test Credentials:</h3>
        <p>
          <strong>Username:</strong> testuser123 (letters, numbers, underscores
          only)
        </p>
        <p>
          <strong>Email:</strong> test123@example.com
        </p>
        <p>
          <strong>Password:</strong> password123
        </p>
      </div>
    </div>
  );
};

export default DebugAuth;
