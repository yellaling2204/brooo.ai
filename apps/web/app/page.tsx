import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 48px',
          borderBottom: '1px solid #1E293B',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 800 }}>
          brooo.ai <span style={{ color: '#00F2FE' }}>✦</span>
        </div>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 15 }}>
            Features
          </a>
          <a href="#how-it-works" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 15 }}>
            How it Works
          </a>
          <Link
            href="/privacy"
            style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 15 }}
          >
            Privacy
          </Link>
          <button
            style={{
              backgroundColor: '#00F2FE',
              color: '#0B0F19',
              fontWeight: 700,
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Get Early Access
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, maxWidth: 1000, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: 24,
            padding: '6px 18px',
            color: '#00F2FE',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          Your AI Life Operating System
        </div>

        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: 24,
          }}
        >
          Send it to <span style={{ color: '#00F2FE' }}>brooo</span>.
        </h1>

        <p
          style={{
            fontSize: 22,
            color: '#94A3B8',
            maxWidth: 680,
            margin: '0 auto 40px auto',
            lineHeight: 1.5,
          }}
        >
          Email. Screenshot. PDF. Job application. Insurance renewal. Deadline.
          <br />
          <strong>brooo</strong> understands it and tells you exactly what to do.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button
            style={{
              backgroundColor: '#00F2FE',
              color: '#0B0F19',
              fontWeight: 800,
              fontSize: 18,
              padding: '16px 36px',
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 242, 254, 0.3)',
            }}
          >
            Get Early Access
          </button>
        </div>

        {/* Core Loop Visual */}
        <div
          style={{
            marginTop: 80,
            backgroundColor: '#161F30',
            border: '1px solid #243248',
            borderRadius: 24,
            padding: 40,
            textAlign: 'left',
          }}
        >
          <div style={{ color: '#00F2FE', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
            The Core Loop
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
            Input anything. Output actionable clarity.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div style={{ backgroundColor: '#0B0F19', padding: 20, borderRadius: 16, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📥</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Send Anything</div>
              <div style={{ color: '#94A3B8', fontSize: 14 }}>Forward an interview email, share a WhatsApp chat screenshot, or drop a 20-page PDF policy.</div>
            </div>
            <div style={{ backgroundColor: '#0B0F19', padding: 20, borderRadius: 16, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🤖</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Understand & Extract</div>
              <div style={{ color: '#94A3B8', fontSize: 14 }}>Multimodal vision and LLM extraction extract deadlines, companies, priorities, and fraud risks.</div>
            </div>
            <div style={{ backgroundColor: '#0B0F19', padding: 20, borderRadius: 16, border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⚡</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>"Done brooo."</div>
              <div style={{ color: '#94A3B8', fontSize: 14 }}>Tasks created, reminders scheduled, long-term personal memory updated. Never forget anything again.</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #1E293B',
          padding: '40px 24px',
          textAlign: 'center',
          color: '#64748B',
          fontSize: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          <Link href="/privacy" style={{ color: '#94A3B8', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ color: '#94A3B8', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link href="/data-deletion" style={{ color: '#94A3B8', textDecoration: 'none' }}>
            Data Deletion Instructions
          </Link>
        </div>
        © {new Date().getFullYear()} brooo.ai. All rights reserved.
      </footer>
    </div>
  );
}

