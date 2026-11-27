import { getBlogBySlug, getRelatedBlogs } from '$lib/data/blog';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const blog = await getBlogBySlug(params.slug);

  if (!blog || blog.metadata.draft) {
    throw error(404, 'Blog post not found');
  }

  const relatedBlogs = await getRelatedBlogs(blog.metadata, 3);

  return {
    blog,
    relatedBlogs
  };
};
