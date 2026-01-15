// const user = {
//     name: "Yash",
//     age: 21,
//     role: "Developer",
//     skills: ["JS", "React"]
// };

// const { name, ...otherDetails } = user;

// // SPREAD (object)
// const updatedUser = {
//     ...otherDetails,
//     name,
//     age: 22,
//     skills: [...user.skills, "Node.js"] // SPREAD (array)
// };

// // FUNCTION with REST
// function printSkills(mainSkill, ...otherSkills) {
//     console.log("Main Skill:", mainSkill);
//     console.log("Other Skills:", otherSkills);
// }

// // ARRAY DESTRUCTURING
// const [firstSkill, secondSkill] = updatedUser.skills;

// // Output
// console.log("Name:", name);
// console.log("Updated User:", updatedUser);

// printSkills(firstSkill, secondSkill);

// let nums = [1, 2, 3, 4];

// let squares = nums.map((n) => n * n);
// console.log(squares);

// let nums1 = [10, 25, 30, 5];

// let greaterThan20 = nums1.filter((n) => n > 20);
// console.log(greaterThan20);

// let nums2 = [1, 2, 3, 4];

// let sum = nums2.reduce((acc, n) => acc + n, 0);
// console.log(sum);




const user = {
    name: "Yash",
    age: 21,
    role: "Developer",
    skills: ["JS", "React"]
};
