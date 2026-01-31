export type ContentSourceType =
  | 'PASTED_TEXT'
  | 'URL'
  | 'FILE_AUDIO'
  | 'FILE_VIDEO'
  | 'FILE_PDF'
  | 'GOOGLE_DOC'
  | 'GOOGLE_SHEET'
  | 'YOUTUBE'
  | 'SPOTIFY';

export type StationKind = 'NEWS' | 'LEARNING' | 'PODCAST' | 'MIX' | 'MUSIC_ONLY';

export type EpisodeKind = 'RADIO_SHOW' | 'QUICK_NUDGE' | 'DAILY_BRIEF';

export type MediaProvider = 'TTS' | 'YOUTUBE' | 'SPOTIFY';

export type QueueItem =
  | {
      type: 'TTS';
      title: string;
      audioUrl: string;
      durationMs?: number;
      meta?: Record<string, unknown>;
    }
  | {
      type: 'YOUTUBE';
      title: string;
      videoId: string;
      startSeconds?: number;
      meta?: Record<string, unknown>;
    }
  | {
      type: 'SPOTIFY';
      title: string;
      trackId: string;
      previewUrl?: string;
      externalUrl?: string;
      meta?: Record<string, unknown>;
    };

export type Episode = {
  id: string;
  stationId: string;
  kind: EpisodeKind;
  title: string;
  createdAt: string;
  queue: QueueItem[];
};

