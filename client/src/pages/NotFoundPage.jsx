import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="card">
      <h1>Page not found</h1>
      <p><Link to="/">Back to home</Link></p>
    </section>
  );
}
