const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const FILE_PATH = path.join(__dirname, "students.json");

// ===== Read Students =====
async function readStudents() {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

// ===== Write Students =====
async function writeStudents(students) {
  await fs.writeFile(FILE_PATH, JSON.stringify(students, null, 2));
}

// ===== ROUTES =====

app.get("/students", async (req, res) => {
  const students = await readStudents();
  res.render("students", { allStudents: students });
});

app.post("/student/register", async (req, res) => {
  const { name, branch } = req.body;

  if (!name || !branch) {
    return res.send("All fields are required");
  }

  const students = await readStudents();

  const newStudent = {
    id: Date.now(),
    name,
    branch
  };

  students.push(newStudent);

  await writeStudents(students);

  res.redirect("/students");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/students`);
});
