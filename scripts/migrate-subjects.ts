// Migration script to move from JSON subjects to relational model
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMMON_SUBJECTS = [
  { name: 'Mathematics', category: 'STEM' },
  { name: 'Physics', category: 'STEM' },
  { name: 'Chemistry', category: 'STEM' },
  { name: 'Biology', category: 'STEM' },
  { name: 'English', category: 'Language' },
  { name: 'Amharic', category: 'Language' },
  { name: 'History', category: 'Social Studies' },
  { name: 'Geography', category: 'Social Studies' },
  { name: 'Economics', category: 'Social Studies' },
  { name: 'Computer Science', category: 'Technology' },
  { name: 'Programming', category: 'Technology' },
];

async function migrateSubjects() {
  console.log('🚀 Starting subject migration...');

  try {
    // 1. Create common subjects
    console.log('📚 Creating common subjects...');
    for (const subject of COMMON_SUBJECTS) {
      await prisma.subject.upsert({
        where: { name: subject.name },
        update: {},
        create: subject,
      });
    }

    // 2. Get all tutors with existing subjects
    const tutors = await prisma.tutorProfile.findMany({
      include: { user: true },
    });

    console.log(`👨‍🏫 Migrating ${tutors.length} tutors...`);

    for (const tutor of tutors) {
      try {
        // Legacy path: if a legacy JSON 'subjects' field exists, parse; otherwise skip
        const existingSubjects = Array.isArray((tutor as any).subjects)
          ? (tutor as any).subjects
          : typeof (tutor as any).subjects === 'string'
          ? JSON.parse((tutor as any).subjects)
          : [];
        
        for (const subjectName of existingSubjects) {
          if (typeof subjectName === 'string' && subjectName.trim()) {
            // Find or create subject
            const subject = await prisma.subject.upsert({
              where: { name: subjectName.trim() },
              update: {},
              create: {
                name: subjectName.trim(),
                category: 'General',
              },
            });

            // Create tutor-subject relationship
            await prisma.tutorSubject.upsert({
              where: {
                tutorId_subjectId: {
                  tutorId: tutor.id,
                  subjectId: subject.id,
                },
              },
              update: {},
              create: {
                tutorId: tutor.id,
                subjectId: subject.id,
                hourlyRate: 0,
                experience: tutor.experience || 0,
              },
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to migrate tutor ${tutor.id}:`, error);
      }
    }

    // 3. Migrate students
    const students = await prisma.studentProfile.findMany();
    console.log(`👨‍🎓 Migrating ${students.length} students...`);

    for (const student of students) {
      try {
        const existingSubjects = Array.isArray((student as any).subjects)
          ? (student as any).subjects
          : typeof (student as any).subjects === 'string'
          ? JSON.parse((student as any).subjects)
          : [];
        
        for (const subjectName of existingSubjects) {
          if (typeof subjectName === 'string' && subjectName.trim()) {
            const subject = await prisma.subject.upsert({
              where: { name: subjectName.trim() },
              update: {},
              create: {
                name: subjectName.trim(),
                category: 'General',
              },
            });

            await prisma.studentSubject.upsert({
              where: {
                studentId_subjectId: {
                  studentId: student.id,
                  subjectId: subject.id,
                },
              },
              update: {},
              create: {
                studentId: student.id,
                subjectId: subject.id,
              },
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to migrate student ${student.id}:`, error);
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateSubjects().catch(console.error);
}

export { migrateSubjects };