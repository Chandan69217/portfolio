"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type SocialLinks = {
  telegram: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  github: string;
  phone: string;
};

export type PortfolioConfig = {
  title: string;
  description: { long: string; short: string };
  keywords: string[];
  author: string;
  email: string;
  site: string;
  githubUsername: string;
  githubRepo: string;
  resumeUrl: string;
  profilePic?: string;
  snowfallEnabled: boolean;
  snowfallColorLight: string;
  snowfallColorDark: string;
  social: SocialLinks;
};

export type ExperienceEntry = {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  description: string[];
  skills: string[];
};

export type ProjectEntry = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  live: string;
  github?: string;
  description: string;
  skills: {
    frontend: string[];
    backend: string[];
  };
};

export type PortfolioData = {
  config: PortfolioConfig;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillItem[];
};

export type SkillItem = {
  id: string;
  name: string;
  label: string;
  shortDescription: string;
  color?: string;
  icon: string;
  order: number;
};

type PortfolioDataContextType = {
  data: PortfolioData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  skillsMap: Record<string, SkillItem>;
};

const PortfolioDataContext = createContext<PortfolioDataContextType>({
  data: null,
  loading: true,
  refresh: async () => {},
  skillsMap: {},
});

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  const skillsMap = React.useMemo(() => {
    const map: Record<string, SkillItem> = {};
    if (data?.skills) {
      data.skills.forEach((s) => {
        map[s.name] = s;
        map[s.id] = s; // Map both name and id
      });
    }
    return map;
  }, [data?.skills]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/portfolio-data", {
        cache: "no-store",
        next: { revalidate: 0 },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load portfolio data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PortfolioDataContext.Provider
      value={{ data, loading, refresh: fetchData, skillsMap }}
    >
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  return useContext(PortfolioDataContext);
}
