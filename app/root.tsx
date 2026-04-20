"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronRight,
  IconMenu,
  IconPaw,
  IconSearch,
  IconShield,
  IconSyringe,
  IconX
} from "@/components/icons";

function useAnimatedCount(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (target > 0) started.current = false;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current || target <= 0) return;
        started.current = true;
        const start = performance.now();

        function animate(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(target * eased));
          if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [duration, target]);

  return { count, ref };
}

const marketingLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#stories", label: "Stories" },
  { href: "/lost-pets", label: "Lost Pets" },
  { href: "/care-guide", label: "Care Guide" }
];

const steps = [
  {
    number: "01",
    title: "Register your pet",
    description: "Create a digital profile with pet details, owner info, and barangay registration data.",
    icon: IconPaw,
    color: "#1B4F8A"
  },
  {
    number: "02",
    title: "Get protected with QR",
    description: "Each registered pet gets a unique QR identity that helps finders connect with owners faster.",
    icon: IconShield,
    color: "#2A9D8F"
  },
  {
    number: "03",
    title: "Respond as a community",
    description: "Lost pet alerts, sightings, and reunions move faster when neighbors can help in real time.",
    icon: IconAlertTriangle,
    color: "#E76F51"
  }
];

const features = [
  {
    title: "Barangay pet registry",
    description: "A clean digital record for every registered pet, ready for staff review and verification.",
    icon: IconPaw,
    color: "#1B4F8A"
  },
  {
    title: "Vaccination tracking",
    description: "Track due dates, history, and compliance with reminders that help owners stay up to date.",
    icon: IconSyringe,
    color: "#2A9D8F"
  },
  {
    title: "Lost pet alerts",
    description: "Broadcast lost reports quickly so nearby residents can act while the search window is still fresh.",
    icon: IconAlertTriangle,
    color: "#E76F51"
  },
  {
    title: "QR-based identity",
    description: "A safer way to connect found pets to their owners without depending on social posts alone.",
    icon: IconShield,
    color: "#F59E0B"
  },
  {
    title: "Searchable records",
    description: "Look up pets, reports, and identifiers in one place with a simpler community search flow.",
    icon: IconSearch,
    color: "#52B788"
  },
  {
    title: "Reunion updates",
    description: "Keep the community informed from the moment a pet goes missing until it comes home.",
    icon: IconCheck,
    color: "#3B82F6"
  }
];

const testimonials = [
  {
    name: "Maria Santos",
    location: "Brgy. Poblacion",
    avatar: "MS",
    color: "#E76F51",
    text: "AlagaLahat made our lost pet response feel organized. The QR profile and alert system gave people enough detail to help immediately."
  },
  {
    name: "Juan Dela Cruz",
    location: "Brgy. San Jose",
    avatar: "JD",
    color: "#2A9D8F",
    text: "The vaccination reminders are simple but super helpful. It feels like a system made for real pet owners, not just paperwork."
  },
  {
    name: "Ana Reyes",
    location: "Brgy. Santa Cruz",
    avatar: "AR",
    color: "#1B4F8A",
    text: "From an admin perspective, the platform is easier to understand and much better than relying on manual logs and scattered messages."
  }
];

const quickHighlights = [
  "Free for community members",
  "Works on mobile browsers",
  "Supports barangay operations",
  "Built for faster reunions"
];

