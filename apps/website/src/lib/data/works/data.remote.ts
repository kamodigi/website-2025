import { prerender } from '$app/server';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { getFeaturedWorks, getWorkBySlug, getWorks } from '.';

export const getWorksRemote = prerender(getWorks)

export const getFeaturedWorksRemote = prerender(v.optional(v.number()) ,async (limit: number = 3) => {
	return await getFeaturedWorks(limit)
})

export const getWorkBySlugRemote = prerender(v.string(), async (slug: string = '') => {
	if (!slug) error(404, 'URL is invalid');
	const work = await getWorkBySlug(slug)
	if (!work) error(404, 'Work not found');
	return work
})