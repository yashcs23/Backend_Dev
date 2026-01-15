const rawUsers = [
  { id: 1, name: "Rahul", password: "fb_password", role: "admin" },
  { id: 2, name: "Sanya", password: "123_password", role: "user" },
  { id: 3, name: "Amit", password: "secret_password", role: "user" },
];

const safeUser = rawUsers.map(({ password, ...remaining }) => remaining);

const adminUser = rawUsers.filter((user) => user.role == "admin");

console.log(safeUser);
console.log(adminUser);

const cart = [
  { item: "Laptop", price: 50000, quantity: 1, inStock: true },
  { item: "Mouse", price: 1500, quantity: 2, inStock: true },
  { item: "Keyboard", price: 3000, quantity: 1, inStock: false },
];

const c1 = cart.every((product) => product.inStock);
console.log(c1 == true ? "ready to ship " : "wait");
const onStock = cart.filter((item) => item.inStock);
console.log(onStock);

const totalBill = onStock.reduce((total, item) => {
  return total + item.price * item.quantity;
}, 0);

console.log("Total Bill:", totalBill);
