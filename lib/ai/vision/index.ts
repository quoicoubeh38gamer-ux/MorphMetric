import type { VisionProvider } from "./provider";
import { heuristicVisionProvider } from "./heuristic";

export type { VisionProvider, VisionProviderInput } from "./provider";

/**
 * Resolve the active vision provider from configuration.
 *
 * Only the heuristic provider ships in the MVP. `mediapipe` / `cloud` are the
 * intended production swaps — they implement the same VisionProvider interface
 * and register here, so no downstream code changes when they land.
 */
export function getVisionProvider(): VisionProvider {
  const configured = process.env.VISION_PROVIDER ?? "heuristic";
  switch (configured) {
    case "heuristic":
    default:
      return heuristicVisionProvider;
  }
}
