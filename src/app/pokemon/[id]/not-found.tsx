import Link from "next/link";

export default function PokemonNotFound() {
  return (
    <main className="app-shell" style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Pokémon not found</h1>
      <p>That Pokédex entry does not exist.</p>
      <Link href="/">Back to Pokédex</Link>
    </main>
  );
}
