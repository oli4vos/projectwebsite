export type AppType = "frontend" | "api";
export type AppStatus = "active" | "beta" | "draft";

export type AppManifest = {
  slug: string;
  title: string;
  description: string;
  type: AppType;
  category: string;
  tags: string[];
  status: AppStatus;
  version?: string;
  entry: string;
};
