// Blog post data for zeekay.io
// Personal blog covering 15+ years of work (2010-2025)
// Author: Zach Kelling

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  year: number;
  excerpt: string;
  content: string;
  tags: string[];
  readTime: number;
  featured?: boolean;
}

// Helper to create multi-line content
const md = (strings: TemplateStringsArray, ...values: unknown[]) => {
  return strings.reduce((result, str, i) => result + str + (values[i] ?? ''), '').trim();
};

export const blogPosts: BlogPost[] = [
  // ============================================
  // 2010 - Early Programming
  // ============================================
  {
    slug: 'discovering-the-terminal',
    title: 'Discovering the Terminal',
    date: '2010-03-12',
    year: 2010,
    excerpt: 'My first encounter with the command line and how it changed everything about how I think about computers.',
    tags: ['programming', 'unix', 'personal', 'beginnings'],
    readTime: 6,
    content: md`
# Discovering the Terminal

*March 12, 2010*

There is a moment every programmer remembers - the first time the veil lifts and you see the machine for what it really is. For me, that moment came when I opened a terminal window for the first time.

## The Black Screen

I had been writing code for a while, mostly in IDEs that hid the complexity beneath buttons and menus. But then someone showed me the terminal. A black screen. A blinking cursor. A prompt waiting for instructions.

That's it. That's the whole interface. And yet, from that simple prompt, you can do anything.

## Learning to Speak

The terminal forced me to learn the language of Unix. Not just commands, but a philosophy:

**Everything is a file.** Configuration, devices, processes - all represented as files in a unified namespace.

**Small tools that do one thing well.** grep searches. sort sorts. uniq deduplicates. Chain them together with pipes.

**Text is the universal interface.** Programs communicate through plain text streams. No binary formats, no special protocols. Just text.

## The First Scripts

Once I understood the basics, I started automating everything. Why type the same commands repeatedly when you can write a script?

Simple by today's standards, but revolutionary to me then. I could make the computer do my bidding.

## The Philosophy

What struck me most was the elegance. Unix wasn't designed by a committee or a marketing team. It was designed by programmers, for programmers. Every decision optimized for power and simplicity.

This philosophy would shape everything I built afterward:
- **Simplicity over complexity**
- **Composition over monoliths**
- **Text over binary**
- **Automation over manual work**

## Looking Forward

The terminal opened a door I didn't know existed. Behind it was a world of possibilities - servers to manage, systems to build, problems to solve. I was hooked.

Little did I know where this path would lead.

---

*The terminal remains my primary interface to computers. Some things don't need to change.*
    `,
  },
  {
    slug: 'vim-and-the-art-of-text-editing',
    title: 'Vim and the Art of Text Editing',
    date: '2010-07-28',
    year: 2010,
    excerpt: 'Why I chose Vim and what learning a modal editor taught me about the nature of tools.',
    tags: ['vim', 'tools', 'productivity', 'programming'],
    readTime: 8,
    content: md`
# Vim and the Art of Text Editing

*July 28, 2010*

Every programmer eventually confronts the editor question. For me, the answer was Vim - and it taught me more than just how to edit text.

## The Learning Curve

Vim is infamous for its learning curve. The joke goes: "How do you generate a random string? Put a first-year CS student in front of Vim and ask them to exit."

But the difficulty is the point. Vim is not designed for casual use. It's designed for people who will spend thousands of hours editing text and want to optimize every keystroke.

## Modal Editing

The core insight of Vim is modal editing. Instead of one mode where keys type characters, Vim has multiple modes:

**Normal mode**: Navigate and manipulate text
**Insert mode**: Type characters
**Visual mode**: Select text
**Command mode**: Execute commands

This separation seems awkward at first. But it enables something powerful: in normal mode, every key is a command. No modifier keys needed. You can express complex edits in just a few keystrokes.

## The Grammar of Vim

Vim commands follow a grammar: **verb + modifier + noun**

- d = delete (verb)
- i = inside (modifier)
- w = word (noun)

So diw means "delete inside word" - delete the word under the cursor.

Once you internalize this grammar, you can compose commands you've never used before. The vocabulary is small; the combinations are infinite.

## The Broader Lesson

Vim taught me that the best tools are the ones you invest in learning deeply. Shallow tools give you 80% capability immediately but cap out quickly. Deep tools give you 20% capability initially but no upper bound.

This principle applies beyond editors:
- Learn your shell deeply
- Master your version control
- Understand your build system

The time invested compounds over years.

---

*I've tried other editors. I always come back. Vim is home.*
    `,
  },
  {
    slug: 'building-my-first-open-source-project',
    title: 'Building My First Open Source Project',
    date: '2010-11-15',
    year: 2010,
    excerpt: 'The lessons learned from putting code into the world for others to use and critique.',
    tags: ['open-source', 'programming', 'community', 'learning'],
    readTime: 7,
    content: md`
# Building My First Open Source Project

*November 15, 2010*

Today I pushed my first real open source project to GitHub. It's a small thing - a collection of Vim plugins and shell utilities - but it marks a transition from consumer to contributor.

## Why Open Source?

I had been using open source software for years without thinking much about where it came from. Someone, somewhere, wrote this code and gave it away. Why?

The more I used these tools, the more I wanted to understand. And the best way to understand is to participate.

## The Project

My contribution was modest: a Vim colorscheme and some shell functions I found useful. Nothing revolutionary. But it was mine, and it was public.

The act of making code public forces a different kind of rigor:
- **Documentation matters.** Code without docs is code nobody can use.
- **Names matter.** Public names become permanent.
- **Design matters.** Others will build on your decisions.

## The First Issue

A week after publishing, someone filed an issue. My colorscheme didn't work well on light backgrounds.

My first reaction was defensive. "It's designed for dark backgrounds!" But then I realized: this person took time to try my code, identify a problem, and report it. That's a gift.

I fixed the issue. They thanked me. We had a brief exchange about color theory and terminal emulators. I learned something.

## The Magic of Open Source

This is the magic of open source. Strangers, collaborating across time zones and languages, making things better together.

## What I Learned

**1. Perfect is the enemy of shipped.** I almost didn't publish because the code wasn't perfect. But imperfect code that exists beats perfect code that doesn't.

**2. Community is the product.** The code matters less than the people who gather around it.

**3. Maintenance is work.** Publishing is easy. Maintaining is hard. Every issue needs response, every PR needs review.

---

*Ten years later, I still maintain open source projects. The joy of collaboration never fades.*
    `,
  },

  // ============================================
  // 2011 - Deepening Skills
  // ============================================
  {
    slug: 'javascript-the-good-parts',
    title: 'JavaScript: Finding the Good Parts',
    date: '2011-02-20',
    year: 2011,
    excerpt: 'Learning to love JavaScript by understanding its quirks and embracing its flexibility.',
    tags: ['javascript', 'programming', 'web', 'learning'],
    readTime: 9,
    content: md`
# JavaScript: Finding the Good Parts

*February 20, 2011*

JavaScript has a reputation. It's the language everyone loves to hate. The language of "undefined is not a function". The language of implicit type coercion and callback hell.

But beneath the quirks lies something powerful.

## The Unlikely Champion

JavaScript was designed in 10 days. It shows. The language has rough edges that more carefully designed languages avoided. And yet, JavaScript won.

Why? Because JavaScript is everywhere. It's the only language that runs natively in browsers. And as the web became the platform, JavaScript became the default.

## The Good Parts

Douglas Crockford's "JavaScript: The Good Parts" was revelatory. Instead of defending the whole language, Crockford identified a subset worth using and a larger subset worth avoiding.

The good parts:
- **Functions as first-class values.** Pass them around, return them, store them.
- **Closures.** Functions that remember their environment.
- **Object literals.** Create objects without classes.
- **Prototypal inheritance.** Flexible, if you understand it.

The bad parts:
- **Global variables.** Everything pollutes a single namespace.
- **== vs ===.** Implicit type coercion causes bugs.
- **this binding.** Confusing and context-dependent.

## Looking Forward

JavaScript continues to evolve. ES6 brought classes, arrow functions, destructuring, modules. Each year brings new features that address old pain points.

The language I learned in 2011 is different from the language today. But the core insight remains: JavaScript is what you make of it. Use the good parts, avoid the bad parts, and you can build anything.

---

*JavaScript may not be the best designed language, but it might be the most useful one. That counts for something.*
    `,
  },
  {
    slug: 'contributing-to-handlebars',
    title: 'Contributing to Handlebars.js',
    date: '2011-08-14',
    year: 2011,
    excerpt: 'How I became a contributor to one of the most widely-used JavaScript templating libraries.',
    tags: ['javascript', 'open-source', 'handlebars', 'templating'],
    readTime: 10,
    featured: true,
    content: md`
# Contributing to Handlebars.js

*August 14, 2011*

Handlebars.js was everywhere. Every project seemed to use it for templating. And today, I became a contributor.

## The Problem

I was building a web application that needed to render templates on both server and client. Handlebars was the obvious choice - it worked in Node.js and browsers, had a simple syntax, and was well-documented.

But I hit a bug. A specific edge case in the parser that caused incorrect output. Instead of working around it, I decided to fix it.

## Reading the Source

Understanding Handlebars required understanding how templating engines work:

1. **Parsing**: Convert template string to AST (Abstract Syntax Tree)
2. **Compilation**: Transform AST to executable JavaScript
3. **Rendering**: Execute compiled template with data context

The codebase was well-organized. Yehuda Katz and the other maintainers had created clear separations between parsing, compilation, and runtime.

## The Pull Request

I submitted the PR with:
- A clear description of the bug
- A test case that demonstrated the problem
- The minimal fix
- Explanation of why the fix was correct

Two days later, Yehuda reviewed it. He asked one question about edge cases. I added another test. He merged it.

## What I Learned

**1. Good tests are documentation.** My test case explained the bug better than words could.

**2. Maintainer time is precious.** The easier you make review, the faster you get merged.

**3. Reading code is a skill.** Understanding an unfamiliar codebase is harder than writing new code.

**4. Start with bugs.** Bug fixes are easier to contribute than features. They're usually localized, well-defined, and welcomed.

## The Broader Impact

Handlebars eventually became one of the most downloaded packages on npm. Millions of applications use it. And I played a small part in making it better.

This is what open source is about. Not individual heroics, but collective improvement. Many small contributions adding up to something significant.

---

*Contributing to a widely-used project taught me that my code could matter at scale. That lesson shaped everything that followed.*
    `,
  },
  {
    slug: 'dotfiles-and-developer-experience',
    title: 'Dotfiles and Developer Experience',
    date: '2011-12-03',
    year: 2011,
    excerpt: 'Why I started obsessing over configuration files and what they reveal about personal workflows.',
    tags: ['dotfiles', 'developer-experience', 'productivity', 'unix'],
    readTime: 7,
    content: md`
# Dotfiles and Developer Experience

*December 3, 2011*

Every Unix user accumulates dotfiles - those hidden configuration files that customize your environment. Mine had become a tangled mess. It was time to get organized.

## The Chaos

My home directory was full of configuration:
- .bashrc - shell configuration (1200 lines, no comments)
- .vimrc - editor configuration (800 lines, copied from the internet)
- .gitconfig - version control settings (50 lines, barely understood)
- .tmux.conf - terminal multiplexer (100 lines, cargo culted)

I had no idea what half of it did. Some of it conflicted. None of it was documented.

## The Cleanup

Step one: understand everything. I went through each file, line by line, and either:
- Documented why it existed, or
- Deleted it

This was humbling. So much of my configuration was copied without understanding. Default settings I never changed. Workarounds for problems I no longer had.

What remained was smaller, cleaner, and comprehensible.

## What Dotfiles Reveal

Looking at my dotfiles after the cleanup, I could see my workflow:
- Heavy Vim usage (custom mappings, plugins, colorscheme)
- Git for everything (dozens of aliases)
- Terminal-centric workflow (tmux, shell functions)
- Keyboard-driven navigation (no mouse in terminal)

Your dotfiles are a portrait of how you work.

## The Seed of Ellipsis

This experience planted a seed. Managing dotfiles was a common problem. The tools were fragmented. Maybe there was something to build here.

That thought would eventually become Ellipsis, but not for a few more years.

---

*My dotfiles have evolved dramatically since 2011, but the principles remain: understand everything, document everything, share everything.*
    `,
  },

  // ============================================
  // 2012 - Building Foundations
  // ============================================
  {
    slug: 'the-node-js-revolution',
    title: 'The Node.js Revolution',
    date: '2012-03-18',
    year: 2012,
    excerpt: 'Why server-side JavaScript changed everything about how we think about web development.',
    tags: ['nodejs', 'javascript', 'backend', 'web'],
    readTime: 10,
    content: md`
# The Node.js Revolution

*March 18, 2012*

Node.js was dismissed by many as a toy. JavaScript on the server? Madness. But I was intrigued by what it made possible.

## The Promise

Node's pitch was simple: JavaScript everywhere. Write once, run on client and server. Share code, share knowledge, share libraries.

Beyond language unification, Node offered:
- **Event-driven I/O.** Non-blocking operations for high concurrency.
- **npm.** A package manager designed for sharing.
- **V8.** Google's fast JavaScript engine.

The combination was compelling.

## The Event Loop

Understanding Node required understanding the event loop. Unlike threaded servers that handle requests in parallel, Node uses a single thread with non-blocking I/O.

This sounds limited but is actually powerful:
- No thread synchronization bugs
- Low memory overhead per connection
- Simple mental model

The trick is never blocking. All I/O must be asynchronous.

## Full-Stack JavaScript

Node enabled true full-stack JavaScript:
- React on the frontend
- Node.js on the backend
- MongoDB for storage
- npm for package management

One language, one ecosystem, one mental model. This coherence accelerated everything.

## Looking Forward

Node wasn't perfect. Callback hell was real. The ecosystem was chaotic. Performance didn't always match claims.

But it changed expectations. It proved that JavaScript could be a server language. It proved that event-driven I/O was viable. It proved that developer experience mattered.

The web platform is stronger for it.

---

*Node.js is now mature and stable, but in 2012 it felt revolutionary. That sense of possibility is what drove adoption.*
    `,
  },
  {
    slug: 'introducing-ellipsis',
    title: 'Introducing Ellipsis: A Dotfiles Manager',
    date: '2012-11-08',
    year: 2012,
    excerpt: 'Announcing my first significant open source project - a package manager for dotfiles.',
    tags: ['ellipsis', 'dotfiles', 'open-source', 'shell'],
    readTime: 8,
    featured: true,
    content: md`
# Introducing Ellipsis: A Dotfiles Manager

*November 8, 2012*

Today I'm releasing Ellipsis - a package manager for dotfiles. It's the solution to a problem that's been bugging me for years.

## The Problem

Managing dotfiles is harder than it should be. You want to:
- Version control your configurations
- Sync them across machines
- Share useful bits with others
- Use other people's configurations
- Keep everything organized

Existing solutions were either too simple (just use git) or too complex (entire frameworks with their own syntax).

## The Solution

Ellipsis treats dotfiles like packages. Each package is a git repository with a standard structure. Installing a package clones the repo, runs the install hook, and creates symlinks.

## Key Features

**1. Composable Packages** - Mix and match configurations. Each package is independent. Install what you need.

**2. Hooks for Customization** - Packages can define hooks for install, uninstall, link, and pull. This enables packages to do more than just symlink files.

**3. Built on Git** - Every package is a git repo. You get version history, easy updates, fork and customize, collaboration through pull requests.

**4. No Dependencies** - Ellipsis is pure Bash. No Ruby, no Python, no Node. If you have Bash and Git, you can use Ellipsis.

## Get Started

The project is on GitHub at github.com/ellipsis/ellipsis. Issues, pull requests, and feedback welcome.

---

*Ellipsis started as a personal tool and grew into a community project. That growth taught me about open source sustainability.*
    `,
  },

  // ============================================
  // 2013 - Expanding Horizons
  // ============================================
  {
    slug: 'real-time-web-applications',
    title: 'Real-Time Web Applications',
    date: '2013-02-14',
    year: 2013,
    excerpt: 'Exploring WebSockets, Server-Sent Events, and the architecture of real-time systems.',
    tags: ['websockets', 'real-time', 'web', 'architecture'],
    readTime: 12,
    content: md`
# Real-Time Web Applications

*February 14, 2013*

The web was designed for documents, not applications. You request a page, the server sends it, done. But modern applications need real-time communication. Messages that arrive instantly. Data that updates continuously. Experiences that feel alive.

## Beyond Request/Response

Traditional HTTP is request/response. The client asks, the server answers. But what if the server has something to say without being asked?

Techniques evolved:

**Polling**: The client asks repeatedly, "Anything new?" Wasteful but simple.

**Long polling**: The server holds the request open until there's something to say. Better, but awkward.

**Server-Sent Events (SSE)**: One-way persistent connection from server to client. Simple but limited.

**WebSockets**: Bidirectional persistent connection. Full duplex communication. The real solution.

## Scaling Challenges

Real-time at scale is hard:

**1. Connection limits.** Each WebSocket is a persistent connection. Servers have limits.

**2. State synchronization.** Multiple servers need to share state. Redis pub/sub helps.

**3. Reconnection.** Networks fail. Clients must reconnect gracefully with state recovery.

**4. Message ordering.** Messages can arrive out of order. Sequence numbers help.

## Looking Forward

Real-time is now expected. Users don't accept stale data. Applications must feel instant.

The techniques I learned here - WebSockets, pub/sub, eventually consistent state - would prove essential in everything from e-commerce to blockchain.

---

*Real-time systems are complex, but the user experience they enable is worth the complexity.*
    `,
  },
  {
    slug: 'building-shop-js',
    title: 'Building Shop.js: E-commerce for Developers',
    date: '2013-10-15',
    year: 2013,
    excerpt: 'Creating an open source e-commerce framework that prioritized developer experience.',
    tags: ['shopjs', 'ecommerce', 'open-source', 'javascript'],
    readTime: 10,
    featured: true,
    content: md`
# Building Shop.js: E-commerce for Developers

*October 15, 2013*

Today I'm releasing Shop.js - an open source e-commerce framework built for developers who are tired of fighting their tools.

## The Philosophy

Shop.js isn't a platform you configure - it's a framework you code with. The difference matters.

Platforms hide complexity. This is great until you need to do something they didn't anticipate. Then you're fighting the platform.

Frameworks expose complexity. You write more code, but that code does exactly what you need. When requirements change, you change the code.

## Core Principles

**1. Components, not pages** - Shop.js provides React components. Compose them however you want.

**2. Bring your own backend** - Shop.js doesn't mandate a backend. It provides adapters.

**3. Type-safe by default** - Everything is TypeScript.

**4. Offline-first** - Cart state persists locally. The network is treated as unreliable.

## Open Source

Shop.js is MIT licensed. Use it commercially. Fork it. Contribute back.

---

*Shop.js proved that developer-focused e-commerce tools had an audience. That validation would lead to bigger things.*
    `,
  },

  // ============================================
  // 2014 - Starting Hanzo
  // ============================================
  {
    slug: 'from-startups-to-ai-my-journey-begins',
    title: 'From Startups to AI: My Journey Begins',
    date: '2014-03-15',
    year: 2014,
    excerpt: 'How a passion for building things from scratch led me down the path of entrepreneurship and eventually to the frontier of artificial intelligence.',
    tags: ['startup', 'entrepreneurship', 'personal'],
    readTime: 8,
    featured: true,
    content: md`
# From Startups to AI: My Journey Begins

*March 15, 2014*

There's something intoxicating about building things from nothing. The blank canvas of a new project, the potential energy waiting to be released into the world. This feeling has driven me since I first started programming, and it's what led me to leave the relative safety of a traditional career path to pursue entrepreneurship.

## The Early Days

My journey into tech started, like many others, with curiosity. I remember the first time I saw a command line - it felt like discovering a secret language, a way to speak directly to the machine. That fascination never left me.

By the time I was deep into my career, I had contributed to projects like **Handlebars.js**, one of the most widely-used templating engines in the JavaScript ecosystem. Working on open source taught me something crucial: the best software emerges from collaboration, from the collective intelligence of many minds working toward a common goal.

## Why Startups?

The decision to found my own company wasn't made lightly. I had seen what large organizations could accomplish, but I had also seen their limitations - the bureaucracy, the politics, the glacial pace of decision-making. I wanted to move fast, to iterate quickly, to build things that mattered.

## Looking Forward

As I write this in 2014, the AI landscape is beginning to shift. Deep learning is showing promising results, and I can feel that something big is coming.

This is just the beginning.

---

*This is the first post in what I hope will be a long-running chronicle of building at the intersection of technology and commerce.*
    `,
  },
  {
    slug: 'building-crowdstart-lessons-in-ecommerce',
    title: 'Building Crowdstart: Lessons in E-commerce',
    date: '2014-09-22',
    year: 2014,
    excerpt: 'The challenges and triumphs of building an early e-commerce platform, and what I learned about the intersection of technology and retail.',
    tags: ['ecommerce', 'startup', 'crowdstart'],
    readTime: 10,
    content: md`
# Building Crowdstart: Lessons in E-commerce

*September 22, 2014*

E-commerce in 2014 is at an inflection point. The tools available to merchants are either too simple (limiting customization) or too complex (requiring armies of developers). We set out to build something in between.

## The Problem We Set Out to Solve

Traditional e-commerce platforms treated every store the same. But in reality, a fashion brand has very different needs than an electronics retailer. We needed flexibility without sacrificing usability.

Our approach was component-based. Instead of a monolithic platform, we built a collection of modular pieces.

## Technical Decisions That Mattered

We chose JavaScript as our primary language, both on the frontend and backend. We also bet heavily on real-time capabilities.

## What I Learned

**1. Developer experience matters as much as user experience.**

**2. Performance is a feature.**

**3. The platform is not the product.**

**4. Integrations are essential.**

---

*Crowdstart was our first attempt at solving the e-commerce platform problem. It wouldn't be our last.*
    `,
  },

  // ============================================
  // 2015 - Building Astle.js
  // ============================================
  {
    slug: 'building-astle-js-reactive-javascript',
    title: 'Building Astle.js: Reactive JavaScript',
    date: '2015-08-25',
    year: 2015,
    excerpt: 'Creating a reactive JavaScript framework before React became dominant, and what I learned about framework design.',
    tags: ['javascript', 'reactive', 'framework', 'astle'],
    readTime: 14,
    featured: true,
    content: md`
# Building Astle.js: Reactive JavaScript

*August 25, 2015*

The JavaScript framework landscape in 2015 was chaotic. Angular was complex. Backbone was showing its age. React was emerging but not yet dominant. I saw an opportunity to build something that took the best ideas and left the worst behind.

## The Astle Hypothesis

What if we combined:
- React's virtual DOM and one-way data flow
- Observable streams for state management
- First-class server rendering
- TypeScript for type safety

The result was Astle.js.

## Core Concepts

**1. Reactive Streams** - State was modeled as observable streams.

**2. Virtual DOM** - Efficient updates through diffing.

**3. Automatic Subscriptions** - No manual subscription management.

**4. Server Rendering** - Built in from day one.

## What Worked

**Performance**: The combination was fast.

**Developer Experience**: TypeScript caught errors early.

**Composability**: Everything was just functions.

## What Didn't Work

**Ecosystem**: We had no router, no form library, no dev tools.

**Timing**: React was gaining momentum.

## The Outcome

Astle never reached mass adoption. React won that war. But the project taught me invaluable lessons.

---

*Astle.js is archived now, but its DNA lives on in everything I've built since.*
    `,
  },

  // ============================================
  // 2016 - Genetic Algorithms for Marketing
  // ============================================
  {
    slug: 'marketing-automation-with-genetic-algorithms',
    title: 'Marketing Automation with Genetic Algorithms: The Earle System',
    date: '2016-03-18',
    year: 2016,
    excerpt: 'Exploring the use of evolutionary computation for optimizing marketing campaigns and customer engagement.',
    tags: ['ai', 'marketing', 'genetic-algorithms', 'earle'],
    readTime: 14,
    featured: true,
    content: md`
# Marketing Automation with Genetic Algorithms: The Earle System

*March 18, 2016*

Marketing optimization is fundamentally a search problem. You're looking for the best combination of message, audience, timing, and channel in a vast space of possibilities. Traditional A/B testing explores this space randomly and slowly. We wondered: could evolutionary algorithms do better?

## The Earle System

We called it Earle - an AI marketing system that used genetic algorithms to evolve marketing campaigns over time. The basic idea was simple: treat each campaign configuration as a "genome," measure fitness by conversion rate, and let natural selection find winning combinations.

## How It Worked

**1. Genome Representation**: Each campaign was encoded as a vector of parameters.

**2. Fitness Function**: We measured success through a composite score.

**3. Evolution**: Every day, the system would send campaigns, measure fitness, select top performers, apply crossover and mutation, and replace worst performers.

## Results

After six months of deployment:
- **Average improvement of 47%** in conversion rates vs. baseline
- **3.2x faster** discovery of winning combinations
- **Emergent patterns** we never would have tested manually

## What This Taught Me

This project was my first deep dive into applied machine learning:

- **Domain knowledge matters.**
- **Simple models can beat complex ones.**
- **Explainability has value.**
- **Automation isn't replacement.**

---

*Earle was a proof of concept for AI-powered business optimization.*
    `,
  },
  {
    slug: 'introducing-hanzo-ai-powered-commerce',
    title: 'Introducing Hanzo: AI-Powered Commerce',
    date: '2016-08-08',
    year: 2016,
    excerpt: 'The founding of Hanzo and our vision for bringing artificial intelligence to every aspect of digital commerce.',
    tags: ['hanzo', 'ai', 'startup', 'founding'],
    readTime: 10,
    featured: true,
    content: md`
# Introducing Hanzo: AI-Powered Commerce

*August 8, 2016*

Today, I'm excited to announce Hanzo - a company built on a simple premise: every business deserves access to AI-powered tools that were previously available only to tech giants.

## The Problem

Amazon, Google, Facebook - these companies have AI capabilities that give them enormous advantages. But building these capabilities from scratch is prohibitively expensive. Most businesses simply can't compete.

## Our Solution

Hanzo provides AI-as-a-service for commerce:

**Smart Recommendations**: Personalized product suggestions
**Dynamic Pricing**: Real-time price optimization
**Predictive Analytics**: Forecasting tools
**Automated Support**: Intelligent chatbots
**Fraud Detection**: Real-time prevention

## The Name

"Hanzo" comes from the legendary Japanese warrior known for his intelligence network and strategic thinking.

## Our Vision

We're building toward a future where AI is embedded in every business process. Where small businesses have the same technological capabilities as the largest corporations.

---

*Hanzo launched in beta today.*
    `,
  },

  // ============================================
  // 2017 - Techstars Experience
  // ============================================
  {
    slug: 'hanzo-at-techstars-building-the-future',
    title: "Techstars '17 Experience: Building the Future",
    date: '2017-02-14',
    year: 2017,
    excerpt: 'Our experience in Techstars Boulder 2017 and what we learned about building an AI company at scale.',
    tags: ['hanzo', 'techstars', 'startup', 'accelerator'],
    readTime: 12,
    featured: true,
    content: md`
# Techstars '17 Experience: Building the Future

*February 14, 2017*

We just finished Demo Day at Techstars Boulder 2017, and I wanted to capture some reflections while they're still fresh. The past three months have been the most intense, challenging, and rewarding period of my entrepreneurial journey.

## Why Techstars?

When we applied to Techstars, Hanzo had a working product and early revenue. We weren't looking for validation - we knew we had something real. What we needed was acceleration: faster growth, bigger network, clearer focus.

Techstars delivered on all three.

## The Mentor Madness

The first month is called "Mentor Madness" for a reason. We had over 70 meetings with mentors.

Key feedback that shaped our direction:

**1. Focus on one vertical first.**

**2. AI is the feature, not the product.**

**3. Enterprise sales require enterprise thinking.**

## What We Built

During the program, we rebuilt our pricing model, launched dedicated solutions for fashion and CPG, hired our first sales team, closed our first six-figure enterprise deal, and raised a seed round.

## Lessons Learned

**1. Constraints force creativity.**

**2. Feedback is a gift.**

**3. The network matters more than the check.**

**4. Momentum is everything.**

**5. Take care of yourself.**

---

*Techstars Boulder 2017 was a transformative experience.*
    `,
  },

  // ============================================
  // 2018-2019 - Scaling Hanzo
  // ============================================
  {
    slug: 'scaling-ai-infrastructure-lessons-learned',
    title: 'Scaling Hanzo: AI Infrastructure Lessons',
    date: '2018-07-20',
    year: 2018,
    excerpt: 'The technical and organizational challenges of scaling AI systems from prototype to production at enterprise scale.',
    tags: ['ai', 'infrastructure', 'scaling', 'engineering'],
    readTime: 15,
    featured: true,
    content: md`
# Scaling Hanzo: AI Infrastructure Lessons

*July 20, 2018*

Two years into building Hanzo, we've learned some hard lessons about scaling AI systems. What works in a notebook doesn't work in production. What works with one customer doesn't work with a hundred.

## The Scaling Challenges

**1. Data Pipeline Hell**: Building reliable data pipelines at scale is surprisingly difficult.

**2. Model Serving Nightmares**: Training a model is the easy part. Serving it reliably at scale is where things get interesting.

**3. Feature Store Complexity**: Features computed during training need to be available during inference.

## Organizational Lessons

**1. ML Engineers Are Different**: ML engineering requires a unique skill set.

**2. Research vs. Production Tension**: Researchers want to try new things. Production wants stability.

**3. Documentation Is Survival**: Without excellent documentation, knowledge walks out the door.

## What Worked

**1. Invest in Observability Early**

**2. Automate Everything**

**3. Embrace Experimentation**

**4. Hire for Learning Ability**

---

*Scaling AI systems is a craft that's still being developed.*
    `,
  },
  {
    slug: 'building-teams-that-scale',
    title: 'Building Teams That Scale',
    date: '2019-04-15',
    year: 2019,
    excerpt: 'Lessons learned about hiring, culture, and organizational structure as Hanzo grew from a small team to a real company.',
    tags: ['startup', 'team', 'culture', 'growth'],
    readTime: 13,
    content: md`
# Building Teams That Scale

*April 15, 2019*

Hanzo started as three people in a room. Now we're closing in on fifty. The journey from small team to real company has been humbling.

## The Phases of Growth

**Phase 1: The Founding Team (1-5)**: Everyone does everything.

**Phase 2: The Extended Family (5-15)**: Specialization begins.

**Phase 3: The Dunbar Limit (15-50)**: Real structure becomes necessary.

## What We Learned About Hiring

**1. Hire for trajectory, not position**

**2. Culture fit is real but dangerous**

**3. Technical interviews are necessary but insufficient**

**4. References are gold**

## What We Learned About Culture

**1. Culture is what you do, not what you say**

**2. Transparency scales better than hierarchy**

**3. Autonomy requires alignment**

**4. Celebrate failures, not just successes**

---

*Building teams is as much craft as science.*
    `,
  },

  // ============================================
  // 2020 - Entering Blockchain
  // ============================================
  {
    slug: 'from-commerce-to-blockchain-the-lux-vision',
    title: 'Entering Blockchain: The Lux Vision',
    date: '2020-03-12',
    year: 2020,
    excerpt: 'Why we decided to build a new blockchain protocol and how our commerce experience informed our approach.',
    tags: ['blockchain', 'lux', 'crypto', 'decentralization'],
    readTime: 14,
    featured: true,
    content: md`
# Entering Blockchain: The Lux Vision

*March 12, 2020*

After years of building AI-powered commerce tools, we began asking a fundamental question: what if the infrastructure itself was wrong? What if centralized platforms couldn't deliver the future we wanted?

This question led us to blockchain.

## The Problems We Kept Hitting

**1. Platform Risk**: Our customers were always one policy change away from disaster.

**2. Data Silos**: Customer data was trapped in disconnected systems.

**3. Payment Friction**: International commerce was hobbled by slow, expensive payment rails.

**4. Trust Deficits**: Digital commerce required trusting intermediaries at every step.

## The Lux Architecture

Lux is built on three core innovations:

**1. Snow Consensus**: Near-instant finality without sacrificing decentralization.

**2. Multi-Chain Architecture**: Unlimited specialized chains that share security.

**3. Native Asset Support**: First-class support for custom assets.

## The Vision

Lux isn't just another cryptocurrency. It's infrastructure for a new kind of economy.

---

*Lux represents everything we've learned about building scalable systems, applied to economic infrastructure.*
    `,
  },

  // ============================================
  // 2021 - Building Multi-Chain
  // ============================================
  {
    slug: 'multi-chain-architecture-why-we-built-18-vms',
    title: 'Building Multi-Chain: The Subnet Architecture',
    date: '2021-05-17',
    year: 2021,
    excerpt: "The philosophy and engineering behind Lux's multi-VM architecture.",
    tags: ['blockchain', 'lux', 'virtual-machines', 'architecture'],
    readTime: 13,
    featured: true,
    content: md`
# Building Multi-Chain: The Subnet Architecture

*May 17, 2021*

One of the most common questions we get about Lux: why multiple virtual machines? Why subnets? Isn't one blockchain enough?

The short answer: different problems need different solutions.

## The Limits of Monoculture

Ethereum proved that a general-purpose smart contract platform could support incredible diversity. But it also revealed limits:

- **DeFi needs speed.**
- **Gaming needs low fees.**
- **NFTs need storage.**
- **Enterprise needs privacy.**

## The Multi-VM Philosophy

Lux provides a toolkit of specialized virtual machines:

**1. CoreVM (C-Chain)**: EVM-compatible for Ethereum developers.

**2. Platform VM (P-Chain)**: Handles staking and subnet management.

**3. Exchange VM (X-Chain)**: UTXO-based for asset transfer.

And beyond the core chains, developers can build specialized VMs for any use case.

---

*The multi-chain architecture represents our commitment to building infrastructure that serves diverse needs.*
    `,
  },

  // ============================================
  // 2022 - Post-Quantum Journey
  // ============================================
  {
    slug: 'post-quantum-cryptography-preparing-for-q-day',
    title: 'Post-Quantum Journey: Preparing for Q-Day',
    date: '2022-09-14',
    year: 2022,
    excerpt: 'Why quantum computers threaten current cryptography and how Lux is preparing for a post-quantum world.',
    tags: ['quantum', 'cryptography', 'security', 'lux'],
    readTime: 18,
    featured: true,
    content: md`
# Post-Quantum Journey: Preparing for Q-Day

*September 14, 2022*

Quantum computers will break most of the cryptography that secures the internet and blockchain. This isn't speculation - it's mathematical certainty. The only questions are when and whether we'll be ready.

At Lux, we're not waiting to find out.

## The Quantum Threat

Current public-key cryptography relies on problems that are hard for classical computers but easy for quantum computers.

For blockchain, this means:
- **Signatures become forgeable**
- **Encrypted data becomes readable**
- **Hash functions weaken**

## The Post-Quantum Solutions

Several families of algorithms are believed to be quantum-resistant:

**1. Lattice-based**: CRYSTALS-Kyber, CRYSTALS-Dilithium
**2. Hash-based**: SPHINCS+ for signatures
**3. Code-based**: Classic McEliece

## Lux's Post-Quantum Strategy

**Layer 1: Crypto-Agility** - Pluggable cryptographic schemes

**Layer 2: Hybrid Signatures** - Combining classical and post-quantum

**Layer 3: Key Migration Tools** - Help users migrate to quantum-safe keys

**Layer 4: Research Investment** - Funding post-quantum cryptography research

---

*Post-quantum cryptography is one of the most important technical challenges of our generation.*
    `,
  },

  // ============================================
  // 2023 - AI Meets Blockchain
  // ============================================
  {
    slug: 'zen-ai-training-models-on-decentralized-data',
    title: 'AI Meets Blockchain: The Convergence Thesis',
    date: '2023-04-03',
    year: 2023,
    excerpt: 'Exploring the convergence of AI and blockchain, and introducing Zen - our flagship large language model.',
    tags: ['ai', 'llm', 'zen', 'decentralized', 'hanzo'],
    readTime: 15,
    featured: true,
    content: md`
# AI Meets Blockchain: The Convergence Thesis

*April 3, 2023*

For years, AI and blockchain seemed like separate worlds. One focused on intelligence, the other on coordination. But I've come to believe these worlds are converging, and the intersection will be transformative.

## The Convergence

AI needs blockchain because:
- **Data provenance**: Training data needs verifiable origins
- **Model verification**: Users need proof that models are what they claim
- **Compute markets**: Decentralized compute can reduce concentration
- **Alignment incentives**: Economic mechanisms can align AI development

Blockchain needs AI because:
- **Smart contract intelligence**: AI can make contracts adaptive
- **Governance optimization**: AI can help DAOs make better decisions
- **Security analysis**: AI can detect vulnerabilities
- **User experience**: AI can make blockchain accessible

## Introducing Zen

Today we're announcing Zen - Hanzo's flagship large language model.

**Federated Learning**: Computation comes to the data.

**Differential Privacy**: Mathematical privacy guarantees.

**Decentralized Compute**: Training on a distributed network.

---

*Zen represents years of research into privacy-preserving machine learning.*
    `,
  },
  {
    slug: 'homomorphic-encryption-at-scale',
    title: 'Homomorphic Encryption at Scale',
    date: '2023-10-11',
    year: 2023,
    excerpt: 'How we achieved practical fully homomorphic encryption for AI inference.',
    tags: ['fhe', 'cryptography', 'privacy', 'ai'],
    readTime: 17,
    content: md`
# Homomorphic Encryption at Scale

*October 11, 2023*

For decades, fully homomorphic encryption (FHE) was a theoretical curiosity - computation on encrypted data without ever decrypting it. Beautiful mathematics, impractical performance.

That's changing. At Hanzo, we've achieved FHE inference for production AI workloads.

## What Is Homomorphic Encryption?

Homomorphic encryption allows computation directly on ciphertext:

With these operations, you can compute any function on encrypted data.

## Why It Matters for AI

With FHE:
1. You encrypt your data
2. Server runs model on encrypted data (never sees plaintext)
3. You decrypt the answer

The server learns nothing about your data.

## Our Approach

We attacked the performance problem from multiple angles:

**1. Better Schemes**: TFHE for fast bootstrapping
**2. Custom Hardware**: ASICs for FHE operations
**3. Model Architecture**: FHE-friendly architectures
**4. Algorithmic Improvements**: Client-aided computation, batching

## Results

We've reduced the overhead from 1,000,000x to 40-100x.

---

*FHE represents the future of private computation.*
    `,
  },

  // ============================================
  // 2024 - Zoo Foundation
  // ============================================
  {
    slug: 'agent-frameworks-and-the-future-of-ai',
    title: 'Agent Frameworks and MCP',
    date: '2024-06-22',
    year: 2024,
    excerpt: "How we're building the infrastructure for autonomous AI agents.",
    tags: ['ai', 'agents', 'mcp', 'hanzo'],
    readTime: 14,
    content: md`
# Agent Frameworks and MCP

*June 22, 2024*

The next frontier of AI isn't better models - it's better agents. Systems that can plan, execute, learn, and operate autonomously in the real world.

## From Models to Agents

A language model is a function: text in, text out. An agent is a system: perceive environment, plan actions, execute plans, observe results, repeat.

The difference is profound:
- Models answer questions. Agents solve problems.
- Models process inputs. Agents pursue goals.
- Models are stateless. Agents learn and remember.

## The Agent Architecture

Our agent framework, Jin, is built around several key components:

**1. Perception Layer**: Multi-modal inputs
**2. Memory System**: Working, episodic, semantic, procedural
**3. Planning Engine**: Hierarchical planning, MCTS, reflection
**4. Action Execution**: Code, APIs, browser, files
**5. Learning Loop**: Outcome tracking, skill extraction

## Model Context Protocol

MCP provides a universal protocol for tool interaction. Any tool that implements MCP can be used by any agent.

---

*Agent frameworks represent the next evolution of AI systems.*
    `,
  },
  {
    slug: 'building-zoo-open-ai-research-networks',
    title: 'Zoo Foundation: Open AI Research',
    date: '2024-11-15',
    year: 2024,
    excerpt: 'Announcing Zoo Labs Foundation and our vision for decentralized, community-driven AI research.',
    tags: ['zoo', 'ai', 'research', 'decentralization', 'desci'],
    readTime: 12,
    featured: true,
    content: md`
# Zoo Foundation: Open AI Research

*November 15, 2024*

Today we're announcing Zoo Labs Foundation - an open AI research network dedicated to advancing the frontier of artificial intelligence through decentralized collaboration.

## Why Zoo?

The current AI research landscape has a problem. The most important research happens behind closed doors. Breakthroughs are announced but not explained. Models are deployed but not shared.

This is not how science is supposed to work.

Zoo is our answer: a community-driven research network where:
- Research is open by default
- Compute resources are shared
- Governance is distributed
- Results benefit everyone

## The Zoo Architecture

**1. ZIPs (Zoo Improvement Proposals)**: A formal process for proposing research directions.

**2. Decentralized Compute**: Aggregating resources from contributors.

**3. Open Research Infrastructure**: Federated training, reproducibility tooling, collaborative experimentation.

## Current Research Programs

- Multimodal Foundation Models
- Alignment and Safety
- Efficient Training
- Decentralized ML

---

*Zoo Labs Foundation launches publicly today. Visit zips.zoo.ngo to learn more and get involved.*
    `,
  },

  // ============================================
  // 2025 - The Future
  // ============================================
  {
    slug: 'the-future-vision-2025-and-beyond',
    title: 'The Future: Vision for 2025 and Beyond',
    date: '2025-01-15',
    year: 2025,
    excerpt: 'Reflecting on fifteen years of building and looking forward to what comes next.',
    tags: ['vision', 'future', 'ai', 'blockchain', 'personal'],
    readTime: 16,
    featured: true,
    content: md`
# The Future: Vision for 2025 and Beyond

*January 15, 2025*

Fifteen years ago, I opened a terminal for the first time and discovered a new way of thinking. Since then, I've built dotfiles managers and JavaScript frameworks, e-commerce platforms and AI companies, blockchains and research foundations.

Looking back, I see patterns. Looking forward, I see possibilities.

## What I've Learned

**1. Technology serves people.** The best technology disappears into usefulness.

**2. Open beats closed.** Every bet I've made on openness has paid off.

**3. Timing matters as much as idea.**

**4. Teams matter more than individuals.**

**5. Constraints breed creativity.**

## Where We Are

The convergence I've been working toward for years is finally happening:

**AI** has crossed the threshold from demos to usefulness.

**Blockchain** has matured from speculation to infrastructure.

**Cryptography** is preparing for the quantum transition.

**Open research** is proving its value.

## Where We're Going

### AI That Works For Everyone

I believe in a future where:
- AI training is distributed
- AI inference is private
- AI governance is democratic
- AI benefits are shared

### Finance That Works For Everyone

I believe in a future where:
- Payments are instant and global
- Assets are programmable
- Access is universal
- Privacy is preserved

## What I'm Working On

**1. Decentralized AI Infrastructure**
**2. Quantum-Safe Systems**
**3. Open Research Networks**
**4. Privacy-Preserving Computation**
**5. Economic Infrastructure**

## An Invitation

The future isn't predetermined. It's built by people who show up and do the work.

If you share this vision - of AI that serves humanity, finance that includes everyone, computation that respects privacy - I want to hear from you.

We're hiring at Hanzo, Lux, and Zoo. We're funding research through Zoo Foundation. We're building tools that anyone can use.

The next fifteen years will be more transformative than the last. Let's build them together.

---

*This blog has chronicled fifteen years of building. It will chronicle many more. Thank you for reading.*
    `,
  },
];

