import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FeedItem {
  id: string;
  type: 'content' | 'show' | 'nudge';
  title: string;
  description: string | null;
  thumbnail: string | null;
  score: number;
  data: any;
}

export async function getPersonalizedFeed(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: FeedItem[]; total: number }> {
  const skip = (page - 1) * limit;

  // Get user preferences
  const preferences = await prisma.userPreference.findUnique({
    where: { userId },
  });

  const preferredTopics = preferences
    ? JSON.parse(preferences.preferredTopics || '[]')
    : [];
  const preferredFormats = preferences
    ? JSON.parse(preferences.preferredFormats || '[]')
    : [];

  // Get user's liked content for similarity
  const likedContent = await prisma.like.findMany({
    where: { userId },
    include: { content: true },
    take: 20,
  });

  const likedTopics = new Set<string>();
  likedContent.forEach((like) => {
    const topics = JSON.parse(like.content.topics || '[]');
    topics.forEach((t: string) => likedTopics.add(t));
  });

  // Get user's subscribed topics
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: { topic: true },
  });

  subscriptions.forEach((sub) => {
    likedTopics.add(sub.topic.name.toLowerCase());
  });

  // Fetch content
  const allContent = await prisma.content.findMany({
    where: {
      status: 'READY',
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Fetch shows
  const allShows = await prisma.radioShow.findMany({
    where: {
      status: { in: ['SCHEDULED', 'ARCHIVED'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Fetch nudges
  const allNudges = await prisma.knowledgeNudge.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  // Score and rank items
  const feedItems: FeedItem[] = [];

  // Score content
  allContent.forEach((content) => {
    const topics = JSON.parse(content.topics || '[]');
    let score = 0;

    // Topic matching
    topics.forEach((topic: string) => {
      if (likedTopics.has(topic.toLowerCase())) score += 10;
      if (preferredTopics.includes(topic.toLowerCase())) score += 5;
    });

    // Recency bonus
    const ageInDays = (Date.now() - content.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 20 - ageInDays);

    // User's own content bonus
    if (content.userId === userId) score += 15;

    feedItems.push({
      id: content.id,
      type: 'content',
      title: content.title,
      description: content.summary,
      thumbnail: null,
      score,
      data: {
        ...content,
        topics,
      },
    });
  });

  // Score shows
  allShows.forEach((show) => {
    let score = 5;

    // Format preference
    if (preferredFormats.includes(show.format)) score += 10;

    // Recency bonus
    const ageInDays = (Date.now() - show.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 15 - ageInDays);

    feedItems.push({
      id: show.id,
      type: 'show',
      title: show.title,
      description: show.description,
      thumbnail: null,
      score,
      data: show,
    });
  });

  // Score nudges
  allNudges.forEach((nudge) => {
    let score = 3;

    // Category matching
    if (nudge.category && likedTopics.has(nudge.category.toLowerCase())) {
      score += 8;
    }

    feedItems.push({
      id: nudge.id,
      type: 'nudge',
      title: nudge.text.slice(0, 50) + '...',
      description: nudge.text,
      thumbnail: null,
      score,
      data: nudge,
    });
  });

  // Sort by score and add some randomization
  feedItems.sort((a, b) => {
    const randomFactor = Math.random() * 5;
    return b.score + randomFactor - (a.score + randomFactor);
  });

  // Diversify the feed (alternate between types)
  const diversifiedFeed: FeedItem[] = [];
  const itemsByType = {
    content: feedItems.filter((i) => i.type === 'content'),
    show: feedItems.filter((i) => i.type === 'show'),
    nudge: feedItems.filter((i) => i.type === 'nudge'),
  };

  let typeIndex = 0;
  const types: ('content' | 'show' | 'nudge')[] = ['content', 'show', 'nudge'];

  while (diversifiedFeed.length < feedItems.length) {
    const type = types[typeIndex % types.length];
    const item = itemsByType[type].shift();
    
    if (item) {
      diversifiedFeed.push(item);
    }
    
    typeIndex++;

    // Safety check
    if (Object.values(itemsByType).every((arr) => arr.length === 0)) {
      break;
    }
  }

  return {
    data: diversifiedFeed.slice(skip, skip + limit),
    total: diversifiedFeed.length,
  };
}

export async function refreshUserFeed(userId: string): Promise<void> {
  // This would be called periodically to refresh the user's feed
  // Could update a cached feed in Redis or similar
  console.log(`Refreshing feed for user ${userId}`);
}
