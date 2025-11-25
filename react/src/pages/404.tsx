
import DefaultLayout from "@/layouts/default";

function NotFoundPage() {
  return (
    <DefaultLayout>
    <div className="flex flex-col items-center justify-center h-[75vh]">
      <h1 className="text-6xl font-bold ">404</h1>
      <p className="text-2xl mt-4">Strona nie znaleziona</p>
      <a href="/" className="mt-6 text-success hover:underline">Powrót do strony głównej</a>
    </div>
    </DefaultLayout>
  );
}

export default NotFoundPage;