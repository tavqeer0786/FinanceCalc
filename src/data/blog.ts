import { investingBlogs } from './blogs/investing.js';
import { mortgagesBlogs } from './blogs/mortgages.js';
import { taxesBlogs } from './blogs/taxes.js';
import { budgetingBlogs } from './blogs/budgeting.js';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'investing' | 'mortgages' | 'taxes' | 'budgeting';
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  publishedAt: string;
  readTime: string;
  relatedCalculators: { name: string; slug: string }[];
}

export const blogPosts: BlogPost[] = [
  ...investingBlogs,
  ...mortgagesBlogs,
  ...taxesBlogs,
  ...budgetingBlogs
];
