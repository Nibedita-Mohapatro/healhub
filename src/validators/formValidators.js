// src/utils/formValidators.js

/**
 * Generic form validation utilities for HealHub
 * Used in: Login, Register, MedicineForm, ReminderForm, Profile pages
 *
 * Each validator returns: { isValid: boolean, errors: { field: message } }
 */

/* ---------- Helper functions ---------- */

/** Check if a string is non-empty */
export const isRequired = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

/** Check for valid email */
export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

/** Check for valid password — at least 6 chars */
export const isStrongPassword = (value) => String(value).length >= 6;

/** Check for valid phone number (basic pattern) */
export const isPhone = (value) => /^[0-9]{10}$/.test(String(value).trim());

/** Check if a date is valid */
export const isValidDate = (dateStr) => {
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d);
};

/** Check positive number */
export const isPositiveNumber = (val) => !isNaN(val) && Number(val) > 0;

/* ---------- Validators for forms ---------- */

/** Login form validation */
export function validateLoginForm(values) {
  const errors = {};
  if (!isRequired(values.email)) errors.email = "Email is required";
  else if (!isEmail(values.email)) errors.email = "Invalid email format";

  if (!isRequired(values.password)) errors.password = "Password is required";
  else if (!isStrongPassword(values.password))
    errors.password = "Password must be at least 6 characters";

  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Register form validation */
export function validateRegisterForm(values) {
  const errors = {};
  if (!isRequired(values.name)) errors.name = "Full name is required";

  if (!isRequired(values.email)) errors.email = "Email is required";
  else if (!isEmail(values.email)) errors.email = "Invalid email format";

  if (!isRequired(values.password)) errors.password = "Password is required";
  else if (!isStrongPassword(values.password))
    errors.password = "Password must be at least 6 characters";

  if (values.confirmPassword !== values.password)
    errors.confirmPassword = "Passwords do not match";

  if (values.phone && !isPhone(values.phone))
    errors.phone = "Invalid phone number";

  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Medicine form validation */
export function validateMedicineForm(values) {
  const errors = {};
  if (!isRequired(values.name)) errors.name = "Medicine name is required";

  if (!isRequired(values.dosage)) errors.dosage = "Dosage is required";

  if (!isRequired(values.frequency)) errors.frequency = "Frequency is required";

  if (!isRequired(values.startDate) || !isValidDate(values.startDate))
    errors.startDate = "Valid start date is required";

  if (values.endDate && !isValidDate(values.endDate))
    errors.endDate = "Invalid end date";

  if (values.stock && !isPositiveNumber(values.stock))
    errors.stock = "Stock must be a positive number";

  if (values.doctor && values.doctor.length < 2)
    errors.doctor = "Doctor name too short";

  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Reminder form validation */
export function validateReminderForm(values) {
  const errors = {};
  if (!isRequired(values.title)) errors.title = "Title is required";

  if (!isRequired(values.time)) errors.time = "Reminder time is required";

  if (!isRequired(values.date) || !isValidDate(values.date))
    errors.date = "Valid date is required";

  if (!isRequired(values.medicineId))
    errors.medicineId = "Select a medicine to remind";

  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Profile update validation */
export function validateProfileForm(values) {
  const errors = {};
  if (!isRequired(values.name)) errors.name = "Name is required";

  if (!isRequired(values.email)) errors.email = "Email is required";
  else if (!isEmail(values.email)) errors.email = "Invalid email";

  if (values.phone && !isPhone(values.phone))
    errors.phone = "Invalid phone number";

  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Tracker inputs (generic) */
export function validateTrackerEntry(values) {
  const errors = {};
  if (!isRequired(values.type)) errors.type = "Tracker type required";
  if (!isPositiveNumber(values.value))
    errors.value = "Enter a valid positive number";
  if (!isRequired(values.date) || !isValidDate(values.date))
    errors.date = "Enter a valid date";
  return { isValid: Object.keys(errors).length === 0, errors };
}

/* ---------- Combined export ---------- */
export default {
  validateLoginForm,
  validateRegisterForm,
  validateMedicineForm,
  validateReminderForm,
  validateProfileForm,
  validateTrackerEntry,
  isRequired,
  isEmail,
  isStrongPassword,
  isPhone,
  isValidDate,
  isPositiveNumber,
};
