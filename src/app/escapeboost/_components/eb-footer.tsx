import Link from 'next/link';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/escapeboost/features' },
      { label: 'Pricing', href: '/escapeboost/pricing' },
      { label: 'Booking Widget', href: '/escapeboost/features#widget' },
      { label: 'AI Chatbot', href: '/escapeboost/features#chatbot' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/escapeboost/about' },
      { label: 'Contact', href: '/escapeboost/contact' },
      { label: 'Blog', href: '/escapeboost/blog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'API Docs', href: '#' },
      { label: 'System Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

export function EBFooter() {
  return (
    <footer className="border-t border-[#E7E5E4] bg-[#FFFDF9]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-black uppercase tracking-[0.12em] text-[#201515] mb-6">{col.title}</h4>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] font-medium text-[#6F6765] hover:text-[#201515] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[20px] font-bold text-[#201515]">
            <span className="text-[#FF4F00]">🔥</span> EscapeBoost
          </div>
          <p className="text-[13px] font-medium text-[#93908C]">
            &copy; {new Date().getFullYear()} EscapeBoost. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
