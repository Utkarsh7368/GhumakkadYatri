import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Users, Star } from 'lucide-react';

const PackageCard = ({ package: pkg, className = '' }) => {
  const {
    _id,
    title,
    description,
    locations,
    price,
    duration,
    image_url,
    rating = 4.5,
    reviewCount = 23
  } = pkg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`card overflow-hidden group cursor-pointer ${className}`}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image_url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ₹{price.toLocaleString()}
        </div>
        
        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1 text-white">
          <Star size={16} className="fill-current text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-xs opacity-75">({reviewCount})</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Package Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <MapPin size={16} className="mr-2 flex-shrink-0" />
            <span className="truncate">{locations.join(', ')}</span>
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Clock size={16} className="mr-2 flex-shrink-0" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Link
            to={`/packages/${_id}`}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
          >
            View Details
          </Link>
          
          <Link
            to={`/book/${_id}`}
            className="btn-primary text-sm"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PackageCard;