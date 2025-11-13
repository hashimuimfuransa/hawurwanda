import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Building2, MapPin, Phone, Mail, FileText, Image, Upload, Video, Users, IdCard, Briefcase, Loader2, User, Camera } from 'lucide-react';
import { adminService, userService } from '../../services/api';
import MapLocationPicker from '../MapLocationPicker';
import {
  getAllProvinces,
  getDistrictsByProvince,
  getSectorsByDistrict,
  findLocationFromCoordinates
} from '../../data/rwandaLocations';
import { useTranslation } from '../../stores/translations';

interface FormState {
  name: string;
  address: string;
  province: string;
  district: string;
  sector: string;
  latitude: string;
  longitude: string;
  ownerId: string;
  // Owner Information
  ownerIdNumber: string;
  ownerContactPhone: string;
  ownerContactEmail: string;
  // Business Information
  numberOfEmployees: string;
  serviceCategories: string[];
  customServices: string; // Custom services when "Other" is selected
  description: string;
  phone: string;
  email: string;
  logo: File | null;
  coverImages: File[]; // Multiple cover images
  promotionalVideo: File | null; // Optional video
  gallery: File[];
  ownerProfilePicture: File | null; // Owner profile picture
  verified: boolean; // Admin can choose to auto-verify
}

const initialState: FormState = {
  name: '',
  address: '',
  province: '',
  district: '',
  sector: '',
  latitude: '-1.9403',
  longitude: '29.8739',
  ownerId: '',
  // Owner Information
  ownerIdNumber: '',
  ownerContactPhone: '',
  ownerContactEmail: '',
  // Business Information
  numberOfEmployees: '',
  serviceCategories: [],
  customServices: '',
  description: '',
  phone: '',
  email: '',
  logo: null,
  coverImages: [],
  promotionalVideo: null,
  gallery: [],
  ownerProfilePicture: null,
  verified: false,
};

interface AdminCreateSalonProps {
  onClose: () => void;
}

