import { describe, it, expect } from "vitest";
import { validateCvFile, sanitizeFilename, MAX_CV_BYTES } from "@/lib/upload";

describe("validateCvFile", () => {
  it("accepte un PDF valide", () => {
    expect(validateCvFile({ mimetype: "application/pdf", size: 1000, name: "cv.pdf" }).valid).toBe(true);
  });
  it("accepte un DOCX valide", () => {
    expect(validateCvFile({ mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 1000, name: "cv.docx" }).valid).toBe(true);
  });
  it("refuse un type non autorisé", () => {
    expect(validateCvFile({ mimetype: "text/plain", size: 10, name: "cv.txt" }).valid).toBe(false);
  });
  it("refuse un fichier trop volumineux", () => {
    expect(validateCvFile({ mimetype: "application/pdf", size: MAX_CV_BYTES + 1, name: "cv.pdf" }).valid).toBe(false);
  });
  it("refuse une extension incohérente avec le MIME", () => {
    expect(validateCvFile({ mimetype: "application/pdf", size: 10, name: "cv.exe" }).valid).toBe(false);
  });
});

describe("sanitizeFilename", () => {
  it("neutralise le path traversal et les caractères douteux", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("mon cv (final)!.pdf")).toBe("mon_cv_final_.pdf");
  });
});
