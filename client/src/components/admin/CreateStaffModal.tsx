import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Lock, Building2, Scissors, Calendar, IdCard, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateStaffModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (staffData: FormData) => void;
  salons: any[];
  isPending: boolean;
}

const CreateStaffModal: React.FC<CreateStaffModalProps> = ({ 
  showModal, 
  onClose, 
  onSubmit, 
  salons,
  isPending
}) => {
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    salonId: '',
    staffCategory: 'barber',
    gender: '',
    specialties: [] as string[],
    experience: '',
    educationLevel: '',
    birthYearRange: '',
    bio: '',
    credentials: [] as string[],
    profilePhoto: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!staffFormData.name || !staffFormData.phone || !staffFormData.password) {
      toast.error('Name, phone, and password are required');
      return;
    }
    
    // Validate phone number (9 digits for Rwanda)
    if (staffFormData.phone.replace(/\D/g, '').length !== 9) {
      toast.error('Phone number must be exactly 9 digits');
      return;
    }

    // Create FormData object
    const formData = new FormData();
    
    // Append all form fields
    Object.entries(staffFormData).forEach(([key, value]) => {
      if (key === 'specialties' || key === 'credentials') {
        // Handle array fields
        if (Array.isArray(value) && value.length > 0) {
          formData.append(key, JSON.stringify(value));
        }
      } else if (key === 'profilePhoto' && value instanceof File) {
        // Handle file upload
        formData.append('profilePhoto', value);
      } else if (value !== null && value !== undefined && value !== '') {
        // Handle regular fields
        formData.append(key, value.toString());
      }
    });
    
    // Call the submit function
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setStaffFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStaffFormData(prev => ({ ...prev, profilePhoto: e.target.files![0] }));
    }
  };

  const resetForm = () => {
    setStaffFormData({
      name: '',
      email: '',
      phone: '',
      nationalId: '',
      password: '',
      salonId: '',
      staffCategory: 'barber',
      gender: '',
      specialties: [],
      experience: '',
      educationLevel: '',
      birthYearRange: '',
      bio: '',
      credentials: [],
      profilePhoto: null,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!showModal) {
      resetForm();
    }
  }, [showModal]);

  // Reset form when modal is opened to ensure clean state
  useEffect(() => {
    if (showModal) {
      resetForm();
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create Staff Member</h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={staffFormData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={staffFormData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={staffFormData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="788 123 456"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 9-digit Rwandan phone number (e.g., 788123456)
                      <span className={`ml-2 ${staffFormData.phone.replace(/\D/g, '').length === 9 ? 'text-green-600' : 'text-red-600'}`}>
                        ({staffFormData.phone.replace(/\D/g, '').length}/9 digits)
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={staffFormData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <input
                      type="text"
                      value={staffFormData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5 years"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                    <select
                      value={staffFormData.educationLevel}
                      onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Education Level</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="certificate">Certificate</option>
                      <option value="diploma">Diploma</option>
                      <option value="degree">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Birth Year Range</label>
                    <select
                      value={staffFormData.birthYearRange}
                      onChange={(e) => handleInputChange('birthYearRange', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Birth Year Range</option>
                      <option value="12-35">12-35 years</option>
                      <option value="35-60">35-60 years</option>
                      <option value="60+">60+ years</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                    <input
                      type="text"
                      value={staffFormData.nationalId}
                      onChange={(e) => handleInputChange('nationalId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890123456"
                      maxLength={16}
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - 16-digit national ID number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      value={staffFormData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      value={staffFormData.staffCategory}
                      onChange={(e) => handleInputChange('staffCategory', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="barber">Barber</option>
                      <option value="hairstylist">Hair Stylist</option>
                      <option value="nail_technician">Nail Technician</option>
                      <option value="massage_therapist">Massage Therapist</option>
                      <option value="esthetician">Esthetician</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Salon Assignment */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Salon Assignment</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Salon (Optional)</label>
                  <select
                    value={staffFormData.salonId}
                    onChange={(e) => handleInputChange('salonId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a salon</option>
                    {salons.filter((s: any) => s.verified).map((salon: any) => (
                      <option key={salon._id} value={salon._id}>
                        {salon.name} - {salon.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStaffModal;