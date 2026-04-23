'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
  BookOpen, MessageSquare, ArrowRight, Megaphone, ArrowUp,
  Zap, Users, Tag, Shield, Star, ChevronRight
} from 'lucide-react';

// ─── Floating orb background ────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {/* Large primary orb */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float1 12s ease-in-out infinite',
        }}
      />
      {/* Right accent orb */}
      <div
        className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full opacity-[0.15] dark:opacity-[0.08]"
        style={{
          background: 'radial-gradient(circle, #818cf8 0%, #c084fc 50%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float2 16s ease-in-out infinite',
        }}
      />
      {/* Bottom orb */}
      <div
        className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 dark:opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, #4f46e5 0%, #7c3aed 60%, transparent 80%)',
          filter: 'blur(70px)',
          animation: 'float3 20s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -30px) scale(1.05); }
          66%       { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-50px, 40px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(30px, -40px) scale(1.04); }
          70%       { transform: translate(-15px, 20px) scale(0.96); }
        }
      `}</style>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon, title, desc, delay = '0ms',
}: { icon: React.ReactNode; title: string; desc: string; delay?: string }) {
  return (
    <div
      className="group relative p-6 rounded-2xl border border-gray-200/60 dark:border-white/5
        bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm
        hover:border-brand-300 dark:hover:border-brand-700/50
        hover:shadow-xl hover:shadow-brand-500/5
        transition-all duration-300 cursor-default"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 mb-4 group-hover:scale-110 transition-transform duration-200">
        <span className="text-brand-600 dark:text-brand-400">{icon}</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Mock query card ──────────────────────────────────────────────────────────
function MockQueryCard({
  title, tag, votes, replies, delay = '0ms',
}: { title: string; tag: string; votes: number; replies: number; delay?: string }) {
  return (
    <div
      className="flex gap-3 p-4 rounded-xl border border-gray-200/70 dark:border-white/5
        bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm
        hover:border-brand-300/60 dark:hover:border-brand-700/40 transition-all duration-200"
      style={{ animationDelay: delay }}
    >
      {/* Votes */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 w-8">
        <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 tabular-nums">{votes}</span>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug mb-2">{title}</p>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
          <span className="px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40">
            #{tag}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare className="w-2.5 h-2.5" />{replies} replies
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent">
        {value}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

// ─── Main landing ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/queries');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) return null; // avoid flash

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#08080d] overflow-x-hidden">
      <FloatingOrbs />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 border-b border-gray-200/60 dark:border-white/5 bg-white/70 dark:bg-[#08080d]/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm shadow-brand-600/40">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Query<span className="text-brand-500">Book</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1 text-sm">
            <a href="#features" className="px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Features</a>
            <a href="#how-it-works" className="px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm shadow-brand-600/30"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-5 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800/50 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          Academic Q&amp;A — reimagined
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.05]">
          Ask. Answer.{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-brand-500 via-violet-500 to-brand-400 bg-clip-text text-transparent">
              Advance.
            </span>
            {/* Underline glow */}
            <span
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full opacity-40"
              style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)' }}
            />
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
          A Reddit-style academic platform where students ask questions, faculty post
          announcements, and knowledge flows freely — with threaded replies and live voting.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
              bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white
              shadow-lg shadow-brand-600/30 transition-all duration-150"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
              border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150"
          >
            Sign in
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-10 mt-16 pt-10 border-t border-gray-200/60 dark:border-white/5">
          <StatPill value="∞" label="Questions" />
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
          <StatPill value="3" label="Roles" />
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
          <StatPill value="↑↓" label="Voting" />
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
          <StatPill value="∞" label="Nesting" />
        </div>
      </section>

      {/* ── Live preview (mock UI) ── */}
      <section className="relative max-w-5xl mx-auto px-5 pb-24">
        {/* Glow behind the card */}
        <div
          className="absolute inset-x-16 top-4 h-full rounded-3xl opacity-20 dark:opacity-[0.15] -z-10"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, #6366f1 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Browser chrome mockup */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-white/[0.08] bg-white/80 dark:bg-[#0f0f18]/80 backdrop-blur-sm shadow-2xl shadow-black/10 dark:shadow-black/60 overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/60 dark:border-white/5 bg-gray-50/80 dark:bg-white/[0.03]">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <div className="flex-1 mx-4 h-5 rounded-md bg-gray-200/70 dark:bg-white/[0.06] flex items-center px-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">querybook.app/queries</span>
            </div>
          </div>
          {/* Nav mock */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-white/5 bg-white/60 dark:bg-transparent">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-brand-600" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">Query<span className="text-brand-500">Book</span></span>
            </div>
            <div className="flex gap-1 text-[10px]">
              <span className="px-2 py-1 rounded-md bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium">Queries</span>
              <span className="px-2 py-1 rounded-md text-gray-400 hover:text-gray-600">Announcements</span>
            </div>
            <div className="ml-auto w-5 h-5 rounded-full bg-brand-500 opacity-80" />
          </div>
          {/* Body */}
          <div className="p-4 space-y-2.5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-brand-500" /> Queries
                <span className="text-gray-400 font-normal ml-1">142 questions</span>
              </span>
              <span className="text-[10px] px-2 py-1 rounded-lg bg-brand-600 text-white font-semibold">+ Ask</span>
            </div>

            <MockQueryCard
              title="How do I implement a Red-Black Tree insertion with rotation balancing?"
              tag="data-structures"
              votes={24}
              replies={7}
            />
            <MockQueryCard
              title="What's the difference between process and thread in OS scheduling?"
              tag="operating-systems"
              votes={18}
              replies={12}
            />
            <MockQueryCard
              title="Why does gradient descent get stuck in local minima for deep networks?"
              tag="machine-learning"
              votes={31}
              replies={5}
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Everything your class needs
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-md mx-auto text-sm">
            Built for academic communities — from Q&amp;A to announcements with role-based access.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={<ArrowUp className="w-5 h-5" />}
            title="Upvote & Downvote"
            desc="Surface the best answers with Reddit-style voting. Net score ranked in real time."
            delay="0ms"
          />
          <FeatureCard
            icon={<MessageSquare className="w-5 h-5" />}
            title="Threaded Replies"
            desc="Infinite nested replies with collapsible thread lines, just like Reddit."
            delay="60ms"
          />
          <FeatureCard
            icon={<Megaphone className="w-5 h-5" />}
            title="Faculty Announcements"
            desc="Faculty-only post access for announcements. Students read and stay informed."
            delay="120ms"
          />
          <FeatureCard
            icon={<Tag className="w-5 h-5" />}
            title="Tag System"
            desc="Multi-tag queries and filter feeds by tag. Admins manage the tag taxonomy."
            delay="180ms"
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5" />}
            title="Role-Based Access"
            desc="Student, Faculty, and Admin roles with context-sensitive permissions."
            delay="240ms"
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5" />}
            title="Instant Search"
            desc="Debounced full-text search across queries and announcements. No page reloads."
            delay="300ms"
          />
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Three steps to answers
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-px bg-gray-200/60 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-200/60 dark:border-white/5">
          {[
            { n: '01', title: 'Register', desc: 'Create an account as a student or faculty member in seconds.' },
            { n: '02', title: 'Post a Query', desc: 'Ask your question, add relevant tags, and submit to the community.' },
            { n: '03', title: 'Get Answers', desc: 'Receive threaded replies, votes surface the best answer to the top.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="p-8 bg-white/80 dark:bg-[#0f0f18]/80 backdrop-blur-sm hover:bg-gray-50/90 dark:hover:bg-white/[0.03] transition-colors">
              <span className="text-3xl font-extrabold text-brand-500/30 dark:text-brand-500/20">{n}</span>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-2 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div
          className="relative rounded-3xl overflow-hidden p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #8b5cf6 100%)',
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.3) 0%, transparent 60%)',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Ready to get your questions answered?
            </h2>
            <p className="text-indigo-200 mb-8 max-w-md mx-auto">
              Join your academic community on QueryBook today.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm
                bg-white text-brand-700 hover:bg-gray-50 active:scale-[0.98]
                shadow-xl shadow-black/20 transition-all duration-150"
            >
              Create free account
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200/60 dark:border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Query<span className="text-brand-500">Book</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Academic Q&A Platform
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <Link href="/login" className="hover:text-brand-500 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-brand-500 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
