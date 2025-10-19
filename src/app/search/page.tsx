'use client';

import { useState, useEffect } from 'react';
import { useSession } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';
import { TutorCard } from '@/components/TutorCard';
import { Search, SlidersHorizontal, LayoutGrid, List, Star, MapPin, DollarSign, Shield, BookOpen } from 'lucide-react';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tutors, setTutors] = useState(mockTutors);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('search:viewMode') : null;
    if (saved === 'grid' || saved === 'list') setViewMode(saved as 'grid' | 'list');
  }, []);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  type Filters = {
    query: string;
    subjects: string[];
    minRating: number;
    maxPrice: number;
    location: string;
    verifiedOnly: boolean;
  };

  const POPULAR_SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'English', 'Economics', 'Programming'
  ];

  const [filters, setFilters] = useState<Filters>({
    query: '',
    subjects: [],
    minRating: 0,
    maxPrice: 200,
    location: '',
    verifiedOnly: false,
  });

  const handleSearch = (activeFilters: Filters) => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
    const filteredTutors = mockTutors.filter((tutor) => {
        const matchesQuery = tutor.name.toLowerCase().includes(activeFilters.query.toLowerCase()) ||
          tutor.subjects.some(subject => subject.toLowerCase().includes(activeFilters.query.toLowerCase()));
        const matchesSubjects = activeFilters.subjects.length === 0 ||
          tutor.subjects.some(subject => activeFilters.subjects.includes(subject.toLowerCase()));
        const matchesRating = tutor.rating >= activeFilters.minRating;
        const matchesPrice = tutor.hourlyRate <= activeFilters.maxPrice;
        const matchesLocation = !activeFilters.location ||
          tutor.location.toLowerCase().includes(activeFilters.location.toLowerCase());
        const matchesVerified = activeFilters.verifiedOnly ? tutor.isVerified : true;

        return matchesQuery && matchesSubjects && matchesRating && matchesPrice && matchesLocation && matchesVerified;
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
    handleSearch(filters);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero search band */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  placeholder="Search tutors, subjects, or specialties"
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-px h-5 bg-gray-300" />
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="Location"
                    className="w-28 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
                  />
                </div>
              </div>
              <button onClick={() => handleSearch(filters)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl">
                Search
              </button>
              <button onClick={() => setIsFiltersOpen(true)} className="md:hidden flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
            {/* Quick subjects */}
            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR_SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      subjects: f.subjects.includes(s.toLowerCase())
                        ? f.subjects.filter((x) => x !== s.toLowerCase())
                        : [...f.subjects, s.toLowerCase()],
                    }))
                  }
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    filters.subjects.includes(s.toLowerCase())
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Filters</h3>
                  <button
                    className="text-sm text-gray-600 hover:text-red-600"
                    onClick={() => {
                      const reset = { query: '', subjects: [], minRating: 0, maxPrice: 200, location: '', verifiedOnly: false } as Filters;
                      setFilters(reset);
                      handleSearch(reset);
                    }}
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-5">
                  {/* Verified */}
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="flex items-center gap-1 text-gray-700">
                      <Shield className="w-4 h-4 text-green-600" /> Verified only
                    </span>
                  </label>

                  {/* Rating */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-800">Minimum rating</span>
                    </div>
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1, 0].map((r) => (
                        <label key={r} className="flex items-center gap-3 text-sm text-gray-700">
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.minRating === r}
                            onChange={() => setFilters({ ...filters, minRating: r })}
                          />
                          <span className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < r ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                            {r === 0 ? 'Any' : `${r}+`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-800">Max price: ${filters.maxPrice}/hr</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={200}
                      step={5}
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$10</span>
                      <span>$200+</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleSearch(filters)}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <section className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
              <div className="text-gray-700">
                <span className="font-semibold">{tutors.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-700"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="experience">Most Experience</option>
                </select>
                <div className="hidden sm:flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button onClick={() => { setViewMode('list'); if (typeof window !== 'undefined') window.localStorage.setItem('search:viewMode','list'); }} className={`px-3 py-2 text-sm ${viewMode==='list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}><List className="w-4 h-4" /></button>
                  <button onClick={() => { setViewMode('grid'); if (typeof window !== 'undefined') window.localStorage.setItem('search:viewMode','grid'); }} className={`px-3 py-2 text-sm ${viewMode==='grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}><LayoutGrid className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {!isLoading && tutors.length > 0 && (
              <div className="space-y-4">
        {tutors.map((tutor) => (
                  <TutorCard key={tutor.id} {...tutor} variant="list" />
        ))}
      </div>
            )}

            {/* Empty */}
            {!isLoading && tutors.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tutors found</h3>
                <p className="text-gray-600 mb-6">Try adjusting filters or broadening your search.</p>
                <button
                  onClick={() => {
                    setTutors(mockTutors);
                    setFilters({ query: '', subjects: [], minRating: 0, maxPrice: 200, location: '', verifiedOnly: false });
                    setSortBy('relevance');
                  }}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  Reset Search
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
} 