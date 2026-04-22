import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crown,
  type LucideIcon,
} from "lucide-react";

const siteUrl = "https://invinciblecrm.com";

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type SeoStat = {
  value: string;
  label: string;
};

export type SeoPainPoint = {
  title: string;
  description: string;
};

export type SeoWorkflowStep = {
  title: string;
  description: string;
};

export type SeoRelatedLink = {
  href: string;
  label: string;
  description: string;
};

type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: {
    href: string;
    label: string;
  };
  secondaryCta: {
    href: string;
    label: string;
  };
  heroHighlights: string[];
  heroStats: SeoStat[];
  painPoints: SeoPainPoint[];
  solutionTitle: string;
  solutionDescription: string;
  solutionBullets: string[];
  featureTitle: string;
  featureDescription: string;
  features: SeoFeature[];
  workflowTitle: string;
  workflowDescription: string;
  workflowSteps: SeoWorkflowStep[];
  faqs: SeoFaq[];
  relatedLinks: SeoRelatedLink[];
};

type StructuredDataOptions = {
  slug: string;
  pageTitle: string;
  description: string;
  faqs: SeoFaq[];
  featureTitles: string[];
};

export function buildLandingStructuredData({
  slug,
  pageTitle,
  description,
  faqs,
  featureTitles,
}: StructuredDataOptions) {
  const pageUrl = `${siteUrl}/${slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: pageTitle,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Invincible CRM",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: pageUrl,
        description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        featureList: featureTitles,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

export function SeoLandingPage({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  heroHighlights,
  heroStats,
  painPoints,
  solutionTitle,
  solutionDescription,
  solutionBullets,
  featureTitle,
  featureDescription,
  features,
  workflowTitle,
  workflowDescription,
  workflowSteps,
  faqs,
  relatedLinks,
}: SeoLandingPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[#3d2a08] opacity-40 blur-[100px]" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#2f684a] opacity-30 blur-[100px]" />
        <div className="absolute left-1/2 top-[20%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-[#7f4b21] opacity-20 blur-[120px]" />
        <div className="cinematic-grid opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/register" className="cinematic-top-link">
              Start free
            </Link>
            <Link href="/book-demo" className="cinematic-top-link cinematic-top-link-strong">
              Book demo
            </Link>
          </div>
        </div>

        <section className="grid gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.36em] text-gold/60">
                  {eyebrow}
                </p>
                <p className="text-sm text-white/55">Invincible CRM</p>
              </div>
            </div>

            <h1 className="mt-8 font-serif text-4xl leading-tight text-white lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              {description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {heroHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-gold/15 bg-gold/10 px-4 py-2 text-sm font-medium text-gold/85"
                >
                  {highlight}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href={primaryCta.href} className="cinematic-enter-button">
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>

          <aside className="cinematic-panel rounded-[2rem] p-6 lg:p-8">
            <p className="cinematic-label text-gold/45">What changes after setup</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/55">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-gold/15 bg-gold/[0.05] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold/55">
                Why teams switch
              </p>
              <p className="mt-3 text-base leading-7 text-white/70">
                Invincible CRM is built for teams that want follow-up discipline, structured records,
                and less copy-paste work between chats, calls, and pipeline updates.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="cinematic-label text-gold/45">Pain points</p>
            <h2 className="font-serif text-3xl text-white lg:text-5xl">
              The same problems keep slowing teams down
            </h2>
            <p className="max-w-xl text-base leading-7 text-white/60">
              These pages are not about vanity traffic. They are about real buying intent from teams
              that already know their current workflow is leaking deals.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {painPoints.map((painPoint) => (
              <div
                key={painPoint.title}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <h3 className="text-lg font-semibold text-white">{painPoint.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/58">{painPoint.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-gold/15 bg-gold/[0.05] p-6 lg:p-8">
            <p className="cinematic-label text-gold/45">The Invincible fix</p>
            <h2 className="mt-4 font-serif text-3xl text-white lg:text-5xl">
              {solutionTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/67">{solutionDescription}</p>

            <div className="mt-6 space-y-3">
              {solutionBullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <p className="text-sm leading-7 text-white/72">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="cinematic-label text-gold/45">Feature fit</p>
            <h2 className="mt-4 font-serif text-3xl text-white lg:text-5xl">
              {featureTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
              {featureDescription}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/15 bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-8">
          <p className="cinematic-label text-gold/45">How it flows</p>
          <h2 className="mt-4 font-serif text-3xl text-white lg:text-5xl">
            {workflowTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/60">
            {workflowDescription}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-sm font-semibold text-gold">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/58">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="cinematic-label text-gold/45">FAQ</p>
            <h2 className="mt-4 font-serif text-3xl text-white lg:text-5xl">
              Questions teams ask before they switch
            </h2>

            <div className="mt-8 space-y-4">
              {faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6"
                >
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-gold/15 bg-gold/[0.05] p-6 lg:p-8">
              <p className="cinematic-label text-gold/45">Next move</p>
              <h2 className="mt-4 font-serif text-3xl text-white">Turn this traffic into pipeline</h2>
              <p className="mt-4 text-base leading-8 text-white/65">
                If someone lands on this page, they are already problem aware. The next job is to
                make evaluation easy and give them a fast path into your product.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/book-demo" className="cinematic-enter-button">
                  Book a demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  Start free
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 lg:p-8">
              <p className="cinematic-label text-gold/45">Related pages</p>
              <div className="mt-6 space-y-4">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/20 hover:bg-gold/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">{link.label}</p>
                        <p className="mt-2 text-sm leading-7 text-white/55">{link.description}</p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gold" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
