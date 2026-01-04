import { create } from 'zustand';
import type { Content, ListeningHistory, Subscription, Topic } from '../types';

interface ContentStore {
  contents: Content[];
  history: ListeningHistory[];
  likes: string[];
  subscriptions: Subscription[];
  topics: Topic[];
  isLoading: boolean;
  
  setContents: (contents: Content[]) => void;
  addContent: (content: Content) => void;
  updateContent: (id: string, updates: Partial<Content>) => void;
  removeContent: (id: string) => void;
  
  setHistory: (history: ListeningHistory[]) => void;
  addToHistory: (item: ListeningHistory) => void;
  
  setLikes: (likes: string[]) => void;
  toggleLike: (contentId: string) => void;
  
  setSubscriptions: (subscriptions: Subscription[]) => void;
  addSubscription: (subscription: Subscription) => void;
  removeSubscription: (topicId: string) => void;
  
  setTopics: (topics: Topic[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useContentStore = create<ContentStore>((set, get) => ({
  contents: [],
  history: [],
  likes: [],
  subscriptions: [],
  topics: [],
  isLoading: false,

  setContents: (contents: Content[]) => set({ contents }),
  
  addContent: (content: Content) => {
    set((state) => ({ contents: [content, ...state.contents] }));
  },
  
  updateContent: (id: string, updates: Partial<Content>) => {
    set((state) => ({
      contents: state.contents.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },
  
  removeContent: (id: string) => {
    set((state) => ({
      contents: state.contents.filter((c) => c.id !== id),
    }));
  },

  setHistory: (history: ListeningHistory[]) => set({ history }),
  
  addToHistory: (item: ListeningHistory) => {
    set((state) => ({
      history: [item, ...state.history.filter((h) => h.itemId !== item.itemId)],
    }));
  },

  setLikes: (likes: string[]) => set({ likes }),
  
  toggleLike: (contentId: string) => {
    const { likes } = get();
    if (likes.includes(contentId)) {
      set({ likes: likes.filter((id) => id !== contentId) });
    } else {
      set({ likes: [...likes, contentId] });
    }
  },

  setSubscriptions: (subscriptions: Subscription[]) => set({ subscriptions }),
  
  addSubscription: (subscription: Subscription) => {
    set((state) => ({ subscriptions: [...state.subscriptions, subscription] }));
  },
  
  removeSubscription: (topicId: string) => {
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.topicId !== topicId),
    }));
  },

  setTopics: (topics: Topic[]) => set({ topics }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
