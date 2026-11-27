## Background

This site started from a conversation with friends about the 10,000th day since birth. Everyone celebrates their birthday, but I think the exact 10,000th day of your life is also a big milestone. 10,000 days is about 27 years, which for many people is around the time they start working or make important decisions in life.

I wanted to build a site that tells you that special day accurately, taking leap years and the like into account, and that also lets you look back on your life.

## Choosing the tech

### Why I chose SvelteKit

A big reason I chose SvelteKit is simply that it is my favorite framework. Svelte is designed as an extension of HTML and CSS. I like React too, and being entirely in JS is one of its strengths, but writing Svelte feels like a natural extension of HTML, which I find comfortable.

Another reason is that Svelte compiles down to HTML, CSS, and JavaScript with no overhead. React and Vue need a runtime, which I think is overkill for a small web app. Svelte can also use JavaScript libraries without needing wrappers, which is appealing too.

### Internationalization with Paraglide JS

I always intended this site to be multilingual, so I chose the lightweight Paraglide JS. Its API is simple and easy to use, and it integrates smoothly with SvelteKit.

### Why I didn't use TailwindCSS

I did not adopt TailwindCSS this time. I have always been skeptical of Tailwind: writing styles in class names departs from the principle of semantic separation. And when you need a value that isn't provided, you have to write a JIT (Just-In-Time) arbitrary value, at which point I think you might as well write CSS.

Also, now that generative AI can help, it has become easier to write plain CSS without any custom syntax. I feel this has lowered the barrier to writing traditional CSS considerably.

## Implementation details

### Date calculation logic

For the 10,000th-day calculation I decided to use the `luxon` library, whose API is easy to understand. Luxon handles leap years and time zones accurately and absorbs the complexity of date manipulation.

### UI/UX touches

The UI/UX touch I put the most effort into is making an OGP (Open Graph Protocol) card appear when the link is shared. I thought it would be a fun experience if users could easily share their own 10,000th-day birthday. I hope a visually appealing card shown when the link is shared on social media will let more people discover the site.

### Planned features

I plan to implement a "look back on your life" feature. By showing events that happened in the world on the day you were born, your 1,000th day, your 5,000th day, and other milestones, I want to offer an experience where you can overlay your own life on world history.

## Deployment and infrastructure

### Coolify and choosing Japanese infrastructure

I chose Coolify for deployment because I recently got my own server and run Coolify on it. Vercel is an attractive place to deploy too, but I deliberately chose Coolify because it lets me use Japanese infrastructure.

Japan's growing digital deficit is a social issue I care about as someone in IT. All I can do myself is use open source and try Japanese infrastructure, but if this spreads, I believe it could help address the digital deficit. It is a small individual choice, but I see it as one way to fulfill my social responsibility as an engineer.

## What was hard

What I struggled with during development was design and UI/UX. I have never studied design, so I found sites to use as references and proceeded by feel. Generative AI was, of course, very helpful too.

More than the technical implementation, I realized how hard it is to build an interface that is easy to use and also visually appealing. Design has a lot of intuitive elements and there is no single right answer, so it was a constant cycle of trial and error.

## Outlook

I want to explore whether this site can create more value than just showing a 10,000th-day birthday. I want to keep a cycle going: think about what would be a fun experience for users, then build it.

Specifically, I am considering implementing the "look back on your life" feature mentioned above, a feature for users to exchange messages, and an anniversary reminder feature. Through this project, I want to sharpen not only my technical skills but also my ability to design user experiences.
