import { Link } from "react-router-dom";
import { LinkButton } from "../../components/ui/Button";
import { config } from "../../lib/config";

const steps = [
  { num: "01", title: "Watch offers", desc: "See brand messages picked for your profile" },
  { num: "02", title: "Verify mobile", desc: "Confirm with a secure one-time password" },
  { num: "03", title: "Browse deals", desc: "Access travel, shopping, and lifestyle offers" },
];

const features = [
  {
    icon: "🎯",
    title: "Relevant advertisements",
    desc: "Offers aligned with your age, city, and interests.",
  },
  {
    icon: "🔐",
    title: "Secure sign-in",
    desc: "OTP verification keeps your account protected.",
  },
  {
    icon: "📊",
    title: "Trusted brands",
    desc: "Travel, finance, retail, and wellness partners.",
  },
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/50 px-6 py-16 shadow-card backdrop-blur-sm sm:px-12 sm:py-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-apad-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="badge-brand mb-6">Offers · Verify · Access</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Watch. Verify.{" "}
            <span className="bg-gradient-to-r from-apad-600 to-indigo-500 bg-clip-text text-transparent">
              Access.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            {config.appName} brings you curated brand offers and a simple mobile sign-in
            so you can unlock deals that fit your profile.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LinkButton to="/register" className="min-w-[180px]">
              Create account
            </LinkButton>
            <LinkButton to="/login" variant="secondary" className="min-w-[180px]">
              Sign in
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-apad-600">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="card group text-center transition hover:-translate-y-1 hover:shadow-glow"
            >
              <span className="text-3xl font-extrabold text-apad-200 group-hover:text-apad-400">
                {s.num}
              </span>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-center text-2xl font-bold text-slate-900">Why APAD</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl bg-gradient-to-r from-apad-700 to-apad-500 px-8 py-12 text-center text-white shadow-glow">
        <h2 className="text-2xl font-bold sm:text-3xl">Start exploring offers</h2>
        <p className="mx-auto mt-3 max-w-lg text-apad-100">
          Sign in with your mobile number and discover deals from leading brands.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-apad-700 shadow-lg transition hover:bg-apad-50"
        >
          Sign in now
        </Link>
        <p className="mt-4 text-sm text-apad-100">
          <Link to="/admin/login" className="underline hover:text-white">
            Business login
          </Link>
        </p>
      </section>
    </div>
  );
}
