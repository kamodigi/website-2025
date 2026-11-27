import { query } from '$app/server';
import { listWorks, rethrowAsUnavailable } from '$lib/server/works';

/**
 * トップページの WORKS の欄が、ブラウザから呼ぶ（トップページはプリレンダーのまま、制作実績だけを表示のたびに読む）。
 * PocketBase に届かないときは 503 になり、欄にだけエラーの文が出る
 */
export const getWorks = query(async () => {
	try {
		return await listWorks();
	} catch (cause) {
		rethrowAsUnavailable(cause);
	}
});
