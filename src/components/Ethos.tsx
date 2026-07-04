import EthosWave from "./EthosWave";
import EthosList from "./EthosList";

/**
 * ETHOS - "the way I think".
 * Combines two scroll effects into one section:
 *   1. Wave Bend intro (the problem: we build more, rarely more efficient).
 *   2. Scroll List Index (the principles behind "efficient by design").
 */
export default function Ethos() {
  return (
    <section id="ethos" aria-label="Ethos">
      <EthosWave />
      <EthosList />
    </section>
  );
}