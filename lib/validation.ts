import type { HealthMetrics } from "@/lib/domain";

export type ScheduleValidationInput = {
  patientName: string;
  patientPhone: string;
  reason: string;
  selectedDate?: Date;
  selectedTime: string;
  availableSlots: string[];
};

export type DoctorValidationInput = {
  name: string;
  age: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type DoctorValidationErrors = {
  name?: string;
  age?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

export type LoginValidationInput = {
  email: string;
  password: string;
};

export type LoginValidationErrors = {
  email?: string;
  password?: string;
};

export type UsernameValidationErrors = {
  username?: string;
};

export type PasswordChangeValidationInput = {
  currentPassword: string;
  newPassword: string;
};

export type PasswordChangeValidationErrors = {
  currentPassword?: string;
  newPassword?: string;
};

export type ScheduleValidationErrors = {
  patientName?: string;
  patientPhone?: string;
  reason?: string;
  selectedDate?: string;
  selectedTime?: string;
};

export const sanitizeText = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

export const isValidPhoneNumber = (value: string): boolean => {
  const trimmed = sanitizeText(value);
  if (trimmed.length < 8 || trimmed.length > 20) {
    return false;
  }

  // Allow common phone characters while requiring at least 8 digits.
  if (!/^\+?[0-9\s()\-]+$/.test(trimmed)) {
    return false;
  }

  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
};

export const validateScheduleForm = (
  input: ScheduleValidationInput,
): {
  isValid: boolean;
  errors: ScheduleValidationErrors;
  sanitized: {
    patientName: string;
    patientPhone: string;
    reason: string;
  };
} => {
  const errors: ScheduleValidationErrors = {};

  const patientName = sanitizeText(input.patientName);
  const patientPhone = sanitizeText(input.patientPhone);
  const reason = sanitizeText(input.reason);

  if (!patientName) {
    errors.patientName = "Patient name is required.";
  } else if (patientName.length < 2 || patientName.length > 80) {
    errors.patientName = "Patient name must be 2-80 characters.";
  }

  if (!patientPhone) {
    errors.patientPhone = "Phone number is required.";
  } else if (!isValidPhoneNumber(patientPhone)) {
    errors.patientPhone = "Enter a valid phone number.";
  }

  if (!reason) {
    errors.reason = "Reason is required.";
  } else if (reason.length < 3 || reason.length > 120) {
    errors.reason = "Reason must be 3-120 characters.";
  }

  if (!input.selectedDate) {
    errors.selectedDate = "Appointment date is required.";
  } else {
    const selectedDate = new Date(input.selectedDate);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errors.selectedDate = "Appointment date cannot be in the past.";
    }

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      errors.selectedDate = "Appointments are only available on weekdays.";
    }
  }

  if (!input.selectedTime) {
    errors.selectedTime = "Appointment time is required.";
  } else if (!input.availableSlots.includes(input.selectedTime)) {
    errors.selectedTime = "Selected time is not available for this date.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      patientName,
      patientPhone,
      reason,
    },
  };
};

export const validateDoctorForm = (
  input: DoctorValidationInput,
): {
  isValid: boolean;
  errors: DoctorValidationErrors;
  sanitized: {
    name: string;
    age: number;
    email: string;
    phone: string;
    password: string;
  };
} => {
  const errors: DoctorValidationErrors = {};

  const name = sanitizeText(input.name);
  const ageNumber = Number.parseInt(input.age, 10);
  const email = sanitizeText(input.email).toLowerCase();
  const phone = sanitizeText(input.phone);
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!name) {
    errors.name = "Doctor name is required.";
  } else if (name.length < 2 || name.length > 80) {
    errors.name = "Doctor name must be 2-80 characters.";
  }

  if (!Number.isFinite(ageNumber)) {
    errors.age = "Age is required.";
  } else if (ageNumber < 24 || ageNumber > 90) {
    errors.age = "Age must be between 24 and 90.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhoneNumber(phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6 || password.length > 72) {
    errors.password = "Password must be between 6 and 72 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name,
      age: Number.isFinite(ageNumber) ? ageNumber : 0,
      email,
      phone,
      password,
    },
  };
};

export const validateLoginForm = (
  input: LoginValidationInput,
): {
  isValid: boolean;
  errors: LoginValidationErrors;
  sanitized: {
    email: string;
  };
} => {
  const errors: LoginValidationErrors = {};
  const email = sanitizeText(input.email).toLowerCase();

  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!input.password) {
    errors.password = "Password is required.";
  } else if (input.password.length < 6 || input.password.length > 72) {
    errors.password = "Password must be between 6 and 72 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      email,
    },
  };
};

export const validateUsernameForm = (
  usernameInput: string,
): {
  isValid: boolean;
  errors: UsernameValidationErrors;
  sanitized: {
    username: string;
  };
} => {
  const errors: UsernameValidationErrors = {};
  const username = sanitizeText(usernameInput);

  if (!username) {
    errors.username = "Username is required.";
  } else if (username.length < 3 || username.length > 30) {
    errors.username = "Username must be between 3 and 30 characters.";
  } else if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    errors.username = "Use letters, digits, dot, underscore, or hyphen only.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      username,
    },
  };
};

export const validatePasswordChangeForm = (
  input: PasswordChangeValidationInput,
): {
  isValid: boolean;
  errors: PasswordChangeValidationErrors;
} => {
  const errors: PasswordChangeValidationErrors = {};

  if (!input.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (!input.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (input.newPassword.length < 8 || input.newPassword.length > 72) {
    errors.newPassword = "New password must be between 8 and 72 characters.";
  } else if (input.newPassword === input.currentPassword) {
    errors.newPassword =
      "New password must be different from current password.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateDoctorNote = (
  noteInput: string,
): {
  isValid: boolean;
  error?: string;
  sanitized: string;
} => {
  const sanitized = noteInput.replace(/\s+/g, " ").trimStart();

  if (sanitized.length > 200) {
    return {
      isValid: false,
      error: "Note must be at most 200 characters.",
      sanitized,
    };
  }

  return {
    isValid: true,
    sanitized,
  };
};

type EditableMetricKey = Exclude<keyof HealthMetrics, "date">;

export const metricRanges: Record<
  EditableMetricKey,
  { min: number; max: number }
> = {
  weight: { min: 25, max: 250 },
  height: { min: 100, max: 230 },
  bmi: { min: 10, max: 60 },
  bodyFat: { min: 2, max: 70 },
  muscleMass: { min: 5, max: 120 },
  bodyWater: { min: 20, max: 80 },
  metabolicAge: { min: 30, max: 120 },
  leanBodyMass: { min: 10, max: 200 },
  inorganicSalts: { min: 0.5, max: 8 },
  smm: { min: 5, max: 120 },
  bfp: { min: 2, max: 70 },
};

export const validateMetricValue = (
  key: EditableMetricKey,
  value: number,
): string | undefined => {
  if (!Number.isFinite(value)) {
    return "Value must be a valid number.";
  }

  const { min, max } = metricRanges[key];
  if (value < min || value > max) {
    return `Value must be between ${min} and ${max}.`;
  }

  return undefined;
};

export type MetricValidationErrors = Partial<Record<EditableMetricKey, string>>;

export const validatePatientMetrics = (
  metrics: HealthMetrics,
): {
  isValid: boolean;
  errors: MetricValidationErrors;
} => {
  const errors: MetricValidationErrors = {};

  (Object.keys(metricRanges) as EditableMetricKey[]).forEach((key) => {
    const error = validateMetricValue(key, metrics[key]);
    if (error) {
      errors[key] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
