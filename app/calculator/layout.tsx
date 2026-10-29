import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Electricity Bill Calculator India | BijliBudget',
  description: 'Use your electricity bill amount, units and appliance use to estimate household energy costs and potential savings.',
  alternates: { canonical: '/calculator' },
};

export default function CalculatorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
