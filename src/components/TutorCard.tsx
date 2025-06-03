import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface TutorCardProps {
  id: string;
  name: string;
  image: string;
  subjects: string[];
  rating: number;
  hourlyRate: number;
  experience: number;
  location: string;
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
}: TutorCardProps) {
  return (
    <Link href={`/tutor/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <div className="flex items-center mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600">Subjects: {subjects.join(', ')}</p>
            <p className="text-sm text-gray-600">Experience: {experience} years</p>
            <p className="text-sm text-gray-600">{location}</p>
          </div>
          <div className="mt-3">
            <p className="text-lg font-semibold text-primary">
              ${hourlyRate}/hour
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
} 