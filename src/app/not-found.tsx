export default function NotFound() {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-gray-600">
          The page you are looking for does not exist OR Under development
        </p>
  
        <a
          href="/"
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Go Home
        </a>
        <a
          href="/login"
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Go Login
        </a>
      </div>
    );
  }
  