import {
  isValidPhoneNumber,
  metricRanges,
  sanitizeText,
  validateDoctorForm,
  validateDoctorNote,
  validateLoginForm,
  validateMetricValue,
  validatePasswordChangeForm,
  validatePatientMetrics,
  validateScheduleForm,
  validateUsernameForm,
} from "@/lib/validation";

describe("validation", () => {
  it("sanitizes repeated whitespace", () => {
    expect(sanitizeText("  John   Doe  ")).toBe("John Doe");
  });

  it("validates phone numbers", () => {
    expect(isValidPhoneNumber("+1 (555) 123-4567")).toBe(true);
    expect(isValidPhoneNumber("abc")).toBe(false);
  });

  it("validates login form", () => {
    const invalid = validateLoginForm({ email: "bad", password: "123" });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.email).toBeDefined();
    expect(invalid.errors.password).toBeDefined();

    const valid = validateLoginForm({
      email: "  USER@Mail.Com ",
      password: "123456",
    });
    expect(valid.isValid).toBe(true);
    expect(valid.sanitized.email).toBe("user@mail.com");
  });

  it("validates schedule form with date, slot, and text constraints", () => {
    const invalid = validateScheduleForm({
      patientName: "",
      patientPhone: "12",
      reason: "",
      selectedDate: undefined,
      selectedTime: "",
      availableSlots: [],
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.patientName).toBeDefined();
    expect(invalid.errors.selectedDate).toBeDefined();

    const nextWeekday = new Date();
    nextWeekday.setDate(nextWeekday.getDate() + 1);
    if (nextWeekday.getDay() === 0) {
      nextWeekday.setDate(nextWeekday.getDate() + 1);
    }
    if (nextWeekday.getDay() === 6) {
      nextWeekday.setDate(nextWeekday.getDate() + 2);
    }

    const valid = validateScheduleForm({
      patientName: "  Jane   Roe ",
      patientPhone: "+1 555-123-4567",
      reason: "  Follow up  ",
      selectedDate: nextWeekday,
      selectedTime: "09:00",
      availableSlots: ["09:00", "09:30"],
    });
    expect(valid.isValid).toBe(true);
    expect(valid.sanitized.patientName).toBe("Jane Roe");
  });

  it("validates doctor form and sanitizes output", () => {
    const invalid = validateDoctorForm({
      name: "",
      age: "2",
      email: "bad",
      phone: "abc",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.name).toBeDefined();
    expect(invalid.errors.email).toBeDefined();

    const valid = validateDoctorForm({
      name: "  Ana  Maria  ",
      age: "35",
      email: " ANA@MAIL.COM ",
      phone: "+1 555-000-1234",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(valid.isValid).toBe(true);
    expect(valid.sanitized.name).toBe("Ana Maria");
    expect(valid.sanitized.email).toBe("ana@mail.com");
  });

  it("validates username and password change forms", () => {
    expect(validateUsernameForm(" ").isValid).toBe(false);
    expect(validateUsernameForm("john_doe.1").isValid).toBe(true);

    const pwdInvalid = validatePasswordChangeForm({
      currentPassword: "secret123",
      newPassword: "secret123",
      confirmPassword: "secret123",
    });
    expect(pwdInvalid.isValid).toBe(false);

    const pwdValid = validatePasswordChangeForm({
      currentPassword: "oldpass123",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    });
    expect(pwdValid.isValid).toBe(true);
  });

  it("validates doctor notes max length", () => {
    const tooLong = validateDoctorNote("x".repeat(201));
    expect(tooLong.isValid).toBe(false);

    const ok = validateDoctorNote("  hello doctor");
    expect(ok.isValid).toBe(true);
    expect(ok.sanitized).toBe("hello doctor");
  });

  it("validates metric values and full metric object", () => {
    expect(validateMetricValue("weight", Number.NaN)).toBe(
      "Value must be a valid number.",
    );
    expect(validateMetricValue("weight", metricRanges.weight.max + 1)).toBe(
      `Value must be between ${metricRanges.weight.min} and ${metricRanges.weight.max}.`,
    );

    const validMetrics = {
      date: "2026-01-01",
      weight: 70,
      height: 170,
      bmi: 24,
      bodyFat: 20,
      muscleMass: 40,
      bodyWater: 50,
      metabolicAge: 40,
      leanBodyMass: 50,
      inorganicSalts: 2,
      smm: 40,
      bfp: 20,
    };
    expect(validatePatientMetrics(validMetrics).isValid).toBe(true);

    const invalidMetrics = { ...validMetrics, weight: 500 };
    expect(validatePatientMetrics(invalidMetrics).isValid).toBe(false);
    expect(validatePatientMetrics(invalidMetrics).errors.weight).toBeDefined();
  });
});
