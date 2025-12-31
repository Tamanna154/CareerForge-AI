import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Mic, MicOff, VideoOff, CheckCircle, AlertCircle } from "lucide-react";

interface MediaPermissionsProps {
  onPermissionsGranted: () => void;
}

export function MediaPermissions({ onPermissionsGranted }: MediaPermissionsProps) {
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const requestVideoPermission = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (stream) {
        videoStream.getAudioTracks().forEach(() => {
          const audioTrack = stream.getAudioTracks()[0];
          if (audioTrack) {
            videoStream.addTrack(audioTrack);
          }
        });
      }

      setStream(videoStream);
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
      setVideoEnabled(true);
      setVideoError(null);
    } catch (error) {
      setVideoError("Camera access denied. Please enable camera permissions.");
      setVideoEnabled(false);
    }
  };

  const requestAudioPermission = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (stream) {
        const audioTrack = audioStream.getAudioTracks()[0];
        stream.addTrack(audioTrack);
      } else {
        setStream(audioStream);
      }

      setAudioEnabled(true);
      setAudioError(null);
    } catch (error) {
      setAudioError("Microphone access denied. Please enable microphone permissions.");
      setAudioEnabled(false);
    }
  };

  const handleContinue = () => {
    if (videoEnabled && audioEnabled) {
      onPermissionsGranted();
    }
  };

  const handleSkip = () => {
    // Allow users to skip permissions (useful for coding rounds)
    onPermissionsGranted();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <Card variant="elevated" className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Setup Your Interview</CardTitle>
          <CardDescription className="text-base">
            Please enable your camera and microphone to start the AI interview session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            {videoEnabled ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
              </div>
            )}
            
            {/* Status Badges */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge variant={videoEnabled ? "success" : "secondary"}>
                {videoEnabled ? <Video className="w-3 h-3 mr-1" /> : <VideoOff className="w-3 h-3 mr-1" />}
                Video
              </Badge>
              <Badge variant={audioEnabled ? "success" : "secondary"}>
                {audioEnabled ? <Mic className="w-3 h-3 mr-1" /> : <MicOff className="w-3 h-3 mr-1" />}
                Audio
              </Badge>
            </div>
          </div>

          {/* Permission Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button 
                variant={videoEnabled ? "success" : "outline"}
                className="w-full"
                onClick={requestVideoPermission}
                disabled={videoEnabled}
              >
                {videoEnabled ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Camera Enabled
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Enable Camera
                  </>
                )}
              </Button>
              {videoError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {videoError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                variant={audioEnabled ? "success" : "outline"}
                className="w-full"
                onClick={requestAudioPermission}
                disabled={audioEnabled}
              >
                {audioEnabled ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Microphone Enabled
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Enable Microphone
                  </>
                )}
              </Button>
              {audioError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {audioError}
                </p>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={handleSkip}
            >
              Skip (Coding Only)
            </Button>
            <Button 
              variant="hero" 
              size="lg" 
              className="flex-1"
              disabled={!videoEnabled || !audioEnabled}
              onClick={handleContinue}
            >
              Continue to Interview
            </Button>
          </div>

          {/* Tips */}
          <div className="glass rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Tips for a Great Interview:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure good lighting on your face</li>
              <li>• Find a quiet environment with minimal background noise</li>
              <li>• Position yourself in the center of the frame</li>
              <li>• Test your audio by speaking a few words</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
