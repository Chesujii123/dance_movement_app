import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'FormationViewer',
  description: 'K-POPカバーダンスのフォーメーションを俯瞰視点で可視化・共有',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="ja">
      <body className="bg-gray-950 text-white antialiased">
        <NextIntlClientProvider messages={messages} locale="ja">
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
