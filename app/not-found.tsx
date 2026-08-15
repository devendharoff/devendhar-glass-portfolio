export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-4xl font-light tracking-widest mb-4">404</h1>
      <p className="text-sm font-mono text-white/50">Page not found</p>
      <a href="/" className="mt-8 px-6 py-2 rounded-full border border-white/20 text-xs font-mono hover:bg-white hover:text-black transition-colors">
        Back Home
      </a>
    </div>
  );
}
