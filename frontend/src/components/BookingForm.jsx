import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';

const BookingForm = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [packageData, setPackageData] = useState(null);
    const [formData, setFormData] = useState({
        packageId: packageId || '',
        travelDate: '',
        travelers: 1,
        travelerDetails: [],
        contactDetails: {
            primaryContact: {
                name: user?.name || '',
                email: user?.email || '',
                phone: ''
            },
            emergencyContact: {
                name: '',
                phone: '',
                relation: ''
            }
        },
        specialRequests: ''
    });

    // Initialize traveler details when travelers count changes
    useEffect(() => {
        const newTravelerDetails = [];
        for (let i = 0; i < formData.travelers; i++) {
            newTravelerDetails.push({
                name: '',
                age: '',
                gender: '',
                phone: '',
                email: '',
                idType: '',
                idNumber: ''
            });
        }
        setFormData(prev => ({ ...prev, travelerDetails: newTravelerDetails }));
    }, [formData.travelers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContactChange = (contactType, field, value) => {
        setFormData(prev => ({
            ...prev,
            contactDetails: {
                ...prev.contactDetails,
                [contactType]: {
                    ...prev.contactDetails[contactType],
                    [field]: value
                }
            }
        }));
    };

    const handleTravelerChange = (index, field, value) => {
        const updatedTravelers = [...formData.travelerDetails];
        updatedTravelers[index] = { ...updatedTravelers[index], [field]: value };
        setFormData(prev => ({ ...prev, travelerDetails: updatedTravelers }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clean up form data - remove empty idType and idNumber fields
            const cleanedFormData = {
                ...formData,
                travelerDetails: formData.travelerDetails.map(traveler => {
                    const cleanedTraveler = { ...traveler };
                    
                    // Remove idType and idNumber if they are empty
                    if (!cleanedTraveler.idType || cleanedTraveler.idType === '') {
                        delete cleanedTraveler.idType;
                        delete cleanedTraveler.idNumber;
                    }
                    
                    // Convert age to number
                    cleanedTraveler.age = parseInt(cleanedTraveler.age);
                    
                    return cleanedTraveler;
                })
            };

            // Validate form data
            const validation = bookingService.validateBookingData(cleanedFormData);
            if (!validation.isValid) {
                toast.error('Please fill all required fields');
                console.error('Validation errors:', validation.errors);
                setLoading(false);
                return;
            }

            const response = await bookingService.createBooking(cleanedFormData);
            
            if (response.status === 'success') {
                toast.success('Booking created successfully!');
                navigate(`/booking-confirmation/${response.data._id}`);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to create booking');
            console.error('Booking creation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Book Your Package</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Package and Travel Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Travel Date *
                        </label>
                        <input
                            type="date"
                            name="travelDate"
                            value={formData.travelDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="input-field"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Travelers *
                        </label>
                        <select
                            name="travelers"
                            value={formData.travelers}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                        >
                            {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} {i === 0 ? 'Person' : 'People'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Traveler Details */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Traveler Details</h3>
                    {formData.travelerDetails.map((traveler, index) => (
                        <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
                            <h4 className="font-medium mb-3 text-gray-700">
                                Traveler {index + 1}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={traveler.name}
                                        onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                                        className="input-field"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Age *
                                    </label>
                                    <input
                                        type="number"
                                        value={traveler.age}
                                        onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                                        className="input-field"
                                        min="1"
                                        max="100"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        value={traveler.gender}
                                        onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={traveler.phone}
                                        onChange={(e) => handleTravelerChange(index, 'phone', e.target.value)}
                                        className="input-field"
                                        placeholder="Phone number"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={traveler.email}
                                        onChange={(e) => handleTravelerChange(index, 'email', e.target.value)}
                                        className="input-field"
                                        placeholder="Email address"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ID Type
                                    </label>
                                    <select
                                        value={traveler.idType}
                                        onChange={(e) => handleTravelerChange(index, 'idType', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Select ID Type</option>
                                        <option value="passport">Passport</option>
                                        <option value="aadhar">Aadhar Card</option>
                                        <option value="driving_license">Driving License</option>
                                        <option value="voter_id">Voter ID</option>
                                    </select>
                                </div>
                            </div>
                            
                            {traveler.idType && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ID Number
                                    </label>
                                    <input
                                        type="text"
                                        value={traveler.idNumber}
                                        onChange={(e) => handleTravelerChange(index, 'idNumber', e.target.value)}
                                        className="input-field"
                                        placeholder="Enter ID number"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact Details */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Contact */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium mb-3 text-gray-700">Primary Contact</h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contactDetails.primaryContact.name}
                                        onChange={(e) => handleContactChange('primaryContact', 'name', e.target.value)}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.contactDetails.primaryContact.phone}
                                        onChange={(e) => handleContactChange('primaryContact', 'phone', e.target.value)}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.contactDetails.primaryContact.email}
                                        onChange={(e) => handleContactChange('primaryContact', 'email', e.target.value)}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium mb-3 text-gray-700">Emergency Contact</h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contactDetails.emergencyContact.name}
                                        onChange={(e) => handleContactChange('emergencyContact', 'name', e.target.value)}
                                        className="input-field"
                                        placeholder="Emergency contact name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.contactDetails.emergencyContact.phone}
                                        onChange={(e) => handleContactChange('emergencyContact', 'phone', e.target.value)}
                                        className="input-field"
                                        placeholder="Emergency contact phone"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Relation
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contactDetails.emergencyContact.relation}
                                        onChange={(e) => handleContactChange('emergencyContact', 'relation', e.target.value)}
                                        className="input-field"
                                        placeholder="Relationship (e.g., Father, Brother)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Special Requests */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests
                    </label>
                    <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows="3"
                        className="input-field"
                        placeholder="Any special requirements or requests..."
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Creating Booking...' : 'Create Booking'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingForm;