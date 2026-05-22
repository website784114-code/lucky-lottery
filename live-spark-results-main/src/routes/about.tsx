import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Live Lottery Result" }, { name: "description", content: "About Live Lottery Result — how our live result platform works." }] }),
  component: () => (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold gold-text">About Us</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>Live Lottery Result is a real-time result platform broadcasting winning numbers between 1 and 100 across multiple games, every 30 minutes.</p>
        <p>Our admin desk publishes each result the moment a draw closes. Numbers stream to every viewer instantly through a live socket connection — no refresh needed.</p>
        <p>This site is for entertainment and information purposes only. Please play responsibly.</p>
      </div>
    </div>
  ),
});
