import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUBJECTS = [
  // STEM
  { name: 'Mathematics', category: 'STEM', description: 'Algebra, Calculus, Geometry, Statistics' },
  { name: 'Physics', category: 'STEM', description: 'Mechanics, Thermodynamics, Electromagnetism' },
  { name: 'Chemistry', category: 'STEM', description: 'Organic, Inorganic, Physical Chemistry' },
  { name: 'Biology', category: 'STEM', description: 'Cell Biology, Genetics, Ecology' },
  { name: 'Computer Science', category: 'STEM', description: 'Programming, Algorithms, Data Structures' },
  
  // Languages
  { name: 'English', category: 'Languages', description: 'Grammar, Literature, Writing, Speaking' },
  { name: 'Amharic', category: 'Languages', description: 'Native Ethiopian language instruction' },
  { name: 'French', category: 'Languages', description: 'Conversational and Academic French' },
  { name: 'Arabic', category: 'Languages', description: 'Modern Standard and Classical Arabic' },
  
  // Social Studies
  { name: 'History', category: 'Social Studies', description: 'World History, Ethiopian History' },
  { name: 'Geography', category: 'Social Studies', description: 'Physical and Human Geography' },
  { name: 'Economics', category: 'Social Studies', description: 'Micro and Macroeconomics' },
  { name: 'Political Science', category: 'Social Studies', description: 'Government, International Relations' },
  
  // Technology
  { name: 'Programming', category: 'Technology', description: 'Python, JavaScript, Java, C++' },
  { name: 'Web Development', category: 'Technology', description: 'HTML, CSS, React, Node.js' },
  { name: 'Data Science', category: 'Technology', description: 'Python, R, Machine Learning' },
  { name: 'Mobile Development', category: 'Technology', description: 'iOS, Android, Flutter' },
  
  // Arts & Creative
  { name: 'Art', category: 'Arts', description: 'Drawing, Painting, Design' },
  { name: 'Music', category: 'Arts', description: 'Piano, Guitar, Voice, Theory' },
  { name: 'Photography', category: 'Arts', description: 'Digital Photography, Editing' },
  
  // Business
  { name: 'Accounting', category: 'Business', description: 'Financial Accounting, Management Accounting' },
  { name: 'Marketing', category: 'Business', description: 'Digital Marketing, Brand Strategy' },
  { name: 'Business Administration', category: 'Business', description: 'Management, Strategy, Operations' },
  
  // Test Prep
  { name: 'SAT Prep', category: 'Test Prep', description: 'SAT Math, Reading, Writing' },
  { name: 'University Entrance', category: 'Test Prep', description: 'Ethiopian University Entrance Exam' },
  { name: 'IELTS', category: 'Test Prep', description: 'International English Language Testing' },
];

