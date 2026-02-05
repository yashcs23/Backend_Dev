const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8000;

app.use(express.json());

const DATA_FILE = path.join(__dirname, "students.json");

const getStudents = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

const saveStudents = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

let students = getStudents();

app.post("/students/register", (req, res) => {
  const { id, name, age, marks, branch } = req.body;

  if (!id || !name || !age || !marks || !branch) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (students.find(s => s.id === id)) {
    return res.status(409).json({ message: "ID already exists" });
  }

  const student = { id, name, age, marks, branch };
  students.push(student);
  saveStudents(students);

  res.status(201).json({
    message: "Student added",
    student
  });
});

app.get("/students/search", (req, res) => {
  const { branch } = req.query;

  if (!branch) {
    return res.status(400).json({ message: "Branch is required" });
  }

  const result = students.filter(
    s => s.branch.toLowerCase() === branch.toLowerCase()
  );

  res.json(result);
});

app.get("/students", (req, res) => {
  res.json(students);
});

app.get("/students/:id", (req, res) => {
  const student = students.find(s => s.id == req.params.id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
