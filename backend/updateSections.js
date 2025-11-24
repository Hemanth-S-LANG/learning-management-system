import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Course from './models/Course.js';
import User from './models/User.js';

dotenv.config();

const updateCourseSections = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all courses grouped by code
    const courses = await Course.find().populate('teacher', 'username');
    
    // Group courses by code
    const coursesByCode = {};
    courses.forEach(course => {
      if (!coursesByCode[course.code]) {
        coursesByCode[course.code] = [];
      }
      coursesByCode[course.code].push(course);
    });

    // Assign different sections to courses with same code
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (const code in coursesByCode) {
      const coursesWithSameCode = coursesByCode[code];
      
      if (coursesWithSameCode.length > 1) {
        console.log(`\nFound ${coursesWithSameCode.length} courses with code ${code}`);
        
        for (let i = 0; i < coursesWithSameCode.length; i++) {
          const course = coursesWithSameCode[i];
          const newSection = alphabet[i];
          
          course.section = newSection;
          await course.save();
          
          console.log(`  Updated ${course.name} (${course.code}) to Section ${newSection} - Teacher: ${course.teacher.username}`);
        }
      }
    }

    console.log('\n✅ Course sections updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating sections:', error);
    process.exit(1);
  }
};

updateCourseSections();
