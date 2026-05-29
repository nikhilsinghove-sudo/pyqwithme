import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Paper } from "../models/Paper.js";
import { Visitor } from "../models/Visitor.js";
import { Report } from "../models/Report.js";

async function run() {
  await connectDB();
  console.log("Connected to DB for test");

  // Create an approved paper for testing
  let paper = await Paper.findOne({ status: "approved" });
  if (!paper) {
    console.log("No approved paper found, creating a mock approved paper for test");
    paper = await Paper.create({
      examName: "MOCK EXAM",
      year: 2026,
      month: "May",
      week: "Week 4",
      shift: "Morning",
      subject: "Computer Science",
      pdfUrl: "http://example.com/mock.pdf",
      pdfPublicId: "mock_public_id",
      uploadedEmail: "mock@example.com",
      uploadPassword: "password123",
      status: "approved",
      views: 10,
      downloads: 5,
      shares: 2
    });
  }

  const initialShares = paper.shares || 0;
  console.log(`Initial shares count for paper "${paper.examName}": ${initialShares}`);

  // Increment shares
  paper.shares = (paper.shares || 0) + 1;
  await paper.save();

  const updatedPaper = await Paper.findById(paper._id);
  console.log(`Updated shares count: ${updatedPaper.shares}`);

  if (updatedPaper.shares !== initialShares + 1) {
    throw new Error(`Assertion failed: expected ${initialShares + 1} shares, got ${updatedPaper.shares}`);
  }
  console.log("✅ Shares incremented successfully!");

  // Create some mock visitors to test the returning visitors & IP grouping logic
  console.log("Testing visitor analytics calculations...");
  const mockVisitorId1 = "visitor-test-1";
  const mockVisitorId2 = "visitor-test-2";
  const mockIpHash = "hash-1234-test";

  // Cleanup old test visitor records if any
  await Visitor.deleteMany({ ipHash: mockIpHash });

  // Record visits
  await Visitor.create([
    { visitorId: mockVisitorId1, ipHash: mockIpHash, path: "/", userAgent: "Mozilla/5.0 (Windows)", lastSeenAt: new Date() },
    { visitorId: mockVisitorId1, ipHash: mockIpHash, path: "/search", userAgent: "Mozilla/5.0 (Windows)", lastSeenAt: new Date() }, // visitor-test-1 has 2 paths -> returning
    { visitorId: mockVisitorId2, ipHash: mockIpHash, path: "/", userAgent: "Mozilla/5.0 (Windows)", lastSeenAt: new Date() }  // visitor-test-2 has 1 path -> non-returning
  ]);

  // Run returning user query
  const returningCountGroup = await Visitor.aggregate([
    { $group: { _id: "$visitorId", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: "count" }
  ]);
  const returningCount = returningCountGroup[0]?.count || 0;
  console.log(`Calculated returning users count: ${returningCount}`);

  // Run IP aggregation query
  const visitorIPList = await Visitor.aggregate([
    {
      $group: {
        _id: "$ipHash",
        visits: { $sum: 1 },
        paths: { $addToSet: "$path" },
        userAgents: { $addToSet: "$userAgent" },
        lastActive: { $max: "$lastSeenAt" }
      }
    },
    { $match: { _id: mockIpHash } }
  ]);

  const groupData = visitorIPList[0];
  console.log("Grouped IP metrics:", groupData);
  if (!groupData || groupData.visits !== 3 || groupData.paths.length !== 2) {
    throw new Error("Assertion failed on grouped IP metrics!");
  }
  console.log("✅ Grouped IP visitor calculations are perfect!");

  // Cleanup mock visitors
  await Visitor.deleteMany({ ipHash: mockIpHash });
  console.log("Cleanup mock visitors done.");

  // Test User Report Creation
  console.log("Testing user reports database schema...");
  const mockReport = await Report.create({
    paper: paper._id,
    examName: paper.examName,
    subject: paper.subject || "General",
    year: paper.year,
    comment: "This question paper has incorrect answer key in Shift 2.",
    userEmail: "reporter@example.com"
  });
  console.log(`Mock report created: ${mockReport._id}`);

  const fetchedReport = await Report.findById(mockReport._id).populate("paper", "examName year");
  console.log("Fetched Report populated paper:", fetchedReport.paper);
  if (!fetchedReport || fetchedReport.comment !== "This question paper has incorrect answer key in Shift 2." || fetchedReport.paper.examName !== paper.examName) {
    throw new Error("Assertion failed: report failed to populate paper correctly!");
  }
  console.log("✅ Reports creation and population are perfect!");

  await Report.findByIdAndDelete(mockReport._id);
  console.log("Mock report cleaned up.");

  mongoose.connection.close();
  console.log("Test finished successfully.");
}

run().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
