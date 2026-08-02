import { howItWorks } from "../data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-dark sm:text-4xl">
          From raw data to a decision, in three steps
        </h2>
      </div>

      <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div
          aria-hidden
          className="absolute top-6 left-0 right-0 hidden h-px bg-border sm:block"
        />
        {howItWorks.map((item) => (
          <div key={item.step} className="relative text-center sm:text-left">
            <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-primary shadow-soft sm:mx-0">
              {item.step[0]}
            </div>
            <h3 className="mt-5 text-base font-semibold text-dark">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
