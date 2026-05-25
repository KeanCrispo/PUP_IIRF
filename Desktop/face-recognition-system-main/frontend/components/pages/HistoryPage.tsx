import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import backend from '~backend/client';

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch detections
  const { data: detectionsData, isLoading } = useQuery({
    queryKey: ['detections'],
    queryFn: () => backend.face_recognition.getDetections({ limit: 100 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const filteredDetections = detectionsData?.detections.filter((detection: any) => {
    const matchesSearch = detection.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && detection.type.toLowerCase() === filter;
  }) || [];

  const totalPages = Math.ceil(filteredDetections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDetections = filteredDetections.slice(startIndex, startIndex + itemsPerPage);

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleExport = () => {
    // Simple CSV export
    const csvData = filteredDetections.map((detection: any) => ({
      Name: detection.name,
      Type: detection.type,
      DateTime: formatDateTime(detection.timestamp)
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row: any) => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'face-recognition-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="known">Known</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExport} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export to CSV</span>
        </Button>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detection History</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedDetections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No detections found
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Image</th>
                      <th className="text-left py-3 px-4">Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDetections.map((detection: any) => (
                      <tr key={detection.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{detection.name}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={detection.type === 'Known' ? 'default' : 'destructive'}
                            className={
                              detection.type === 'Known' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {detection.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {detection.image && (
                            <img
                              src={detection.image}
                              alt={detection.name}
                              className="w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => {
                                // Open image in modal (could be implemented)
                                window.open(detection.image, '_blank');
                              }}
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDateTime(detection.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}