import { NextRequest } from 'next/server';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { withApiHandler } from '@/lib/api-middleware';

// Mock tutor data - replace with actual database call
const mockTutors = {
  '1': {
    id: '1',
    name: 'Abebe Kebede',
    email: 'abebe@example.com',
    tutorProfile: {
      bio: 'Experienced mathematics and physics tutor with 5 years of teaching experience. I specialize in helping students understand complex concepts through practical examples.',
      subjects: ['Mathematics', 'Physics'],
      education: 'MSc in Mathematics from Addis Ababa University',
      experience: 5,
      hourlyRate: 50,
      location: 'Addis Ababa',
      availability: 'Monday-Friday 9AM-6PM',
      isVerified: true,
      rating: 4.8,
      totalReviews: 42,
    },
    reviews: [
      {
        id: '1',
        rating: 5,
        comment: 'Excellent tutor! Very patient and explains concepts clearly.',
        createdAt: '2024-01-15T10:00:00Z',
        student: { name: 'John Doe' }
      },
      {
        id: '2', 
        rating: 4,
        comment: 'Good teaching style, helped me improve my grades.',
        createdAt: '2024-01-10T14:30:00Z',
        student: { name: 'Jane Smith' }
      }
    ],
    subjects: [
      { id: 'math', name: 'Mathematics', hourlyRate: 50 },
      { id: 'physics', name: 'Physics', hourlyRate: 55 }
    ]
  },
  '2': {
    id: '2',
    name: 'Kebede Alemu',
    email: 'kebede@example.com',
    tutorProfile: {
      bio: 'English and Literature specialist with passion for helping students excel in language arts.',
      subjects: ['English', 'Literature'],
      education: 'BA in English Literature',
      experience: 3,
      hourlyRate: 45,
      location: 'Addis Ababa',
      availability: 'Flexible hours',
      isVerified: false,
      rating: 4.5,
      totalReviews: 28,
    },
    reviews: [],
    subjects: [
      { id: 'english', name: 'English', hourlyRate: 45 },
      { id: 'literature', name: 'Literature', hourlyRate: 45 }
    ]
  },
  '3': {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    tutorProfile: {
      bio: 'Chemistry and Biology expert with 7 years of experience in both academic and research settings.',
      subjects: ['Chemistry', 'Biology'],
      education: 'PhD in Chemistry',
      experience: 7,
      hourlyRate: 60,
      location: 'Bahir Dar',
      availability: 'Evenings and weekends',
      isVerified: true,
      rating: 4.9,
      totalReviews: 67,
    },
    reviews: [],
    subjects: [
      { id: 'chemistry', name: 'Chemistry', hourlyRate: 60 },
      { id: 'biology', name: 'Biology', hourlyRate: 58 }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async (req) => {
    const tutorId = params.id;
    
    const tutor = mockTutors[tutorId as keyof typeof mockTutors];
    
    if (!tutor) {
      return ApiErrors.NOT_FOUND('Tutor not found');
    }
    
    return apiSuccess(tutor);
  }, request);
}