import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  subjects: string[];
  minRating: number;
  maxPrice: number;
  location: string;
}

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    subjects: [],
    minRating: 0,
    maxPrice: 1000,
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tutors..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subjects
          </label>
          <select
            multiple
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.subjects}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setFilters({ ...filters, subjects: values });
            }}
          >
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="english">English</option>
            <option value="amharic">Amharic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Rating
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Price (ETB/hour)
          </label>
          <input
            type="number"
            min="0"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          placeholder="Enter location..."
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>
    </form>
  );
} 