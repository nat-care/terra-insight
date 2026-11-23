export default function SummaryCards({ cards }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-[#DCCABB] bg-white p-3"
        >
          <h3 className="text-xs text-[#79554B]">{card.title}</h3>
          <p className="mt-1 text-2xl font-bold text-[#36513D]">
            {card.value ?? "—"}
          </p>
          <p className="text-[10px] text-[#A79588]">{card.unit}</p>
        </article>
      ))}
    </section>
  );
}
