import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, Video, VideoOff, Maximize, Minimize } from 'lucide-react';
import { useState } from 'react';
import backend from '~backend/client';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => backend.face_recognition.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleFullscreen = () => {
    const videoContainer = document.getElementById('videoContainer');
    if (!videoContainer) return;

    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleCameraToggle = async () => {
    try {
      if (cameraActive) {
        // Stop camera
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        await backend.face_recognition.stopCamera();
        setCameraActive(false);
        toast({
          title: "Camera stopped",
          description: "Camera has been turned off",
        });
      } else {
        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          } 
        });
        setCameraStream(stream);
        
        const video = document.getElementById('cameraFeed') as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
        }
        
        await backend.face_recognition.startCamera();
        setCameraActive(true);
        toast({
          title: "Camera started",
          description: "Camera is now active",
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalMembers || 0}
                </p>
                <p className="text-gray-600">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.knownToday || 0}
                </p>
                <p className="text-gray-600">Known Detected Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <UserX className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.unknownToday || 0}
                </p>
                <p className="text-gray-600">Unknown Detected Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Camera Feed</CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={handleCameraToggle}
                variant={cameraActive ? "destructive" : "default"}
                className="flex items-center space-x-2"
              >
                {cameraActive ? (
                  <>
                    <VideoOff className="h-4 w-4" />
                    <span>Turn Off</span>
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    <span>Turn On</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleFullscreen}
                disabled={!cameraActive}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div id="videoContainer" className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
            {cameraActive ? (
              <video
                id="cameraFeed"
                className="w-full h-full object-cover"
                autoPlay
                muted
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <VideoOff className="h-16 w-16 mx-auto mb-4" />
                  <p>Camera is OFF</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}