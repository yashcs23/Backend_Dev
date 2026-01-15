// const obj = { a: "one", b: "two", a: "three" };
// console.log(obj);

// const a = {};
// const b = { key: "b" };
// const c = { key: "c" };

// a[b] = 123;
// a[c] = 456;

// console.log(a);


// const user = { name: "Lydia", age: 21 };
// const admin = { admin: true, ...user };
// console.log(admin);


// const shape = {
//   radius: 10,
//   diameter() {
//     return this.radius * 2;
//   },
//   perimeter: () => 2 * Math.PI * this.radius,
// };

// console.log(shape.diameter());
// console.log(shape.perimeter());
//here lexical scopre refers to whole object

// function test() {
//     console.log(a);
//     console.log(b);
//     var a = 10;
//     let b = 20;
// }
// test();

var x = 10;
if (true) {
  var x = 20;
  console.log(x);
}
console.log(x);

let y = 10;
if (true) {
  let y = 20;
  console.log(y);
}
console.log(y);  