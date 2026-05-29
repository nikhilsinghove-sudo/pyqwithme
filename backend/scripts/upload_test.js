import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const tempDir = path.join(process.cwd(), 'uploads');
    await fs.promises.mkdir(tempDir, { recursive: true });
    const tempPath = path.join(tempDir, 'e2e-temp.pdf');
    const pdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 72 72 Td (Hi) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\ntrailer << /Root 1 0 R >>\nstartxref\n000\n%%EOF`;
    await fs.promises.writeFile(tempPath, pdf, 'binary');

    const fd = new FormData();
    fd.append('uploadedEmail', 'e2e.test@example.com');
    fd.append('uploadPassword', 'E2Epass123');
    fd.append('examName', 'E2E Test Exam');
    fd.append('year', String(new Date().getFullYear()));
    fd.append('month', 'May');
    fd.append('week', 'Week 1');
    fd.append('shift', 'Shift 1');
    fd.append('subject', 'General');
    fd.append('pdf', fs.createReadStream(tempPath), 'e2e-temp.pdf');

    const res = await fetch('http://localhost:5001/api/papers', { method: 'POST', body: fd });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('UPLOAD FAILED', err);
  }
}

main();
