import { listWorks, rethrowAsUnavailable } from '$lib/server/works';
import type { PageServerLoad } from './$types';

// 制作実績は CMS で編集するので、プリレンダーせず、表示のたびに PocketBase から読む
export const prerender = false;

export const load: PageServerLoad = async () => {
	try {
		return { works: await listWorks() };
	} catch (cause) {
		rethrowAsUnavailable(cause);
	}
};
