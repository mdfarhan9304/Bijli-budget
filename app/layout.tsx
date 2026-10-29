import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BijliBudget — Find practical ways to save electricity',
  description: 'Review your electricity bill, estimate appliance usage, and compare realistic electricity-saving scenarios.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
