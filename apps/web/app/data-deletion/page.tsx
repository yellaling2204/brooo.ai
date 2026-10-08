import React from 'react';
import Link from 'next/link';

export default function DataDeletionPage() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', lineHeight: 1.7, color: '#CBD5E1' }}>
      <Link href="/" style={{ color: '#00F2FE', textDecoration: 'none', fontWeight: 600 }}>
        ← Back to brooo.ai
      </Link>
      <h1 style={{ color: '#FFFFFF', fontSize: 36, marginTop: 24, marginBottom: 8 }}>
        User Data Deletion Instructions
      </h1>
      <p style={{ color: '#64748B', fontSize: 14 }}>
        Compliant with Google Play & Apple App Store Account Deletion Policies
      </p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>How to Delete Your Account and Data</h2>
        <p>
          At <strong>brooo.ai</strong>, we provide straightforward, self-service mechanisms to permanently delete your personal account and all associated records.
        </p>

        <h3 style={{ color: '#00F2FE', fontSize: 16, marginTop: 20 }}>Option 1: In-App Account Deletion (Instant)</h3>
        <ol style={{ paddingLeft: 20 }}>
          <li>Open the <strong>brooo.ai</strong> mobile app.</li>
          <li>Navigate to the <strong>Profile</strong> tab (bottom right).</li>
          <li>Scroll down to the <strong>Privacy & Data Controls</strong> section.</li>
          <li>Tap <strong>Delete Account & All Data</strong>.</li>
          <li>Confirm your deletion in the modal dialog.</li>
        </ol>

        <h3 style={{ color: '#00F2FE', fontSize: 16, marginTop: 20 }}>Option 2: Web / Email Request</h3>
        <p>
          If you no longer have access to the mobile application, you may request permanent data deletion by emailing our compliance team:
        </p>
        <p>
          <strong>Email:</strong> <code>support@brooo.ai</code><br />
          <strong>Subject:</strong> Account & Data Deletion Request<br />
          <strong>Content:</strong> Include the registered email address associated with your account.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 20 }}>What Happens Upon Deletion</h2>
        <p>
          Once confirmed, our database executes a cascade deletion across all tables:
        </p>
        <ul>
          <li>Your profile and authentication credentials in Supabase Auth are deleted immediately.</li>
          <li>All uploaded documents, screenshots, and PDFs in Supabase Storage are permanently removed.</li>
          <li>All action objects, tasks, reminders, conversation logs, and vector embeddings in <code>pgvector</code> are purged.</li>
          <li>No backup or residual copies are retained past 30 days.</li>
        </ul>
      </section>
    </div>
  );
}

