/* eslint-disable @next/next/no-img-element */
// The selector of image should accept any url, and as we use our own VPS we should not have issues with extra calls due unoptimized images
"use client";

import { useState, useCallback } from "react";
import { defaultAvatars, fallbackImageUrl, avatarUtils } from "@/shared/config/avatar-options";

interface AvatarSelectorProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  disabled?: boolean;
  customUrl?: string;
  onCustomUrlChange?: (url: string) => void;
  onCustomUrlApply?: () => void;
}

export default function AvatarSelector({
  currentAvatarUrl,
  onAvatarChange,
  disabled = false,
  customUrl = "",
  onCustomUrlChange,
  onCustomUrlApply,
}: AvatarSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleDefaultAvatarClick = useCallback(
    (src: string) => {
      onAvatarChange(src);
      setShowCustomInput(false);
    },
    [onAvatarChange]
  );

  const handleCustomUrlApply = useCallback(() => {
    if (customUrl.trim() && avatarUtils.isValidUrl(customUrl)) {
      onAvatarChange(customUrl);
      setShowCustomInput(false);
    }
    onCustomUrlApply?.();
  }, [customUrl, onAvatarChange, onCustomUrlApply]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4 max-w-2xl">
        {defaultAvatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            className={`relative rounded-full overflow-hidden border-2 ${
              currentAvatarUrl === avatar.src
                ? "border-blue-500"
                : "border-transparent"
            } hover:border-blue-300 transition-all ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !disabled && handleDefaultAvatarClick(avatar.src)}
            disabled={disabled}
          >
            <div className="h-16 rounded-full relative  overflow-hidden">
              <img
                src={avatar.src}
                alt={avatar.alt}
                className="h-16 rounded-full object-cover"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = fallbackImageUrl)
                }
              />
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => !disabled && setShowCustomInput(!showCustomInput)}
        className={`text-sm ${disabled ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}`}
        disabled={disabled}
      >
        {showCustomInput ? "Hide custom URL option" : "Use custom avatar URL"}
      </button>

      {showCustomInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => {
              onCustomUrlChange?.(e.target.value);
            }}
            placeholder="Enter avatar URL"
            className="flex-1 border border-gray-300 dark:border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleCustomUrlApply}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={disabled || !customUrl.trim()}
          >
            Apply
          </button>
        </div>
      )}

      {currentAvatarUrl && (
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">Current avatar:</p>
          <div className="w-16 h-16 relative rounded-full overflow-hidden border border-gray-200 dark:border-border">
            <img
              src={currentAvatarUrl}
              alt="Current avatar"
              className="h-16 rounded-full object-cover"
              onError={(e) =>
                ((e.target as HTMLImageElement).src = fallbackImageUrl)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}