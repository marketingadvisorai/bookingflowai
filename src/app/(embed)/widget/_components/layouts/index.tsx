'use client';

import { BookingWidgetDemo } from '../booking-widget-demo';
import { WizardLayout } from './WizardLayout';
import { ClassicLayout } from './ClassicLayout';
import { WidgetErrorBoundary } from '../error-boundary';

type LayoutProps = {
  layout?: 'original' | 'wizard' | 'classic';
  orgId?: string;
  gameId?: string;
  theme?: 'dark' | 'light';
  primaryColor?: string;
  radius?: string;
};

export function LayoutSwitcher({ layout = 'original', ...props }: LayoutProps) {
  const inner = (() => {
    switch (layout) {
      case 'wizard':
        return <WizardLayout {...props} />;
      case 'classic':
        return <ClassicLayout {...props} />;
      case 'original':
      default:
        return <BookingWidgetDemo {...props} />;
    }
  })();

  return <WidgetErrorBoundary>{inner}</WidgetErrorBoundary>;
}
