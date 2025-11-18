import { Link } from "@heroui/link";
import { Navbar } from "@/components/navbar";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-screen ">
      <Navbar />
      <main className="mt-15 flex-1">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3 p-5 m-5 divide-x-1 divide-solid divide-amber-50" >
        <div className="flex items-center justify-center py-3 gap-5 p-5 m-5 w-1/3" >
        <div className="p-5">
          <ul className="list-disc">
            <li>
              <Link underline="always" href="/dashboard">Dashboard</Link>
            </li>
             <li>
              <Link underline="always" href="/forum">Forum</Link>
            </li>
             <li>
              <Link underline="always" href="/articles">Articles</Link>
            </li>
          </ul>
          </div>
          <div>
            <ul className="list-disc">
               <li>
              <Link underline="always" href="/progress">Progress</Link>
            </li>
             <li>
              <Link underline="always" href="/focus">Focus</Link>
            </li>
             <li>
              <Link underline="always" href="/profile">Profile</Link>
            </li>
          </ul>
          </div>
          </div>
          <h1 className="w-1/3 text-center">WorkSense</h1>
          <div className="w-1/3 flex justify-center" >
          <ul className="list-disc  ">
            <li>Terms</li>
            <li>privacy</li>
          </ul>
          </div>
      </footer >
    </div>
  );
}
