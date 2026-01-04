"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ExternalLink } from "lucide-react";
import { useCallback, useState } from "react";
import { developmentLogger } from "@/lib/logger";

interface VideoTutorialProps {
  stepTitle: string;
  videoUrl?: string;
}

export function VideoTutorial({ stepTitle, videoUrl }: VideoTutorialProps) {
  const [showVideo, setShowVideo] = useState(false);

  const handlePlayVideo = useCallback(() => {
    if (videoUrl) {
      developmentLogger.debug(
        "Play video tutorial:",
        stepTitle,
        "URL:",
        videoUrl
      );
      setShowVideo(true);
    } else {
      developmentLogger.debug("Video not ready for:", stepTitle);
    }
  }, [stepTitle, videoUrl]);

  const handleWatchExternal = useCallback(() => {
    if (videoUrl) {
      developmentLogger.debug("Open external video:", videoUrl);
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    }
  }, [videoUrl]);

  // Video component placeholder
  if (showVideo && videoUrl) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">📹 Video Tutorial</h3>
        <Card className="bg-linear-to-br from-muted/50 to-muted w-full">
          <CardContent className="p-6 space-y-4">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-white text-center space-y-2">
                <Play className="h-12 w-12 mx-auto" />
                <p>Video Player Component</p>
                <p className="text-sm opacity-75">External: {videoUrl}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleWatchExternal}
                  className="mt-2"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
            <div className="text-center">
              <Button variant="outline" onClick={() => setShowVideo(false)}>
                Close Video
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">📹 Video Tutorial</h3>
      <Card className="bg-linear-to-br from-muted/50 to-muted w-full">
        <CardContent className="p-8 text-center space-y-4">
          {videoUrl ? (
            <>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-24 h-24"
                onClick={handlePlayVideo}
                aria-label={`Play video tutorial for ${stepTitle}`}
              >
                <Play className="h-12 w-12 text-white" />
              </Button>
              <div className="space-y-2">
                <h4 className="font-semibold">
                  Step-by-Step Guide: {stepTitle}
                </h4>
                <p className="text-muted-foreground">
                  Watch our detailed tutorial to complete this step
                </p>
              </div>
              <div className="space-y-2">
                <Button variant="destructive" onClick={handlePlayVideo}>
                  ▶ Watch Video Tutorial
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWatchExternal}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch in New Tab
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full w-24 h-24 bg-gray-300 mx-auto flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-500" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">
                  Step-by-Step Guide: {stepTitle}
                </h4>
                <p className="text-muted-foreground">
                  Video tutorial coming soon
                </p>
              </div>
              <Button variant="outline" disabled className="w-full">
                📹 Video Not Ready Yet
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
