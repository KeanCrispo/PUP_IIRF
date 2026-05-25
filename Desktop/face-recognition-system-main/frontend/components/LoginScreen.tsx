import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, User, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminName || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simple validation - in production this would be server-side
    if (password === 'admin') {
      onLogin(adminName);
      toast({
        title: "Success",
        description: "Login successful!",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials. Use 'admin' as password.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">FaceGuard</CardTitle>
          <CardDescription className="text-gray-600">
            Multi-Face Recognition System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  type="text"
                  placeholder="Admin Name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}