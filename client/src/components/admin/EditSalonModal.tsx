import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Image, 
  Upload, 
  Video,
  X
} from 'lucide-react';
import { superAdminService } from '../../services/api';
import MapLocationPicker from '../MapLocationPicker';
import {
  getAllProvinces,
  getDistrictsByProvince,
  getSectorsByDistrict,
  findLocationFromCoordinates
} from '../../data/rwandaLocations';

interface EditSalonModalProps {
  salon: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditSalonModal: React.FC<EditSalonModalProps> = ({ 
  salon, 
  isOpen, 
  onClose,
  onUpdate
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);

  // Initialize form data when salon changes
  useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name || '',
        address: salon.address || '',
        province: salon.province || '',
        district: salon.district || '',
        sector: salon.sector || '',
        latitude: salon.latitude ? salon.latitude.toString() : '-1.9403',
        longitude: salon.longitude ? salon.longitude.toString() : '29.8739',
        phone: salon.phone || '',
        email: salon.email || '',
        description: salon.description || '',
        // Media will be handled separately
      });
      
      // Set available districts and sectors based on current values
      if (salon.province) {
        const districts = getDistrictsByProvince(salon.province);
        setAvailableDistricts(districts);
        if (salon.district) {
          const sectors = getSectorsByDistrict(salon.district);
          setAvailableSectors(sectors);
        }
      }
    }
  }, [salon]);

  const updateSalonMutation = useMutation({
    mutationFn: ({ salonId, salonData }: { salonId: string; salonData: any }) => 
      superAdminService.updateSalon(salonId, salonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      toast.success('Salon updated successfully');
      onUpdate();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update salon');
    },
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous: any) => ({ ...previous, [name]: value }));
  };

  const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const province = event.target.value;
    const districts = getDistrictsByProvince(province);
    setAvailableDistricts(districts);
    setAvailableSectors([]);
    setFormData((prev: any) => ({
      ...prev,
      province,
      district: '',
      sector: ''
    }));
  };

  const handleDistrictChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const district = event.target.value;
    const sectors = getSectorsByDistrict(district);
    setAvailableSectors(sectors);
    setFormData((prev: any) => ({
      ...prev,
      district,
      sector: ''
    }));
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setFormData((prev: any) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));

    // Auto-fill location data from coordinates
    try {
      const locationData = await findLocationFromCoordinates(lat, lng);
      if (locationData) {
        const updates: any = {};
        
        if (locationData.province) {
          updates.province = locationData.province;
          const districts = getDistrictsByProvince(locationData.province);
          setAvailableDistricts(districts);
        }
        
        if (locationData.district) {
          updates.district = locationData.district;
          const sectors = getSectorsByDistrict(locationData.district);
          setAvailableSectors(sectors);
        }
        
        if (locationData.sector) {
          updates.sector = locationData.sector;
        }
        
        if (locationData.address) {
          updates.address = locationData.address;
        }
        
        setFormData((prev: any) => ({ ...prev, ...updates }));
        toast.success('Location details auto-filled from map!');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!formData.name || !formData.address || !formData.province || !formData.district) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      toast.error('Latitude and longitude must be valid numbers.');
      return;
    }

    const payload = {
      name: formData.name,
      address: formData.address,
      province: formData.province,
      district: formData.district,
      sector: formData.sector,
      latitude,
      longitude,
      phone: formData.phone,
      email: formData.email,
      description: formData.description,
    };

    updateSalonMutation.mutate({ 
      salonId: salon._id, 
      salonData: payload 
    });
  };

  if (!isOpen || !salon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Edit Salon</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                <p className="text-sm text-gray-500">Update salon details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Salon Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="Enter salon name"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  Province *
                </label>
                <select
                  id="province"
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleProvinceChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                >
                  <option value="">Select province</option>
                  {getAllProvinces().map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                  District *
                </label>
                <select
                  id="district"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleDistrictChange}
                  disabled={!formData.province}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select district</option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                  Sector (Optional)
                </label>
                <select
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select sector</option>
                  {availableSectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="Enter street address"
                />
              </div>
            </div>
          </section>

          {/* Location on Map */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mr-3">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Location on Map</h3>
                <p className="text-sm text-gray-500">Update the salon location on the map</p>
              </div>
            </div>

            <MapLocationPicker
              latitude={Number(formData.latitude)}
              longitude={Number(formData.longitude)}
              onLocationChange={handleLocationChange}
            />
          </section>

          {/* Contact Information */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mr-3">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
                <p className="text-sm text-gray-500">Update salon contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setFormData((prev: any) => ({ ...prev, phone: value }));
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="788 123 456"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 9-digit Rwandan phone number (e.g., 788123456)</p>
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                    placeholder="salon@example.com"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Description</h3>
                <p className="text-sm text-gray-500">Update salon description</p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                placeholder="Describe the salon, its specialties, and what makes it unique..."
              />
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={updateSalonMutation.isPending}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateSalonMutation.isPending}
              className={`inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 min-w-[140px] ${
                updateSalonMutation.isPending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
              } text-white disabled:opacity-70`}
            >
              {updateSalonMutation.isPending ? 'Updating...' : 'Update Salon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalonModal;