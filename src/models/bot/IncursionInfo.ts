interface IncursionInfo {
  constellationName: string;
  constellationId: number;
  headquarterSystem: string;
  headquarterSystemId: number | null;
  assaultSystems: string[];
  vanguardSystems: string[];
  stagingSystem: string;
  influence: number;
  state: string;
  numberOfJumpsFromLastIncursion: string;
  lastIncursionSystemName: string;
  regionIconUrl: string;
  isIslandConstellation: string;
  stateUpdatedAt?: string;
}

export default IncursionInfo;
