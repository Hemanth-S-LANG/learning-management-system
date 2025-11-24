import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';
import Course from './models/Course.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Starting database seed...');

    // Clear existing data
    await Course.deleteMany({});
    console.log('Cleared existing courses');
    
    // Create multiple teachers
    const teachers = [
      {
        username: 'prof_johnson',
        email: 'johnson@university.edu',
        password: 'teacher123',
        role: 'teacher',
        name: 'Dr. Sarah Johnson'
      },
      {
        username: 'prof_smith',
        email: 'smith@university.edu',
        password: 'teacher123',
        role: 'teacher',
        name: 'Prof. Michael Smith'
      },
      {
        username: 'prof_davis',
        email: 'davis@university.edu',
        password: 'teacher123',
        role: 'teacher',
        name: 'Dr. Emily Davis'
      },
      {
        username: 'prof_wilson',
        email: 'wilson@university.edu',
        password: 'teacher123',
        role: 'teacher',
        name: 'Prof. James Wilson'
      },
      {
        username: 'prof_brown',
        email: 'brown@university.edu',
        password: 'teacher123',
        role: 'teacher',
        name: 'Dr. Lisa Brown'
      }
    ];

    // Create or find teachers
    const createdTeachers = [];
    for (const teacherData of teachers) {
      let teacher = await User.findOne({ email: teacherData.email });
      if (!teacher) {
        teacher = await User.create(teacherData);
        console.log(`Created teacher: ${teacher.name}`);
      } else {
        console.log(`Teacher already exists: ${teacher.name}`);
      }
      createdTeachers.push(teacher);
    }

    // Create sample courses with different teachers
    const courses = [
      {
        name: 'Introduction to Programming',
        code: 'CS101',
        description: 'Learn programming fundamentals with Python. Perfect for beginners.',
        teacher: createdTeachers[0]._id
      },
      {
        name: 'Data Structures',
        code: 'CS102',
        description: 'Master arrays, linked lists, trees, graphs, and hash tables.',
        teacher: createdTeachers[1]._id
      },
      {
        name: 'Algorithms',
        code: 'CS201',
        description: 'Study sorting, searching, dynamic programming, and algorithm analysis.',
        teacher: createdTeachers[2]._id
      },
      {
        name: 'Database Systems',
        code: 'CS202',
        description: 'Learn SQL, database design, normalization, and transactions.',
        teacher: createdTeachers[3]._id
      },
      {
        name: 'Web Development',
        code: 'CS301',
        description: 'Build full-stack web applications with React, Node.js, and MongoDB.',
        teacher: createdTeachers[4]._id
      },
      {
        name: 'Operating Systems',
        code: 'CS302',
        description: 'Understand processes, threads, memory management, and file systems.',
        teacher: createdTeachers[0]._id
      },
      {
        name: 'Machine Learning',
        code: 'CS401',
        description: 'Introduction to ML algorithms, neural networks, and deep learning.',
        teacher: createdTeachers[1]._id
      },
      {
        name: 'Computer Networks',
        code: 'CS402',
        description: 'Study TCP/IP, HTTP, network protocols, and distributed systems.',
        teacher: createdTeachers[2]._id
      },
      {
        name: 'Software Engineering',
        code: 'CS403',
        description: 'Learn software design patterns, testing, and agile methodologies.',
        teacher: createdTeachers[3]._id
      },
      {
        name: 'Artificial Intelligence',
        code: 'CS404',
        description: 'Explore AI concepts, search algorithms, and intelligent agents.',
        teacher: createdTeachers[4]._id
      }
    ];

    await Course.insertMany(courses);
    console.log('\n✅ Sample courses created successfully!');
    console.log('\n📚 Created 10 courses with 5 different teachers');
    console.log('\n👨‍🏫 Teacher accounts (all use password: teacher123):');
    teachers.forEach(t => {
      console.log(`   - ${t.name} (${t.email})`);
    });
    console.log('\n💡 You can login with any of these teacher accounts to manage courses');
    console.log('💡 Or create a new student account to enroll in courses\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
