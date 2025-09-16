import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  Users,
  MapPin,
  Calendar,
  Search,
  Settings
} from 'lucide-react';
import { packageService } from '../services';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [managingPackageDetails, setManagingPackageDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: packages, isLoading, error } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: packageService.getAllPackages,
    select: (data) => {
      console.log('API Response in AdminDashboard:', data);
      return data?.data || [];
    },
    onError: (error) => {
      console.error('API Error in AdminDashboard:', error);
      toast.error('Failed to fetch packages');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: packageService.deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPackages'] });
      toast.success('Package deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete package');
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredPackages = packages?.filter(pkg =>
    pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.locations?.some(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  console.log('Packages in AdminDashboard:', packages);
  console.log('Filtered Packages:', filteredPackages);
  console.log('IsLoading:', isLoading);
  console.log('Error:', error);

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your travel packages and bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Packages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {packages?.length || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Destinations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(packages?.flatMap(pkg => pkg.locations || [])).size || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Package
          </button>
        </div>

        {/* Packages Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={pkg.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'}
                            alt={pkg.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pkg.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {pkg.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {pkg.locations?.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₹{pkg.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {pkg.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/packages/${pkg._id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Package"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingPackage(pkg)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit Package"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setManagingPackageDetails(pkg)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Manage Package Details"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Package"
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPackages.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No packages found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new package.'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Create/Edit Package Modal would go here */}
      {(showCreateForm || editingPackage) && (
        <PackageFormModal
          package={editingPackage}
          onClose={() => {
            setShowCreateForm(false);
            setEditingPackage(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['adminPackages'] });
            setShowCreateForm(false);
            setEditingPackage(null);
          }}
        />
      )}

      {/* Package Details Management Modal */}
      {managingPackageDetails && (
        <PackageDetailsModal
          package={managingPackageDetails}
          onClose={() => setManagingPackageDetails(null)}
          onSuccess={() => {
            setManagingPackageDetails(null);
          }}
        />
      )}
    </div>
  );
};

// Simple modal component for creating/editing packages
const PackageFormModal = ({ package: editPackage, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: editPackage?.title || '',
    locations: editPackage?.locations?.join(', ') || '',
    price: editPackage?.price || '',
    duration: editPackage?.duration || '',
    description: editPackage?.description || '',
    category: editPackage?.category || 'adventure',
    image_url: editPackage?.image_url || ''
  });

  const createMutation = useMutation({
    mutationFn: packageService.createPackage,
    onSuccess: () => {
      toast.success('Package created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create package');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => packageService.updatePackage(id, data),
    onSuccess: () => {
      toast.success('Package updated successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update package');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const packageData = {
      ...formData,
      price: Number(formData.price),
      locations: formData.locations.split(',').map(loc => loc.trim()).filter(loc => loc)
    };

    if (editPackage) {
      updateMutation.mutate({ id: editPackage._id, data: packageData });
    } else {
      createMutation.mutate(packageData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {editPackage ? 'Edit Package' : 'Create New Package'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Locations (comma separated)
                </label>
                <input
                  type="text"
                  name="locations"
                  value={formData.locations}
                  onChange={handleChange}
                  placeholder="Manali, Shimla, Delhi"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 7 days"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="adventure">Adventure</option>
                <option value="cultural">Cultural</option>
                <option value="nature">Nature</option>
                <option value="relaxation">Relaxation</option>
                <option value="spiritual">Spiritual</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isLoading || updateMutation.isLoading
                  ? 'Saving...'
                  : editPackage
                  ? 'Update Package'
                  : 'Create Package'
                }
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Package Details Management Modal
const PackageDetailsModal = ({ package: selectedPackage, onClose, onSuccess }) => {
  const [packageDetails, setPackageDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    group_size: { min: 2, max: 15 },
    pricing: { adult_price: 0, child_price: 0 },
    itinerary: [],
    inclusions: [],
    exclusions: [],
    terms: [],
    best_time_to_visit: '',
    gallery: []
  });

  console.log('Selected Package:', selectedPackage);
  console.log('Package Details State:', packageDetails);
  console.log('Form Data:', formData);

  // Fetch existing package details
  const { data: details, isLoading: fetchingDetails, error: fetchError } = useQuery({
    queryKey: ['packageDetails', selectedPackage._id],
    queryFn: () => packageService.getPackageDetails(selectedPackage._id),
  });

  // Handle data when it's fetched
  React.useEffect(() => {
    console.log('Package Details API Response:', details);
    
    if (details?.data?.details) {
      const detailsData = details.data.details;
      console.log('Extracted details data:', detailsData);
      
      setPackageDetails(detailsData);
      setFormData({
        group_size: detailsData.group_size || { min: 2, max: 15 },
        pricing: detailsData.pricing || { adult_price: 0, child_price: 0 },
        itinerary: detailsData.itinerary || [],
        inclusions: detailsData.inclusions || [],
        exclusions: detailsData.exclusions || [],
        terms: detailsData.terms || [],
        best_time_to_visit: detailsData.best_time_to_visit || '',
        gallery: detailsData.gallery || []
      });
    } else if (details && !details.data) {
      console.log('No package details found');
    }
    
    if (fetchError) {
      console.log('Fetch error:', fetchError);
    }
    
    setIsLoading(false);
  }, [details, fetchError]);

  const addDetailsMutation = useMutation({
    mutationFn: packageService.addPackageDetails,
    onSuccess: () => {
      toast.success('Package details added successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add package details');
    },
  });

  const updateDetailsMutation = useMutation({
    mutationFn: (packageDetailsData) => packageService.updatePackageDetails(packageDetailsData),
    onSuccess: () => {
      toast.success('Package details updated successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update package details');
    },
  });

  const deleteDetailsMutation = useMutation({
    mutationFn: packageService.deletePackageDetails,
    onSuccess: () => {
      toast.success('Package details deleted successfully');
      setPackageDetails(null);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete package details');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const detailsData = {
      packageId: selectedPackage._id,
      details: formData
    };

    if (packageDetails) {
      updateDetailsMutation.mutate(detailsData);
    } else {
      addDetailsMutation.mutate(detailsData);
    }
  };

  const handleArrayFieldChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...formData.itinerary];
    if (!newItinerary[index]) {
      newItinerary[index] = { day: index + 1, title: '', description: '', activities: [], meals: '', accommodation: '' };
    }
    newItinerary[index][field] = value;
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const addItineraryDay = () => {
    const newDay = {
      day: formData.itinerary.length + 1,
      title: '',
      description: '',
      activities: [],
      meals: '',
      accommodation: ''
    };
    setFormData({ ...formData, itinerary: [...formData.itinerary, newDay] });
  };

  const removeItineraryDay = (index) => {
    const newItinerary = formData.itinerary.filter((_, i) => i !== index);
    // Update day numbers
    newItinerary.forEach((day, i) => {
      day.day = i + 1;
    });
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const handleActivityChange = (dayIndex, activityIndex, value) => {
    const newItinerary = [...formData.itinerary];
    if (!newItinerary[dayIndex].activities) {
      newItinerary[dayIndex].activities = [];
    }
    newItinerary[dayIndex].activities[activityIndex] = value;
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const addActivity = (dayIndex) => {
    const newItinerary = [...formData.itinerary];
    if (!newItinerary[dayIndex].activities) {
      newItinerary[dayIndex].activities = [];
    }
    newItinerary[dayIndex].activities.push('');
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const removeActivity = (dayIndex, activityIndex) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[dayIndex].activities = newItinerary[dayIndex].activities.filter((_, i) => i !== activityIndex);
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const handleGalleryChange = (index, field, value) => {
    const newGallery = [...formData.gallery];
    if (!newGallery[index]) {
      newGallery[index] = { url: '', caption: '', type: 'gallery' };
    }
    newGallery[index][field] = value;
    setFormData({ ...formData, gallery: newGallery });
  };

  const addGalleryItem = () => {
    setFormData({ 
      ...formData, 
      gallery: [...formData.gallery, { url: '', caption: '', type: 'gallery' }] 
    });
  };

  const removeGalleryItem = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: newGallery });
  };

  if (fetchingDetails || isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Package Details - {selectedPackage.title}
            </h2>
            <div className="flex space-x-2">
              {packageDetails && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => deleteDetailsMutation.mutate(selectedPackage._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={deleteDetailsMutation.isLoading}
                  >
                    Delete Details
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>

          {!packageDetails && !isEditing ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                No Package Details Found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This package doesn't have detailed information yet.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Package Details
              </button>
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Group Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Group Size
                  </label>
                  <input
                    type="number"
                    value={formData.group_size.min}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      group_size: { ...formData.group_size, min: parseInt(e.target.value) || 0 } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Group Size
                  </label>
                  <input
                    type="number"
                    value={formData.group_size.max}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      group_size: { ...formData.group_size, max: parseInt(e.target.value) || 0 } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adult Price (₹)
                  </label>
                  <input
                    type="text"
                    value={formData.pricing.adult_price}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pricing: { ...formData.pricing, adult_price: parseInt(e.target.value) || 0 } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Child Price (₹)
                  </label>
                  <input
                    type="text"
                    value={formData.pricing.child_price}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pricing: { ...formData.pricing, child_price: parseInt(e.target.value) || 0 } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Best Time to Visit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Best Time to Visit
                </label>
                <input
                  type="text"
                  value={formData.best_time_to_visit}
                  onChange={(e) => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., March to May, September to December"
                />
              </div>

              {/* Itinerary */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Itinerary</h3>
                  <button
                    type="button"
                    onClick={addItineraryDay}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Day
                  </button>
                </div>
                {formData.itinerary.map((day, dayIndex) => (
                  <div key={dayIndex} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Day {day.day}</h4>
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(dayIndex)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        value={day.title || ''}
                        onChange={(e) => handleItineraryChange(dayIndex, 'title', e.target.value)}
                        placeholder="Day title"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <textarea
                        value={day.description || ''}
                        onChange={(e) => handleItineraryChange(dayIndex, 'description', e.target.value)}
                        placeholder="Day description"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={day.meals || ''}
                          onChange={(e) => handleItineraryChange(dayIndex, 'meals', e.target.value)}
                          placeholder="Meals included"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={day.accommodation || ''}
                          onChange={(e) => handleItineraryChange(dayIndex, 'accommodation', e.target.value)}
                          placeholder="Accommodation"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Activities</label>
                          <button
                            type="button"
                            onClick={() => addActivity(dayIndex)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            Add Activity
                          </button>
                        </div>
                        {day.activities && day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex space-x-2 mb-2">
                            <input
                              type="text"
                              value={activity}
                              onChange={(e) => handleActivityChange(dayIndex, actIndex, e.target.value)}
                              placeholder="Activity"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => removeActivity(dayIndex, actIndex)}
                              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inclusions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Inclusions</label>
                  <button
                    type="button"
                    onClick={() => addArrayField('inclusions')}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Add Inclusion
                  </button>
                </div>
                {formData.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={inclusion}
                      onChange={(e) => handleArrayFieldChange('inclusions', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="What's included"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('inclusions', index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Exclusions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exclusions</label>
                  <button
                    type="button"
                    onClick={() => addArrayField('exclusions')}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Add Exclusion
                  </button>
                </div>
                {formData.exclusions.map((exclusion, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={exclusion}
                      onChange={(e) => handleArrayFieldChange('exclusions', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="What's not included"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('exclusions', index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Terms */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</label>
                  <button
                    type="button"
                    onClick={() => addArrayField('terms')}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Add Term
                  </button>
                </div>
                {formData.terms.map((term, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => handleArrayFieldChange('terms', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Term or condition"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('terms', index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Gallery */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gallery</label>
                  <button
                    type="button"
                    onClick={addGalleryItem}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Add Image
                  </button>
                </div>
                {formData.gallery.map((item, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Image {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(index)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="url"
                        value={item.url || ''}
                        onChange={(e) => handleGalleryChange(index, 'url', e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={item.caption || ''}
                        onChange={(e) => handleGalleryChange(index, 'caption', e.target.value)}
                        placeholder="Caption"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <select
                        value={item.type || 'gallery'}
                        onChange={(e) => handleGalleryChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="gallery">Gallery</option>
                        <option value="hero">Hero Image</option>
                        <option value="itinerary">Itinerary</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addDetailsMutation.isLoading || updateDetailsMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {packageDetails ? 'Update Details' : 'Add Details'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Package Overview */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Group Size</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {packageDetails.group_size?.min} - {packageDetails.group_size?.max} people
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Pricing</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Adult: ₹{packageDetails.pricing?.adult_price?.toLocaleString()}<br/>
                    Child: ₹{packageDetails.pricing?.child_price?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Best Time to Visit */}
              {packageDetails.best_time_to_visit && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Best Time to Visit</h3>
                  <p className="text-gray-700 dark:text-gray-300">{packageDetails.best_time_to_visit}</p>
                </div>
              )}

              {/* Itinerary */}
              {packageDetails.itinerary && packageDetails.itinerary.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Itinerary</h3>
                  <div className="space-y-4">
                    {packageDetails.itinerary.map((day, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                            Day {day.day}
                          </span>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">{day.title}</h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{day.description}</p>
                        {day.activities && day.activities.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Activities:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Meals: </span>
                            <span className="text-gray-600 dark:text-gray-400">{day.meals}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Stay: </span>
                            <span className="text-gray-600 dark:text-gray-400">{day.accommodation}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions */}
              {packageDetails.inclusions && packageDetails.inclusions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">What's Included</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {packageDetails.inclusions.map((inclusion, index) => (
                      <li key={index}>{inclusion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exclusions */}
              {packageDetails.exclusions && packageDetails.exclusions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">What's Not Included</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {packageDetails.exclusions.map((exclusion, index) => (
                      <li key={index}>{exclusion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Terms & Conditions */}
              {packageDetails.terms && packageDetails.terms.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Terms & Conditions</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {packageDetails.terms.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery */}
              {packageDetails.gallery && packageDetails.gallery.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {packageDetails.gallery.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <img 
                          src={item.url} 
                          alt={item.caption}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';
                          }}
                        />
                        <div className="text-xs">
                          <p className="text-gray-700 dark:text-gray-300">{item.caption}</p>
                          <span className="text-gray-500 dark:text-gray-400 capitalize">({item.type})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews (Read-only) */}
              {packageDetails.reviews && packageDetails.reviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Customer Reviews (Read-only)
                  </h3>
                  <div className="space-y-3">
                    {packageDetails.reviews.map((review, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{review.user_name}</h4>
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{review.comment}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;