import { getWork, rethrowAsUnavailable } from '$lib/server/works';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// 制作実績は CMS で編集するので、プリレンダーせず、表示のたびに PocketBase から読む
export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	let work;
	try {
		work = await getWork(params.slug);
	} catch (cause) {
		rethrowAsUnavailable(cause);
	}
	if (!work) error(404, 'Work not found');
	return { work };
};
