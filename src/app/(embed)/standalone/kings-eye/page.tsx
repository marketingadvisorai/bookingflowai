export const dynamic = 'force-dynamic';

export default function StandaloneKingsEyePage() {
  const baseUrl = process.env.BF_PUBLIC_BASE_URL || 'https://bookingflowai.com';
  const scriptUrl = `${baseUrl.replace('://', '://script.')}/v1/widget.js`;
  const apiBase = baseUrl.replace('://', '://console.');

  return (
    <div style={{ margin: 0, padding: 40, background: '#0b0b10', color: 'white', minHeight: '100vh', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, margin: '0 0 10px' }}>BookingFlow – Standalone Widget Preview (King’s Eye)</h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, marginTop: 0 }}>
          This page loads the <strong>Standalone</strong> CDN widget script and points it at the Standalone API base.
        </p>

        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
          Widget: <code style={{ background: 'rgba(255,255,255,.08)', padding: '2px 6px', borderRadius: 6 }}>{scriptUrl}</code>
          <br />
          API base: <code style={{ background: 'rgba(255,255,255,.08)', padding: '2px 6px', borderRadius: 6 }}>{apiBase}</code>
          <br />
          Org: <code style={{ background: 'rgba(255,255,255,.08)', padding: '2px 6px', borderRadius: 6 }}>org_hk43ln2vfanmyt4jrf6jfg8a</code>
        </p>

        <div id="bookingflow-widget" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var s = document.createElement('script');
                s.src = '${scriptUrl}';
                s.setAttribute('data-api-base', '${apiBase}');
                s.setAttribute('data-org-id', 'org_hk43ln2vfanmyt4jrf6jfg8a');
                s.setAttribute('data-game-id', '');
                s.setAttribute('data-container-id', 'bookingflow-widget');
                s.setAttribute('data-accent', '#E54D27');
                document.body.appendChild(s);
              })();
            `,
          }}
        />
      </div>
    </div>
  );
}
