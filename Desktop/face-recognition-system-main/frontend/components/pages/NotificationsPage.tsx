import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Bell } from 'lucide-react';
import backend from '~backend/client';

export default function NotificationsPage() {
  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => backend.face_recognition.getNotifications({ limit: 50 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const notifications = notificationsData?.notifications || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Recent Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-full ${
                    notification.type === 'known' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {notification.type === 'known' ? (
                      <UserCheck className="h-5 w-5" />
                    ) : (
                      <UserX className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">
                      {notification.message}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDateTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}