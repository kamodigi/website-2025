import { getAllWorkSlugs, getWorkBySlug } from '$lib/data/works';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const slugs = await getAllWorkSlugs();
	return slugs.map(slug => ({ slug: slug }));
}

// 作品名は h1 と <title> に使う。リモート関数の結果はプリレンダーの時点で解決しないので、
// 作品名だけをここで返し、プリレンダーした HTML に作品名が入るようにする
export const load: PageServerLoad = async ({ params }) => {
	const work = await getWorkBySlug(params.slug);
	return { workTitle: work?.metadata.title ?? null };
};
