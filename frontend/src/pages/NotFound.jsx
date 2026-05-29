import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";

export function NotFound() {
  return (
    <main className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-3 text-slate-500">This page does not exist.</p>
      <Link to="/" className="mt-6"><Button>Go Home</Button></Link>
    </main>
  );
}