export default function LandingPage() {
  const [stats, setStats] = useState({ pets: 0, reunited: 0, members: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStory, setActiveStory] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = getSupabaseClient();
        const [petsRes, reunitedRes, membersRes] = await Promise.all([
          supabase.from("pets").select("id", { count: "exact", head: true }).neq("status", "Rejected"),
          supabase.from("lost_pet_reports").select("id", { count: "exact", head: true }).eq("status", "Found"),
          supabase.from("profiles").select("id", { count: "exact", head: true })
        ]);

        setStats({
          pets: petsRes.count || 0,
          reunited: reunitedRes.count || 0,
          members: membersRes.count || 0
        });
      } catch (error) {
        console.error("Failed to load landing page stats:", error);
      }
    }

    void loadStats();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStory((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const petsCounter = useAnimatedCount(stats.pets);
  const reunitedCounter = useAnimatedCount(stats.reunited);
  const membersCounter = useAnimatedCount(stats.members);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(59,130,246,0.10), transparent 28%), linear-gradient(180deg, #F8FBFF 0%, #F4F7FB 38%, #FFFFFF 100%)"
      }}
    >
      <header className="landing-header">
        <div className="landing-header-shell">
          <Link href="/" className="landing-brand" aria-label="AlagaLahat home">
            <span className="landing-brand-mark">
              <IconPaw size={18} />
            </span>
            <span className="landing-brand-text">
              <strong>AlagaLahat</strong>
              <span>Community Pet Safety Network</span>
            </span>
          </Link>

          <nav className="landing-nav" aria-label="Landing navigation">
            {marketingLinks.map((link) => (
              <Link key={link.href} href={link.href} className="landing-nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="landing-actions">
            <Button variant="ghost" asChild href="/login" style={buttonGhostStyle}>
              <span>Log in</span>
            </Button>
            <Button variant="primary" asChild href="/register" style={buttonPrimaryStyle}>
              <span>Get Started</span>
            </Button>
            <button
              type="button"
              className="landing-menu-btn"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <IconX size={20} /> : <IconMenu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="landing-mobile-sheet">
          <div className="landing-mobile-card">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="landing-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="landing-mobile-cta">
              <Button variant="outline" asChild href="/login" style={{ width: "100%" }}>
                <span>Log in</span>
              </Button>
              <Button variant="primary" asChild href="/register" style={{ width: "100%" }}>
                <span>Sign up</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <main>
        <section className="landing-hero">
          <div className="container landing-hero-grid">
            <div className="landing-hero-copy">
              <div className="landing-pill">
                <span className="landing-pill-dot" />
                Trusted by barangay pet owners and local staff
              </div>

              <h1 className="landing-hero-title">
                A cleaner, smarter way to
                <span> protect pets in your community.</span>
              </h1>

              <p className="landing-hero-text">
                AlagaLahat helps barangays register pets, track records, send lost-pet alerts,
                and make reunions faster through a modern digital experience.
              </p>

              <div className="landing-hero-cta">
                <Button variant="primary" size="lg" asChild href="/register" style={buttonPrimaryStyle}>
                  <span style={ctaLabelStyle}>
                    Register Your Pet <IconChevronRight size={16} />
                  </span>
                </Button>
                <Button variant="outline" size="lg" asChild href="/lost-pets/report" style={buttonOutlineStyle}>
                  <span>Report a Lost Pet</span>
                </Button>
              </div>

              <div className="landing-highlight-list">
                {quickHighlights.map((item) => (
                  <span key={item} className="landing-highlight-chip">
                    <span className="landing-highlight-check">
                      <IconCheck size={12} />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="landing-hero-visual">
              <div className="landing-device-card">
                <div className="landing-device-header">
                  <div className="landing-pet-summary">
                    <span className="landing-pet-avatar">
                      <IconPaw size={18} />
                    </span>
                    <div>
                      <p>Bantay</p>
                      <span>AGL-00421 • Aspin • Male</span>
                    </div>
                  </div>
                  <span className="landing-status-badge">Verified</span>
                </div>

                <div className="landing-device-grid">
                  <div className="landing-device-panel">
                    <span>Registration</span>
                    <strong>Active</strong>
                    <small>Barangay profile synced</small>
                  </div>
                  <div className="landing-device-panel">
                    <span>Vaccines</span>
                    <strong>Up to date</strong>
                    <small>Next due in 24 days</small>
                  </div>
                  <div className="landing-device-panel landing-device-panel-wide">
                    <span>Community alert</span>
                    <strong>Finder scan detected</strong>
                    <small>Owner notified and reunification flow started</small>
                  </div>
                </div>

                <div className="landing-device-footer">
                  <div>
                    <span>Last update</span>
                    <strong>2 minutes ago</strong>
                  </div>
                  <div>
                    <span>Support type</span>
                    <strong>QR + Alerts</strong>
                  </div>
                </div>
              </div>

              <div className="landing-floating-card landing-floating-card-left">
                <strong>12 new pet registrations</strong>
                <span>This week across partner barangays</span>
              </div>

              <div className="landing-floating-card landing-floating-card-right">
                <strong>Lost report shared</strong>
                <span>Broadcast sent to nearby residents</span>
              </div>
            </div>
          </div>

          <div className="container landing-stats">
            <div ref={petsCounter.ref} className="landing-stat-card">
              <strong>{petsCounter.count.toLocaleString()}</strong>
              <span>Pets Registered</span>
            </div>
            <div ref={reunitedCounter.ref} className="landing-stat-card">
              <strong>{reunitedCounter.count.toLocaleString()}</strong>
              <span>Successful Reunions</span>
            </div>
            <div ref={membersCounter.ref} className="landing-stat-card">
              <strong>{membersCounter.count.toLocaleString()}</strong>
              <span>Community Members</span>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-section">
          <div className="container">
            <div className="landing-section-heading">
              <span className="landing-section-kicker">How it works</span>
              <h2>Designed for owners, helpers, and barangay teams.</h2>
              <p>
                The flow is simple enough for first-time users but strong enough to support a real
                community safety process.
              </p>
            </div>

            <div className="landing-steps-grid">
              {steps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <article key={step.number} className="landing-step-card">
                    <span className="landing-step-number" style={{ background: step.color }}>
                      {step.number}
                    </span>
                    <div className="landing-step-icon" style={{ color: step.color, background: `${step.color}16` }}>
                      <StepIcon size={24} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="features" className="landing-section landing-section-soft">
          <div className="container">
            <div className="landing-section-heading">
              <span className="landing-section-kicker">Platform strengths</span>
              <h2>Built to feel polished, practical, and trustworthy.</h2>
              <p>
                Every section supports the core promise: safer pets, clearer records, and better
                coordination across the barangay.
              </p>
            </div>

            <div className="landing-features-grid">
              {features.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <article key={feature.title} className="landing-feature-card">
                    <div className="landing-feature-icon" style={{ color: feature.color, background: `${feature.color}14` }}>
                      <FeatureIcon size={22} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="container landing-community-band">
            <div>
              <span className="landing-section-kicker">Community coverage</span>
              <h2>When a pet goes missing, speed and clarity matter.</h2>
              <p>
                AlagaLahat combines registration, search, reporting, and public-friendly pet
                profiles so the whole response feels more coordinated.
              </p>
            </div>
            <div className="landing-community-grid">
              <div className="landing-community-card">
                <strong>QR pet identity</strong>
                <span>Lets finders access useful profile info quickly.</span>
              </div>
              <div className="landing-community-card">
                <strong>Lost pet reporting</strong>
                <span>Creates a clearer starting point for neighborhood response.</span>
              </div>
              <div className="landing-community-card">
                <strong>Admin visibility</strong>
                <span>Helps barangay staff review cases and track outcomes.</span>
              </div>
            </div>
          </div>
        </section>

        <section id="stories" className="landing-section landing-section-dark">
          <div className="container landing-stories-grid">
            <div className="landing-stories-copy">
              <span className="landing-section-kicker landing-section-kicker-dark">Community stories</span>
              <h2>People trust tools that make difficult moments feel manageable.</h2>
              <p>
                These examples reflect the kind of calm, guided experience the platform should give
                to owners and staff during urgent situations.
              </p>
            </div>

            <div className="landing-story-card">
              {testimonials.map((story, index) => (
                <div
                  key={story.name}
                  style={{ display: index === activeStory ? "block" : "none" }}
                >
                  <p className="landing-story-quote">&ldquo;{story.text}&rdquo;</p>
                  <div className="landing-story-author">
                    <span className="landing-story-avatar" style={{ background: story.color }}>
                      {story.avatar}
                    </span>
                    <div>
                      <strong>{story.name}</strong>
                      <span>{story.location}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="landing-story-dots">
                {testimonials.map((story, index) => (
                  <button
                    key={story.name}
                    type="button"
                    aria-label={`Show story ${index + 1}`}
                    className={index === activeStory ? "active" : ""}
                    onClick={() => setActiveStory(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="container landing-final-cta">
            <span className="landing-section-kicker">Ready to launch</span>
            <h2>Make the first impression of AlagaLahat feel as strong as the product vision.</h2>
            <p>
              Give pet owners and barangay staff a homepage that clearly explains the value, feels
              modern, and guides them into the right next step.
            </p>
            <div className="landing-final-actions">
              <Button variant="primary" size="lg" asChild href="/register" style={buttonPrimaryStyle}>
                <span style={ctaLabelStyle}>
                  Create an Account <IconChevronRight size={16} />
                </span>
              </Button>
              <Button variant="outline" size="lg" asChild href="/lost-pets" style={buttonOutlineStyle}>
                <span>Explore Lost Pet Reports</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container landing-footer-grid">
          <div>
            <div className="landing-brand landing-footer-brand">
              <span className="landing-brand-mark">
                <IconPaw size={18} />
              </span>
              <span className="landing-brand-text">
                <strong>AlagaLahat</strong>
                <span>Community Pet Safety Network</span>
              </span>
            </div>
            <p className="landing-footer-copy">
              A modern barangay pet platform for registration, protection, search, and safer
              community response.
            </p>
          </div>

          <div className="landing-footer-links">
            <strong>Explore</strong>
            <Link href="/lost-pets">Lost Pet Board</Link>
            <Link href="/care-guide">Care Guide</Link>
            <Link href="/help">Help Center</Link>
          </div>

          <div className="landing-footer-links">
            <strong>Account</strong>
            <Link href="/login">Log in</Link>
            <Link href="/register">Sign up</Link>
            <Link href="/forgot-password">Forgot password</Link>
          </div>

          <div className="landing-footer-links">
            <strong>Contact</strong>
            <span>support@alagalahat.ph</span>
            <span>(02) 8123-4567</span>
            <span>Barangay Hall, Your City</span>
          </div>
        </div>

        <div className="container landing-footer-bottom">
          <span>{new Date().getFullYear()} AlagaLahat. All rights reserved.</span>
          <span>Built for Filipino pet owners and barangay teams.</span>
        </div>
      </footer>

      <style>{`
        .landing-header {
          position: sticky;
          top: 0;
          z-index: 120;
          padding: 16px 0 0;
          background: linear-gradient(180deg, rgba(248,251,255,0.92), rgba(248,251,255,0.65), transparent);
          backdrop-filter: blur(10px);
        }

        .landing-header-shell {
          width: min(1240px, calc(100% - 32px));
          margin: 0 auto;
          padding: 12px 18px;
          border: 1px solid rgba(210, 216, 224, 0.72);
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 18px 50px rgba(16, 24, 48, 0.08);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .landing-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .landing-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, #0052CC, #2A9D8F);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(0, 82, 204, 0.25);
          flex-shrink: 0;
        }

        .landing-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .landing-brand-text strong {
          font-size: 15px;
          color: #122033;
          letter-spacing: -0.02em;
        }

        .landing-brand-text span {
          font-size: 11px;
          color: #667085;
        }

        .landing-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .landing-nav-link {
          padding: 10px 14px;
          border-radius: 999px;
          color: #526071;
          font-size: 14px;
          font-weight: 600;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .landing-nav-link:hover {
          color: #122033;
          background: rgba(0, 82, 204, 0.07);
        }

        .landing-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .landing-menu-btn {
          display: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(210, 216, 224, 0.9);
          background: #fff;
          color: #122033;
          align-items: center;
          justify-content: center;
        }

        .landing-mobile-sheet {
          position: fixed;
          inset: 88px 16px auto;
          z-index: 119;
        }

        .landing-mobile-card {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(210, 216, 224, 0.9);
          border-radius: 24px;
          box-shadow: 0 24px 60px rgba(16, 24, 48, 0.18);
          padding: 18px;
          display: grid;
          gap: 8px;
        }

        .landing-mobile-link {
          padding: 14px 12px;
          border-radius: 14px;
          color: #1A1A2E;
          font-weight: 600;
          background: transparent;
        }

        .landing-mobile-link:hover {
          background: rgba(0, 82, 204, 0.06);
        }

        .landing-mobile-cta {
          display: grid;
          gap: 10px;
          margin-top: 8px;
        }

        .landing-hero {
          padding: 42px 0 32px;
        }

        .landing-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 48px;
          align-items: center;
          min-height: 720px;
        }

        .landing-hero-copy {
          max-width: 620px;
        }

        .landing-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid rgba(0, 82, 204, 0.12);
          background: rgba(255, 255, 255, 0.9);
          color: #345;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
          margin-bottom: 22px;
        }

        .landing-pill-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2ECC71, #2A9D8F);
          box-shadow: 0 0 0 6px rgba(46, 204, 113, 0.12);
        }

        .landing-hero-title {
          margin: 0;
          font-size: clamp(42px, 6.2vw, 74px);
          line-height: 0.98;
          letter-spacing: -0.05em;
          color: #122033;
          max-width: 760px;
        }

        .landing-hero-title span {
          display: block;
          background: linear-gradient(135deg, #0052CC 0%, #2A9D8F 60%, #F59E0B 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .landing-hero-text {
          margin: 24px 0 0;
          font-size: 18px;
          line-height: 1.8;
          color: #5D6B7A;
          max-width: 560px;
        }

        .landing-hero-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 32px;
        }

        .landing-highlight-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .landing-highlight-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(210, 216, 224, 0.8);
          color: #415062;
          font-size: 13px;
          font-weight: 600;
        }

        .landing-highlight-check {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(46, 204, 113, 0.14);
          color: #1E9E5A;
        }

        .landing-hero-visual {
          position: relative;
          min-height: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .landing-device-card {
          width: min(100%, 500px);
          padding: 24px;
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(255,255,255,0.97), rgba(246,249,255,0.98));
          border: 1px solid rgba(210, 216, 224, 0.9);
          box-shadow: 0 30px 80px rgba(16, 24, 48, 0.16);
          position: relative;
          overflow: hidden;
        }

        .landing-device-card::before {
          content: "";
          position: absolute;
          inset: -30% auto auto -10%;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.14), transparent 68%);
          pointer-events: none;
        }

        .landing-device-header {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }

        .landing-pet-summary {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .landing-pet-avatar {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #173b63, #0052CC);
          color: #fff;
          box-shadow: 0 12px 24px rgba(0, 82, 204, 0.2);
          flex-shrink: 0;
        }

        .landing-pet-summary p {
          margin: 0;
          color: #122033;
          font-size: 18px;
          font-weight: 800;
        }

        .landing-pet-summary span {
          font-size: 13px;
          color: #6B7280;
        }

        .landing-status-badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(46, 204, 113, 0.12);
          color: #168653;
          font-size: 12px;
          font-weight: 800;
        }

        .landing-device-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .landing-device-panel {
          padding: 18px;
          border-radius: 20px;
          background: #fff;
          border: 1px solid rgba(210, 216, 224, 0.8);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
        }

        .landing-device-panel-wide {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, rgba(42,157,143,0.10), rgba(59,130,246,0.08));
        }

        .landing-device-panel span,
        .landing-device-footer span {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .landing-device-panel strong,
        .landing-device-footer strong {
          display: block;
          font-size: 18px;
          color: #122033;
          line-height: 1.2;
        }

        .landing-device-panel small {
          display: block;
          margin-top: 6px;
          font-size: 13px;
          line-height: 1.5;
          color: #5D6B7A;
        }

        .landing-device-footer {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .landing-device-footer > div {
          padding: 16px 18px;
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.03);
          border: 1px solid rgba(210, 216, 224, 0.72);
        }

        .landing-floating-card {
          position: absolute;
          z-index: 2;
          padding: 16px 18px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(210, 216, 224, 0.9);
          box-shadow: 0 18px 40px rgba(16, 24, 48, 0.12);
          backdrop-filter: blur(10px);
          max-width: 220px;
        }

        .landing-floating-card strong {
          display: block;
          margin-bottom: 6px;
          color: #122033;
          font-size: 14px;
        }

        .landing-floating-card span {
          display: block;
          color: #64748B;
          font-size: 12px;
          line-height: 1.5;
        }

        .landing-floating-card-left {
          left: -8px;
          top: 72px;
        }

        .landing-floating-card-right {
          right: -8px;
          bottom: 62px;
        }

        .landing-stats {
          margin-top: 60px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          position: relative;
          z-index: 2;
        }

        .landing-stat-card {
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(210, 216, 224, 0.88);
          box-shadow: 0 22px 50px rgba(15, 23, 42, 0.08);
          text-align: center;
        }

        .landing-stat-card strong {
          display: block;
          font-size: clamp(30px, 4vw, 42px);
          line-height: 1;
          color: #122033;
          letter-spacing: -0.03em;
          margin-bottom: 10px;
        }

        .landing-stat-card span {
          color: #667085;
          font-size: 14px;
          font-weight: 700;
        }

        .landing-section {
          padding: 96px 0;
        }

        .landing-section-soft {
          background: linear-gradient(180deg, rgba(0,82,204,0.03), rgba(42,157,143,0.04));
        }

        .landing-section-dark {
          background: linear-gradient(145deg, #112033 0%, #17324E 55%, #0D2036 100%);
          color: #fff;
        }

        .landing-section-heading {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 52px;
        }

        .landing-section-kicker {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(0, 82, 204, 0.09);
          color: #0052CC;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .landing-section-kicker-dark {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .landing-section-heading h2,
        .landing-community-band h2,
        .landing-stories-copy h2,
        .landing-final-cta h2 {
          margin: 18px 0 12px;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: inherit;
        }

        .landing-section-heading p,
        .landing-community-band p,
        .landing-stories-copy p,
        .landing-final-cta p {
          margin: 0;
          font-size: 17px;
          line-height: 1.8;
          color: #627180;
        }

        .landing-section-dark .landing-stories-copy p {
          color: rgba(255,255,255,0.78);
        }

        .landing-steps-grid,
        .landing-features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .landing-step-card,
        .landing-feature-card {
          position: relative;
          padding: 28px;
          border-radius: 26px;
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(210, 216, 224, 0.85);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
        }

        .landing-step-number {
          position: absolute;
          top: 22px;
          right: 22px;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 18px rgba(15, 23, 42, 0.16);
        }

        .landing-step-icon,
        .landing-feature-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .landing-step-card h3,
        .landing-feature-card h3 {
          margin: 0 0 10px;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #122033;
        }

        .landing-step-card p,
        .landing-feature-card p {
          margin: 0;
          font-size: 15px;
          line-height: 1.75;
          color: #637281;
        }

        .landing-community-band {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
          gap: 28px;
          padding: 34px;
          border-radius: 32px;
          background: linear-gradient(135deg, #F8FBFF, #EFF6FF 45%, #F5FFFB);
          border: 1px solid rgba(210, 216, 224, 0.82);
          box-shadow: 0 24px 50px rgba(15, 23, 42, 0.06);
        }

        .landing-community-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          align-self: stretch;
        }

        .landing-community-card {
          padding: 22px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(210, 216, 224, 0.8);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .landing-community-card strong {
          color: #122033;
          font-size: 16px;
        }

        .landing-community-card span {
          color: #64748B;
          font-size: 14px;
          line-height: 1.7;
        }

        .landing-stories-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 28px;
          align-items: center;
        }

        .landing-story-card {
          padding: 32px;
          border-radius: 30px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          box-shadow: 0 28px 70px rgba(0,0,0,0.18);
        }

        .landing-story-quote {
          margin: 0;
          font-size: 22px;
          line-height: 1.8;
          letter-spacing: -0.02em;
          color: #fff;
        }

        .landing-story-author {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 24px;
        }

        .landing-story-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .landing-story-author strong {
          display: block;
          color: #fff;
          font-size: 15px;
        }

        .landing-story-author span {
          display: block;
          color: rgba(255,255,255,0.72);
          font-size: 13px;
        }

        .landing-story-dots {
          display: flex;
          gap: 8px;
          margin-top: 24px;
        }

        .landing-story-dots button {
          width: 10px;
          height: 10px;
          min-width: 10px;
          min-height: 10px;
          border-radius: 999px;
          border: none;
          background: rgba(255,255,255,0.3);
          padding: 0;
          transition: width var(--transition-fast), background var(--transition-fast);
        }

        .landing-story-dots button.active {
          width: 28px;
          background: #fff;
        }

        .landing-final-cta {
          max-width: 920px;
          text-align: center;
          padding: 42px;
          border-radius: 34px;
          background: linear-gradient(135deg, rgba(0,82,204,0.07), rgba(42,157,143,0.08), rgba(245,158,11,0.08));
          border: 1px solid rgba(210, 216, 224, 0.8);
          box-shadow: 0 24px 50px rgba(15, 23, 42, 0.06);
        }

        .landing-final-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
        }

        .landing-footer {
          margin-top: 28px;
          padding: 48px 0 28px;
          background: #101C2C;
          color: rgba(255,255,255,0.75);
        }

        .landing-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr repeat(3, minmax(0, 1fr));
          gap: 28px;
        }

        .landing-footer-brand .landing-brand-text strong,
        .landing-footer-brand .landing-brand-text span {
          color: #fff;
        }

        .landing-footer-copy {
          margin: 18px 0 0;
          max-width: 300px;
          font-size: 14px;
          line-height: 1.8;
          color: rgba(255,255,255,0.7);
        }

        .landing-footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .landing-footer-links strong {
          color: #fff;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .landing-footer-links a,
        .landing-footer-links span {
          color: rgba(255,255,255,0.72);
          font-size: 14px;
        }

        .landing-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 13px;
          color: rgba(255,255,255,0.58);
        }

        @media (max-width: 1120px) {
          .landing-nav {
            display: none;
          }

          .landing-menu-btn {
            display: inline-flex;
          }

          .landing-header-shell {
            border-radius: 24px;
          }

          .landing-hero-grid,
          .landing-stories-grid,
          .landing-community-band,
          .landing-footer-grid {
            grid-template-columns: 1fr;
          }

          .landing-steps-grid,
          .landing-features-grid,
          .landing-community-grid,
          .landing-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .landing-floating-card-left,
          .landing-floating-card-right {
            position: static;
            max-width: none;
            margin-top: 14px;
          }

          .landing-hero-visual {
            min-height: auto;
            display: block;
          }
        }

        @media (max-width: 820px) {
          .landing-header {
            padding-top: 12px;
          }

          .landing-header-shell {
            width: min(100% - 24px, 1240px);
            padding: 12px 14px;
          }

          .landing-brand-text span {
            display: none;
          }

          .landing-actions .btn:not(.landing-menu-btn) {
            display: none;
          }

          .landing-hero {
            padding-top: 28px;
          }

          .landing-hero-grid {
            gap: 28px;
            min-height: auto;
          }

          .landing-hero-title {
            font-size: clamp(36px, 12vw, 54px);
          }

          .landing-hero-text,
          .landing-section-heading p,
          .landing-community-band p,
          .landing-stories-copy p,
          .landing-final-cta p {
            font-size: 16px;
          }

          .landing-steps-grid,
          .landing-features-grid,
          .landing-community-grid,
          .landing-stats,
          .landing-device-grid,
          .landing-device-footer {
            grid-template-columns: 1fr;
          }

          .landing-device-panel-wide {
            grid-column: auto;
          }

          .landing-stat-card,
          .landing-final-cta,
          .landing-community-band,
          .landing-story-card {
            padding: 24px;
          }

          .landing-section {
            padding: 76px 0;
          }

          .landing-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 560px) {
          .landing-brand-text strong {
            font-size: 14px;
          }

          .landing-pill {
            width: 100%;
            justify-content: center;
            text-align: center;
          }

          .landing-hero-copy {
            text-align: center;
          }

          .landing-hero-cta,
          .landing-highlight-list,
          .landing-final-actions {
            justify-content: center;
          }

          .landing-device-card {
            padding: 18px;
            border-radius: 22px;
          }

          .landing-section-heading {
            margin-bottom: 38px;
          }

          .landing-story-quote {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}

const buttonPrimaryStyle: CSSProperties = {
  background: "linear-gradient(135deg, #0052CC 0%, #2A9D8F 100%)",
  color: "#fff",
  border: "none",
  boxShadow: "0 16px 32px rgba(0, 82, 204, 0.18)"
};

const buttonOutlineStyle: CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(18, 32, 51, 0.12)",
  color: "#122033",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)"
};

const buttonGhostStyle: CSSProperties = {
  color: "#122033",
  background: "transparent",
  border: "1px solid transparent"
};

const ctaLabelStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700
};
