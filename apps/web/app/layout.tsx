import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'brooo.ai — Your Personal AI Assistant & Life Operating System',
  description: 'Send anything to brooo. Screenshots, emails, PDFs, bills, job applications, and deadlines. Handled in seconds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#0B0F19',
          color: '#FFFFFF',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}

