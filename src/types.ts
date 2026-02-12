
export enum Category {
  TECHNOLOGY = 'Tecnologia',
  SCIENCE = 'Ciência',
  BIOLOGY = 'Biologia',
  ASTRONOMY = 'Astronomia',
  HEALTH = 'Saúde e Bem-estar',
  ENTERTAINMENT = 'Entretenimento',
  CURIOSITIES = 'Curiosidades',
  HISTORY = 'História',
  CULTURA = 'Cultura',
  PSYCHOLOGY = 'Psicologia',
  INNOVATION = 'Inovação',
  SUSTAINABILITY = 'Sustentabilidade',
  OUTSIDE_WORLD = 'Mundo fora',
  NERD_FACTS = 'Fatos Nerd',
  EDUCATION = 'Educação',
  AI_GENERATED = 'Laboratório AI',
  BIG_DATA = 'Big Data'
}

export interface AcademicMetrics {
  citations: number;
  altmetricScore: number;
  viewCount: number;
  downloadCount: number;
}

export interface JournalMeta {
  doi: string;
  issn: string;
  volume: number;
  issue: number;
  receivedDate: string;
  acceptedDate: string;
}

export type ArticleStatus = 'published' | 'draft' | 'under_review' | 'scheduled' | 'archived';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorId?: string;
  authorAvatarUrl?: string;
  date: string;
  category: Category;
  imageUrl: string;
  readTime: number;
  status: ArticleStatus;
  metrics: AcademicMetrics;
  journalMeta: JournalMeta;
  likes?: number;
  views?: number;
  tags?: string[];
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

// BIG DATA TYPES
export type EventType = 'leitura_iniciada' | 'leitura_concluida' | 'download_recurso' | 'pesquisa_realizada' | 'clique_referencia';

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  contentId: string;
  category: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AggregatedImpact {
  totalEvents: number;
  retentionRate: number; // % conclusão de leitura
  topCategories: { category: string; count: number }[];
  searchTrends: string[];
  educationalEfficiency: number; // Escala 0-100 baseada em downloads/leitura
}

export type CommentStatus = 'pending' | 'approved' | 'spam';

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  author: string;
  content: string;
  date: string;
  status: CommentStatus;
  sentiment?: 'Positivo' | 'Neutro' | 'Negativo';
}

export interface BlogSettings {
  name: string;
  description: string;
  impactFactor: string;
  hIndex: number;
  contactEmail: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

export type UserRole = 'admin' | 'editor' | 'author';

export interface BlogUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  joinedDate: string;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetId?: string;
  targetType?: string;
  date: string;
}

export type ResourceType = 'Ficha' | 'Plano de Aula' | 'Experiência' | 'Manual';

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  subject: string;
  isLocal: boolean;
  isLowCost?: boolean;
  fileSize: string;
  downloadUrl: string;
}

export type FootnoteType = 'correction' | 'supplementary_link' | 'insight';
export type FootnoteStatus = 'pending' | 'approved' | 'rejected';

export interface Footnote {
  id: string;
  articleId: string;
  author: string;
  content: string;
  type: FootnoteType;
  status: FootnoteStatus;
  date: string;
  referenceText?: string; // Text fragment the footnote refers to
}
