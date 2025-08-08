import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Star, DollarSign, BookOpen } from 'lucide-react';

interface SearchFiltersProps {
  value: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  subjects: string[];
  minRating: number;
  maxPrice: number;
  location: string;
}

const POPULAR_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History',
  'Computer Science', 'Economics', 'Psychology', 'Spanish', 'French', 'Art'
];

export function SearchFilters({ value: filters, onChange, onSearch }: SearchFiltersProps) {
  // Note: Component is now controlled by parent via value/onChange

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const toggleSubject = (subject: string) => {
    onChange({
      ...filters,
      subjects: filters.subjects.includes(subject)
        ? filters.subjects.filter(s => s !== subject)
        : [...filters.subjects, subject]
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Compact Search Header */}
      <div className="bg-white p-4 rounded-t-2xl">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Compact Search Bar */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutors, subjects, or specialties..."
                className="flex-1 bg-transparent border-0 text-gray-800 placeholder-gray-500 focus:outline-none"
                value={filters.query}
                onChange={(e) => onChange({ ...filters, query: e.target.value })}
              />
              
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-px h-5 bg-gray-300"></div>
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-24 bg-transparent border-0 text-gray-800 placeholder-gray-500 focus:outline-none text-sm"
                  value={filters.location}
                  onChange={(e) => onChange({ ...filters, location: e.target.value })}
                />
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm hidden md:inline">Filters</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Location */}
          <div className="sm:hidden">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Location"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.location}
                onChange={(e) => onChange({ ...filters, location: e.target.value })}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="space-y-6">
            {/* Subjects */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-semibold text-gray-800">Subjects</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.subjects.includes(subject)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <label className="text-sm font-semibold text-gray-800">Minimum Rating</label>
                </div>
                <div className="space-y-2">
                  {[4, 3, 2, 1, 0].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.minRating === rating}
                        onChange={(e) => onChange({ ...filters, minRating: parseInt(e.target.value) })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          {rating === 0 ? 'Any rating' : `${rating}+ stars`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <label className="text-sm font-semibold text-gray-800">
                    Max Price: ${filters.maxPrice}/hour
                  </label>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={filters.maxPrice}
                  onChange={(e) => onChange({ ...filters, maxPrice: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$10</span>
                  <span>$200+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}