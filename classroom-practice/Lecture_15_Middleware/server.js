const express = require("express");
const fs = require("fs");
const fsPromises = require("fs").promises;

const app = express();
const PORT = 8000;

// ================= LOGGER MIDDLEWARE =================
const logger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const log = `[${new Date().toISOString()}] ${req.method} ${
      req.originalUrl
    } ${res.statusCode} ${duration}ms\n`;

    fs.appendFile("server.log", log, (err) => {
      if (err) console.error("Log write failed:", err);
    });
  });

  next();
};
const authenticateStudent = (req, res, next) => {
  const loggedInUserId = parseInt(req.headers["user-id"]);
  const paramId = parseInt(req.params.id);

  if (!loggedInUserId) {
    return res.status(401).json({ message: "Unauthorized: No user-id header" });
  }

  if (loggedInUserId !== paramId) {
    return res.status(403).json({ message: "Forbidden: You cannot update this record" });
  }

  next();
};


// ================= MIDDLEWARE =================
app.use(express.json());
app.use(logger);

// ================= FILE HELPERS =================
const readStudentsFromFile = async () => {
  try {
    const data = await fsPromises.readFile("./students.json", "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
};

const writeStudentsToFile = async (records) => {
  await fsPromises.writeFile(
    "./students.json",
    JSON.stringify(records, null, 2)
  );
};

// ================= ROUTES =================

// GET all students
app.get("/students", async (req, res) => {
  const students = await readStudentsFromFile();
  return res.status(200).json(students);
});
//new student
app.post("/students/register", (req, res) => {
  const { name, age, marks, branch } = req.body;

  if (!name || !age || !marks || !branch) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newId =
    students.length === 0
      ? 1
      : students[students.length - 1].id + 1;

  const student = {
    id: newId,
    name,
    age,
    marks,
    branch
  };

  students.push(student);
  saveStudents(students);

  res.status(201).json({
    message: "Student added",
    student
  });
});

// UPDATE student
app.put("/students/:id",authenticateStudent, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Empty body not allowed" });
    }

    const students = await readStudentsFromFile();
    const index = students.findIndex((s) => s.id === userId);

    if (index === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    students[index] = { ...students[index], ...req.body };

    await writeStudentsToFile(students);

    return res.status(200).json({
      message: "Updated successfully",
      student: students[index],
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

// DELETE student
app.delete("/students/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const students = await readStudentsFromFile();
    const index = students.findIndex((s) => s.id === userId);

    if (index === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    const deletedStudent = students.splice(index, 1)[0];
    await writeStudentsToFile(students);

    return res.status(200).json({
      message: "Student deleted successfully",
      deletedStudent,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
