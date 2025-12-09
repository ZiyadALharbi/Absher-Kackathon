import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "عون - الوكيل الذكي",
    description: "افحص حالتك الحكومية بضغطة زر",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl">
            <body className="font-cairo antialiased">{children}</body>
        </html>
    );
}
