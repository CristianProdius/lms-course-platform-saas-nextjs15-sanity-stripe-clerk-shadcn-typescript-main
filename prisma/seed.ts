import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const aiCategory = await prisma.category.upsert({
    where: { slug: 'artificial-intelligence' },
    update: {},
    create: {
      title: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      description: 'Learn about AI, machine learning, and deep learning',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    },
  });

  const webDevCategory = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      title: 'Web Development',
      slug: 'web-development',
      description: 'Frontend and backend web development',
      imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
    },
  });

  // Create instructors
  const instructor1 = await prisma.instructor.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      bio: 'AI expert with 10+ years of experience in machine learning and deep learning.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      website: 'https://johndoe.ai',
      social: {
        twitter: '@johndoe',
        linkedin: 'john-doe-ai',
      },
    },
  });

  const instructor2 = await prisma.instructor.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      bio: 'Full-stack developer and educator specializing in modern web technologies.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
      website: 'https://janesmith.dev',
      social: {
        twitter: '@janesmith',
        github: 'janesmith',
      },
    },
  });

  // Create courses
  const aiCourse = await prisma.course.upsert({
    where: { slug: 'master-ai-in-5-days' },
    update: {},
    create: {
      title: 'Master AI in 5 Days',
      slug: 'master-ai-in-5-days',
      description: 'A comprehensive course to learn artificial intelligence fundamentals and practical applications.',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
      price: 299.00,
      currency: 'USD',
      isPublished: true,
      isFree: false,
      level: 'beginner',
      duration: 2400, // 40 hours
      categoryId: aiCategory.id,
      instructorId: instructor1.id,
      objectives: [
        'Understand AI fundamentals',
        'Build machine learning models',
        'Implement deep learning algorithms',
        'Deploy AI applications',
      ],
      prerequisites: [
        'Basic programming knowledge',
        'High school mathematics',
      ],
      tags: ['AI', 'Machine Learning', 'Deep Learning', 'Python'],
    },
  });

  const reactCourse = await prisma.course.upsert({
    where: { slug: 'modern-react-development' },
    update: {},
    create: {
      title: 'Modern React Development',
      slug: 'modern-react-development',
      description: 'Learn React 18+ with hooks, context, and modern patterns.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
      price: 199.00,
      currency: 'USD',
      isPublished: true,
      isFree: false,
      level: 'intermediate',
      duration: 1800, // 30 hours
      categoryId: webDevCategory.id,
      instructorId: instructor2.id,
      objectives: [
        'Master React hooks',
        'Build scalable applications',
        'Implement state management',
        'Optimize performance',
      ],
      prerequisites: [
        'JavaScript fundamentals',
        'Basic HTML/CSS knowledge',
      ],
      tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    },
  });

  // Create modules for AI course
  const aiModule1 = await prisma.module.upsert({
    where: { courseId_orderIndex: { courseId: aiCourse.id, orderIndex: 1 } },
    update: {},
    create: {
      title: 'AI Fundamentals',
      description: 'Introduction to artificial intelligence concepts',
      orderIndex: 1,
      courseId: aiCourse.id,
    },
  });

  const aiModule2 = await prisma.module.upsert({
    where: { courseId_orderIndex: { courseId: aiCourse.id, orderIndex: 2 } },
    update: {},
    create: {
      title: 'Machine Learning Basics',
      description: 'Core machine learning algorithms and concepts',
      orderIndex: 2,
      courseId: aiCourse.id,
    },
  });

  // Create modules for React course
  const reactModule1 = await prisma.module.upsert({
    where: { courseId_orderIndex: { courseId: reactCourse.id, orderIndex: 1 } },
    update: {},
    create: {
      title: 'React Fundamentals',
      description: 'Getting started with React',
      orderIndex: 1,
      courseId: reactCourse.id,
    },
  });

  // Create lessons for AI Module 1
  await prisma.lesson.upsert({
    where: { moduleId_orderIndex: { moduleId: aiModule1.id, orderIndex: 1 } },
    update: {},
    create: {
      title: 'What is Artificial Intelligence?',
      description: 'An introduction to AI concepts and history',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Artificial Intelligence (AI) is a branch of computer science that aims to create machines capable of intelligent behavior.'
              }
            ]
          }
        ]
      },
      vimeoUrl: 'https://vimeo.com/123456789',
      vimeoId: '123456789',
      duration: 15,
      orderIndex: 1,
      moduleId: aiModule1.id,
      isFree: true, // Preview lesson
    },
  });

  await prisma.lesson.upsert({
    where: { moduleId_orderIndex: { moduleId: aiModule1.id, orderIndex: 2 } },
    update: {},
    create: {
      title: 'History of AI',
      description: 'Key milestones in AI development',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'The history of AI spans several decades, from early theoretical work to modern breakthroughs.'
              }
            ]
          }
        ]
      },
      vimeoUrl: 'https://vimeo.com/123456790',
      vimeoId: '123456790',
      duration: 20,
      orderIndex: 2,
      moduleId: aiModule1.id,
      isFree: false,
    },
  });

  // Create lessons for React Module 1
  await prisma.lesson.upsert({
    where: { moduleId_orderIndex: { moduleId: reactModule1.id, orderIndex: 1 } },
    update: {},
    create: {
      title: 'Introduction to React',
      description: 'Getting started with React development',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'React is a popular JavaScript library for building user interfaces.'
              }
            ]
          }
        ]
      },
      vimeoUrl: 'https://vimeo.com/987654321',
      vimeoId: '987654321',
      duration: 18,
      orderIndex: 1,
      moduleId: reactModule1.id,
      isFree: true,
    },
  });

  // Create PrecuityAI platform organization
  const precuityOrg = await prisma.organization.upsert({
    where: { slug: 'precuityai' },
    update: {
      name: 'PrecuityAI',
      description: 'Platform administration organization - Full access to all platform features',
      metadata: {
        isPlatformOrg: true,
        createdBy: 'system',
        features: ['full_access', 'platform_admin', 'all_courses', 'all_organizations']
      }
    },
    create: {
      id: 'precuityai-org',
      name: 'PrecuityAI',
      slug: 'precuityai',
      description: 'Platform administration organization - Full access to all platform features',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
      subscriptionStatus: 'active',
      subscriptionPlan: 'enterprise',
      billingEmail: 'admin@precuityai.com',
      metadata: {
        isPlatformOrg: true,
        createdBy: 'system',
        features: ['full_access', 'platform_admin', 'all_courses', 'all_organizations']
      }
    },
  });

  // Create a demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo-company',
      description: 'A demo organization for testing',
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
      subscriptionStatus: 'active',
      subscriptionPlan: 'premium',
      billingEmail: 'billing@demo-company.com',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log({
    categories: 2,
    instructors: 2,
    courses: 2,
    modules: 3,
    lessons: 3,
    organizations: 2,
    platformOrg: 'PrecuityAI',
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });