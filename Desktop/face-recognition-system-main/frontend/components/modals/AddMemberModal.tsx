import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Camera, User, X } from 'lucide-react';
import backend from '~backend/client';
import { useToast } from '@/components/ui/use-toast';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ open, onClose }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [faceImages, setFaceImages] = useState<string[]>([]);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  const faceImagesUploadRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (memberData: {
      id: string;
      name: string;
      profileImage: string;
      faceImages: string[];
    }) => backend.face_recognition.addMember(memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      handleClose();
      toast({
        title: "Success",
        description: "Member added successfully",
      });
    },
    onError: (error) => {
      console.error('Add member error:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setName('');
    setProfileImage('');
    setFaceImages([]);
    onClose();
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaceImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaceImages(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFaceImage = (index: number) => {
    setFaceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter member name",
        variant: "destructive",
      });
      return;
    }

    if (!profileImage) {
      toast({
        title: "Error",
        description: "Please add a profile image",
        variant: "destructive",
      });
      return;
    }

    if (faceImages.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one face image",
        variant: "destructive",
      });
      return;
    }

    const memberData = {
      id: Date.now().toString(),
      name: name.trim(),
      profileImage,
      faceImages
    };

    addMemberMutation.mutate(memberData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter member name"
              required
            />
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => profileUploadRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </div>
            </div>
            <input
              ref={profileUploadRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
          </div>

          {/* Face Images */}
          <div className="space-y-2">
            <Label>Face Images (Multiple)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
              {faceImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {faceImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Face ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                        onClick={() => removeFaceImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => faceImagesUploadRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Multiple
                </Button>
              </div>
            </div>
            <input
              ref={faceImagesUploadRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFaceImagesUpload}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}