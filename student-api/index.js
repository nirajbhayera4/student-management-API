const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student-management";

app.use(express.json());

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 1,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("API is working");
});

app.get("/students", async (req, res) => {
  try {
    const filter = {};

    if (req.query.city) {
      filter.city = req.query.city;
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({ message: "invalid student id" });
  }
});

app.post("/students", async (req, res) => {
  try {
    const student = await Student.create({
      name: req.body.name,
      age: req.body.age,
      email: req.body.email,
      city: req.body.city,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        city: req.body.city,
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "student not found" });
    }

    res.json({ message: "student deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "invalid student id" });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
});