// Get post by slug
export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

// Get posts by year
export const getPostsByYear = (year: number): BlogPost[] => {
  return blogPosts.filter(post => post.year === year);
};

// Get featured posts
export const getFeaturedPosts = (): BlogPost[] => {
  return blogPosts.filter(post => post.featured);
};

// Get posts by tag
export const getPostsByTag = (tag: string): BlogPost[] => {
  return blogPosts.filter(post => post.tags.includes(tag.toLowerCase()));
};

// Get all unique tags
export const getAllTags = (): string[] => {
  const tagSet = new Set<string>();
  blogPosts.forEach(post => post.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
};

// Get all years with posts
export const getYearsWithPosts = (): number[] => {
  const yearSet = new Set<number>();
  blogPosts.forEach(post => yearSet.add(post.year));
  return Array.from(yearSet).sort((a, b) => b - a);
};

// Get recent posts
export const getRecentPosts = (count: number = 5): BlogPost[] => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

// Author information
export const author = {
  name: 'Zach Kelling',
  handle: 'zeekay',
  title: 'Founder',
  companies: ['Hanzo AI', 'Lux', 'Zoo Labs Foundation'],
  bio: 'Building at the intersection of AI, blockchain, and decentralized systems.',
  avatar: 'Z',
  social: {
    github: 'https://github.com/zeekay',
    twitter: 'https://x.com/zeekay',
    linkedin: 'https://linkedin.com/in/zeekay',
  },
};
