/**
 * Avatar Configuration
 * 
 * Centralized avatar options and utilities
 */

export interface AvatarOption {
  id: string;
  src: string;
  alt: string;
}

// Default avatar options using Dicebear API
export const defaultAvatars: AvatarOption[] = [
  {
    id: "aidan",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Aiden",
    alt: "Aiden",
  },
  {
    id: "adrian",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Adrian",
    alt: "Adrian",
  },
  {
    id: "george",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=George",
    alt: "George",
  },
  {
    id: "destiny",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Destiny",
    alt: "Destiny",
  },
  {
    id: "christian",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Christian",
    alt: "Christian",
  },
  {
    id: "caleb",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Caleb",
    alt: "Caleb",
  },
  {
    id: "easton",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Easton",
    alt: "Easton",
  },
  {
    id: "brian",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Brian",
    alt: "Brian",
  },
  {
    id: "alexander",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Alexander",
    alt: "Alexander",
  },
  {
    id: "jack",
    src: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jack",
    alt: "Jack",
  },
];

// Fallback image URL
export const fallbackImageUrl = "https://via.placeholder.com/64x64?text=No+Image";

// Avatar utilities
export const avatarUtils = {
  /**
   * Validates if a URL is a valid image URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Generates a random avatar URL from Dicebear
   */
  generateRandomAvatar: (seed?: string): string => {
    const randomSeed = seed || Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${randomSeed}`;
  },

  /**
   * Gets avatar by ID
   */
  getAvatarById: (id: string): AvatarOption | undefined => {
    return defaultAvatars.find(avatar => avatar.id === id);
  },

  /**
   * Gets all available avatar options
   */
  getAllAvatars: (): AvatarOption[] => {
    return [...defaultAvatars];
  }
};