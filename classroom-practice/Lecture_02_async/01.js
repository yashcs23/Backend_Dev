// console.log("fetch user data from database");

// let user;

// setTimeout(() => {
//     user = {
//         id: 1,
//         name: "Yash",
//         role: "Developer"
//     };

//     console.log("User data fetched:", user);
// }, 2000);

// console.log(user);

// async function getUser() {
//     const user = await new Promise(resolve =>
//         setTimeout(() => resolve({
//             id: 1,
//             name: "Yash",
//             role: "Developer"
//         }), 2000)
//     );

//     console.log(user);
// }

// getUser();

// console.log("first");
// setTimeout(()=>{
//     console.log("task");
// },0)

// Promise.resolve().then(()=>console.log("promise resolved"))

// console.log("second task");


// const fetchUserById = (id) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             const users = [
//                 { id: 1, name: "Yash", role: "Developer" },
//                 { id: 2, name: "Aman", role: "Designer" },
//                 { id: 3, name: "Riya", role: "Tester" },
//                 { id: 4, name: "Neha", role: "Manager" }
//             ];

//             const user = users.find(u => u.id === id);

//             if (user) {
//                 resolve(user);
//             } else {
//                 reject("User not found");
//             }
//         }, 2000);
//     });
// };

// fetchUserById(5)
//     .then(user => {
//         console.log(user);
//     })
//     .catch(err => {
//         console.error(err);
//     });


const fetchUserById = (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = [
                { id: 1, name: "Yash", role: "Developer" },
                { id: 2, name: "Aman", role: "Designer" },
                { id: 3, name: "Riya", role: "Tester" },
                { id: 4, name: "Neha", role: "Manager" }
            ];

            const user = users.find(u => u.id === id);

            if (user) {
                resolve(user);
            } else {
                reject("User not found");
            }
        }, 2000);
    });
};

const getUser = async () => {
    try {
        const user = await fetchUserById(82);
        console.log(user);
    } catch (error) {
        console.error(error);
    }
};

getUser();
