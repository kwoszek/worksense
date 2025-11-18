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
                    <Link underline="always" href="/articles" color="foreground">Articles</Link>
                  </li>
                </ul>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-center">WorkSense</h1>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <ul className="list-disc text-center">
                  <li>
                    <Link underline="always" href="/progress" color="foreground">Progress</Link>
                  </li>
                  <li>
                    <Link underline="always" href="/focus" color="foreground">Focus</Link>
                  </li>
                  <li>
                    <Link underline="always" href="/profile" color="foreground">Profile</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground mb-5">
              <span className="mr-4">Terms</span>
              <span>Privacy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
