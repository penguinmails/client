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
      label: "veryWeak",
      color: "red",
      feedback: ["enterPassword"],
    };
  }

  const requirements = validatePasswordRequirements(password);
  const score = Object.values(requirements).filter(Boolean).length;

  let label: string;
  let color: "red" | "yellow" | "green";
  const feedback: string[] = [];

  // Generate feedback messages (translation keys)
  if (!requirements.length) feedback.push("useAtLeast8Characters");
  if (!requirements.uppercase) feedback.push("addUppercaseLetter");
  if (!requirements.lowercase) feedback.push("addLowercaseLetter");
  if (!requirements.number) feedback.push("addNumber");
  if (!requirements.special) feedback.push("addSpecialCharacter");

  // Determine strength level (translation keys)
  if (score === 0) {
    label = "veryWeak";
    color = "red";
    if (password.length > 0) {
      feedback.unshift("veryWeakPassword");
    }
  } else if (score <= 2) {
    label = "weak";
    color = "red";
    feedback.unshift("weakPassword");
  } else if (score <= 3) {
    label = "fair";
    color = "yellow";
    feedback.unshift("fairPasswordStrength");
  } else if (score <= 4) {
    label = "good";
    color = "green";
    feedback.unshift("goodPasswordStrength");
  } else {
    label = "strong";
    color = "green";
    feedback.unshift("strongPassword");
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
