db.courses.insertOne({
  _id: ObjectId(),
  code: "CS101",
  title: "Introduction to Computer Science",
  credits: 3,
  department: "Computer Science",
  prerequisites: ["MATH101"],
  instructor: ObjectId("507f1f77bcf86cd799439011"),
  capacity: 30,
  enrollmentCount: 28,
  schedule: {
    days: ["Monday", "Wednesday", "Friday"],
    startTime: "09:00",
    endTime: "10:30"
  }
});

db.courses.insertMany([
  {
    _id: ObjectId(),
    code: "MATH101",
    title: "Calculus I",
    credits: 4,
    department: "Mathematics",
    prerequisites: [],
    instructor: ObjectId("507f1f77bcf86cd799439012"),
    capacity: 35,
    enrollmentCount: 32,
    schedule: {
      days: ["Monday", "Wednesday", "Friday"],
      startTime: "10:45",
      endTime: "12:15"
    }
  },
  {
    _id: ObjectId(),
    code: "PHYS101",
    title: "Physics I",
    credits: 4,
    department: "Physics",
    prerequisites: ["MATH101"],
    instructor: ObjectId("507f1f77bcf86cd799439013"),
    capacity: 25,
    enrollmentCount: 23,
    schedule: {
      days: ["Tuesday", "Thursday"],
      startTime: "13:00",
      endTime: "14:45"
    }
  },
  {
    _id: ObjectId(),
    code: "CS201",
    title: "Data Structures",
    credits: 3,
    department: "Computer Science",
    prerequisites: ["CS101", "MATH101"],
    instructor: ObjectId("507f1f77bcf86cd799439014"),
    capacity: 25,
    enrollmentCount: 24,
    schedule: {
      days: ["Monday", "Wednesday", "Friday"],
      startTime: "14:00",
      endTime: "15:30"
    }
  }
]);

db.professors.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "Dr. Margaret Chen",
    email: "mchen@university.edu",
    departments: ["Computer Science", "Mathematics"],
    office: "CS Building, Room 301",
    phone: "555-0101",
    specialization: ["Algorithms", "Database Systems"],
    yearsOfExperience: 15,
    courses: [ObjectId()],
    officeHours: {
      days: ["Monday", "Wednesday"],
      time: "14:00-16:00"
    }
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439012"),
    name: "Dr. James Wilson",
    email: "jwilson@university.edu",
    departments: ["Mathematics", "Physics"],
    office: "Math Building, Room 205",
    phone: "555-0102",
    specialization: ["Calculus", "Linear Algebra"],
    yearsOfExperience: 22,
    courses: [ObjectId()],
    officeHours: {
      days: ["Tuesday", "Thursday"],
      time: "13:00-15:00"
    }
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439013"),
    name: "Dr. Patricia Rodriguez",
    email: "prodriguez@university.edu",
    departments: ["Physics", "Engineering"],
    office: "Physics Building, Room 401",
    phone: "555-0103",
    specialization: ["Mechanics", "Waves"],
    yearsOfExperience: 18,
    courses: [ObjectId()],
    officeHours: {
      days: ["Monday", "Friday"],
      time: "15:00-17:00"
    }
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439014"),
    name: "Dr. Robert Norton",
    email: "rnorton@university.edu",
    departments: ["Computer Science"],
    office: "CS Building, Room 302",
    phone: "555-0104",
    specialization: ["Data Structures", "Networking"],
    yearsOfExperience: 12,
    courses: [ObjectId()],
    officeHours: {
      days: ["Wednesday", "Thursday"],
      time: "10:00-12:00"
    }
  }
]);

db.grades.insertMany([
  {
    _id: ObjectId(),
    studentId: ObjectId("507f1f77bcf86cd799439021"),
    studentName: "John Doe",
    courseId: ObjectId(),
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    midtermGrade: 85,
    finalGrade: 88,
    participationGrade: 90,
    projectGrade: 92,
    assignmentGrade: 87,
    letterGrade: "A",
    gpa: 4.0,
    semester: "Fall 2023",
    instructor: ObjectId("507f1f77bcf86cd799439011")
  },
  {
    _id: ObjectId(),
    studentId: ObjectId("507f1f77bcf86cd799439022"),
    studentName: "Jane Smith",
    courseId: ObjectId(),
    courseCode: "MATH101",
    courseName: "Calculus I",
    midtermGrade: 78,
    finalGrade: 82,
    participationGrade: 80,
    projectGrade: 85,
    assignmentGrade: 79,
    letterGrade: "B+",
    gpa: 3.7,
    semester: "Fall 2023",
    instructor: ObjectId("507f1f77bcf86cd799439012")
  },
  {
    _id: ObjectId(),
    studentId: ObjectId("507f1f77bcf86cd799439021"),
    studentName: "John Doe",
    courseId: ObjectId(),
    courseCode: "PHYS101",
    courseName: "Physics I",
    midtermGrade: 90,
    finalGrade: 91,
    participationGrade: 88,
    projectGrade: 94,
    assignmentGrade: 89,
    letterGrade: "A",
    gpa: 4.0,
    semester: "Fall 2023",
    instructor: ObjectId("507f1f77bcf86cd799439013")
  },
  {
    _id: ObjectId(),
    studentId: ObjectId("507f1f77bcf86cd799439023"),
    studentName: "Mike Johnson",
    courseId: ObjectId(),
    courseCode: "CS201",
    courseName: "Data Structures",
    midtermGrade: 72,
    finalGrade: 76,
    participationGrade: 74,
    projectGrade: 78,
    assignmentGrade: 75,
    letterGrade: "C+",
    gpa: 2.3,
    semester: "Fall 2023",
    instructor: ObjectId("507f1f77bcf86cd799439014")
  }
]);