const AdminCreateSalon: React.FC<AdminCreateSalonProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const t = useTranslation();

  // Fetch owners for selection
  const { data: ownersData } = useQuery({
    queryKey: ['admin-owners'],
    queryFn: () => userService.getUsers({ role: 'owner' }),
  });

  const owners = ownersData?.data?.users || [];

  const createSalonMutation = useMutation({
    mutationFn: (payload: FormData) => adminService.createSalon(payload),
    onSuccess: () => {
      toast.success('Salon created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create salon');
    },
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const province = event.target.value;
    const districts = getDistrictsByProvince(province);
    setAvailableDistricts(districts);
    setAvailableSectors([]);
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      district,
      sector: ''
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof Pick<FormState, 'logo' | 'coverImages' | 'promotionalVideo' | 'gallery' | 'ownerProfilePicture'>) => {
    const files = event.target.files;
    if (!files) return;

    if (fieldName === 'gallery') {
      const fileArray = Array.from(files).slice(0, 5);
      setFormData((prev) => ({ ...prev, gallery: fileArray }));
    } else if (fieldName === 'coverImages') {
      const fileArray = Array.from(files).slice(0, 10); // Up to 10 cover images
      setFormData((prev) => ({ ...prev, coverImages: fileArray }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldName]: files[0] }));
    }
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));

    // Auto-fill location data from Google Maps
    try {
      const locationData = await findLocationFromCoordinates(lat, lng);
      if (locationData) {
        const updates: Partial<FormState> = {};
        
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
        
        setFormData((prev) => ({ ...prev, ...updates }));
        toast.success('Location details auto-filled from map!');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      // Silently fail - user can still fill manually
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => {
      // Special handling for "other" category
      if (category === 'other' && !prev.serviceCategories.includes('other')) {
        // If selecting "other", we need to make sure customServices is provided later
        return { ...prev, serviceCategories: [...prev.serviceCategories, category] };
      } else if (category === 'other' && prev.serviceCategories.includes('other')) {
        // If unselecting "other", clear customServices
        return { ...prev, serviceCategories: prev.serviceCategories.filter((c) => c !== category), customServices: '' };
      } else {
        return { ...prev, serviceCategories: prev.serviceCategories.includes(category)
          ? prev.serviceCategories.filter((c) => c !== category)
          : [...prev.serviceCategories, category] };
      }
    });
  };

  const handleOwnerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const ownerId = event.target.value;
    const selectedOwner = owners.find((owner: any) => owner._id === ownerId);

    setFormData((prev) => ({
      ...prev,
      ownerId,
      ownerContactPhone: selectedOwner?.phone || '',
      ownerContactEmail: selectedOwner?.email || '',
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name || !formData.address || !formData.province || !formData.district || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in all required fields (name, address, province, district, location).');
      return;
    }

    if (!formData.ownerId) {
      toast.error('Please select a salon owner.');
      return;
    }

    if (!formData.ownerIdNumber || !formData.ownerContactPhone) {
      toast.error('Please provide owner information (ID number and contact phone).');
      return;
    }

    if (!formData.numberOfEmployees || Number(formData.numberOfEmployees) < 1) {
      toast.error('Please provide the number of employees (must be at least 1).');
      return;
    }

    if (formData.serviceCategories.length === 0) {
      toast.error('Please select at least one service category.');
      return;
    }

    if (formData.serviceCategories.includes('other') && !formData.customServices.trim()) {
      toast.error('Please specify custom services when "Other" category is selected.');
      return;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      toast.error('Latitude and longitude must be valid numbers.');
      return;
    }

    // Create FormData for multipart upload
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('address', formData.address);
    payload.append('province', formData.province);
    payload.append('district', formData.district);
    if (formData.sector) payload.append('sector', formData.sector);
    payload.append('latitude', latitude.toString());
    payload.append('longitude', longitude.toString());

    payload.append('ownerId', formData.ownerId);

    // Owner Information
    payload.append('ownerIdNumber', formData.ownerIdNumber);
    payload.append('ownerContactPhone', formData.ownerContactPhone);
    if (formData.ownerContactEmail) payload.append('ownerContactEmail', formData.ownerContactEmail);

    // Business Information
    payload.append('numberOfEmployees', formData.numberOfEmployees);
    // Send service categories as a comma-separated string
    payload.append('serviceCategories', formData.serviceCategories.join(','));
    if (formData.customServices) payload.append('customServices', formData.customServices);

    if (formData.description) payload.append('description', formData.description);
    if (formData.phone) payload.append('phone', formData.phone);
    if (formData.email) payload.append('email', formData.email);
    if (formData.logo) payload.append('logo', formData.logo);

    // Append multiple cover images
    formData.coverImages.forEach((file) => {
      payload.append('coverImages', file);
    });

    // Append promotional video (optional)
    if (formData.promotionalVideo) payload.append('promotionalVideo', formData.promotionalVideo);

    // Append gallery images
    formData.gallery.forEach((file) => {
      payload.append('gallery', file);
    });

    // Append owner profile picture
    if (formData.ownerProfilePicture) payload.append('ownerProfilePicture', formData.ownerProfilePicture);

    // Append verification status
    payload.append('verified', formData.verified.toString());

    createSalonMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create Salon for Owner</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Owner Selection */}
          <section className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Select Salon Owner</h3>
                <p className="text-sm text-gray-500">Choose an owner to assign to this salon</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700">
                  Salon Owner *
                </label>
                <select
                  id="ownerId"
                  name="ownerId"
                  required
                  value={formData.ownerId}
                  onChange={handleOwnerChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                >
                  <option value="">Select an owner</option>
                  {owners.map((owner: any) => (
                    <option key={owner._id} value={owner._id}>
                      {owner.name} - {owner.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Owner Profile Picture */}
              <div className="space-y-2">
                <label htmlFor="ownerProfilePicture" className="block text-sm font-medium text-gray-700">
                  Owner Profile Picture
                </label>
                <p className="text-xs text-gray-500 mb-2">Upload the owner's profile picture</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <Camera className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Choose Profile Picture</span>
                    <input
                      id="ownerProfilePicture"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'ownerProfilePicture')}
                      className="hidden"
                    />
                  </label>
                  {formData.ownerProfilePicture && (
                    <span className="text-sm text-green-600">✓ {formData.ownerProfilePicture.name}</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Salon Identity */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Salon Identity</h3>
                <p className="text-sm text-gray-500">Basic information about the salon</p>
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
                <p className="text-sm text-gray-500">Select the salon location on the map</p>
              </div>
            </div>

            <MapLocationPicker
              latitude={Number(formData.latitude)}
              longitude={Number(formData.longitude)}
              onLocationChange={handleLocationChange}
            />
          </section>

          {/* Owner Information */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3">
                <IdCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Owner Information</h3>
                <p className="text-sm text-gray-500">Owner's identification and contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="ownerIdNumber" className="block text-sm font-medium text-gray-700">
                  Owner ID Number *
                </label>
                <input
                  id="ownerIdNumber"
                  name="ownerIdNumber"
                  type="text"
                  required
                  value={formData.ownerIdNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="Enter owner's national ID number"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="ownerContactPhone" className="block text-sm font-medium text-gray-700">
                  Owner Contact Phone *
                </label>
                <input
                  id="ownerContactPhone"
                  name="ownerContactPhone"
                  type="tel"
                  required
                  value={formData.ownerContactPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setFormData(prev => ({ ...prev, ownerContactPhone: value }));
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="788 123 456"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 9-digit Rwandan phone number (e.g., 788123456)</p>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label htmlFor="ownerContactEmail" className="block text-sm font-medium text-gray-700">
                  Owner Contact Email
                </label>
                <input
                  id="ownerContactEmail"
                  name="ownerContactEmail"
                  type="email"
                  value={formData.ownerContactEmail}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="Enter owner's email address"
                />
              </div>
            </div>
          </section>

          {/* Business Information */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mr-3">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Business Information</h3>
                <p className="text-sm text-gray-500">Business details and service categories</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700">
                  Number of Employees *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Users className="h-4 w-4" />
                  </span>
                  <input
                    id="numberOfEmployees"
                    name="numberOfEmployees"
                    type="number"
                    min="1"
                    required
                    value={formData.numberOfEmployees}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                    placeholder="Enter number of employees"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Service Categories *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'haircut', label: 'Haircut' },
                    { value: 'styling', label: 'Styling' },
                    { value: 'coloring', label: 'Coloring' },
                    { value: 'treatment', label: 'Treatment' },
                    { value: 'beard', label: 'Beard Care' },
                    { value: 'massage', label: 'Massage' },
                    { value: 'other', label: 'Other Services' },
                  ].map((category) => (
                    <label
                      key={category.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.serviceCategories.includes(category.value)
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.serviceCategories.includes(category.value)}
                        onChange={() => handleCategoryChange(category.value)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.serviceCategories.includes('other') && (
                <div className="space-y-1 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label htmlFor="customServices" className="block text-sm font-medium text-gray-700">
                    Specify Custom Services *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Describe the custom services offered by this salon
                  </p>
                  <textarea
                    id="customServices"
                    name="customServices"
                    rows={3}
                    value={formData.customServices}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                    placeholder="List custom services offered"
                    required
                  />
                </div>
              )}
            </div>
          </section>

          {/* Salon Media */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mr-3">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Salon Media</h3>
                <p className="text-sm text-gray-500">Upload salon images and promotional content</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                  Logo
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Choose Logo</span>
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                  {formData.logo && (
                    <span className="text-sm text-green-600">✓ {formData.logo.name}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="coverImages" className="block text-sm font-medium text-gray-700">
                  Cover Images
                </label>
                <p className="text-xs text-gray-500 mb-2">Upload up to 10 cover images for the salon</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Choose Cover Images</span>
                    <input
                      id="coverImages"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'coverImages')}
                      className="hidden"
                    />
                  </label>
                  {formData.coverImages.length > 0 && (
                    <span className="text-sm text-green-600">✓ {formData.coverImages.length} images selected</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="promotionalVideo" className="block text-sm font-medium text-gray-700">
                  Promotional Video (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">Upload a promotional video for the salon (optional)</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <Video className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Choose Video</span>
                    <input
                      id="promotionalVideo"
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'promotionalVideo')}
                      className="hidden"
                    />
                  </label>
                  {formData.promotionalVideo && (
                    <span className="text-sm text-green-600">✓ {formData.promotionalVideo.name}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="gallery" className="block text-sm font-medium text-gray-700">
                  Gallery Images
                </label>
                <p className="text-xs text-gray-500 mb-2">Upload gallery images for the salon</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Choose Images</span>
                    <input
                      id="gallery"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'gallery')}
                      className="hidden"
                    />
                  </label>
                  {formData.gallery.length > 0 && (
                    <span className="text-sm text-green-600">✓ {formData.gallery.length} images selected</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* About the Salon */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">About the Salon</h3>
                <p className="text-sm text-gray-500">Describe the salon and its services</p>
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
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mr-3">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
                <p className="text-sm text-gray-500">Salon contact details</p>
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
                      setFormData(prev => ({ ...prev, phone: value }));
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
            </div>
          </section>

          {/* Verification Option */}
          <section className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mr-3">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Verification Status</h3>
                <p className="text-sm text-gray-500">Set the verification status for this salon</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="verified"
                name="verified"
                type="checkbox"
                checked={formData.verified}
                onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                Auto-verify this salon
              </label>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={createSalonMutation.isPending}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSalonMutation.isPending}
              className={`inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-200 min-w-[140px] ${
                createSalonMutation.isPending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
              } text-white disabled:opacity-70`}
            >
              {createSalonMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Salon...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Create Salon</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateSalon;