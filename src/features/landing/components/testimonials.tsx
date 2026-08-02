import { testimonials } from "../data";

export function Testimonials() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-dark sm:text-4xl">
            Trusted by finance-literate founders
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex h-full flex-col justify-between rounded-[var(--radius-card)] border border-border bg-background p-6"
            >
              <blockquote className="text-sm leading-relaxed text-dark">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <div className="text-sm font-medium text-dark">{t.name}</div>
                  <div className="text-xs text-muted">
                    {t.role}, {t.company}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
