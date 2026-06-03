import {
  GeneralSectionSchema,
  TagSchema,
  UrlSchema,
} from "@jakubkanna/labguy-front-schema";
import { MediaRef } from "../src/utils/helpers";

export interface Work {
  id: number;
  general: GeneralSectionSchema & { tags?: TagSchema[] };
  etag: string;
  description?: string | null;
  dimensions?: string | null;
  technique?: string | null;
  medium?: string | null;
  year?: string | number | null;
  projects?: Record<string, unknown>[];
  media?: MediaRef[];
  urls: UrlSchema[];
}
