export const samplePapers = [
  {
    _id: "sample-jee-2024-physics",
    isSample: true,
    examName: "JEE Main",
    examLogo: "",
    year: 2024,
    month: "January",
    week: "Week 2",
    shift: "Shift 1",
    subject: "Physics",
    downloads: 124,
    views: 410,
    pdfUrl: "#"
  },
  {
    _id: "sample-neet-2023-biology",
    isSample: true,
    examName: "NEET UG",
    examLogo: "",
    year: 2023,
    month: "May",
    week: "Week 1",
    shift: "Shift 1",
    subject: "Biology",
    downloads: 98,
    views: 360,
    pdfUrl: "#"
  },
  {
    _id: "sample-ssc-2022-math",
    isSample: true,
    examName: "SSC CGL",
    examLogo: "",
    year: 2022,
    month: "December",
    week: "Week 3",
    shift: "Shift 2",
    subject: "Quantitative Aptitude",
    downloads: 76,
    views: 250,
    pdfUrl: "#"
  },
  {
    _id: "sample-gate-2024-cs",
    isSample: true,
    examName: "GATE",
    examLogo: "",
    year: 2024,
    month: "February",
    week: "Week 1",
    shift: "Shift 2",
    subject: "Computer Science",
    branch: "Computer Science",
    downloads: 145,
    views: 520,
    pdfUrl: "#"
  }
];

export function filterSamplePapers(filters = {}) {
  return samplePapers.filter((paper) => {
    if (filters.examName && !paper.examName.toLowerCase().includes(String(filters.examName).toLowerCase())) return false;
    if (filters.year && String(paper.year) !== String(filters.year)) return false;
    if (filters.month && paper.month !== filters.month) return false;
    if (filters.week && paper.week !== filters.week) return false;
    if (filters.shift && paper.shift !== filters.shift) return false;
    if (filters.subject && !paper.subject.toLowerCase().includes(String(filters.subject).toLowerCase())) return false;
    if (filters.branch) {
      const branch = paper.branch || "";
      if (!branch.toLowerCase().includes(String(filters.branch).toLowerCase())) return false;
    }
    return true;
  });
}
