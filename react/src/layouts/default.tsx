import { Link } from "@heroui/link";
import { Navbar } from "@/components/navbar";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 mt-4">
        {children}
      </main>

      <footer className="w-full mt-20">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full border-t pt-6">
            <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4">
              <div className="flex-1 flex items-center justify-center">
                <ul className="list-disc text-center">
                  <li>
                    <Link underline="always" href="/dashboard" color="foreground">Dashboard</Link>
                  </li>
                  <li>
                    <Link underline="always" href="/forum" color="foreground">Forum</Link>
                  </li>
                  <li>
                    <Link underline="always" href="/articles" color="foreground">Artykuły</Link>
                  </li>
                </ul>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <Link underline="always" href="/" color="foreground" className="text-2xl">WorkSense</Link>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <ul className="list-disc text-center">
                  <li>
                    <Link underline="always" href="/progress" color="foreground">Progres</Link>
                  </li>
                  <li>
                    <Link underline="always" href="/focus" color="foreground">Focus</Link>
                  </li>
                  <li>
                    <Link underline="always" href="/profile" color="foreground">Profil</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground mb-5">
              <Link underline="always" color="foreground" href="/terms">Terms</Link>
              <Link underline="always" color="foreground" className="ml-5" href="/privacy">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
