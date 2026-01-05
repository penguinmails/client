/**
 * Password validation utilities
 * Part of the FSD shared layer
 */

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: "red" | "yellow" | "green";
  feedback: string[];
}

export const validatePasswordRequirements = (password: string) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  return requirements;
};

export const calculatePasswordStrength = (
  password: string,
): PasswordStrength => {
  if (password.length === 0) {
    return {
      score: 0,
      label: "Very Weak",
      color: "red",
      feedback: ["Enter a password"],
    };
  }

  const requirements = validatePasswordRequirements(password);
  const score = Object.values(requirements).filter(Boolean).length;

  let label: string;
  let color: "red" | "yellow" | "green";
  const feedback: string[] = [];

  // Generate feedback messages
  if (!requirements.length) feedback.push("Use at least 8 characters");
  if (!requirements.uppercase) feedback.push("Add uppercase letter");
  if (!requirements.lowercase) feedback.push("Add lowercase letter");
  if (!requirements.number) feedback.push("Add number");
  if (!requirements.special) feedback.push("Add special character");

  // Determine strength level
  if (score === 0) {
    label = "Very Weak";
    color = "red";
    if (password.length > 0) {
      feedback.unshift("Very weak password");
    }
  } else if (score <= 2) {
    label = "Weak";
    color = "red";
    feedback.unshift("Weak password");
  } else if (score <= 3) {
    label = "Fair";
    color = "yellow";
    feedback.unshift("Fair password strength");
  } else if (score <= 4) {
    label = "Good";
    color = "green";
    feedback.unshift("Good password strength");
  } else {
    label = "Strong";
    color = "green";
    feedback.unshift("Strong password");
  }

  return {
    score,
    label,
    color,
    feedback,
  };
};

export const isPasswordStrongEnough = (password: string): boolean => {
  const strength = calculatePasswordStrength(password);
  return strength.score >= 3; // At least "Fair" strength required
};
