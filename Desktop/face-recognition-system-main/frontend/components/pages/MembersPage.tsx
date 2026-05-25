import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, Edit, Trash2, User } from 'lucide-react';
import backend from '~backend/client';
import { useToast } from '@/components/ui/use-toast';
import AddMemberModal from '../modals/AddMemberModal';

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch members
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => backend.face_recognition.getMembers(),
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => backend.face_recognition.deleteMember({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete member error:', error);
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
    },
  });

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMemberMutation.mutate(id);
    }
  };

  const filteredMembers = membersData?.members.filter((member: any) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Member</span>
        </Button>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No members found</h3>
            <p className="text-gray-500 text-center">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first member to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member: any) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-white" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-4">{member.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    disabled={deleteMemberMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}