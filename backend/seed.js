require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Set DNS for Atlas SRV resolution

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Course = require("./models/Course");
const connectDB = require("./config/db");

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("Clearing existing courses...");
    await Course.deleteMany({});

    // Check if default instructor exists, if not create one
    let instructor = await User.findOne({ email: "instructor@example.com" });
    if (!instructor) {
      console.log("Creating default instructor...");
      const hashedPassword = await bcrypt.hash("password123", 10);
      instructor = await User.create({
        name: "Professor Smith",
        email: "instructor@example.com",
        password: hashedPassword,
        role: "instructor"
      });
    }

    // Default courses with real playable YouTube URLs
    const courses = [
      {
        title: "Web Development - HTML Basics",
        description: "Learn the foundations of HTML5, tags, elements, and page structures to build your very first web page from scratch.",
        instructor: instructor._id,
        videoUrl: "https://www.youtube.com/watch?v=qz0aGYrrlhU"
      },
      {
        title: "CSS Styling and Responsive Design",
        description: "Dive deep into CSS selectors, box model, Flexbox, Grid, and media queries to make your websites responsive and visually stunning.",
        instructor: instructor._id,
        videoUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc"
      },
      {
        title: "JavaScript Programming for Beginners",
        description: "Master modern JS syntax, variables, conditional blocks, loops, functions, DOM manipulation, and building simple interactive web apps.",
        instructor: instructor._id,
        videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk"
      },
      {
        title: "Python Programming Course",
        description: "Learn Python from the ground up: data types, logic control, functions, object-oriented concepts, and basic scripting automation.",
        instructor: instructor._id,
        videoUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc"
      },
      {
        title: "Introduction to Machine Learning",
        description: "An absolute beginner's introduction to ML concepts, supervised/unsupervised learning, training data, and simple regression algorithms.",
        instructor: instructor._id,
        videoUrl: "https://www.youtube.com/watch?v=GwIo3gTOB3I"
      }
    ];

    console.log("Seeding courses...");
    await Course.insertMany(courses);

    console.log("Database seeded successfully! 🎉");
    console.log("Default Instructor Account:");
    console.log("  Email: instructor@example.com");
    console.log("  Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
