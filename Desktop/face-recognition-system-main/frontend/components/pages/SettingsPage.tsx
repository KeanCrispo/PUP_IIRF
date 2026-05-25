import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Settings, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SettingsPageProps {
  currentUser: string;
}

export default function SettingsPage({ currentUser }: SettingsPageProps) {
  const [adminName, setAdminName] = useState(currentUser);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [autoDelete, setAutoDelete] = useState('never');
  const { toast } = useToast();

  const handleSaveSettings = () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Save settings (in a real app, this would be sent to the backend)
    localStorage.setItem('autoDeleteSetting', autoDelete);
    
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });

    // Clear password fields
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Admin Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Admin Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminName">Admin Name</Label>
            <Input
              id="adminName"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Enter admin name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="autoDelete">Auto-delete History & Notifications</Label>
            <Select value={autoDelete} onValueChange={setAutoDelete}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="week">After 1 Week</SelectItem>
                <SelectItem value="month">After 1 Month</SelectItem>
                <SelectItem value="3months">After 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Database Status</span>
            <span className="text-green-600 font-medium">Connected</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Last Backup</span>
            <span className="font-medium">Never</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Storage Used</span>
            <span className="font-medium">245 MB</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSaveSettings} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Settings
      </Button>
    </div>
  );
}