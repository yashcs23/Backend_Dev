// const fetchOrderById = (id) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             const orders = [
//                 { id: 1, status: "Shipped" },
//                 { id: 2, status: "Shipped" },
//                 { id: 3, status: "Shipped"},
//                 { id: 4, status: "Shipped" }
//             ];

//             const order = orders.find(u => u.id === id);

//             if (order) {
//                 resolve(order.status);
//             } else {
//                 reject("order not found");
//             }
//         }, 1000);
//     });
// };

// const getOrder = async () => {
//     try {
//         const order = await fetchOrderById(5);
//         console.log(order);
//     } catch (error) {
//         console.error(error);
//     }
// };

// getOrder();


const getUser = (username) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = [
                { name: "Rahul", type: "Premium" },
                { name: "Amit", type: "Free" },
                { name: "Neha", type: "Premium" },
                { name: "Priya", type: "Free" }
            ];

            const user = users.find(u => u.name === username);

            if (user) {
                resolve(user);
            } else {
                reject("User not found");
            }
        }, 1500);
    });
};

const checkSubscription = (user) => {
    return new Promise((resolve, reject) => {
        if (user.type === "Premium") {
            resolve(`Access Granted to Netflix for ${user.name}`);
        } else {
            reject(`Please Subscribe, ${user.name}`);
        }
    });
};

const authenticateUser = async (username) => {
    try {
        const user = await getUser(username);
        const result = await checkSubscription(user);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
};

authenticateUser("Rahul"); 
authenticateUser("Amit");
authenticateUser("Neha");  
authenticateUser("Priya");

/// 03 
  const fetchUser = (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ name: "Rahul", isPremium: true });
        }, 1000);
    });
};

const fetchOrders = (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { item: "Laptop", price: 1000, status: "delivered" },
                { item: "Phone", price: 500, status: "pending" }
            ]);
        }, 2000);
    });
};

const displayDashboard = async (id) => {
    try {
        const user = await fetchUser(id);
        const orders = await fetchOrders(id);

        const deliveredOrders = orders.filter(
            order => order.status === "delivered"
        );

        const discountedOrders = deliveredOrders.map(order => {
            const discountedPrice = user.isPremium
                ? order.price * 0.9
                : order.price;

            return { ...order, price: discountedPrice };
        });

        const total = discountedOrders.reduce(
            (sum, order) => sum + order.price,
            0
        );

        console.log(`Welcome, ${user.name}!`);
        console.log("Delivered Orders:", discountedOrders);
        console.log("Final Total:", total);
    } catch (error) {
        console.error(error);
    }
};

displayDashboard(1);

