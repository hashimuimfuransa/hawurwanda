import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Trash2, 
  X,
  AlertTriangle
} from 'lucide-react';
import { superAdminService } from '../../services/api';

interface DeleteSalonModalProps {
  salon: any;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteSalonModal: React.FC<DeleteSalonModalProps> = ({ 
  salon, 
  isOpen, 
  onClose,
  onDeleted
}) => {
  const queryClient = useQueryClient();

  const deleteSalonMutation = useMutation({
    mutationFn: (salonId: string) => superAdminService.deleteSalon(salonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      toast.success('Salon deleted successfully');
      onDeleted();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete salon');
    },
  });

  const handleDelete = () => {
    if (salon && salon._id) {
      deleteSalonMutation.mutate(salon._id);
    }
  };

  if (!isOpen || !salon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Delete Salon</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete "{salon.name}"?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this salon? This action cannot be undone. 
              All associated data including bookings, staff, and services will be permanently removed.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">This action is irreversible</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteSalonMutation.isPending}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteSalonMutation.isPending}
              className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center ${
                deleteSalonMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {deleteSalonMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Salon
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSalonModal;
