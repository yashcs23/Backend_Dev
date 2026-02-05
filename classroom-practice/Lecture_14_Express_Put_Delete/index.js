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

app.put("/students/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, marks, branch } = req.body;

  const index = students.findIndex(s => s.id == id);

  if (index === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (name !== undefined) students[index].name = name;
  if (age !== undefined) students[index].age = age;
  if (marks !== undefined) students[index].marks = marks;
  if (branch !== undefined) students[index].branch = branch;

  saveStudents(students);

  res.json({
    message: "Student updated successfully",
    student: students[index]
  });
});
app.delete("/students/delete/:id", (req, res) => {
  const { id } = req.params;

  const index = students.findIndex(s => s.id == id);

  if (index === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  const deletedStudent = students.splice(index, 1)[0];
  saveStudents(students);

  res.json({
    message: "Student deleted successfully",
    student: deletedStudent
  });
});


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
