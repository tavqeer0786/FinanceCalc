import { investingBlogs } from './blogs/investing';
import { mortgagesBlogs } from './blogs/mortgages';
import { taxesBlogs } from './blogs/taxes';
import { budgetingBlogs } from './blogs/budgeting';

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
