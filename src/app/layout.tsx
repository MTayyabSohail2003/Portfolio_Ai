import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsTracker } from "@/components/features/analytics-tracker";
// import { FloatingChat } from "@/components/chat/floating-chat";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>
            <ApolloWrapper>
              <AnalyticsTracker />
              <div className="flex min-h-screen bg-background text-foreground">
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ">
                  <Header />
                  <div className="flex-1 p-4 md:p-8 pt-6 w-full">
                    <Breadcrumbs />
                    {children}
                  </div>
                  <Footer />
                </main>
              </div>
            </ApolloWrapper>
          </TooltipProvider>
          <Toaster position="top-center" richColors closeButton />
          {/* <FloatingChat /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
