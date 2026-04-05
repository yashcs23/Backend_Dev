db.students.insertMany([
  {
    name: "Alice Cooper",
    email: "alice@example.com",
    gpa: 3.2,
    city: "New York",
    courses: ["Math", "Physics", "Chemistry"]
  },
  {
    name: "Bob Davis",
    email: "bob@example.com",
    gpa: 3.4,
    city: "Boston",
    courses: ["History", "Literature", "Art", "Philosophy", "Music", "Drama"]
  },
  {
    name: "Carol Evans",
    email: "carol@example.com",
    gpa: 3.15,
    city: "Chicago",
    courses: ["Biology", "Chemistry", "Physics", "Math", "Computer Science"]
  },
  {
    name: "David Foster",
    email: "david@example.com",
    gpa: 3.45,
    city: "New York",
    courses: ["English", "History", "Political Science", "Sociology", "Psychology", "Economics"]
  },
  {
    name: "Emma Green",
    email: "emma@example.com",
    gpa: 3.25,
    city: "San Francisco",
    courses: ["Math", "Physics", "Computer Science"]
  },
  {
    name: "Frank Harris",
    email: "frank@example.com",
    gpa: 3.5,
    city: "Boston",
    courses: ["Art", "Design", "Music", "Film", "Photography", "Architecture"]
  },
  {
    name: "Grace Hall",
    email: "grace@example.com",
    gpa: 3.8,
    city: "Seattle",
    courses: ["Biology", "Chemistry", "Physics", "Math", "Astronomy", "Geology", "Environmental Science"]
  }
]);

db.students.find({
  gpa: { $gte: 3.0, $lte: 3.5 }
}).pretty();

db.students.find({
  courses: { $size: { $gt: 5 } }
}).pretty();

db.students.find()
  .sort({ gpa: -1 })
  .limit(10)
  .pretty();

db.students.aggregate([
  {
    $group: {
      _id: "$city",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
]);

db.students.find({ gpa: { $gte: 3.3 } }).count();

db.students.find()
  .sort({ gpa: -1 })
  .limit(3)
  .pretty();

db.students.find({ $or: [{ city: "New York" }, { city: "Boston" }] }).pretty();

db.students.find({ courses: "Physics" }).pretty();

db.students.find({ email: { $regex: "@example.com" } }).pretty();

db.students.aggregate([
  {
    $match: { gpa: { $gte: 3.4 } }
  },
  {
    $sort: { gpa: -1 }
  }
]);
