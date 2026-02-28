'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type SessionData = {
  customerName?: string;
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
  paymentStatus?: string;
  holdId?: string;
  orgId?: string;
};

export function ConfirmationClient() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const holdId = params.get('holdId');
  const orgId = params.get('orgId');
  const stripeStatus = params.get('stripe');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<SessionData | null>(null);

  useEffect(() => {
    if (stripeStatus === 'success' && holdId && orgId) {
      // Widget flow: we have holdId, show success directly
      setData({ holdId, orgId });
      setStatus('success');
      return;
    }

    if (!sessionId) {
      setStatus('error');
      return;
    }

    fetch(`/api/v1/stripe/checkout/status?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          setData(json.data);
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [sessionId, holdId, orgId, stripeStatus]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {status === 'loading' && <LoadingState />}
        {status === 'success' && <SuccessState data={data} />}
        {status === 'error' && <ErrorState />}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={styles.text}>Confirming your booking...</p>
    </div>
  );
}

function SuccessState({ data }: { data: SessionData | null }) {
  const amount = data?.amountTotal
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: data.currency ?? 'usd',
      }).format(data.amountTotal / 100)
    : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti-fall {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes checkmark-scale {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .confetti-piece {
          position: fixed;
          width: 8px;
          height: 8px;
          background: #FF4F00;
          top: -10px;
          animation: confetti-fall 3s linear forwards;
          z-index: 1000;
        }
      `}} />
      
      {/* Confetti pieces */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            background: ['#FF4F00', '#16a34a', '#eab308', '#ec4899'][i % 4],
            borderRadius: i % 2 === 0 ? '50%' : '0',
          }}
        />
      ))}
      
      <div style={styles.center}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: '#dcfce7',
            animation: 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
          <div style={{ ...styles.checkCircle, animation: 'checkmark-scale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
            ✓
          </div>
        </div>
        <h1 style={{ ...styles.heading, animation: 'checkmark-scale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s backwards' }}>
          Booking Confirmed!
        </h1>
        <p style={{ ...styles.subtext, animation: 'checkmark-scale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s backwards' }}>
          Your escape room experience is booked.
          {data?.customerEmail && ` A confirmation has been sent to ${data.customerEmail}.`}
        </p>
        {amount && (
          <p style={{ ...styles.amount, animation: 'checkmark-scale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.4s backwards' }}>
            {amount} paid
          </p>
        )}
        {data?.holdId && (
          <p style={{ ...styles.refId, animation: 'checkmark-scale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s backwards' }}>
            Reference: {data.holdId.slice(0, 8).toUpperCase()}
          </p>
        )}
      </div>
    </>
  );
}

function ErrorState() {
  return (
    <div style={styles.center}>
      <div style={{ ...styles.checkCircle, background: '#fee2e2', color: '#dc2626' }}>✗</div>
      <h1 style={styles.heading}>Something went wrong</h1>
      <p style={styles.subtext}>
        We could not confirm your booking. Please contact the venue directly.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    background: '#FFFDF9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '48px 32px',
    maxWidth: 480,
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  center: { textAlign: 'center' as const },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#dcfce7',
    color: '#16a34a',
    fontSize: 32,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: '#201515',
    margin: '0 0 8px',
  },
  subtext: {
    fontSize: 15,
    color: '#6b7280',
    margin: '0 0 16px',
    lineHeight: 1.5,
  },
  amount: {
    fontSize: 20,
    fontWeight: 600,
    color: '#FF4F00',
    margin: '0 0 8px',
  },
  refId: {
    fontSize: 13,
    color: '#9ca3af',
    margin: 0,
  },
  text: { fontSize: 15, color: '#6b7280' },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #e5e7eb',
    borderTopColor: '#FF4F00',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
};
