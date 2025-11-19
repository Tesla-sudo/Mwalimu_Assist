import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    class: { type: Number, required: true, min: 1, max: 9 },
    subject: { type: String, required: true },
    performance: { type: Number, min: 0, max: 100, default: 0 }, // Score %
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
