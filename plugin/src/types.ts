import type { LanguageCode } from "./i18n";

export type LanguageSetting = "auto" | LanguageCode;

export interface PluginSettings {
  language: LanguageSetting;
  sourcePath: string;
  coreWeight: number;
  easyWeight: number;
  mediumWeight: number;
  hardWeight: number;
  recentPenalty: number;
  recentDays: number;
  reviewBoost: number;
  // Task id -> timestamp (ms) of the last time it was picked
  history: Record<string, number>;
}

export interface Task {
  title: string;
  id: string;
  difficulty: string;
  core: boolean;
  done: boolean;
  topic: string;
  slug: string;
  lineIndex: number;
}

export interface TopicStat {
  name: string;
  done: number;
  total: number;
  percent: number;
}

export interface Stats {
  sourceName: string;
  lineCount: number;
  total: number;
  done: number;
  remaining: number;
  percent: number;
  coreTotal: number;
  coreDone: number;
  byTopic: TopicStat[];
}