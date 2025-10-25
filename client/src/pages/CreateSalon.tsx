import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Building2, MapPin, Phone, Mail, FileText, Image, Upload, Video, Users, IdCard, Briefcase, Loader2 } from 'lucide-react';
import { salonService, authService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import MapLocationPicker from '../components/MapLocationPicker';
import { 
  getAllProvinces, 
  getDistrictsByProvince, 
  getSectorsByDistrict,
  findLocationFromCoordinates 
} from '../data/rwandaLocations';

interface FormState {
  name: string;
  address: string;
  province: string;
  district: string;
  sector: string;
  latitude: string;
  longitude: string;
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
}

const initialState: FormState = {
  name: '',
  address: '',
  province: '',
  district: '',
  sector: '',
  latitude: '-1.9403',
  longitude: '29.8739',
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
};

const CreateSalon: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);

  const createSalonMutation = useMutation({
    mutationFn: (payload: FormData) => salonService.createSalon(payload),
    onSuccess: async (response) => {
      toast.success('Salon created successfully and pending admin approval!');
      queryClient.invalidateQueries({ queryKey: ['owner-salon'] });

      try {
        const profileResponse = await authService.getProfile();
        setUser(profileResponse.data.user);
      } catch (error) {
        if (user) {
          setUser({ ...user, salonId: response.data?.salon?._id ?? user.salonId });
        }
      }

      navigate('/dashboard/owner');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create salon. Please try again.');
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'logo' | 'coverImages' | 'promotionalVideo' | 'gallery') => {
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
      const categories = prev.serviceCategories.includes(category)
        ? prev.serviceCategories.filter((c) => c !== category)
        : [...prev.serviceCategories, category];
      return { ...prev, serviceCategories: categories };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name || !formData.address || !formData.province || !formData.district || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in all required fields (name, address, province, district, location).');
      return;
    }

    if (!formData.ownerIdNumber || !formData.ownerContactPhone) {
      toast.error('Please provide owner information (ID number and contact phone).');
      return;
    }

    if (!formData.numberOfEmployees || Number(formData.numberOfEmployees) < 1) {
      toast.error('Please provide the number of employees (at least 1).');
      return;
    }

    if (formData.serviceCategories.length === 0) {
      toast.error('Please select at least one service category.');
      return;
    }

    if (formData.serviceCategories.includes('other') && !formData.customServices.trim()) {
      toast.error('Please specify your custom services when selecting "Other".');
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
    
    // Owner Information
    payload.append('ownerIdNumber', formData.ownerIdNumber);
    payload.append('ownerContactPhone', formData.ownerContactPhone);
    if (formData.ownerContactEmail) payload.append('ownerContactEmail', formData.ownerContactEmail);
    
    // Business Information
    payload.append('numberOfEmployees', formData.numberOfEmployees);
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

    createSalonMutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            &larr; Back
          </button>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Create Your Salon</h1>
          <p className="mt-2 text-slate-600">
            Provide your salon details to unlock your owner dashboard and start managing your business online.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white shadow-lg rounded-2xl border border-slate-200/70 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Salon Identity</h2>
                <p className="text-sm text-slate-500">Tell clients how to find and recognise your salon.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Salon name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="E.g. Glow & Grace Beauty Studio"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="province" className="block text-sm font-medium text-slate-700">
                  Province *
                </label>
                <select
                  id="province"
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleProvinceChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
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
                <label htmlFor="district" className="block text-sm font-medium text-slate-700">
                  District *
                </label>
                <select
                  id="district"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleDistrictChange}
                  disabled={!formData.province}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
                <label htmlFor="sector" className="block text-sm font-medium text-slate-700">
                  Sector (Optional)
                </label>
                <select
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
                <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                  Street Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="Street name, building number, and other details"
                />
              </div>
            </div>
          </section>

          <section className="bg-white shadow-lg rounded-2xl border border-slate-200/70 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mr-3">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Location on Map</h2>
                <p className="text-sm text-slate-500">Pin your exact location - address details will be auto-filled from the map!</p>
              </div>
            </div>

            <MapLocationPicker
              latitude={Number(formData.latitude)}
              longitude={Number(formData.longitude)}
              onLocationChange={handleLocationChange}
            />
          </section>

          <section className="bg-white shadow-lg rounded-2xl border border-slate-200/70 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3">
                <IdCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Owner Information</h2>
                <p className="text-sm text-slate-500">Provide your identification and contact details for verification.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="ownerIdNumber" className="block text-sm font-medium text-slate-700">
                  ID Number / Business Registration *
                </label>
                <input
                  id="ownerIdNumber"
                  name="ownerIdNumber"
                  type="text"
                  required
                  value={formData.ownerIdNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="National ID or business registration number"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="ownerContactPhone" className="block text-sm font-medium text-slate-700">
                  Owner Contact Phone *
                </label>
                <input
                  id="ownerContactPhone"
                  name="ownerContactPhone"
                  type="tel"
                  required
                  value={formData.ownerContactPhone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="E.g. +250 788 123 456"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label htmlFor="ownerContactEmail" className="block text-sm font-medium text-slate-700">
                  Owner Contact Email
                </label>
                <input
                  id="ownerContactEmail"
                  name="ownerContactEmail"
                  type="email"
                  value={formData.ownerContactEmail}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="owner@example.com"
                />
              </div>
            </div>
          </section>

          <section className="bg-white shadow-lg rounded-2xl border border-slate-200/70 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mr-3">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Business Information</h2>
                <p className="text-sm text-slate-500">Tell us about your team and services.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-slate-700">
                  Number of Employees *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
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
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                    placeholder="Total staff count including owner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Service Categories * (Select at least one)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'haircut', label: 'Haircut' },
                    { value: 'styling', label: 'Styling' },
                    { value: 'coloring', label: 'Coloring' },
                    { value: 'treatment', label: 'Treatment' },
                    { value: 'beard', label: 'Beard Care' },
                    { value: 'massage', label: 'Massage' },
                    { value: 'other', label: 'Other' },
                  ].map((category) => (
                    <label
                      key={category.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.serviceCategories.includes(category.value)
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
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
                  <label htmlFor="customServices" className="block text-sm font-medium text-slate-700">
                    Specify Your Custom Services *
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Please describe the additional services you offer (e.g., "Nail art, Makeup, Spa treatments")
                  </p>
                  <textarea
                    id="customServices"
                    name="customServices"
                    rows={3}
                    value={formData.customServices}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                    placeholder="E.g., Nail art, Makeup application, Spa treatments, Bridal packages..."
                  />
                </div>
              )}
            </div>
          </section>

          <section className="bg-white shadow-lg rounded-2xl border border-slate-200/70 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mr-3">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Salon Media</h2>
                <p className="text-sm text-slate-500">Upload photos and video to showcase your salon (optional).</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="logo" className="block text-sm font-medium text-slate-700">
                  Logo
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Choose logo</span>
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
                <label htmlFor="coverImages" className="block text-sm font-medium text-slate-700">
                  Cover Images (up to 10)
                </label>
                <p className="text-xs text-slate-500 mb-2">Upload multiple images to showcase your salon's ambiance and style</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Choose cover images</span>
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
                    <span className="text-sm text-green-600">✓ {formData.coverImages.length} image(s) selected</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="promotionalVideo" className="block text-sm font-medium text-slate-700">
                  Promotional Video (Optional)
                </label>
                <p className="text-xs text-slate-500 mb-2">Upload a short video showcasing your salon (max 50MB)</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <Video className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Choose video</span>
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
                <label htmlFor="gallery" className="block text-sm font-medium text-slate-700">
                  Gallery Images (up to 5)
                </label>
                <p className="text-xs text-slate-500 mb-2">Additional images of your work, services, or team</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Choose images</span>
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
                    <span className="text-sm text-green-600">✓ {formData.gallery.length} image(s) selected</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white shadow-lg rounded-2xl border border-slate-200/70 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">About the Salon</h2>
                <p className="text-sm text-slate-500">Share what makes your salon unique.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                placeholder="Highlight your services, ambiance, or specialties"
              />
            </div>
          </section>

          <section className="bg-white shadow-lg rounded-2xl border border-slate-200/70 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mr-3">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Contact Information</h2>
                <p className="text-sm text-slate-500">Make it easy for clients to reach out.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                  placeholder="E.g. +250 788 123 456"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring focus:ring-blue-100"
                    placeholder="owner@salon.com"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={createSalonMutation.isPending}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span>Creating salon...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Create salon</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSalon;