import { LuSearchX } from "react-icons/lu";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <LuSearchX size={28} />
      </div>
      <p className="font-display text-5xl font-black text-ink">404</p>
      <h1 className="mt-2 font-display text-xl font-bold text-ink">Sahifa topilmadi</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        Bunday sahifa mavjud emas yoki ko'chirilgan. Manzilni tekshiring yoki bosh sahifaga qayting.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent"
      >
        Bosh sahifa
      </Link>
    </div>
  );
}
