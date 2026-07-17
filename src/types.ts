export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  createdAt: number; // timestamp
  emailSent: boolean;
  emailSentError?: string;
}

export interface EditableCopy {
  ebookTitle: string;
  targetAudience: string;
  headline: string;
  subheadline: string;
  bullets: string[];
  testimonials: {
    text: string;
    author: string;
    role: string;
    rating: number;
    avatarUrl?: string;
  }[];
  aboutHeadline: string;
  aboutBody: string;
  closingHeadline: string;
  closingBody: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
