// Public landing page: hero, how it works, features, SDG impact and footer.
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, EyeOff, Activity, Eye, BarChart3, Sparkles, Users, Send, ClipboardCheck, Wrench, Star,
  CheckCircle2, Bell, Check,
} from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import { Button } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const L = STRINGS.landing;
const STEP_ICONS = [Send, ClipboardCheck, Wrench, Star];
const FEATURE_ICONS = [EyeOff, Activity, Eye, BarChart3, Sparkles, Users];
const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.5 } };

const Nav = () => {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border/60 bg-surface/75 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={ROUTES.HOME}><Logo /></Link>
        <nav className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          <a href="#how" className="transition-colors hover:text-ink">{L.nav.how}</a>
          <a href="#features" className="transition-colors hover:text-ink">{L.nav.features}</a>
          <a href="#sdg" className="transition-colors hover:text-ink">{L.nav.sdg}</a>
        </nav>
        <Link to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
          <Button size="sm" iconRight={ArrowRight}>{user ? L.nav.dashboard : L.nav.login}</Button>
        </Link>
      </div>
    </header>
  );
};

// A product mockup made of plain UI pieces (no image files needed).
const HeroMock = () => (
  <motion.div initial={{ opacity: 0, y: 30, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
    className="relative mx-auto w-full max-w-md [perspective:1000px]">
    <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" />
    <div className="rounded-card border border-surface-border bg-surface p-5 shadow-pop">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ink-faint">{L.mock.id}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success ring-1 ring-inset ring-success-border">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />{STRINGS.statuses.resolved}
        </span>
      </div>
      <p className="mt-2 font-semibold text-ink">{L.mock.title}</p>
      <p className="text-xs text-ink-muted">{L.mock.department}</p>
      <ol className="mt-5 space-y-4">
        {L.mock.steps.map((s, i) => (
          <motion.li key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.15 }} className="relative flex items-center gap-3">
            {i < L.mock.steps.length - 1 && <span className="absolute left-[11px] top-6 h-5 w-px bg-primary-muted" />}
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${i === 3 ? 'bg-success text-ink-inverse' : 'bg-primary-soft text-primary'}`}>
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-sm text-ink-soft">{s}</span>
            <span className="text-xs text-ink-faint">{L.mock.times[i]}</span>
          </motion.li>
        ))}
      </ol>
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2.5">
        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-star text-star" />)}
        <span className="ml-1 text-xs text-ink-muted">{L.mock.rating}</span>
      </div>
    </div>
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.3 }}
      className="absolute -right-4 -top-6 hidden items-center gap-2.5 rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 shadow-lift sm:flex">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary"><Bell className="h-4 w-4" /></span>
      <span className="text-xs font-medium text-ink">{L.mock.notif}</span>
    </motion.div>
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}
      className="absolute -bottom-14 -left-8 hidden rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-lift sm:block">
      <p className="text-xs text-ink-muted">{L.mock.statLabel}</p>
      <p className="text-xl font-semibold text-ink">{L.mock.statValue}</p>
    </motion.div>
  </motion.div>
);

const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,theme(colors.surface.border)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.surface.border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
    <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
      <div>
        <motion.span {...fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary-muted bg-surface px-3 py-1 text-xs font-medium text-primary shadow-soft">
          <Sparkles className="h-3.5 w-3.5" />{L.badge}
        </motion.span>
        <motion.h1 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {L.title}<br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{L.titleHighlight}</span>
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">{L.subtitle}</motion.p>
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8 flex flex-wrap gap-3">
          <Link to={ROUTES.LOGIN}><Button size="lg" iconRight={ArrowRight} className="shadow-glow">{L.ctaPrimary}</Button></Link>
          <a href="#how"><Button size="lg" variant="outline">{L.ctaSecondary}</Button></a>
        </motion.div>
        <motion.ul {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          {L.trust.map((t) => <li key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" />{t}</li>)}
        </motion.ul>
      </div>
      <HeroMock />
    </div>
  </section>
);

const SectionHead = ({ title, subtitle }) => (
  <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
    <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
    <p className="mt-3 text-ink-muted">{subtitle}</p>
  </motion.div>
);

const HowItWorks = () => (
  <section id="how" className="scroll-mt-16 border-y border-surface-border bg-surface py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHead title={L.howTitle} subtitle={L.howSubtitle} />
      <div className="relative grid gap-8 md:grid-cols-4">
        <div className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-gradient-to-r from-primary-muted via-primary to-primary-muted md:block" />
        {L.steps.map((s, i) => {
          const Icon = STEP_ICONS[i];
          return (
            <motion.div key={s.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative text-center">
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-primary shadow-lift ring-1 ring-surface-border">
                <Icon className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-ink-inverse">{i + 1}</span>
              </span>
              <h3 className="mt-5 font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="scroll-mt-16 py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHead title={L.featuresTitle} subtitle={L.featuresSubtitle} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {L.features.map((f, i) => {
          const Icon = FEATURE_ICONS[i];
          return (
            <motion.div key={f.title} {...fadeUp} transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group rounded-card border border-surface-border bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-accent-soft text-primary transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

const Sdg = () => (
  <section id="sdg" className="scroll-mt-16 border-y border-surface-border bg-surface py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHead title={L.sdgTitle} subtitle={L.sdgSubtitle} />
      <div className="grid gap-5 md:grid-cols-3">
        {L.sdgs.map((g, i) => (
          <motion.div key={g.number} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative overflow-hidden rounded-card border border-surface-border bg-gradient-to-br from-surface to-surface-muted p-7 shadow-card">
            <span className="absolute -right-3 -top-6 text-[7rem] font-bold leading-none text-primary/[0.07]">{g.number}</span>
            <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-ink-inverse">{L.sdgLabel(g.number)}</span>
            <h3 className="mt-4 text-lg font-semibold text-ink">{g.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{g.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CallToAction = () => (
  <section className="py-24">
    <motion.div {...fadeUp} className="relative mx-auto max-w-4xl overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary to-accent px-6 py-14 text-center shadow-glow sm:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.surface.DEFAULT/18%),transparent_50%)]" />
      <ShieldCheck className="mx-auto h-10 w-10 text-ink-inverse/90" />
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink-inverse">{L.ctaTitle}</h2>
      <p className="mx-auto mt-3 max-w-lg text-ink-inverse/80">{L.ctaText}</p>
      <Link to={ROUTES.LOGIN}><Button size="lg" variant="outline" className="mt-8 border-transparent" iconRight={ArrowRight}>{L.ctaPrimary}</Button></Link>
    </motion.div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-surface-border bg-surface">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
      <div className="flex items-center gap-3">
        <Logo compact />
        <div>
          <p className="text-sm font-semibold text-ink">{STRINGS.app.name}</p>
          <p className="text-xs text-ink-muted">{STRINGS.app.tagline}</p>
        </div>
      </div>
      <nav className="flex gap-6 text-sm text-ink-muted">
        <a href="#how" className="hover:text-ink">{L.footerLinks.how}</a>
        <a href="#features" className="hover:text-ink">{L.footerLinks.features}</a>
        <Link to={ROUTES.LOGIN} className="hover:text-ink">{L.footerLinks.login}</Link>
      </nav>
      <p className="text-xs text-ink-faint">{STRINGS.app.copyright(new Date().getFullYear())}</p>
    </div>
  </footer>
);

const Landing = () => (
  <div className="min-h-screen bg-surface">
    <Nav />
    <main>
      <Hero />
      <HowItWorks />
      <Features />
      <Sdg />
      <CallToAction />
    </main>
    <Footer />
  </div>
);
export default Landing;
