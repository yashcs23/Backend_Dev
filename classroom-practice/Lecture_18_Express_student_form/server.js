const express = require("express");
const fs = require("fs").promises;
const fssync = require("fs");
const path = require("path");

const app = express();
const PORT = 8000;
const data = JSON.parse(fssync.readFileSync('students.json', 'utf8'));
const count = data.length;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const FILE_PATH = path.join(__dirname, "students.json");

// Total Students



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

  res.render("students", {
    allStudents: students,
    count: students.length
  });
});

app.get("/students/search", async (req, res) => {
  const { branch } = req.query;

  if (!branch) {
    return res.status(400).json({ message: "Branch is required" });
  }

  const students = await readStudents();

  const result = students.filter(
    s => s.branch.toLowerCase() === branch.toLowerCase()
  );

  res.render("students", {
    allStudents: result,
    count: result.length
  });
  // res.json(result);
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


app.get("/students/delete/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const existingStudents = await readStudents();

    const foundIndex = existingStudents.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.status(404).send("Student not found");
    }

    existingStudents.splice(foundIndex, 1);

    await writeStudents(existingStudents);
    res.redirect("/students");

  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/students`);
});
