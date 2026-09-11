export const FERTILIZER_FORMULAS: Record<string, { n: number, p: number, k: number, defaultCostPerAcre: number }> = {
  wheat: { n: 120, p: 60, k: 40, defaultCostPerAcre: 3500 },
  rice: { n: 100, p: 50, k: 50, defaultCostPerAcre: 4000 },
  maize: { n: 120, p: 60, k: 40, defaultCostPerAcre: 3800 },
  cotton: { n: 150, p: 75, k: 75, defaultCostPerAcre: 5500 },
  sugarcane: { n: 250, p: 100, k: 100, defaultCostPerAcre: 8000 },
  mango: { n: 100, p: 50, k: 100, defaultCostPerAcre: 4500 },
  groundnut: { n: 20, p: 60, k: 40, defaultCostPerAcre: 2500 },
  banana: { n: 200, p: 100, k: 250, defaultCostPerAcre: 7000 },
  tomato: { n: 150, p: 100, k: 100, defaultCostPerAcre: 5000 },
  potato: { n: 180, p: 100, k: 120, defaultCostPerAcre: 6000 },
  onion: { n: 120, p: 80, k: 100, defaultCostPerAcre: 4200 },
  chickpea: { n: 20, p: 50, k: 20, defaultCostPerAcre: 2000 },
};

export const UREA_N_RATIO = 0.46; // Urea is 46% Nitrogen
export const DAP_N_RATIO = 0.18; // DAP is 18% Nitrogen
export const DAP_P_RATIO = 0.46; // DAP is 46% Phosphorus
export const MOP_K_RATIO = 0.60; // MOP is 60% Potassium

export const BAG_SIZE_KG = 50;
