"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, User, Loader2, Check, X } from "lucide-react";
import { developmentLogger } from "@/lib/logger";
import { useTranslations } from "next-intl";

interface AvatarFormProps {
  currentAvatarUrl: string;
  onAvatarChange: (url: string) => void;
  profileLoading: boolean;
  submitLoading: boolean;
  customAvatarUrl: string;
  onCustomUrlChange: (url: string) => void;
  onCustomUrlApply: () => void;
}

export default function AvatarForm({
  currentAvatarUrl,
  onAvatarChange,
  profileLoading,
  submitLoading,
  customAvatarUrl,
  onCustomUrlChange,
  onCustomUrlApply,
}: AvatarFormProps) {
  const t = useTranslations();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      developmentLogger.warn("Invalid file type for avatar upload");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      developmentLogger.warn("Avatar file too large (max 5MB)");
      return;
    }

    setUploading(true);
    
    try {
      // Mock upload - would implement actual file upload
      const mockUrl = URL.createObjectURL(file);
      onAvatarChange(mockUrl);
      developmentLogger.debug("Avatar uploaded:", { fileName: file.name, size: file.size });
    } catch (error) {
      developmentLogger.error("Avatar upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const predefinedAvatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
  ];

  const isDisabled = profileLoading || submitLoading || uploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("Settings.profile.avatar.title")}
          {(profileLoading || submitLoading || uploading) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Avatar Display */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={currentAvatarUrl}
              alt={t("Settings.profile.avatar.current")}
            />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("Settings.profile.avatar.current")}
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("Settings.profile.avatar.upload")}
          </label>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isDisabled}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isDisabled}
              onClick={() => document.getElementById("avatar-upload")?.click()}
              className="w-fit"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Settings.profile.avatar.uploading")}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("Settings.profile.avatar.chooseFile")}
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("Settings.profile.avatar.fileDescription")}
            </span>
          </div>
        </div>

        {/* Predefined Avatars */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("Settings.profile.avatar.chooseFrom")}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {predefinedAvatars.map((avatarUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onAvatarChange(avatarUrl)}
                disabled={isDisabled}
                className={`relative group rounded-lg overflow-hidden transition-all hover:scale-105 ${
                  currentAvatarUrl === avatarUrl ? "ring-2 ring-primary" : ""
                } ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={avatarUrl}
                    alt={t("Settings.profile.avatar.alt", {
                      index: index + 1,
                    })}
                  />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                {currentAvatarUrl === avatarUrl && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("Settings.profile.avatar.customUrl")}
          </label>
          <div className="flex space-x-2">
            <Input
              placeholder={t("Settings.profile.avatar.placeholder")}
              value={customAvatarUrl}
              onChange={(e) => onCustomUrlChange(e.target.value)}
              disabled={isDisabled}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={!customAvatarUrl || isDisabled}
              onClick={onCustomUrlApply}
            >
              {t("Settings.profile.avatar.apply")}
            </Button>
            {customAvatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isDisabled}
                onClick={() => onCustomUrlChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}