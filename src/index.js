import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import branchRoutes from "./routes/branchRoute.js";
import clientRoutes from "./routes/clientRoute.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:4000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api", branchRoutes);
app.use("/api", userRoutes);
app.use("/api", authRoutes); // authentication api
<<<<<<< HEAD
app.use("/uploads", express.static("C:/Users/Lenovo i5 8th Gen/Desktop/CAPSTONE/uploads")); // user profile uploads 
=======
app.use("/uploads", express.static("D:/Capstone_ni_Angelie/uploads")); // user profile uploads
app.use("/api", clientRoutes);
>>>>>>> bf1168663dba915e448d7e40430b2d06372d734e

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
