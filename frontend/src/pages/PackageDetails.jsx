import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { packageService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Star,
  Heart,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Phone,
  Mail,
  Shield
} from 'lucide-react';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch package basic info
  const { data: packageData, isLoading: packageLoading, error: packageError } = useQuery({
    queryKey: ['package', id],
    queryFn: () => packageService.getPackageById(id),
    enabled: !!id,
    retry: 1,
    onError: (error) => {
      console.error('Error fetching package:', error);
    }
  });

  // Fetch package details (don't fail if details don't exist)
  const { data: packageDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['packageDetails', id],
    queryFn: () => packageService.getPackageDetails(id),
    enabled: !!id,
    retry: 1,
    onError: (error) => {
      console.log('Package details not found - this is okay:', error);
    }
  });

  const isLoading = packageLoading; // Only wait for basic package data
  const error = packageError; // Only error if basic package fails

  // Debug logs
  console.log('Package data:', packageData);
  console.log('Package details:', packageDetails);
  console.log('Details error (okay if 404):', detailsError);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Package Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The package you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/packages"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  // Use details if available, otherwise fallback to basic package data
  const details = packageDetails?.data?.details || {};
  const gallery = details.gallery || [{ url: packageData.data.image_url, caption: packageData.data.title, type: 'hero' }];
  const itinerary = details.itinerary || [];
  const inclusions = details.inclusions || [];
  const exclusions = details.exclusions || [];
  const terms = details.terms || [];
  const reviews = details.reviews || [];
  const pricing = details.pricing || { adult_price: packageData.data.price, child_price: packageData.data.price * 0.7 };
  const groupSize = details.group_size || { min: 2, max: 20 };
  const bestTimeToVisit = details.best_time_to_visit || 'Year round';

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === gallery.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? gallery.length - 1 : prevIndex - 1
    );
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Please login to book a package');
      navigate('/login');
      return;
    }

    if (!selectedDate) {
      alert('Please select a travel date');
      return;
    }

    setIsBooking(true);
    try {
      const bookingData = {
        packageId: packageData.data._id,
        travelDate: selectedDate,
        numberOfTravelers: travelers,
        totalAmount: pricing.adult_price * travelers,
        contactInfo: {
          email: user.email,
          name: user.name
        }
      };

      await packageService.createBooking(bookingData);
      alert('Booking request submitted successfully! We will contact you soon.');
      
      setSelectedDate('');
      setTravelers(2);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit booking request');
    } finally {
      setIsBooking(false);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/packages"
          className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Packages</span>
        </Link>
      </div>

      {/* Image Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden mb-4">
            <img
              src={gallery[currentImageIndex]?.url || packageData.data.image_url}
              alt={gallery[currentImageIndex]?.caption || packageData.data.title}
              className="w-full h-full object-cover"
            />
            
            {gallery.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {gallery.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {gallery.length}
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-6 lg:grid-cols-8 gap-2">
              {gallery.slice(0, 8).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-16 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {gallery.length > 8 && (
                <div className="h-16 lg:h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <ImageIcon size={20} />
                  <span className="ml-1 text-xs">+{gallery.length - 8}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {packageData.data.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{packageData.data.destination}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{packageData.data.duration}</span>
                    </div>
                    {groupSize && (
                      <div className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{groupSize.min}-{groupSize.max} people</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full transition-colors ${
                    isWishlisted 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{pricing.adult_price?.toLocaleString() || packageData.data.price?.toLocaleString()}
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400"> per person</span>
                  </div>
                  {pricing.child_price && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Child: ₹{pricing.child_price.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="fill-yellow-400 text-yellow-400" size={16} />
                    <span className="font-medium">
                      {reviews.length > 0 
                        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
                        : '4.8'
                      }
                    </span>
                  </div>
                  <span className="text-gray-500">
                    ({reviews.length || 124} reviews)
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="text-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                <p className="font-semibold text-gray-900 dark:text-white">{packageData.data.duration}</p>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Group Size</p>
                <p className="font-semibold text-gray-900 dark:text-white">{groupSize.min}-{groupSize.max}</p>
              </div>
              <div className="text-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">{bestTimeToVisit}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Trip</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                {packageData.data.description}
              </p>
            </motion.div>

            {/* Itinerary Section */}
            {itinerary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Itinerary</h2>
                <div className="space-y-4">
                  {itinerary.map((day, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                          Day {day.day}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{day.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{day.description}</p>
                      {day.activities && day.activities.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Activities:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {day.activities.map((activity, actIndex) => (
                              <li key={actIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Meals: </span>
                          <span className="text-gray-600 dark:text-gray-400">{day.meals || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Stay: </span>
                          <span className="text-gray-600 dark:text-gray-400">{day.accommodation || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Inclusions Section */}
            {inclusions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What's Included</h2>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <ul className="space-y-2">
                    {inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Exclusions Section */}
            {exclusions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What's Not Included</h2>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                  <ul className="space-y-2">
                    {exclusions.map((exclusion, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-5 h-5 border-2 border-red-500 rounded-full mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                          <div className="w-2 h-0.5 bg-red-500"></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{exclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Terms & Conditions Section */}
            {terms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terms & Conditions</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <ul className="space-y-2">
                    {terms.map((term, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customer Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{review.user_name}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{pricing.adult_price?.toLocaleString() || packageData.data.price?.toLocaleString()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">per person</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Travel Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Travelers
                    </label>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {Array.from({ length: groupSize.max - groupSize.min + 1 }, (_, i) => groupSize.min + i).map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{((pricing.adult_price || packageData.data.price) * travelers).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={isBooking || !selectedDate}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isBooking ? 'Processing...' : 'Book Now'}
                  </button>

                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <Shield size={16} className="inline mr-1" />
                    Secure booking with instant confirmation
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Need Help?</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Phone size={14} />
                      <span>+91 9876543210</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Mail size={14} />
                      <span>support@ghumakkadyatri.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;