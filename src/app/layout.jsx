import './globals.css';

export const metadata = {
  title: 'Mindora Aegis — Ultra-Secure Examination Platform',
  description: 'Next-generation proctored online test preparation and assessment platform with AI vision and audio security personnel.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-teal-500 selection:text-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

