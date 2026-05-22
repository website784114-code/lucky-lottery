import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Live Lottery Result" }, { name: "description", content: "Get in touch with Live Lottery Result." }] }),
  component: () => (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-4xl font-bold gold-text">Contact</h1>
      <p className="mt-3 text-muted-foreground">Questions, feedback, or partnership inquiries — we'd love to hear from you.</p>
      <div className="mt-8 grid gap-3">
        <a href="mailto:website784114@gmail.com" className="glass rounded-xl p-4 flex items-center gap-3 hover:border-primary/40">
          <Mail className="h-5 w-5 text-primary" /> website784114@gmail.com
        </a>
      </div>
    </div>
  ),
});
