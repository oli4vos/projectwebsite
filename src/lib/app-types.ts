export type AppType = "frontend" | "api";
export type AppStatus = "active" | "beta" | "draft";
export type AppVisibility = "public" | "hidden";

export type AppManifest = {
  slug: string;
  title: string;
  description: string;
  type: AppType;
  category: string;
  tags: string[];
  status: AppStatus;
  visibility?: AppVisibility;
  version?: string;
  entry: string;
};
