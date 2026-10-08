import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', lineHeight: 1.7, color: '#CBD5E1' }}>
      <Link href="/" style={{ color: '#00F2FE', textDecoration: 'none', fontWeight: 600 }}>
        ← Back to brooo.ai
      </Link>
      <h1 style={{ color: '#FFFFFF', fontSize: 36, marginTop: 24, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#64748B', fontSize: 14 }}>Last Updated: October 2026</p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>1. Acceptance of Terms</h2>
        <p>
          By creating an account or accessing the services provided by <strong>brooo.ai</strong>, you agree to be bound by these Terms of Service.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>2. Description of Service</h2>
        <p>
          brooo.ai is an AI-powered personal assistant designed to analyze user-submitted documents, extract actionable tasks and deadlines, and assist in personal life organization.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>3. AI Disclaimers & Scam Shield</h2>
        <p>
          While brooo.ai uses advanced LLMs and heuristic evaluation to extract deadlines, calculate career job match scores, and flag potential fraud or scams:
        </p>
        <ul>
          <li>Scam Shield evaluations represent an automated risk assessment and do not constitute legal or financial guarantees.</li>
          <li>Users are encouraged to verify important deadlines and sensitive financial communications before executing payments or binding obligations.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>4. Termination</h2>
        <p>
          You may terminate your account at any time directly through the app or by submitting a deletion request.
        </p>
      </section>
    </div>
  );
}

