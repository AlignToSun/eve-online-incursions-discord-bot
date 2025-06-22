import { writeFileSync, readFileSync } from "fs";
import IncursionsCacheEntry from "../models/bot/IncursionsCacheEntry";
import IncursionsCache from "../models/bot/IncursionsCache";

class IncursionsCacheService {
  private readonly incursionCacheFilePath: string = "incursions_cache.json";

  private readonly incursionsCache: IncursionsCache;

  private stateChangeTimestamps: { [constellationId: number]: { [state: string]: string } } = {};

  constructor() {
    this.incursionsCache = {
      noIncursionMessageId: null,
      lastIncursion: null,
      currentIncursions: [],
    };

    try {
      const data = readFileSync(this.incursionCacheFilePath, "utf8");
      this.incursionsCache = JSON.parse(data);
      // Load stateChangeTimestamps if available
      if ((this.incursionsCache as any).stateChangeTimestamps) {
        this.stateChangeTimestamps = (this.incursionsCache as any).stateChangeTimestamps;
      }
    } catch (err) {
      console.log(err);
    }
  }

  findNoIncursionMessageId(): string | null {
    return this.incursionsCache.noIncursionMessageId;
  }

  findLastIncursion(): IncursionsCacheEntry | null {
    return this.incursionsCache.lastIncursion;
  }

  findCurrentIncursions(): IncursionsCacheEntry[] {
    return this.incursionsCache.currentIncursions;
  }

  findCurrentIncursionByConstellationId(
    constellationId: number
  ): IncursionsCacheEntry | null {
    const currentIncursion: IncursionsCacheEntry | undefined =
      this.incursionsCache.currentIncursions.find(
        (incursionCacheEntry) =>
          incursionCacheEntry.incursionInfo.constellationId === constellationId
      );

    if (currentIncursion === undefined) {
      return null;
    }

    return currentIncursion;
  }

  replaceAndUpdateCurrentIncursions(
    newCurrentIncursions: IncursionsCacheEntry[]
  ) {
    const updatedCurrentIncursions: IncursionsCacheEntry[] = [];

    this.incursionsCache.currentIncursions.forEach((cachedCurrentIncursion) => {
      const isOldIncursion: boolean =
        newCurrentIncursions.findIndex(
          (newIncursion) =>
            newIncursion.incursionInfo.constellationId ===
            cachedCurrentIncursion.incursionInfo.constellationId
        ) === -1;
      if (!isOldIncursion) {
        updatedCurrentIncursions.push({ ...cachedCurrentIncursion });
      }
    });

    newCurrentIncursions.forEach((incursionCacheEntry) => {
      const index = updatedCurrentIncursions.findIndex(
        (cachedCurrentIncursion) =>
          cachedCurrentIncursion.incursionInfo.constellationId ===
          incursionCacheEntry.incursionInfo.constellationId
      );

      if (index === -1) {
        updatedCurrentIncursions.push(incursionCacheEntry);
      } else {
        updatedCurrentIncursions[index] = incursionCacheEntry;
      }
    });

    this.saveCurrentIncursions(updatedCurrentIncursions);
  }

  constellationIsInCurrentIncursions(constellationId: number): boolean {
    return (
      this.incursionsCache.currentIncursions.find(
        (incursionCacheEntry) =>
          incursionCacheEntry.incursionInfo.constellationId === constellationId
      ) !== undefined
    );
  }

  checkAndRotateCurrentIncursions(
    newCurrentIncursions: IncursionsCacheEntry[]
  ) {
    const newPotentialLastIncursion: IncursionsCacheEntry[] = [];

    this.incursionsCache.currentIncursions.forEach((cachedCurrentIncursion) => {
      const index = newCurrentIncursions.findIndex(
        (currentIncursion) =>
          currentIncursion.incursionInfo.constellationId ===
          cachedCurrentIncursion.incursionInfo.constellationId
      );

      if (index === -1) {
        newPotentialLastIncursion.push(cachedCurrentIncursion);
      }
    });

    if (newPotentialLastIncursion.length > 0) {
      newPotentialLastIncursion.sort((a, b) => b.createdAt - a.createdAt);
      newPotentialLastIncursion[0].updatedAt = Date.now();
      this.saveLastIncursion(newPotentialLastIncursion[0]);
    }

    this.replaceAndUpdateCurrentIncursions(newCurrentIncursions);
  }

  clearNoIncursionMessageId() {
    this.incursionsCache.noIncursionMessageId = null;
    this.saveCacheToFile();
  }

  saveNoIncursionMessageId(noIncursionMessageId: string) {
    this.incursionsCache.noIncursionMessageId = noIncursionMessageId;
    this.saveCacheToFile();
  }

  private saveCurrentIncursions(incursionsCacheEntry: IncursionsCacheEntry[]) {
    this.incursionsCache.currentIncursions = incursionsCacheEntry;
    this.saveCacheToFile();
  }

  private saveLastIncursion(incursionsCacheEntry: IncursionsCacheEntry) {
    this.incursionsCache.lastIncursion = incursionsCacheEntry;
    this.saveCacheToFile();
  }

  private saveCacheToFile() {
    try {
      // 將 stateChangeTimestamps 一起寫入
      const cacheWithState = {
        ...this.incursionsCache,
        stateChangeTimestamps: this.stateChangeTimestamps,
      };
      writeFileSync(
        this.incursionCacheFilePath,
        JSON.stringify(cacheWithState, null, 4),
        "utf8"
      );
    } catch (err) {
      console.log("An error occured while writing JSON Object to File.");
      console.log(err);
    }
  }

  getStateChangeTimestamps() {
    return this.stateChangeTimestamps;
  }

  setStateChangeTimestamps(newTimestamps: { [constellationId: number]: { [state: string]: string } }) {
    this.stateChangeTimestamps = newTimestamps;
    this.saveCacheToFile();
  }
}

export default IncursionsCacheService;
