'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F9F9F8',
            color: '#111111',
            fontFamily: 'sans-serif',
            padding: '0 16px',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '520px' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '24px',
                border: '1px solid rgba(128, 0, 0, 0.25)',
                backgroundColor: 'rgba(128, 0, 0, 0.06)',
                color: '#800000',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}
            >
              System Error
            </div>
            <h1
              style={{
                fontSize: '44px',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                margin: '28px 0 12px',
              }}
            >
              Something Went Wrong
            </h1>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#666666', margin: 0 }}>
              An unexpected error occurred on the platform. Please try again or return home.
            </p>
            <button
              onClick={retry}
              style={{
                marginTop: '28px',
                padding: '14px 32px',
                borderRadius: '9999px',
                backgroundColor: '#800000',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
