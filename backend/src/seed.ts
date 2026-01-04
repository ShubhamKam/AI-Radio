import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default topics
  const topics = [
    { name: 'Technology', description: 'Tech news and innovations' },
    { name: 'Science', description: 'Scientific discoveries and research' },
    { name: 'Business', description: 'Business and finance news' },
    { name: 'Health', description: 'Health and wellness content' },
    { name: 'Entertainment', description: 'Movies, music, and pop culture' },
    { name: 'Sports', description: 'Sports news and analysis' },
    { name: 'Politics', description: 'Political news and commentary' },
    { name: 'Education', description: 'Learning and educational content' },
    { name: 'Art', description: 'Art, design, and creativity' },
    { name: 'Music', description: 'Music news and discoveries' },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: {},
      create: topic,
    });
  }

  console.log(`✅ Created ${topics.length} topics`);

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@airadio.app' },
    update: {},
    create: {
      email: 'demo@airadio.app',
      password: demoPassword,
      name: 'Demo User',
      preferences: {
        create: {
          preferredTopics: JSON.stringify(['Technology', 'Music', 'Science']),
          preferredFormats: JSON.stringify(['NEWS', 'MUSIC_MIX']),
          autoRefresh: true,
          refreshInterval: 3600,
          notificationsOn: true,
        },
      },
    },
  });

  console.log(`✅ Created demo user: demo@airadio.app (password: demo123)`);

  // Create sample content
  const sampleContent = await prisma.content.upsert({
    where: { id: 'sample-content-1' },
    update: {},
    create: {
      id: 'sample-content-1',
      userId: demoUser.id,
      type: 'TEXT',
      title: 'Welcome to AI Radio',
      transcript: `AI Radio is your intelligent personal radio experience. 
      
      Upload your content - documents, audio files, videos, or even just text - and AI Radio will transform it into engaging radio shows, quick knowledge nudges, and seamless music experiences.
      
      Key features include:
      - Content transcription and analysis using AI
      - Personalized radio show generation
      - YouTube and Spotify integration for music
      - Web research capabilities
      - Knowledge nudges for quick learning
      
      Get started by uploading your first piece of content or connecting your Spotify account!`,
      summary: 'Introduction to AI Radio and its key features for transforming content into engaging radio experiences.',
      topics: JSON.stringify(['Technology', 'Education', 'Music']),
      status: 'READY',
    },
  });

  console.log(`✅ Created sample content`);

  // Create sample radio show
  const sampleShow = await prisma.radioShow.upsert({
    where: { id: 'sample-show-1' },
    update: {},
    create: {
      id: 'sample-show-1',
      title: 'Welcome Show',
      description: 'Your first AI Radio show experience',
      script: `[INTRO MUSIC]

Host: Welcome to AI Radio! I'm your AI host, and today we're going to explore what makes this platform special.

[TRANSITION]

AI Radio transforms your content into engaging radio shows. Whether you upload documents, videos, or audio files, our AI analyzes and creates personalized content just for you.

[KNOWLEDGE NUDGE]

Did you know? The average person consumes over 11 hours of media per day. AI Radio helps you make the most of that time by turning passive content into active learning experiences.

[MUSIC BREAK]

Host: And that's what AI Radio is all about - making information accessible, enjoyable, and personalized. Thanks for tuning in!

[OUTRO]`,
      duration: 180,
      format: 'EDUCATIONAL',
      status: 'SCHEDULED',
      channelId: 'discover',
    },
  });

  // Link content to show
  await prisma.showContent.upsert({
    where: {
      showId_contentId: {
        showId: sampleShow.id,
        contentId: sampleContent.id,
      },
    },
    update: {},
    create: {
      showId: sampleShow.id,
      contentId: sampleContent.id,
    },
  });

  // Create show segments
  const segments = [
    { type: 'INTRO', content: 'Welcome to AI Radio!', duration: 15, order: 0 },
    { type: 'CONTENT', content: 'Main content about AI Radio features', duration: 120, order: 1 },
    { type: 'NUDGE', content: 'Quick fact about media consumption', duration: 15, order: 2 },
    { type: 'OUTRO', content: 'Thanks for tuning in!', duration: 30, order: 3 },
  ];

  for (const segment of segments) {
    await prisma.showSegment.create({
      data: {
        showId: sampleShow.id,
        type: segment.type,
        content: segment.content,
        duration: segment.duration,
        order: segment.order,
        startTime: segments.slice(0, segment.order).reduce((acc, s) => acc + s.duration, 0),
      },
    });
  }

  console.log(`✅ Created sample radio show with segments`);

  // Create knowledge nudges
  const nudges = [
    { text: 'AI can process and understand content 100x faster than humans, making it perfect for content curation.', category: 'Technology' },
    { text: 'Listening to content while doing other activities can increase information retention by up to 40%.', category: 'Education' },
    { text: 'Personalized content recommendations can help you discover topics you never knew you were interested in.', category: 'Technology' },
  ];

  for (const nudge of nudges) {
    await prisma.knowledgeNudge.create({
      data: {
        contentId: sampleContent.id,
        text: nudge.text,
        category: nudge.category,
        duration: 20,
      },
    });
  }

  console.log(`✅ Created ${nudges.length} knowledge nudges`);

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email: demo@airadio.app');
  console.log('  Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
