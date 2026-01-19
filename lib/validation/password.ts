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
  switch (score) {
    case 0:
      label = "veryWeak";
      color = "red";
      if (password.length > 0) {
        feedback.unshift("veryWeakPassword");
      }
      break;
    case 1:
    case 2:
      label = "weak";
      color = "red";
      feedback.unshift("weakPassword");
      break;
    case 3:
      label = "fair";
      color = "yellow";
      feedback.unshift("fairPasswordStrength");
      break;
    case 4:
      label = "good";
      color = "green";
      feedback.unshift("goodPasswordStrength");
      break;
    default: // score is 5
      label = "strong";
      color = "green";
      feedback.unshift("strongPassword");
      break;
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
