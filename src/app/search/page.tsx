'use client';

import { useState } from 'react';
import { TutorCard } from '@/components/TutorCard';
import { SearchFilters, type SearchFilters as SearchFiltersType } from '@/components/SearchFilters';

// Mock data - replace with actual API call
const mockTutors = [
  {
    id: '1',
    name: 'Abebe Kebede',
    image: '/tutors/tutor1.jpg',
    subjects: ['Mathematics', 'Physics'],
    rating: 4.8,
    hourlyRate: 50,
    experience: 5,
    location: 'Addis Ababa',
    isVerified: true,
    totalReviews: 42,
  },
  {
    id: '2',
    name: 'Kebede Alemu',
    image: '/tutors/tutor2.jpg',
    subjects: ['English', 'Literature'],
    rating: 4.5,
    hourlyRate: 45,
    experience: 3,
    location: 'Addis Ababa',
    isVerified: false,
    totalReviews: 28,
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    image: '/tutors/tutor1.jpg',
    subjects: ['Chemistry', 'Biology'],
    rating: 4.9,
    hourlyRate: 60,
    experience: 7,
    location: 'Bahir Dar',
    isVerified: true,
    totalReviews: 67,
  },
  {
    id: '4',
    name: 'Michael Brown',
    image: '/tutors/tutor2.jpg',
    subjects: ['Computer Science', 'Programming'],
    rating: 4.7,
    hourlyRate: 75,
    experience: 4,
    location: 'Mekelle',
    isVerified: true,
    totalReviews: 35,
  },
  {
    id: '5',
    name: 'Hanan Ahmed',
    image: '/tutors/tutor1.jpg',
    subjects: ['Arabic', 'History'],
    rating: 4.6,
    hourlyRate: 40,
    experience: 6,
    location: 'Dire Dawa',
    isVerified: false,
    totalReviews: 21,
  },
  {
    id: '6',
    name: 'David Wilson',
    image: '/tutors/tutor2.jpg',
    subjects: ['Economics', 'Statistics'],
    rating: 4.8,
    hourlyRate: 55,
    experience: 5,
    location: 'Hawassa',
    isVerified: true,
    totalReviews: 39,
  },
];

export default function SearchPage() {
  const [tutors, setTutors] = useState(mockTutors);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const handleSearch = (filters: SearchFiltersType) => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filteredTutors = mockTutors.filter((tutor) => {
        const matchesQuery = tutor.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          tutor.subjects.some(subject => subject.toLowerCase().includes(filters.query.toLowerCase()));
        const matchesSubjects = filters.subjects.length === 0 ||
          tutor.subjects.some(subject => filters.subjects.includes(subject.toLowerCase()));
        const matchesRating = tutor.rating >= filters.minRating;
        const matchesPrice = tutor.hourlyRate <= filters.maxPrice;
        const matchesLocation = !filters.location ||
          tutor.location.toLowerCase().includes(filters.location.toLowerCase());

        return matchesQuery && matchesSubjects && matchesRating && matchesPrice && matchesLocation;
      });

      // Apply sorting
      let sortedTutors = [...filteredTutors];
      switch (sortBy) {
        case 'price-low':
          sortedTutors.sort((a, b) => a.hourlyRate - b.hourlyRate);
          break;
        case 'price-high':
          sortedTutors.sort((a, b) => b.hourlyRate - a.hourlyRate);
          break;
        case 'rating':
          sortedTutors.sort((a, b) => b.rating - a.rating);
          break;
        case 'experience':
          sortedTutors.sort((a, b) => b.experience - a.experience);
          break;
        default:
          // Keep original order for relevance
          break;
      }

      setTutors(sortedTutors);
      setIsLoading(false);
    }, 800);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    // Re-apply current filters with new sorting
    handleSearch({
      query: '',
      subjects: [],
      minRating: 0,
      maxPrice: 1000,
      location: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Filters - Full Width */}
      <div className="sticky top-20 z-40 bg-gray-50 pb-6">
        <div className="container mx-auto px-6 pt-6">
          <SearchFilters onSearch={handleSearch} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters Summary (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-40">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filter Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Results</span>
                  <span className="font-semibold text-blue-600">{tutors.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Rate</span>
                  <span className="font-semibold text-gray-900">
                    ${tutors.length > 0 ? Math.round(tutors.reduce((sum, t) => sum + t.hourlyRate, 0) / tutors.length) : 0}/hr
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified Tutors</span>
                  <span className="font-semibold text-green-600">
                    {tutors.filter(t => t.isVerified).length}
                  </span>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Filters</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => setTutors(mockTutors.filter(t => t.isVerified))}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    ✓ Verified Only
                  </button>
                  <button 
                    onClick={() => setTutors(mockTutors.filter(t => t.rating >= 4.5))}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    ⭐ 4.5+ Rating
                  </button>
                  <button 
                    onClick={() => setTutors(mockTutors.filter(t => t.hourlyRate <= 500))}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    💰 Under $500/hr
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isLoading ? 'Searching...' : `${tutors.length} Tutors Found`}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Find the perfect tutor for your learning journey
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 hidden sm:block">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="experience">Most Experience</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for tutors...</p>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && tutors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tutors.map((tutor) => (
                  <TutorCard key={tutor.id} {...tutor} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && tutors.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No tutors found</h3>
                <p className="text-gray-600 text-lg mb-6">
                  We couldn't find any tutors matching your criteria.
                </p>
                <div className="space-y-2 text-gray-500">
                  <p>Try adjusting your filters:</p>
                  <ul className="list-disc list-inside space-y-1 text-left inline-block">
                    <li>Expand your location range</li>
                    <li>Increase your price range</li>
                    <li>Try different subjects</li>
                    <li>Lower the minimum rating</li>
                  </ul>
                </div>
                <button 
                  onClick={() => {
                    setTutors(mockTutors);
                    setSortBy('relevance');
                  }}
                  className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Show All Tutors
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}