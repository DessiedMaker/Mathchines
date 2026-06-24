import { createFileRoute } from "@tanstack/react-router";
import { getDecks } from "@/lib/api/pitch.functions";
import { SlideDeckPlayer } from "@/components/SlideDeckPlayer";

export const Route = createFileRoute("/pitch-investor")({
  loader: async () => {
    return await getDecks();
  },
  head: () => ({
    meta: [
      { title: "Mathchines Investor Pitch Deck — Scaling Global Math Literacy" },
      {
        name: "description",
        content:
          "Explore the investor presentation for Mathchines: capturing the $45B digital math learning opportunity via offline-first design and mobile micro-billing.",
      },
    ],
  }),
  component: InvestorPitchDeck,
});

function InvestorPitchDeck() {
  const { investorSlides } = Route.useLoaderData();

  return (
    <SlideDeckPlayer
      initialSlides={investorSlides}
      deckTitle="Investor & Growth Pitch Deck v1.0"
      defaultDeckType="investor"
    />
  );
}
