db.students.insertOne({
  name: "John Doe",
  email: "john@example.com",
  gpa: 3.8,
  enrollmentDate: new Date("2023-09-01"),
  city: "New York"
});

db.students.insertMany([
  {
    name: "Jane Smith",
    email: "jane@example.com",
    gpa: 3.6,
    enrollmentDate: new Date("2023-09-01"),
    city: "Boston"
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    gpa: 3.4,
    enrollmentDate: new Date("2023-09-15"),
    city: "Chicago"
  },
  {
    name: "Sarah Williams",
    email: "sarah@example.com",
    gpa: 3.9,
    enrollmentDate: new Date("2023-09-01"),
    city: "San Francisco"
  },
  {
    name: "Tom Brown",
    email: "tom@example.com",
    gpa: 3.2,
    enrollmentDate: new Date("2023-10-01"),
    city: "Seattle"
  }
]);

db.students.find().pretty();

db.students.findOne({ email: "john@example.com" });

db.students.find({ email: "jane@example.com" });

db.students.updateOne(
  { email: "john@example.com" },
  { $set: { gpa: 3.9 } }
);

db.students.updateMany(
  { city: "New York" },
  { $set: { gpa: 3.85 } }
);

db.students.findOneAndUpdate(
  { email: "mike@example.com" },
  { $set: { gpa: 3.7, city: "Los Angeles" } },
  { returnNewDocument: true }
);

db.students.deleteOne({ email: "tom@example.com" });

db.students.deleteMany({ gpa: { $lt: 3.3 } });

db.students.find().pretty();

db.students.countDocuments();

db.students.findOne({ name: "Sarah Williams" });
