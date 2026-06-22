const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const dbFilePath = path.join(__dirname, "../db.json");

function loadDB() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));
      // Ensure collections exist
      if (!data.users) data.users = [];
      if (!data.courses) data.courses = [];
      if (!data.progress) data.progress = [];
      return data;
    }
  } catch (e) {
    console.error("[MOCK DB] Failed to load mock DB, resetting:", e.message);
  }
  return { users: [], courses: [], progress: [] };
}

function saveDB(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("[MOCK DB] Failed to save mock DB:", e.message);
  }
}

// Generate valid 24-character hex MongoDB ObjectId format
function generateId() {
  let id = "";
  const chars = "0123456789abcdef";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function getCollectionKey(modelName) {
  if (modelName === "User") return "users";
  if (modelName === "Course") return "courses";
  if (modelName === "Progress") return "progress";
  return modelName.toLowerCase() + "s";
}

function matchQuery(item, query) {
  for (const k in query) {
    if (query[k] && typeof query[k] === "object" && !Array.isArray(query[k])) {
      if (JSON.stringify(item[k]) !== JSON.stringify(query[k])) return false;
    } else {
      if (String(item[k]) !== String(query[k])) return false;
    }
  }
  return true;
}

function createQueryChain(results) {
  const chain = {
    populate: function (path) {
      const db = loadDB();
      results.forEach((res) => {
        if (res[path]) {
          const refKey = path === "course" ? "courses" : "users";
          res[path] =
            db[refKey].find((item) => String(item._id) === String(res[path])) ||
            res[path];
        }
      });
      return createQueryChain(results);
    },
    exec: function () {
      return Promise.resolve(results);
    },
    then: function (onResolve, onReject) {
      return Promise.resolve(results).then(onResolve, onReject);
    },
    catch: function (onReject) {
      return Promise.resolve(results).catch(onReject);
    },
  };
  return chain;
}

function autoSeed(db) {
  let seeded = false;

  // Clean up any non-hex seeded data from previous runs if needed
  if (db.users && db.users.some(u => u._id === "instructor_smith_id")) {
    db.users = [];
    db.courses = [];
    db.progress = [];
  }

  if (!db.users || db.users.length === 0) {
    console.log("[MOCK DB] Auto-seeding default users...");
    const hashedPassword = bcrypt.hashSync("password123", 10);
    db.users = [
      {
        _id: "777777777777777777777777",
        name: "Professor Smith",
        email: "instructor@example.com",
        password: hashedPassword,
        role: "instructor",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "888888888888888888888888",
        name: "Sravan Juluri",
        email: "student@example.com",
        password: hashedPassword,
        role: "student",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    seeded = true;
  }

  if (!db.courses || db.courses.length === 0) {
    console.log("[MOCK DB] Auto-seeding default courses...");
    db.courses = [
      {
        _id: "999999999999999999999901",
        title: "Web Development - HTML Basics",
        description:
          "Learn the foundations of HTML5, tags, elements, and page structures to build your very first web page from scratch.",
        instructor: "777777777777777777777777",
        videoUrl: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "999999999999999999999902",
        title: "CSS Styling and Responsive Design",
        description:
          "Dive deep into CSS selectors, box model, Flexbox, Grid, and media queries to make your websites responsive and visually stunning.",
        instructor: "777777777777777777777777",
        videoUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "999999999999999999999903",
        title: "JavaScript Programming for Beginners",
        description:
          "Master modern JS syntax, variables, conditional blocks, loops, functions, DOM manipulation, and building simple interactive web apps.",
        instructor: "777777777777777777777777",
        videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "999999999999999999999904",
        title: "Python Programming Course",
        description:
          "Learn Python from the ground up: data types, logic control, functions, object-oriented concepts, and basic scripting automation.",
        instructor: "777777777777777777777777",
        videoUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "999999999999999999999905",
        title: "Introduction to Machine Learning",
        description:
          "An absolute beginner's introduction to ML concepts, supervised/unsupervised learning, training data, and simple regression algorithms.",
        instructor: "777777777777777777777777",
        videoUrl: "https://www.youtube.com/watch?v=GwIo3gTOB3I",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    seeded = true;
  }

  if (seeded) {
    saveDB(db);
    console.log("[MOCK DB] Seeded successfully! 🎉");
    console.log("  Instructor: instructor@example.com / password123");
    console.log("  Student: student@example.com / password123");
  }
}

function enable() {
  console.log("[MOCK DB] Enabling Mongoose mock intercepts...");

  // Initialize and Seed DB
  const db = loadDB();
  autoSeed(db);

  // Override Model.find
  mongoose.Model.find = function (query) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    let results = db[key] || [];
    if (query && Object.keys(query).length > 0) {
      results = results.filter((item) => matchQuery(item, query));
    }
    const cloned = JSON.parse(JSON.stringify(results));
    return createQueryChain(cloned);
  };

  // Override Model.findOne
  mongoose.Model.findOne = function (query) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    const results = db[key] || [];
    const item = results.find((item) => matchQuery(item, query));
    return Promise.resolve(item ? JSON.parse(JSON.stringify(item)) : null);
  };

  // Override Model.findById
  mongoose.Model.findById = function (id) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    const results = db[key] || [];
    const item = results.find((item) => String(item._id) === String(id));
    return Promise.resolve(item ? JSON.parse(JSON.stringify(item)) : null);
  };

  // Override Model.create
  mongoose.Model.create = function (doc) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    const newDoc = {
      _id: generateId(),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!db[key]) db[key] = [];
    db[key].push(newDoc);
    saveDB(db);
    return Promise.resolve(JSON.parse(JSON.stringify(newDoc)));
  };

  // Override Model.findByIdAndUpdate
  mongoose.Model.findByIdAndUpdate = function (id, update, options) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    const results = db[key] || [];
    const idx = results.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return Promise.resolve(null);

    const current = results[idx];
    let updated;
    const updateData = update.$set ? update.$set : update;
    updated = {
      ...current,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    results[idx] = updated;
    saveDB(db);
    return Promise.resolve(
      JSON.parse(JSON.stringify(options && options.new ? updated : current))
    );
  };

  // Override Model.findByIdAndDelete
  mongoose.Model.findByIdAndDelete = function (id) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    const results = db[key] || [];
    const idx = results.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return Promise.resolve(null);

    const deleted = results.splice(idx, 1)[0];
    saveDB(db);
    return Promise.resolve(JSON.parse(JSON.stringify(deleted)));
  };

  // Override Model.findOneAndUpdate
  mongoose.Model.findOneAndUpdate = function (query, update, options) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    const results = db[key] || [];
    const idx = results.findIndex((item) => matchQuery(item, query));

    if (idx === -1) {
      if (options && options.upsert) {
        const newDoc = {
          _id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        for (const k in query) {
          newDoc[k] = query[k];
        }
        const updateData = update.$set ? update.$set : update;
        Object.assign(newDoc, updateData);
        results.push(newDoc);
        saveDB(db);
        return Promise.resolve(JSON.parse(JSON.stringify(newDoc)));
      }
      return Promise.resolve(null);
    }

    const current = results[idx];
    const updateData = update.$set ? update.$set : update;
    const updated = {
      ...current,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    results[idx] = updated;
    saveDB(db);
    return Promise.resolve(
      JSON.parse(JSON.stringify(options && options.new ? updated : current))
    );
  };

  // Override Model.deleteMany
  mongoose.Model.deleteMany = function (query) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    if (!query || Object.keys(query).length === 0) {
      db[key] = [];
    } else {
      db[key] = (db[key] || []).filter((item) => !matchQuery(item, query));
    }
    saveDB(db);
    return Promise.resolve({ deletedCount: 1 });
  };

  // Override Model.insertMany
  mongoose.Model.insertMany = function (docs) {
    const db = loadDB();
    const key = getCollectionKey(this.modelName);
    if (!db[key]) db[key] = [];
    const newDocs = docs.map((d) => ({
      _id: generateId(),
      ...d,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    db[key].push(...newDocs);
    saveDB(db);
    return Promise.resolve(JSON.parse(JSON.stringify(newDocs)));
  };
}

module.exports = {
  enable,
};
