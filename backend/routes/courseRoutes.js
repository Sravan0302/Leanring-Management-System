const express = require("express");
const mongoose = require("mongoose"); // Imported to validate ObjectIds
const Course = require("../models/Course");
const Progress = require("../models/Progress");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// =======================
// CREATE COURSE
// =======================
router.post(
  "/",
  authMiddleware,
  authorize("instructor"),
  async (req, res) => {
    try {
      const { title, description } = req.body;

      // 1. Input Validation
      if (!title || !description) {
        return res.status(400).json({
          message: "Title and description are required"
        });
      }

      const course = await Course.create({
        ...req.body,
        instructor: req.user.userId
      });

      res.status(201).json({
        message: "Course Added",
        course
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// =======================
// GET ALL COURSES
// =======================
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// =======================
// GET STUDENT PROGRESS
// =======================
router.get("/progress/all", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.userId;
    const progressList = await Progress.find({ student: studentId }).populate("course");
    res.status(200).json(progressList);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// =======================
// UPDATE COURSE PROGRESS
// =======================
router.post("/:id/progress", authMiddleware, async (req, res) => {
  try {
    const { progressPercentage, isCompleted } = req.body;
    const courseId = req.params.id;
    const studentId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid Course ID format"
      });
    }

    // Upsert the progress record
    const progress = await Progress.findOneAndUpdate(
      { student: studentId, course: courseId },
      { progressPercentage, isCompleted },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Progress updated successfully",
      progress
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// =======================
// GET SINGLE COURSE
// =======================
router.get("/:id", async (req, res) => {
  try {
    // 2. Validate Course ID format before querying database
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid Course ID format"
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// =======================
// UPDATE COURSE (SECURED)
// =======================
router.put(
  "/:id",
  authMiddleware,
  authorize("instructor"),
  async (req, res) => {
    try {
      // 3. Validate Course ID format before querying database
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid Course ID format"
        });
      }

      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found"
        });
      }

      // 🔒 ownership check
      if (course.instructor.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You are not allowed to update this course"
        });
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      res.status(200).json({
        message: "Course Updated",
        course: updatedCourse
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// =======================
// DELETE COURSE (SECURED)
// =======================
router.delete(
  "/:id",
  authMiddleware,
  authorize("instructor"),
  async (req, res) => {
    try {
      // 4. Validate Course ID format before querying database
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid Course ID format"
        });
      }

      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found"
        });
      }

      // 🔒 ownership check
      if (course.instructor.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You are not allowed to delete this course"
        });
      }

      await Course.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "Course Deleted Successfully"
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

module.exports = router;