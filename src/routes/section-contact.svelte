<script>
	import { track } from "$lib/analytics";
	import SocialLink from "$lib/components/ui/SoccialLink.svelte";
	import { Socials } from "$lib/data/social";
	import { m } from "$lib/paraglide/messages";
</script>

<section id="contact" class="section contact-section">
	<div class="container container-contact">
		<h2 class="section-title">{m.sections_contact()}</h2>
		<p>Webサイト制作、フロントエンド開発に関するご相談、共同開発のお誘いなど、お気軽にご連絡ください。技術に関するディスカッションやフィードバックも歓迎です！</p>

		<div class="social-links">
			{#each Socials as social (social.label)}
				<SocialLink
					{...social}
					onclick={() => track("contact_click", { link_label: social.label })}
				/>
			{/each}
		</div>
	</div>
</section>

<style>
	.container-contact {
		text-align: center;
	}
	
	.social-links {
		margin-top: var(--space-8);
		display: flex;
		justify-content: center;
		gap: var(--space-6);
		font-size: 2rem; /* アイコンのサイズを調整 */
	}
</style>
