db.departments.insertMany([
  { _id: "Computer Science", name: "Computer Science" },
  { _id: "Mathematics", name: "Mathematics" },
  { _id: "Physics", name: "Physics" },
  { _id: "Engineering", name: "Engineering" }
]);

db.departmentStudents.insertMany([
  { studentId: ObjectId("507f1f77bcf86cd799439021"), name: "John Doe", department: "Computer Science", gpa: 3.9 },
  { studentId: ObjectId("507f1f77bcf86cd799439022"), name: "Jane Smith", department: "Mathematics", gpa: 3.6 },
  { studentId: ObjectId("507f1f77bcf86cd799439023"), name: "Mike Johnson", department: "Physics", gpa: 3.2 },
  { studentId: ObjectId("507f1f77bcf86cd799439024"), name: "Sarah Williams", department: "Computer Science", gpa: 3.8 },
  { studentId: ObjectId("507f1f77bcf86cd799439025"), name: "Tom Brown", department: "Mathematics", gpa: 3.5 },
  { studentId: ObjectId("507f1f77bcf86cd799439026"), name: "Emma Green", department: "Physics", gpa: 3.7 },
  { studentId: ObjectId("507f1f77bcf86cd799439027"), name: "Frank Harris", department: "Engineering", gpa: 3.4 },
  { studentId: ObjectId("507f1f77bcf86cd799439028"), name: "Grace Hall", department: "Computer Science", gpa: 3.95 }
]);

db.courseEnrollment.insertMany([
  { courseId: ObjectId("507f1f77bcf86cd799439031"), courseCode: "CS101", courseName: "Introduction to Computer Science", enrollments: 128 },
  { courseId: ObjectId("507f1f77bcf86cd799439032"), courseCode: "CS201", courseName: "Data Structures", enrollments: 95 },
  { courseId: ObjectId("507f1f77bcf86cd799439033"), courseCode: "CS301", courseName: "Algorithms", enrollments: 76 },
  { courseId: ObjectId("507f1f77bcf86cd799439034"), courseCode: "MATH101", courseName: "Calculus I", enrollments: 142 },
  { courseId: ObjectId("507f1f77bcf86cd799439035"), courseCode: "MATH201", courseName: "Calculus II", enrollments: 89 },
  { courseId: ObjectId("507f1f77bcf86cd799439036"), courseCode: "PHYS101", courseName: "Physics I", enrollments: 108 },
  { courseId: ObjectId("507f1f77bcf86cd799439037"), courseCode: "PHYS201", courseName: "Physics II", enrollments: 82 },
  { courseId: ObjectId("507f1f77bcf86cd799439038"), courseCode: "ENG101", courseName: "Engineering Basics", enrollments: 65 }
]);

db.departmentStudents.aggregate([
  {
    $group: {
      _id: "$department",
      averageGPA: { $avg: "$gpa" },
      studentCount: { $sum: 1 },
      maxGPA: { $max: "$gpa" },
      minGPA: { $min: "$gpa" }
    }
  },
  {
    $sort: { averageGPA: -1 }
  }
]);

db.courseEnrollment.aggregate([
  {
    $sort: { enrollments: -1 }
  },
  {
    $limit: 5
  }
]);

db.courseEnrollment.aggregate([
  {
    $sort: { enrollments: -1 }
  }
]);

db.departmentStudents.aggregate([
  {
    $sort: { gpa: -1 }
  },
  {
    $group: {
      _id: "$department",
      students: {
        $push: {
          name: "$name",
          gpa: "$gpa"
        }
      },
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 1,
      count: 1,
      students: {
        $slice: ["$students", 3]
      }
    }
  }
]);

db.departmentStudents.aggregate([
  {
    $bucket: {
      groupBy: "$gpa",
      boundaries: [3.0, 3.3, 3.6, 3.9, 4.0],
      default: "Below 3.0",
      output: {
        count: { $sum: 1 },
        students: { $push: "$name" }
      }
    }
  }
]);

db.departmentStudents.aggregate([
  {
    $group: {
      _id: "$department",
      averageGPA: { $avg: "$gpa" },
      studentCount: { $sum: 1 },
      excellentStudents: {
        $sum: {
          $cond: [{ $gte: ["$gpa", 3.8] }, 1, 0]
        }
      },
      goodStudents: {
        $sum: {
          $cond: [
            { $and: [{ $gte: ["$gpa", 3.5] }, { $lt: ["$gpa", 3.8] }] },
            1,
            0
          ]
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      averageGPA: { $round: ["$averageGPA", 2] },
      studentCount: 1,
      excellentStudents: 1,
      goodStudents: 1,
      excellentPercentage: {
        $round: [
          { $multiply: [{ $divide: ["$excellentStudents", "$studentCount"] }, 100] },
          2
        ]
      }
    }
  }
]);

db.courseEnrollment.aggregate([
  {
    $facet: {
      topCourses: [
        { $sort: { enrollments: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, courseCode: 1, courseName: 1, enrollments: 1 } }
      ],
      enrollmentStats: [
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: "$enrollments" },
            averageEnrollment: { $avg: "$enrollments" },
            maxEnrollment: { $max: "$enrollments" },
            minEnrollment: { $min: "$enrollments" }
          }
        },
        {
          $project: {
            _id: 0,
            totalEnrollments: 1,
            averageEnrollment: { $round: ["$averageEnrollment", 0] },
            maxEnrollment: 1,
            minEnrollment: 1
          }
        }
      ]
    }
  }
]);

db.departmentStudents.aggregate([
  {
    $facet: {
      performanceByDepartment: [
        {
          $group: {
            _id: "$department",
            averageGPA: { $avg: "$gpa" },
            studentCount: { $sum: 1 }
          }
        },
        { $sort: { averageGPA: -1 } }
      ],
      topStudents: [
        { $sort: { gpa: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, department: 1, gpa: 1 } }
      ],
      gpaDistribution: [
        {
          $group: {
            _id: {
              $cond: [
                { $gte: ["$gpa", 3.9] },
                "Excellent (3.9-4.0)",
                {
                  $cond: [
                    { $gte: ["$gpa", 3.7] },
                    "Very Good (3.7-3.9)",
                    {
                      $cond: [
                        { $gte: ["$gpa", 3.5] },
                        "Good (3.5-3.7)",
                        "Average (Below 3.5)"
                      ]
                    }
                  ]
                }
              ]
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]
    }
  }
]);

db.departmentStudents.aggregate([
  {
    $match: { gpa: { $gte: 3.5 } }
  },
  {
    $group: {
      _id: "$department",
      qualifyingStudents: { $push: "$name" },
      count: { $sum: 1 }
    }
  }
]);

db.courseEnrollment.aggregate([
  {
    $addFields: {
      popularity: {
        $cond: [
          { $gte: ["$enrollments", 100] },
          "Very Popular",
          {
            $cond: [
              { $gte: ["$enrollments", 80] },
              "Popular",
              "Moderate"
            ]
          }
        ]
      }
    }
  },
  {
    $project: {
      courseCode: 1,
      courseName: 1,
      enrollments: 1,
      popularity: 1
    }
  }
]);
