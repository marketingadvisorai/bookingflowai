import Link from 'next/link';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Embed Widget', href: '/embed' },
      { label: 'API', href: '/developers' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Escape Rooms', href: '/for-escape-rooms' },
      { label: 'Entertainment Venues', href: '/entertainment-venues' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Security', href: '/security' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Acceptable Use', href: '/acceptable-use' },
      { label: 'DPA', href: '/dpa' },
      { label: 'Payment Services', href: '/payment-services' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#F5F0E8] border-t border-[#E7E5E4]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
        {/* Top section: Logo + tagline */}
        <div className="mb-10 sm:mb-12 lg:mb-14">
          <Link href="/" className="inline-flex items-center gap-0 hover:opacity-80 transition-opacity duration-200">
            <span className="font-extrabold text-xl text-[#201515] tracking-tight">booking</span>
            <span className="relative font-normal text-xl text-[#201515] tracking-tight">
              flow
              <span className="absolute -top-1 left-[5px] w-1.5 h-1.5 rounded-full bg-[#FF4F00]"></span>
            </span>
          </Link>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#6F6765] max-w-[360px]">
            The booking platform built for venues that want to fill every time slot.
          </p>
        </div>

        {/* Column links - 2 cols on mobile, 4 on tablet+ */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold text-[#201515] uppercase tracking-wider mb-4 sm:mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-[14px] font-medium text-[#6F6765] hover:text-[#FF4F00] transition-colors duration-200 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] font-medium text-[#93908C]">&copy; {new Date().getFullYear()} BookingFlow. All rights reserved.</p>
          <p className="text-[13px] font-medium text-[#93908C]">Built for venues that keep people entertained.</p>
        </div>
      </div>
    </footer>
  );
}
