## About this site

This site is Takuya Kometani's portfolio. Built with SvelteKit and TypeScript, it introduces my personal projects and tech stack. This time I adopted AI for development and tried AI-driven development with Gemini CLI and Kiro.

## Choosing the tech

### Why I chose SvelteKit

A big reason I chose SvelteKit is simply that it is my favorite framework. Svelte is designed as an extension of HTML and CSS. I like React too, and being entirely in JS is one of its strengths, but writing Svelte feels like a natural extension of HTML, which I find comfortable.

Another reason is that Svelte compiles down to HTML, CSS, and JavaScript with no overhead. React and Vue need a runtime, which I think is overkill for a small web app. Svelte can also use JavaScript libraries without needing wrappers, which is appealing too.

### Why I didn't use TailwindCSS

I did not adopt TailwindCSS this time. I have always been skeptical of Tailwind: writing styles in class names departs from the principle of semantic separation. And when you need a value that isn't provided, you have to write a JIT (Just-In-Time) arbitrary value, at which point I think you might as well write CSS.

Also, now that generative AI can help, it has become easier to write plain CSS without any custom syntax. I feel this has lowered the barrier to writing traditional CSS considerably.

## AI-driven development in practice

In this project I tried AI-driven development with Gemini CLI and Kiro. In practice, though, the workflow was often to let the AI write the code and then fix about 30% of it by hand.

What was especially hard was that Gemini often wrote Svelte 4 syntax rather than the Svelte 5 (runes) syntax this project uses. And since the AI seemed to know almost nothing about Paraglide JS, I wrote all of the internationalization part myself.

I came to feel that AI-driven development is not fully automated: AI-generated code becomes practical only after a human reviews and fixes it properly. Especially with new versions of libraries and minor libraries, the AI's knowledge often hasn't caught up, so human judgment is essential.

## Implementation details

### An interactive eye-catcher with Three.js/Threlte

For this portfolio I put particular effort into the eye-catcher at the top. Using Three.js (more precisely Threlte, its Svelte implementation), I created a dynamic geometric pattern. It also reacts interactively to user clicks.

It was my first time touching Three.js, so it was a good chance to learn from the basics of 3D graphics. I picked up a lot of new knowledge, such as how WebGL works, the concept of shaders, and coordinate systems in 3D space. I want to make more use of 3D expression on the web from now on.

### Content management with Markdown

Work information is managed in Markdown files. The meta information goes in the front matter, and the body can be read as a technical article.

Managing content in Markdown works very well with Git and makes version control easy. The change history is easy to follow and diffs are clear. I find it simpler than using a CMS and easy for engineers to work with.

For the meta information, I prepared both Japanese and English and achieved internationalization by combining it with Paraglide JS.

## Deployment and infrastructure

### Coolify and choosing Japanese infrastructure

I chose Coolify for deployment because I recently got my own server and run Coolify on it. Vercel is an attractive place to deploy too, but I deliberately chose Coolify because it lets me use Japanese infrastructure.

Japan's growing digital deficit is a social issue I care about as someone in IT. All I can do myself is use open source and try Japanese infrastructure, but if this spreads, I believe it could help address the digital deficit. It is a small individual choice, but I see it as one way to fulfill my social responsibility as an engineer.

## What was hard

What I struggled with during development was design and UI/UX. I have never studied design, so I found sites to use as references and proceeded by feel. Generative AI was, of course, very helpful too.

More than the technical implementation, I realized how hard it is to build an interface that is easy to use and also visually appealing. Design has a lot of intuitive elements and there is no single right answer, so it was a constant cycle of trial and error.

## Outlook

I want to make this portfolio a place to share my work. I plan to gather information about the tools and apps I develop here and grow it into a single platform.

I also intend to put more effort into writing technical articles. By putting the insights I gain from development and my trial-and-error process into words, I want to deepen my own learning and offer content that helps other developers.

I also plan to keep improving this portfolio site itself and use it as a testing ground for new technologies.
