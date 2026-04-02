const app = require("./src/app")

const PORT = 8000
const connectDB = require("./src/config/db")
connectDB()
app.listen(PORT , () => {
    console.log(`Server is Running On Port : ${PORT}`);
})