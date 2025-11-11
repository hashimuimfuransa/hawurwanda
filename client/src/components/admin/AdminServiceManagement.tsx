import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '../../services/api';

interface Service {
  _id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  targetAudience: string[];
  isActive: boolean;
}

interface AdminServiceManagementProps {
  salonId: string;
  services: Service[];
  onClose: () => void;
}

const serviceCategories = [
  { value: 'hair', label: 'Hair' },
  { value: 'nails', label: 'Nails' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'massage', label: 'Massage' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'other', label: 'Other' },
];

const targetAudiences = [
  { value: 'children', label: 'Children (0-12)' },
  { value: 'teens', label: 'Teens (13-17)' },
  { value: 'adults', label: 'Adults' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
];

const AdminServiceManagement: React.FC<AdminServiceManagementProps> = ({ 
  salonId, 
  services = [],
  onClose 
}) => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    price: 1000,
    category: 'haircut',
    targetAudience: ['adults'],
    isActive: true,
  });

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: (serviceData: any) => adminService.addServiceToSalon(salonId, serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-details', salonId] });
      toast.success('Service added successfully');
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Add service error:', error);
      toast.error(error.response?.data?.message || 'Failed to add service');
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ serviceId, serviceData }: { serviceId: string; serviceData: any }) => 
      adminService.updateSalonService(salonId, serviceId, serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-details', salonId] });
      toast.success('Service updated successfully');
      setEditingService(null);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Update service error:', error);
      toast.error(error.response?.data?.message || 'Failed to update service');
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => adminService.deleteSalonService(salonId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-details', salonId] });
      toast.success('Service deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete service error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete service');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      durationMinutes: 30,
      price: 1000,
      category: 'haircut',
      targetAudience: ['adults'],
      isActive: true,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationMinutes' || name === 'price' ? Number(value) : value
    }));
  };

  const handleTargetAudienceChange = (audience: string) => {
    setFormData(prev => {
      const targetAudience = prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience];
      return { ...prev, targetAudience };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Service title is required');
      return;
    }
    
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0 RWF');
      return;
    }
    
    if (formData.durationMinutes < 5) {
      toast.error('Duration must be at least 5 minutes');
      return;
    }

    // Log the data being sent for debugging
    console.log('Submitting service data:', formData);

    // Ensure all required fields are present
    const serviceData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      durationMinutes: Number(formData.durationMinutes),
      price: Number(formData.price),
      category: formData.category,
      targetAudience: Array.isArray(formData.targetAudience) ? formData.targetAudience : ['adults'],
      isActive: Boolean(formData.isActive),
    };

    if (editingService) {
      updateServiceMutation.mutate({
        serviceId: editingService._id,
        serviceData
      });
    } else {
      addServiceMutation.mutate(serviceData);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || '',
      durationMinutes: service.durationMinutes,
      price: service.price,
      category: service.category || 'haircut', // Added default value
      targetAudience: service.targetAudience || ['adults'],
      isActive: service.isActive !== undefined ? service.isActive : true,
    });
    setShowAddForm(true);
  };

  const handleDelete = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-indigo-50/30 px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Manage Salon Services</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-600">Add, edit, or remove services for this salon</p>
            <button
              onClick={() => {
                setEditingService(null);
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </button>
          </div>

          {/* Service Form */}
          {showAddForm && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Service Name*</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Men's Haircut"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Price (RWF)*</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="1000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Duration (minutes)*</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {serviceCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe the service..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Target Audience</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {targetAudiences.map((audience) => (
                      <label
                        key={audience.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          formData.targetAudience.includes(audience.value)
                            ? 'bg-purple-50 border-purple-500 text-purple-700'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetAudience.includes(audience.value)}
                          onChange={() => handleTargetAudienceChange(audience.value)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium">{audience.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    Service is Active
                  </label>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingService(null);
                    }}
                    className="px-4 py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addServiceMutation.isPending || updateServiceMutation.isPending}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 transition-all"
                  >
                    {addServiceMutation.isPending || updateServiceMutation.isPending
                      ? 'Saving...'
                      : editingService ? 'Update Service' : 'Add Service'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Services List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Current Services ({services.length})
            </h3>
            
            {services.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500">No services added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div 
                    key={service._id} 
                    className="bg-white rounded-xl border border-slate-200/60 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">{service.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            service.isActive 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {service.description || 'No description'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-sm">
                            <span className="font-bold text-slate-900">{service.price} RWF</span>
                            <span className="text-slate-500 mx-2">•</span>
                            <span className="text-slate-600">{service.durationMinutes} min</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                              {service.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-3">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit service"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          disabled={deleteServiceMutation.isPending}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminServiceManagement;