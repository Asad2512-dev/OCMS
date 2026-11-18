// Root component. Pages and routing will be added here later.
import { STRINGS } from './config/strings.js';

export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface font-sans">
      <h1 className="text-3xl font-semibold text-text">{STRINGS.app.name}</h1>
    </main>
  );
}
