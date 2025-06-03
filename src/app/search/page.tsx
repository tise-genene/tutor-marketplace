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
    hourlyRate: 500,
    experience: 5,
    location: 'Addis Ababa',
  },
  {
    id: '2',
    name: 'Kebede Alemu',
    image: '/tutors/tutor2.jpg',
    subjects: ['English', 'Amharic'],
    rating: 4.5,
    hourlyRate: 450,
    experience: 3,
    location: 'Addis Ababa',
  },
  // Add more mock tutors as needed
];

export default function SearchPage() {
  const [tutors, setTutors] = useState(mockTutors);

  const handleSearch = (filters: SearchFiltersType) => {
    // Implement actual filtering logic here
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

    setTutors(filteredTutors);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Your Perfect Tutor</h1>
      
      <div className="mb-8">
        <SearchFilters onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map((tutor) => (
          <TutorCard key={tutor.id} {...tutor} />
        ))}
      </div>

      {tutors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No tutors found matching your criteria.</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
} 