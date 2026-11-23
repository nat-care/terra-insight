import { sampleAreas } from "../data/Exdata";

export function calculateRecommendations(userData) {
  const keys = Object.keys(userData.factors);
  const totalWeight = keys.reduce(
    (sum, key) => sum + userData.factors[key],
    0
  );

  return sampleAreas
    .map((area) => {
      const weightedScore = keys.reduce(
        (sum, key) => sum + area.factors[key] * userData.factors[key],
        0
      );

      const score = Math.round(
        (weightedScore / (totalWeight * 5)) * 100
      );

      return { ...area, score };
    })
    .sort((a, b) => b.score - a.score);
}
