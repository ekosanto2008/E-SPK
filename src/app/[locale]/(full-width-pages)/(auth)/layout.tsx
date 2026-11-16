import ThemeToggler from "@/components/common/theme-toggler";
import AuthVectorCarousel from "@/components/others/auth/auth-vector-carousel";
import { ThemeProvider } from "@/context/theme-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
      <ThemeProvider>
        <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
          {children}

          {/* Sisi Kanan: Full Image Vector Carousel Tanpa Background & Tanpa Teks */}
          <div className="relative hidden h-full w-full items-center justify-center bg-transparent lg:flex lg:w-1/2 overflow-hidden">
            <div className="relative flex h-full w-full items-center justify-center">
              <AuthVectorCarousel />
            </div>
          </div>

          <div className="fixed inset-e-6 bottom-6 z-50 hidden sm:block">
            <ThemeToggler />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
