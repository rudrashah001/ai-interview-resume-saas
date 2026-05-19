import { jsPDF } from 'jspdf';

export function exportResumePdf(resume) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 48;
  let y = margin;

  const addLine = (text, size = 11, style = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 520);
    lines.forEach((line) => {
      if (y > 720) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size + 4;
    });
    y += 6;
  };

  addLine(resume.fullName || resume.title || 'Resume', 20, 'bold');
  if (resume.headline) addLine(resume.headline, 12, 'italic');
  if (resume.summary) {
    addLine('Summary', 13, 'bold');
    addLine(resume.summary);
  }
  if (resume.contact?.email) {
    const c = resume.contact;
    addLine(
      [c.email, c.phone, c.location, c.linkedin, c.github]
        .filter(Boolean)
        .join(' · '),
      10
    );
  }
  if (resume.experience?.length) {
    addLine('Experience', 13, 'bold');
    resume.experience.forEach((ex) => {
      addLine(`${ex.role} — ${ex.company} (${ex.start}–${ex.end || 'Present'})`, 11, 'bold');
      (ex.bullets || []).forEach((b) => addLine(`• ${b}`, 10));
    });
  }
  if (resume.education?.length) {
    addLine('Education', 13, 'bold');
    resume.education.forEach((ed) =>
      addLine(`${ed.degree} — ${ed.school} (${ed.year})`, 10)
    );
  }
  if (resume.skills?.length) {
    addLine('Skills', 13, 'bold');
    addLine(resume.skills.join(', '), 10);
  }
  doc.save(`${(resume.title || 'resume').replace(/\s+/g, '_')}.pdf`);
}
