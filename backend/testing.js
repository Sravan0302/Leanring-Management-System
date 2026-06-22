const http = require("http");

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.headers["Content-Length"] = Buffer.byteLength(data);
    }
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: responseBody ? JSON.parse(responseBody) : {},
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: responseBody,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(data);
    }
    req.end();
  });
};

async function test() {
  console.log("--- 1. Register with missing password ---");
  const r1 = await request("POST", "/api/auth/register", {
    name: "Bad User",
    email: "bad_user@example.com",
    role: "student"
  });
  console.log("Response:", r1);

  console.log("\n--- 2. Login with missing password ---");
  const r2 = await request("POST", "/api/auth/login", {
    email: "test_instructor_1781201660499@example.com"
  });
  console.log("Response:", r2);

  console.log("\n--- 3. Get course with invalid ID format ---");
  const r3 = await request("GET", "/api/courses/12345");
  console.log("Response:", r3);

  console.log("\n--- 4. Register with invalid role enum ---");
  const r4 = await request("POST", "/api/auth/register", {
    name: "Admin User",
    email: `admin_${Date.now()}@example.com`,
    password: "password123",
    role: "admin"
  });
  console.log("Response:", r4);
}

test();