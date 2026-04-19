import Link from "next/link";

export default function NotFound() {
  return (
    <main
      aria-label="Page not found"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "var(--space-6)",
        background: "var(--color-background)",
        color: "var(--color-text)",
        textAlign: "center",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: "var(--space-8)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="20" fill="var(--color-primary)" />
          <path
            d="M13 16c0-1.5 1-3 2.5-3s2.5 1.5 2.5 3-1 3-2.5 3S13 17.5 13 16Zm9 0c0-1.5 1-3 2.5-3S27 14.5 27 16s-1 3-2.5 3S22 17.5 22 16Zm-7.5 7c0 0 2 4 5.5 4s5.5-4 5.5-4"
            stroke="var(--color-primary-foreground)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
          }}
        >
          AlagaLahat
        </span>
      </div>

      {/* Confused Pet Illustration */}
      <svg
        width="220"
        height="200"
        viewBox="0 0 220 200"
        fill="none"
        aria-label="Illustration of a confused lost pet looking around"
        role="img"
        style={{ marginBottom: "var(--space-8)", maxWidth: "100%" }}
      >
        {/* Ground / shadow */}
        <ellipse cx="110" cy="185" rx="80" ry="8" fill="var(--color-border)" opacity="0.4" />
        
        {/* Body */}
        <ellipse cx="110" cy="140" rx="50" ry="40" fill="var(--color-primary)" opacity="0.15" />
        <ellipse cx="110" cy="140" rx="45" ry="36" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" />
        
        {/* Head */}
        <circle cx="110" cy="85" r="35" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" />
        
        {/* Ears */}
        <ellipse cx="82" cy="62" rx="12" ry="18" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" transform="rotate(-15 82 62)" />
        <ellipse cx="82" cy="62" rx="7" ry="12" fill="var(--color-primary)" opacity="0.15" transform="rotate(-15 82 62)" />
        <ellipse cx="138" cy="62" rx="12" ry="18" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" transform="rotate(15 138 62)" />
        <ellipse cx="138" cy="62" rx="7" ry="12" fill="var(--color-primary)" opacity="0.15" transform="rotate(15 138 62)" />
        
        {/* Eyes — confused expression */}
        <circle cx="98" cy="82" r="5" fill="var(--color-text)" />
        <circle cx="122" cy="82" r="5" fill="var(--color-text)" />
        <circle cx="100" cy="80" r="1.5" fill="var(--color-card)" />
        <circle cx="124" cy="80" r="1.5" fill="var(--color-card)" />
        
        {/* Eyebrows — confused */}
        <path d="M91 73 Q98 69 105 73" stroke="var(--color-text)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M115 73 Q122 69 129 73" stroke="var(--color-text)" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Nose */}
        <ellipse cx="110" cy="92" rx="4" ry="3" fill="var(--color-text)" />
        
        {/* Mouth — confused frown */}
        <path d="M100 100 Q110 96 120 100" stroke="var(--color-text)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Collar */}
        <path d="M85 110 Q110 118 135 110" stroke="var(--color-primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="110" cy="115" r="4" fill="var(--color-amber)" stroke="var(--color-primary)" strokeWidth="1.5" />
        
        {/* Tail — question-mark shape */}
        <path d="M155 135 Q170 120 165 105 Q160 95 165 88" stroke="var(--color-primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="165" cy="85" r="3" fill="var(--color-primary)" />
        
        {/* Front paws */}
        <ellipse cx="90" cy="172" rx="10" ry="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
        <ellipse cx="130" cy="172" rx="10" ry="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
        
        {/* Question marks floating */}
        <text x="55" y="50" fontSize="20" fill="var(--color-primary)" opacity="0.6" fontWeight="800">?</text>
        <text x="160" y="40" fontSize="16" fill="var(--color-amber)" opacity="0.5" fontWeight="800">?</text>
        <text x="42" y="80" fontSize="14" fill="var(--color-text-muted)" opacity="0.4" fontWeight="800">?</text>
      </svg>

      {/* Heading */}
      <h1
        style={{
          fontSize: "clamp(var(--font-size-2xl), 5vw, var(--font-size-4xl))",
          fontWeight: 800,
          margin: "0 0 var(--space-3)",
          letterSpacing: "-0.02em",
          color: "var(--color-text)",
          lineHeight: 1.2,
        }}
      >
        Hala! Page Not Found
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: "var(--font-size-base)",
          color: "var(--color-text-muted)",
          maxWidth: 460,
          lineHeight: 1.7,
          margin: "0 0 var(--space-8)",
          fontWeight: 500,
        }}
      >
        Mukhang nawawala ang page na ito, tulad ng isang ligaw na alagang hayop.
        <br />
        <span style={{ fontSize: "var(--font-size-sm)", opacity: 0.8 }}>
          (Looks like this page is lost, just like a stray pet.)
        </span>
      </p>

      {/* CTA Buttons */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/"
          className="btn btn-primary btn-size-lg"
          style={{ borderRadius: "var(--radius-full)", minWidth: 180 }}
        >
          Go Back Home
        </Link>
        <Link
          href="/lost-pets/report"
          className="btn btn-outline btn-size-lg"
          style={{ borderRadius: "var(--radius-full)", minWidth: 180 }}
        >
          Report a Lost Pet
        </Link>
      </div>

      {/* 404 watermark */}
      <p
        style={{
          position: "absolute",
          bottom: "var(--space-6)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-light)",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        ERROR 404
      </p>
    </main>
  );
}
