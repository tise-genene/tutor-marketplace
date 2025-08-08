import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, BookOpen, Clock, Shield } from 'lucide-react';

interface TutorCardProps {
  id: string;
  name: string;
  image: string;
  subjects: string[];
  rating: number;
  hourlyRate: number;
  experience: number;
  location: string;
  isVerified?: boolean;
  totalReviews?: number;
  variant?: 'grid' | 'list';
}

export function TutorCard({
  id,
  name,
  image,
  subjects,
  rating,
  hourlyRate,
  experience,
  location,
  isVerified = false,
  totalReviews = 0,
  variant = 'grid',
}: TutorCardProps) {
  if (variant === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-shadow">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {/* Fixed-size image for list layout */}
            <Image src={image} alt={name} width={96} height={96} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" />{location}</span>
                  <span className="inline-flex items-center gap-1"><BookOpen className="w-4 h-4 text-blue-500" />{subjects.slice(0, 2).join(', ')}{subjects.length > 2 ? ` +${subjects.length - 2}` : ''}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4 text-purple-500" />{experience} yrs</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-gray-900">${hourlyRate}</div>
                <div className="text-xs text-gray-500">per hour</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {subjects.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">{s}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <Link href={`/tutor/${id}`} className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50">
                  View Profile
                </Link>
                <Link href={`/tutor/${id}/book`} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                  Hire
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isVerified && (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                <Shield className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
              ${hourlyRate}/hr
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{location}</span>
              </div>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({totalReviews} reviews)
            </span>
          </div>
          
          {/* Subjects */}
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Subjects</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {subjects.slice(0, 3).map((subject, index) => (
                <span 
                  key={index}
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-md"
                >
                  {subject}
                </span>
              ))}
              {subjects.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-md">
                  +{subjects.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          {/* Experience */}
          <div className="flex items-center gap-1 mb-4">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">
              {experience} years experience
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link 
              href={`/tutor/${id}`}
              className="flex-1 border-2 border-blue-600 text-blue-600 font-bold py-3 px-4 rounded-xl hover:bg-blue-50 transition-all duration-300 text-center"
            >
              View Profile
            </Link>
            <Link 
              href={`/tutor/${id}/book`}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group-hover:shadow-lg text-center"
            >
              Hire
            </Link>
          </div>
        </div>
      </div>
  );
} 