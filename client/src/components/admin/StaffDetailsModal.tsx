import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  Camera,
  Building2,
  Briefcase,
  Scissors,
  Users,
  Calendar,
  CreditCard,
  GraduationCap,
  Award,
  BookOpen,
  UserCheck,
  CalendarDays,
  Hash,
  IdCard
} from 'lucide-react';
interface StaffDetailsModalProps {
  showModal: boolean;
  onClose: () => void;
  staffDetails: any;
  staffDetailsLoading: boolean;
}

const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({
  showModal,
  onClose,
  staffDetails,
  staffDetailsLoading
}) => {
  // Avoid React concurrent rendering warning by only creating the portal after mount
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll while modal is open
  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    if (showModal) {
      body.style.overflow = 'hidden';
    }
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  if (!mounted) return null;

  return createPortal(
    showModal ? (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white shadow-2xl w-full sm:max-w-2xl lg:max-w-4xl h-[100vh] sm:h-auto sm:max-h-[92vh] overflow-hidden rounded-none sm:rounded-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center sticky top-0 z-10 rounded-t-none sm:rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Staff Member Details</h2>
              <p className="text-green-100 text-sm">Complete staff information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          {staffDetailsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-slate-600">Loading staff details...</p>
            </div>
          ) : staffDetails ? (
            <div className="space-y-6">
              {/* Profile Photo */}
              {staffDetails.profilePhoto && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-2xl p-6 border border-indigo-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-indigo-600" />
                    Profile Photo
                  </h3>
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200">
                      <img 
                        src={staffDetails.profilePhoto} 
                        alt={`${staffDetails.name}'s profile`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Full Name</p>
                    <p className="text-base text-slate-900 font-semibold">{staffDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Role</p>
                    <p className="text-base text-slate-900 font-semibold capitalize">{staffDetails.role}</p>
                  </div>
                  {staffDetails.bio && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-600 font-medium">Bio</p>
                      <p className="text-base text-slate-900">{staffDetails.bio}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      (staffDetails.isActive !== false && staffDetails.status !== 'inactive') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(staffDetails.isActive !== false && staffDetails.status !== 'inactive') ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-green-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staffDetails.phone && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="text-base text-slate-900 font-medium">{staffDetails.phone}</p>
                      </div>
                    </div>
                  )}
                  {staffDetails.email && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="text-base text-slate-900 font-medium">{staffDetails.email}</p>
                      </div>
                    </div>
                  )}
                  {staffDetails.address && (
                    <div className="flex items-center space-x-3 md:col-span-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Address</p>
                        <p className="text-base text-slate-900 font-medium">{staffDetails.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Salon Assignment */}
              {staffDetails.salon && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-2xl p-6 border border-amber-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-amber-600" />
                    Assigned Salon
                  </h3>
                  <div className="flex items-center space-x-4 bg-white rounded-xl p-4 border border-amber-200">
                    <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                      {staffDetails.salon.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-lg">{staffDetails.salon.name}</p>
                      <p className="text-sm text-slate-600">{staffDetails.salon.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Services */}
              {staffDetails.services && staffDetails.services.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-2xl p-6 border border-emerald-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Scissors className="h-5 w-5 mr-2 text-emerald-600" />
                    Specialized Services ({staffDetails.services.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffDetails.services.map((service: any, index: number) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                        <p className="font-semibold text-slate-900 text-lg">{service.title || service.name}</p>
                        {service.description && (
                          <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                        )}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-emerald-100">
                          <span className="text-emerald-600 font-bold text-lg">{service.price} RWF</span>
                          <span className="text-sm text-slate-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.durationMinutes || service.duration} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Schedule */}
              {staffDetails.workSchedule && (
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50/50 rounded-2xl p-6 border border-teal-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                    Work Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(staffDetails.workSchedule).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex justify-between items-center bg-white rounded-lg p-3 border border-teal-200">
                        <span className="font-medium text-slate-900 capitalize">{day}</span>
                        <span className="text-slate-600">
                          {hours.isWorking ? `${hours.start} - ${hours.end}` : 'Off'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {staffDetails.paymentInfo && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Commission Rate</p>
                      <p className="text-base text-slate-900 font-semibold">{staffDetails.paymentInfo.commissionRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Payment Method</p>
                      <p className="text-base text-slate-900 font-semibold capitalize">{staffDetails.paymentInfo.paymentMethod}</p>
                    </div>
                    {staffDetails.paymentInfo.bankAccount && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-600 font-medium">Bank Account</p>
                        <p className="text-base text-slate-900">{staffDetails.paymentInfo.bankAccount}</p>
                      </div>
                    )}
                    {staffDetails.paymentInfo.mobileMoneyNumber && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-600 font-medium">Mobile Money</p>
                        <p className="text-base text-slate-900">{staffDetails.paymentInfo.mobileMoneyNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statistics */}
              {staffDetails.statistics && (
                <div className="bg-gradient-to-br from-rose-50 to-red-50/50 rounded-2xl p-6 border border-rose-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-rose-600" />
                    Performance Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-rose-200 text-center">
                      <p className="text-2xl font-bold text-rose-600">{staffDetails.statistics.totalBookings || 0}</p>
                      <p className="text-sm text-slate-600">Total Bookings</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-rose-200 text-center">
                      <p className="text-2xl font-bold text-rose-600">{staffDetails.statistics.averageRating || 'N/A'}</p>
                      <p className="text-sm text-slate-600">Average Rating</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-rose-200 text-center">
                      <p className="text-2xl font-bold text-rose-600">{staffDetails.statistics.yearsExperience || 0}</p>
                      <p className="text-sm text-slate-600">Years Experience</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Education */}
              {(staffDetails.education || staffDetails.qualifications) && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-2xl p-6 border border-indigo-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                    Education & Qualifications
                  </h3>
                  <div className="space-y-4">
                    {staffDetails.education && staffDetails.education.map((edu: any, index: number) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-indigo-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900">{edu.degree || edu.title || edu.institution}</p>
                            {edu.institution && <p className="text-sm text-slate-600">{edu.institution}</p>}
                            {edu.fieldOfStudy && <p className="text-sm text-slate-500 mt-1">Field: {edu.fieldOfStudy}</p>}
                          </div>
                          {edu.graduationYear && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                              {edu.graduationYear}
                            </span>
                          )}
                        </div>
                        {edu.description && <p className="text-sm text-slate-600 mt-2">{edu.description}</p>}
                      </div>
                    ))}
                    
                    {staffDetails.qualifications && staffDetails.qualifications.map((qual: any, index: number) => (
                      <div key={`qual-${index}`} className="bg-white rounded-xl p-4 border border-indigo-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900">{qual.name || qual.title}</p>
                            {qual.issuer && <p className="text-sm text-slate-600">Issued by: {qual.issuer}</p>}
                          </div>
                          {qual.dateObtained && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                              {new Date(qual.dateObtained).getFullYear()}
                            </span>
                          )}
                        </div>
                        {qual.description && <p className="text-sm text-slate-600 mt-2">{qual.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {staffDetails.certifications && staffDetails.certifications.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-2xl p-6 border border-amber-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-amber-600" />
                    Professional Certifications
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {staffDetails.certifications.map((cert: any, index: number) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-amber-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900">{cert.name || cert.title}</p>
                            {cert.issuingOrganization && (
                              <p className="text-sm text-slate-600">Issued by: {cert.issuingOrganization}</p>
                            )}
                            {cert.credentialId && (
                              <p className="text-xs text-slate-500 mt-1 flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                {cert.credentialId}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {cert.issueDate && (
                              <span className="block text-xs text-slate-500">
                                Issued: {new Date(cert.issueDate).toLocaleDateString()}
                              </span>
                            )}
                            {cert.expirationDate && (
                              <span className="block text-xs text-slate-500 mt-1">
                                Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {cert.description && <p className="text-sm text-slate-600 mt-2">{cert.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Employment History */}
              {staffDetails.employmentHistory && staffDetails.employmentHistory.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                    Employment History
                  </h3>
                  <div className="space-y-4">
                    {staffDetails.employmentHistory.map((job: any, index: number) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900">{job.position || job.role}</p>
                            {job.company && <p className="text-sm text-slate-600">{job.company}</p>}
                            <div className="flex items-center text-xs text-slate-500 mt-1">
                              <CalendarDays className="h-3 w-3 mr-1" />
                              {job.startDate && (
                                <span>
                                  {new Date(job.startDate).toLocaleDateString()} - 
                                  {job.endDate ? new Date(job.endDate).toLocaleDateString() : ' Present'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {job.description && <p className="text-sm text-slate-600 mt-2">{job.description}</p>}
                        {job.skills && job.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.skills.map((skill: string, skillIndex: number) => (
                              <span 
                                key={skillIndex} 
                                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(staffDetails.dateOfBirth || staffDetails.nationality || staffDetails.idNumber || staffDetails.emergencyContact) && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffDetails.dateOfBirth && (
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Date of Birth</p>
                        <p className="text-base text-slate-900">
                          {new Date(staffDetails.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {staffDetails.nationality && (
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Nationality</p>
                        <p className="text-base text-slate-900">{staffDetails.nationality}</p>
                      </div>
                    )}
                    {staffDetails.idNumber && (
                      <div>
                        <p className="text-sm text-slate-600 font-medium">ID Number</p>
                        <p className="text-base text-slate-900">{staffDetails.idNumber}</p>
                      </div>
                    )}
                    {staffDetails.emergencyContact && (
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Emergency Contact</p>
                        <p className="text-base text-slate-900">{staffDetails.emergencyContact.name}</p>
                        <p className="text-sm text-slate-600">{staffDetails.emergencyContact.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-600">No staff details available</p>
            </div>
          )}        </div>
      </div>
    </div>
    ) : null,
    document.body
  );
};

export default StaffDetailsModal;