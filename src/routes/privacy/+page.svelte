<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { CONTACT_EMAIL } from "$lib/data/social";
  import { m } from "$lib/paraglide/messages";
  import { absoluteUrl } from "$lib/utils/seo";
  import type { Snippet } from "svelte";

</script>

<svelte:head>
  <title>{m.privacy_title()} | kamodigi</title>
  <meta name="description" content={m.privacy_description()} />
  <meta property="og:title" content={m.privacy_title()} />
  <meta property="og:description" content={m.privacy_description()} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={absoluteUrl(page.url.pathname)} />
</svelte:head>

<article class="privacy-page">
  <div class="container">
    <h1 class="page-title">{m.privacy_title()}</h1>
    <p>{m.privacy_intro()}</p>

    <section>
      <h2>{m.privacy_operator_heading()}</h2>
      <p>{m.privacy_operator_name()}</p>
    </section>

    <section>
      <h2>{m.privacy_collect_heading()}</h2>
      <p>{m.privacy_collect_contact()}</p>
      <p>{m.privacy_collect_access()}</p>
      <p>{m.privacy_collect_thirdparty()}</p>
    </section>

    <section>
      <h2>{m.privacy_cookie_heading()}</h2>
      <p>{m.privacy_cookie_body()}</p>
    </section>

    <section id="external-transmission">
      <h2>{m.privacy_external_heading()}</h2>
      <p>{m.privacy_external_intro()}</p>

      {#snippet service(
        name: string,
        recipient: string,
        data: string,
        purpose: string,
        policyLink: Snippet,
        optout: string,
        optoutLink: Snippet,
      )}
        <div class="service">
          <h3>{name}</h3>
          <dl>
            <dt>{m.privacy_external_label_recipient()}</dt>
            <dd>{recipient}</dd>
            <dt>{m.privacy_external_label_data()}</dt>
            <dd>{data}</dd>
            <dt>{m.privacy_external_label_purpose()}</dt>
            <dd>{purpose}</dd>
            <dt>{m.privacy_external_label_policy()}</dt>
            <dd>{@render policyLink()}</dd>
            <dt>{m.privacy_external_label_optout()}</dt>
            <dd>{optout}<br />{@render optoutLink()}</dd>
          </dl>
        </div>
      {/snippet}

      <!-- URL は言語に依らないので messages に入れず、ここに直接書く -->
      {#snippet googlePolicy()}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
          >https://policies.google.com/privacy</a
        >
      {/snippet}
      {#snippet gaOptout()}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"
          >https://tools.google.com/dlpage/gaoptout</a
        >
      {/snippet}
      {#snippet adsOptout()}
        <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer"
          >https://myadcenter.google.com/</a
        >
      {/snippet}

      {@render service(
        m.privacy_ga_name(),
        m.privacy_ga_recipient(),
        m.privacy_ga_data(),
        m.privacy_ga_purpose(),
        googlePolicy,
        m.privacy_ga_optout(),
        gaOptout,
      )}
      {@render service(
        m.privacy_adsense_name(),
        m.privacy_adsense_recipient(),
        m.privacy_adsense_data(),
        m.privacy_adsense_purpose(),
        googlePolicy,
        m.privacy_adsense_optout(),
        adsOptout,
      )}

      <p>
        {m.privacy_google_partner()}<br />
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer">https://policies.google.com/technologies/partner-sites</a
        >
      </p>
    </section>

    <section>
      <h2>{m.privacy_contact_heading()}</h2>
      <p>{m.privacy_contact_body()}</p>
      <p><a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a></p>
    </section>

    <section>
      <h2>{m.privacy_changes_heading()}</h2>
      <p>{m.privacy_changes_body()}</p>
    </section>

    <p class="established">{m.privacy_established()}</p>

    <div class="back-link">
      <a href={resolve("/")}>← kamodigi</a>
    </div>
  </div>
</article>

<style>
  .privacy-page {
    padding: var(--space-16) 0;
    line-height: var(--leading-relaxed);
  }

  .page-title {
    font-size: var(--text-4xl);
    font-weight: 700;
    margin-bottom: var(--space-8);
  }

  section {
    margin-top: var(--space-10);
  }

  h2 {
    font-size: var(--text-2xl);
    font-weight: 700;
    margin-bottom: var(--space-4);
  }

  h3 {
    font-size: var(--text-xl);
    font-weight: 700;
    margin-bottom: var(--space-3);
  }

  p + p {
    margin-top: var(--space-3);
  }

  .service {
    margin-top: var(--space-6);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  dl {
    display: grid;
    gap: var(--space-1) var(--space-4);
  }

  dt {
    font-weight: 700;
    margin-top: var(--space-2);
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .service + p {
    margin-top: var(--space-6);
  }

  a {
    color: var(--color-primary-dark);
    overflow-wrap: anywhere;
  }

  .established {
    margin-top: var(--space-10);
    color: var(--color-text-secondary);
  }

  .back-link {
    margin-top: var(--space-12);
    text-align: center;
  }

  .back-link a {
    text-decoration: none;
    font-size: var(--text-lg);
  }
</style>
