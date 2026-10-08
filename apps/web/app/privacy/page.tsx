import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', lineHeight: 1.7, color: '#CBD5E1' }}>
      <Link href="/" style={{ color: '#00F2FE', textDecoration: 'none', fontWeight: 600 }}>
        ← Back to brooo.ai
      </Link>
      <h1 style={{ color: '#FFFFFF', fontSize: 36, marginTop: 24, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#64748B', fontSize: 14 }}>Last Updated: October 2026</p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>1. Our Commitment to Your Privacy</h2>
        <p>
          At <strong>brooo.ai</strong>, we treat your documents, screenshots, and personal communications with the highest standard of confidentiality.
          <strong> You own your data.</strong> brooo only processes what you explicitly send to the application.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>2. Information We Collect</h2>
        <ul>
          <li><strong>Account Information:</strong> Email address and authentication credentials handled securely via Supabase Auth.</li>
          <li><strong>User-Submitted Content:</strong> Text notes, screenshots, and PDF documents you choose to send for action extraction.</li>
          <li><strong>Derived Metadata:</strong> Action items, deadlines, task statuses, and vector embeddings generated to power your AI memory.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>3. Third-Party AI Sub-Processors</h2>
        <p>
          In accordance with Google Play and Apple App Store AI transparency standards, we disclose that user-submitted content is transmitted via encrypted HTTPS directly to our secure backend API, which queries authorized AI inference providers (such as OpenAI or Google Cloud). 
          <strong> Your personal documents are never used to train public foundation models without explicit consent.</strong>
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>4. Data Retention & Deletion Rights</h2>
        <p>
          You have full control over your information at all times. You may:
        </p>
        <ul>
          <li>View and delete individual documents or action items directly within the app.</li>
          <li>Purge your entire semantic AI memory store at any time via Settings.</li>
          <li>Request complete, irreversible deletion of your account and all associated records in accordance with our <Link href="/data-deletion" style={{ color: '#00F2FE' }}>Data Deletion Policy</Link>.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>5. Contact Us</h2>
        <p>
          For privacy inquiries or data protection requests, please contact our privacy team at <code>privacy@brooo.ai</code>.
        </p>
      </section>
    </div>
  );
}

