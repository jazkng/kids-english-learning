import catalog from '../../content/catalog.json';

export function App() {
  return (
    <main>
      <p className="eyebrow">Kids English Learning</p>
      <h1>A little learning,<br />a big adventure.</h1>
      <p>Letters, numbers, and colors with a friendly teacher.</p>
      <section aria-label="Learning areas" className="subjects">
        {catalog.subjects.map((subject) => (
          <article key={subject.id}>
            <span aria-hidden="true" className="symbol">{subject.symbol}</span>
            <h2>{subject.title}</h2>
            <p>{subject.description}</p>
          </article>
        ))}
      </section>
      <aside role="status">Development preview for adults. Lessons and teacher audio are being prepared.</aside>
    </main>
  );
}
