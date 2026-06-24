import { createFileRoute } from "@tanstack/react-router";
import { getDecks } from "@/lib/api/pitch.functions";
import { SlideDeckPlayer } from "@/components/SlideDeckPlayer";

export const Route = createFileRoute("/pitch")({
  loader: async () => {
    return await getDecks();
  },
  head: () => ({
    meta: [
      { title: "Mathchines Pitch Deck — Making Math Enjoyable" },
      {
        name: "description",
        content:
          "Explore the pitch deck for Mathchines: making mathematics enjoyable for every student globally.",
      },
    ],
  }),
  component: PitchDeck,
});

function PitchDeck() {
  const { productSlides } = Route.useLoaderData();

  return (
    <SlideDeckPlayer
      initialSlides={productSlides}
      deckTitle="Product Pitch Deck v2.0"
      defaultDeckType="product"
    />
  );
}
