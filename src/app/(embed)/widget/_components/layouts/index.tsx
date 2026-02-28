'use client';

import { BookingWidgetDemo } from '../booking-widget-demo';
import { WizardLayout } from './WizardLayout';
import { ClassicLayout } from './ClassicLayout';

type LayoutProps = {
  layout?: 'original' | 'wizard' | 'classic';
  orgId?: string;
  gameId?: string;
  theme?: 'dark' | 'light';
  primaryColor?: string;
  radius?: string;
};

export function LayoutSwitcher({ layout = 'original', ...props }: LayoutProps) {
  switch (layout) {
    case 'wizard':
      return <WizardLayout {...props} />;
    case 'classic':
      return <ClassicLayout {...props} />;
    case 'original':
    default:
      return <BookingWidgetDemo {...props} />;
  }
}