const SAMPLE_TUTORS = [
  {
    name: 'Dr. Abebe Kebede',
    email: 'abebe@tutors.com',
    password: '$2b$12$LQv3c1yqBFVMDRm.C5g8f.zW1NOZZ1jC7qN5vK0mH8KL3pQ2r7T8e', // password123
    role: 'TUTOR' as const,
    profile: {
      bio: 'PhD in Mathematics with 10+ years teaching experience at Addis Ababa University. Specialized in advanced calculus and statistics.',
      location: 'Addis Ababa, Ethiopia',
      experience: 10,
      isVerified: true,
      rating: 4.8,
      totalReviews: 25,
      availability: {
        monday: ['09:00-12:00', '14:00-17:00'],
        tuesday: ['09:00-12:00', '14:00-17:00'],
        wednesday: ['09:00-12:00'],
        thursday: ['09:00-12:00', '14:00-17:00'],
        friday: ['09:00-12:00', '14:00-17:00'],
      },
      subjects: [
        { name: 'Mathematics', hourlyRate: 25, experience: 10 },
        { name: 'Physics', hourlyRate: 23, experience: 8 },
        { name: 'SAT Prep', hourlyRate: 30, experience: 5 },
      ]
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@tutors.com',
    password: '$2b$12$LQv3c1yqBFVMDRm.C5g8f.zW1NOZZ1jC7qN5vK0mH8KL3pQ2r7T8e',
    role: 'TUTOR' as const,
    profile: {
      bio: 'Native English speaker with TESOL certification. Helping Ethiopian students master English for 5+ years.',
      location: 'Addis Ababa, Ethiopia',
      experience: 5,
      isVerified: true,
      rating: 4.9,
      totalReviews: 42,
      availability: {
        monday: ['10:00-15:00'],
        tuesday: ['10:00-15:00'],
        wednesday: ['10:00-15:00'],
        thursday: ['10:00-15:00'],
        friday: ['10:00-15:00'],
        saturday: ['09:00-13:00'],
      },
      subjects: [
        { name: 'English', hourlyRate: 20, experience: 5 },
        { name: 'IELTS', hourlyRate: 28, experience: 4 },
      ]
    }
  },
  {
    name: 'Fikadu Assefa',
    email: 'fikadu@tutors.com',
    password: '$2b$12$LQv3c1yqBFVMDRm.C5g8f.zW1NOZZ1jC7qN5vK0mH8KL3pQ2r7T8e',
    role: 'TUTOR' as const,
    profile: {
      bio: 'Software Engineer at major tech company. Teaching programming and computer science to next generation developers.',
      location: 'Addis Ababa, Ethiopia',
      experience: 7,
      isVerified: true,
      rating: 4.7,
      totalReviews: 18,
      availability: {
        saturday: ['09:00-17:00'],
        sunday: ['09:00-17:00'],
      },
      subjects: [
        { name: 'Programming', hourlyRate: 35, experience: 7 },
        { name: 'Web Development', hourlyRate: 40, experience: 6 },
        { name: 'Computer Science', hourlyRate: 32, experience: 5 },
      ]
    }
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create subjects
    console.log('📚 Creating subjects...');
    for (const subject of SUBJECTS) {
      await prisma.subject.upsert({
        where: { name: subject.name },
        update: subject,
        create: subject,
      });
    }
    console.log(`✅ Created ${SUBJECTS.length} subjects`);

    // 2. Create sample tutors
    console.log('👨‍🏫 Creating sample tutors...');
    for (const tutorData of SAMPLE_TUTORS) {
      const { profile, ...userData } = tutorData;
      
      // Create user
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData,
      });

      // Create tutor profile
      const tutorProfile = await prisma.tutorProfile.upsert({
        where: { userId: user.id },
        update: {
          bio: profile.bio,
          location: profile.location,
          experience: profile.experience,
          isVerified: profile.isVerified,
          rating: profile.rating,
          totalReviews: profile.totalReviews,
          availability: JSON.stringify(profile.availability),
          education: JSON.stringify([]), // Empty for now
        },
        create: {
          userId: user.id,
          bio: profile.bio,
          location: profile.location,
          experience: profile.experience,
          isVerified: profile.isVerified,
          rating: profile.rating,
          totalReviews: profile.totalReviews,
          availability: JSON.stringify(profile.availability),
          education: JSON.stringify([]),
        },
      });

      // Create subject relationships
      for (const subjectData of profile.subjects) {
        const subject = await prisma.subject.findUnique({
          where: { name: subjectData.name },
        });

        if (subject) {
          await prisma.tutorSubject.upsert({
            where: {
              tutorId_subjectId: {
                tutorId: tutorProfile.id,
                subjectId: subject.id,
              },
            },
            update: {
              hourlyRate: subjectData.hourlyRate,
              experience: subjectData.experience,
            },
            create: {
              tutorId: tutorProfile.id,
              subjectId: subject.id,
              hourlyRate: subjectData.hourlyRate,
              experience: subjectData.experience,
            },
          });
        }
      }
    }
    console.log(`✅ Created ${SAMPLE_TUTORS.length} sample tutors`);

    // 3. Create a sample student
    console.log('👨‍🎓 Creating sample student...');
    const student = await prisma.user.upsert({
      where: { email: 'student@test.com' },
      update: {},
      create: {
        name: 'Meron Tadesse',
        email: 'student@test.com',
        password: '$2b$12$LQv3c1yqBFVMDRm.C5g8f.zW1NOZZ1jC7qN5vK0mH8KL3pQ2r7T8e', // password123
        role: 'STUDENT',
      },
    });

    await prisma.studentProfile.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        grade: 'Grade 12',
      },
    });

    // Add some subjects to student
    const mathSubject = await prisma.subject.findUnique({ where: { name: 'Mathematics' } });
    const englishSubject = await prisma.subject.findUnique({ where: { name: 'English' } });
    
    if (mathSubject && englishSubject) {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: student.id } });
      if (studentProfile) {
        await prisma.studentSubject.upsert({
          where: {
            studentId_subjectId: { studentId: studentProfile.id, subjectId: mathSubject.id },
          },
          update: {},
          create: {
            studentId: studentProfile.id,
            subjectId: mathSubject.id,
            level: 'Advanced',
          },
        });

        await prisma.studentSubject.upsert({
          where: {
            studentId_subjectId: { studentId: studentProfile.id, subjectId: englishSubject.id },
          },
          update: {},
          create: {
            studentId: studentProfile.id,
            subjectId: englishSubject.id,
            level: 'Intermediate',
          },
        });
      }
    }

    console.log('✅ Created sample student');

    const subjectCount = await prisma.subject.count();
    const tutorCount = await prisma.user.count({ where: { role: 'TUTOR' } });
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Database Statistics:`);
    console.log(`   - ${subjectCount} subjects across multiple categories`);
    console.log(`   - ${tutorCount} verified tutors ready to teach`);
    console.log(`   - ${studentCount} students ready to learn`);
    console.log('\n🔐 Test Accounts:');
    console.log('   Tutors: abebe@tutors.com, sarah@tutors.com, fikadu@tutors.com');
    console.log('   Student: student@test.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});