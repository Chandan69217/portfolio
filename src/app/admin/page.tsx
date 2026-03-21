"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortfolioData, SkillItem } from "@/contexts/PortfolioDataContext";

const TABS = ["Personal Info", "Social Links", "Experience", "Projects", "Tech Stack"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Personal Info");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    // 1. Check if authenticated
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((res) => {
        if (!res.authenticated) {
          router.push("/admin/login");
          return;
        }
        // 2. If authenticated, fetch data
        return fetch("/api/portfolio-data");
      })
      .then(async (r) => {
        if (!r) return; // already redirected
        if (!r.ok) {
          const text = await r.text();
          let errorMsg = `Server error: ${r.status}`;
          try {
            const json = JSON.parse(text);
            if (json.error) errorMsg = json.error;
          } catch {}
          throw new Error(errorMsg);
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        showToast(err.message || "Failed to load data", "error");
        setLoading(false);
      });
  }, [router]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast("Changes saved successfully!", "success");
      } else if (res.status === 401) {
        router.push("/admin/login");
      } else {
        const errJson = await res.json().catch(() => ({}));
        showToast(`Failed to save: ${errJson.error || res.statusText}`, "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/50">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading portfolio data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span className="font-bold text-white">Portfolio Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              View Portfolio ↗
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : "Save Changes"}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-white/40 hover:text-white/80 px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ═══════════════ TAB: Personal Info ═══════════════ */}
        {activeTab === "Personal Info" && (
          <div className="space-y-6">
            <SectionCard title="Personal Info" subtitle="Your name, bio, and basic details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Full Name / Title"
                  value={data.config.author}
                  onChange={(v) => setData({ ...data, config: { ...data.config, author: v } })}
                />
                <Field
                  label="Email"
                  value={data.config.email}
                  onChange={(v) => setData({ ...data, config: { ...data.config, email: v } })}
                />
                <Field
                  label="Site URL"
                  value={data.config.site}
                  onChange={(v) => setData({ ...data, config: { ...data.config, site: v } })}
                />
                <Field
                  label="Page Title"
                  value={data.config.title}
                  onChange={(v) => setData({ ...data, config: { ...data.config, title: v } })}
                />
                <Field
                  label="GitHub Username"
                  value={data.config.githubUsername}
                  onChange={(v) => setData({ ...data, config: { ...data.config, githubUsername: v } })}
                />
                <Field
                  label="GitHub Repo"
                  value={data.config.githubRepo}
                  onChange={(v) => setData({ ...data, config: { ...data.config, githubRepo: v } })}
                />
                <Field
                  label="Resume PDF URL (Google Drive/Dropbox link)"
                  value={data.config.resumeUrl}
                  onChange={(v) => setData({ ...data, config: { ...data.config, resumeUrl: v } })}
                />
                <ImageUploadField
                  label="Profile Picture (Base64)"
                  value={data.config.profilePic || ""}
                  onChange={(v) => setData({ ...data, config: { ...data.config, profilePic: v } })}
                />
              </div>
              <TextareaField
                label="Short Description"
                value={data.config.description.short}
                onChange={(v) =>
                  setData({ ...data, config: { ...data.config, description: { ...data.config.description, short: v } } })
                }
                rows={2}
              />
              <TextareaField
                label="Long Description"
                value={data.config.description.long}
                onChange={(v) =>
                  setData({ ...data, config: { ...data.config, description: { ...data.config.description, long: v } } })
                }
                rows={4}
              />
              <div>
                <label className="block text-sm text-white/60 mb-2">Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={data.config.keywords.join(", ")}
                  onChange={(e) =>
                    setData({
                      ...data,
                      config: { ...data.config, keywords: e.target.value.split(",").map((k) => k.trim()) },
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </SectionCard>
            
            <SectionCard title="Visual Effects" subtitle="Configure Snowfall background effect">
              <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5 mb-4">
                <div>
                  <h3 className="font-medium text-white">Enable Snowfall</h3>
                  <p className="text-xs text-white/50">Show falling snow across your portfolio</p>
                </div>
                <button
                  onClick={() => setData({ ...data, config: { ...data.config, snowfallEnabled: !data.config.snowfallEnabled } })}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                    data.config.snowfallEnabled ? "bg-indigo-600" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      data.config.snowfallEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              
              {data.config.snowfallEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Snow Color (Light Mode)</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={data.config.snowfallColorLight || "#000000"}
                        onChange={(e) => setData({ ...data, config: { ...data.config, snowfallColorLight: e.target.value } })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-none p-0"
                      />
                      <input
                        type="text"
                        value={data.config.snowfallColorLight || "#000000"}
                        onChange={(e) => setData({ ...data, config: { ...data.config, snowfallColorLight: e.target.value } })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Snow Color (Dark Mode)</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={data.config.snowfallColorDark || "#ffffff"}
                        onChange={(e) => setData({ ...data, config: { ...data.config, snowfallColorDark: e.target.value } })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-none p-0"
                      />
                      <input
                        type="text"
                        value={data.config.snowfallColorDark || "#ffffff"}
                        onChange={(e) => setData({ ...data, config: { ...data.config, snowfallColorDark: e.target.value } })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ═══════════════ TAB: Social Links ═══════════════ */}
        {activeTab === "Social Links" && (
          <SectionCard title="Social Links" subtitle="Update all your social media and contact URLs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(data.config.social) as (keyof typeof data.config.social)[]).map((key) => (
                <Field
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={data.config.social[key]}
                  onChange={(v) =>
                    setData({
                      ...data,
                      config: { ...data.config, social: { ...data.config.social, [key]: v } },
                    })
                  }
                />
              ))}
            </div>
          </SectionCard>
        )}

        {/* ═══════════════ TAB: Experience ═══════════════ */}
        {activeTab === "Experience" && (
          <div className="space-y-6">
            {data.experience.map((exp, i) => (
              <SectionCard
                key={exp.id}
                title={`Experience ${i + 1}`}
                subtitle={`${exp.title} @ ${exp.company}`}
                action={
                  <button
                    onClick={() => {
                      const updated = data.experience.filter((_, idx) => idx !== i);
                      setData({ ...data, experience: updated });
                    }}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Remove
                  </button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Job Title"
                    value={exp.title}
                    onChange={(v) => {
                      const updated = [...data.experience];
                      updated[i] = { ...updated[i], title: v };
                      setData({ ...data, experience: updated });
                    }}
                  />
                  <Field
                    label="Company"
                    value={exp.company}
                    onChange={(v) => {
                      const updated = [...data.experience];
                      updated[i] = { ...updated[i], company: v };
                      setData({ ...data, experience: updated });
                    }}
                  />
                  <Field
                    label="Start Date (e.g. Jan 2023)"
                    value={exp.startDate}
                    onChange={(v) => {
                      const updated = [...data.experience];
                      updated[i] = { ...updated[i], startDate: v };
                      setData({ ...data, experience: updated });
                    }}
                  />
                  <Field
                    label='End Date (or "Present")'
                    value={exp.endDate}
                    onChange={(v) => {
                      const updated = [...data.experience];
                      updated[i] = { ...updated[i], endDate: v };
                      setData({ ...data, experience: updated });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Description (one item per line)</label>
                  <textarea
                    rows={4}
                    value={exp.description.join("\n")}
                    onChange={(e) => {
                      const updated = [...data.experience];
                      updated[i] = { ...updated[i], description: e.target.value.split("\n") };
                      setData({ ...data, experience: updated });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={exp.skills.join(", ")}
                    onChange={(e) => {
                      const updated = [...data.experience];
                      updated[i] = { ...updated[i], skills: e.target.value.split(",").map((s) => s.trim()) };
                      setData({ ...data, experience: updated });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </SectionCard>
            ))}

            <button
              onClick={() =>
                setData({
                  ...data,
                  experience: [
                    ...data.experience,
                    {
                      id: Date.now(),
                      title: "New Role",
                      company: "Company Name",
                      startDate: "Jan 2024",
                      endDate: "Present",
                      description: ["Describe your responsibilities here."],
                      skills: [],
                    },
                  ],
                })
              }
              className="w-full border border-dashed border-white/20 hover:border-indigo-500/50 text-white/40 hover:text-indigo-400 rounded-xl py-4 text-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Add Experience
            </button>
          </div>
        )}

        {/* ═══════════════ TAB: Projects ═══════════════ */}
        {activeTab === "Projects" && (
          <div className="space-y-6">
            {data.projects.map((project, i) => (
              <SectionCard
                key={project.id}
                title={project.title}
                subtitle={project.category}
                action={
                  <button
                    onClick={() => {
                      const updated = data.projects.filter((_, idx) => idx !== i);
                      setData({ ...data, projects: updated });
                    }}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Remove
                  </button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Title"
                    value={project.title}
                    onChange={(v) => {
                      const updated = [...data.projects];
                      updated[i] = { ...updated[i], title: v };
                      setData({ ...data, projects: updated });
                    }}
                  />
                  <Field
                    label="Category"
                    value={project.category}
                    onChange={(v) => {
                      const updated = [...data.projects];
                      updated[i] = { ...updated[i], category: v };
                      setData({ ...data, projects: updated });
                    }}
                  />
                  <Field
                    label="Live URL"
                    value={project.live}
                    onChange={(v) => {
                      const updated = [...data.projects];
                      updated[i] = { ...updated[i], live: v };
                      setData({ ...data, projects: updated });
                    }}
                  />
                  <Field
                    label="GitHub URL"
                    value={project.github || ""}
                    onChange={(v) => {
                      const updated = [...data.projects];
                      updated[i] = { ...updated[i], github: v };
                      setData({ ...data, projects: updated });
                    }}
                  />
                  <ImageUploadField
                    label="Project Main Image (src)"
                    value={project.src}
                    onChange={(v) => {
                      const updated = [...data.projects];
                      updated[i] = { ...updated[i], src: v };
                      setData({ ...data, projects: updated });
                    }}
                  />
                  <MultiImageUploadField
                    label="Project Screenshots"
                    values={project.screenshots}
                    onChange={(v) => {
                      const updated = [...data.projects];
                      updated[i] = { ...updated[i], screenshots: v };
                      setData({ ...data, projects: updated });
                    }}
                  />
                </div>
                <TextareaField
                  label="Description"
                  value={project.description}
                  onChange={(v) => {
                    const updated = [...data.projects];
                    updated[i] = { ...updated[i], description: v };
                    setData({ ...data, projects: updated });
                  }}
                  rows={3}
                />
                <div className="grid grid-cols-1 gap-4 md:col-span-2">
                  <SkillSelectorField
                    label="Frontend Skills"
                    selectedIds={project.skills.frontend}
                    allSkills={data.skills}
                    onChange={(ids) => {
                      const updated = [...data.projects];
                      updated[i] = { ...updated[i], skills: { ...updated[i].skills, frontend: ids } };
                      setData({ ...data, projects: updated });
                    }}
                    onAddNewSkill={(skill) => {
                      if (!data.skills.find((s) => s.id === skill.id)) {
                        setData({ ...data, skills: [...data.skills, skill] });
                      }
                    }}
                  />
                  <SkillSelectorField
                    label="Backend Skills"
                    selectedIds={project.skills.backend}
                    allSkills={data.skills}
                    onChange={(ids) => {
                      const updated = [...data.projects];
                      updated[i] = { ...updated[i], skills: { ...updated[i].skills, backend: ids } };
                      setData({ ...data, projects: updated });
                    }}
                    onAddNewSkill={(skill) => {
                      if (!data.skills.find((s) => s.id === skill.id)) {
                        setData({ ...data, skills: [...data.skills, skill] });
                      }
                    }}
                  />
                </div>
              </SectionCard>
            ))}

            <button
              onClick={() =>
                setData({
                  ...data,
                  projects: [
                    ...data.projects,
                    {
                      id: `project-${Date.now()}`,
                      title: "New Project",
                      category: "Category",
                      src: "",
                      screenshots: [],
                      live: "https://",
                      github: "",
                      description: "Describe your project here.",
                      skills: { frontend: [], backend: [] },
                    },
                  ],
                })
              }
              className="w-full border border-dashed border-white/20 hover:border-indigo-500/50 text-white/40 hover:text-indigo-400 rounded-xl py-4 text-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Add Project
            </button>
          </div>
        )}

        {/* ═══════════════ TAB: Tech Stack ═══════════════ */}
        {activeTab === "Tech Stack" && (
          <div className="space-y-6">
            <SectionCard title="Tech Stack" subtitle="Manage skills shown on the 3D keyboard">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.skills.map((skill, i) => (
                  <div key={skill.id} className="p-4 border border-white/10 rounded-xl bg-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-white/30 truncate flex-1 mr-2">ID: {skill.id}</span>
                      <button
                        onClick={() => {
                          const updated = data.skills.filter((_, idx) => idx !== i);
                          setData({ ...data, skills: updated });
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-400/20"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Label (UI Name)"
                        value={skill.label}
                        onChange={(v) => {
                          const updated = [...data.skills];
                          updated[i] = { ...updated[i], label: v };
                          setData({ ...data, skills: updated });
                        }}
                      />
                      <Field
                        label="Internal Name (Spline mapping)"
                        value={skill.name}
                        onChange={(v) => {
                          const updated = [...data.skills];
                          updated[i] = { ...updated[i], name: v };
                          setData({ ...data, skills: updated });
                        }}
                      />
                    </div>
                    <IconUploadField
                      value={skill.icon}
                      onChange={(v) => {
                        const updated = [...data.skills];
                        updated[i] = { ...updated[i], icon: v };
                        setData({ ...data, skills: updated });
                      }}
                    />
                    <TextareaField
                      label="Short Description (Meme/Text)"
                      value={skill.shortDescription}
                      onChange={(v) => {
                        const updated = [...data.skills];
                        updated[i] = { ...updated[i], shortDescription: v };
                        setData({ ...data, skills: updated });
                      }}
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  setData({
                    ...data,
                    skills: [
                      ...data.skills,
                      {
                        id: `skill-${Date.now()}`,
                        name: "new-skill",
                        label: "New Skill",
                        shortDescription: "skibidi toilet rizz 💯🔥",
                        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
                        order: data.skills.length,
                      },
                    ],
                  })
                }
                className="w-full border border-dashed border-white/20 hover:border-indigo-500/50 text-white/40 hover:text-indigo-400 rounded-xl py-4 text-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add New Skill
              </button>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── UI Helpers ─── */

function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-semibold text-white text-base">{title}</h2>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
      />
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {value.startsWith("data:image") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/40">
            None
          </div>
        )}
        <label className="cursor-pointer flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500 rounded-xl px-4 py-3 text-white transition-all text-sm flex items-center justify-center">
            Upload Base64 Image
          </div>
        </label>
      </div>
    </div>
  );
}


function MultiImageUploadField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert all selected files to base64
    const promises = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((base64Strings) => {
      onChange([...values, ...base64Strings]);
    });
  };

  const removeImage = (indexToRemove: number) => {
    onChange(values.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      <div className="flex flex-wrap gap-4 items-center">
        {values.map((val, idx) => (
          <div key={idx} className="relative group">
            {val.startsWith("data:image") || val ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={val} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/40">
                Invalid
              </div>
            )}
            <button
              onClick={() => removeImage(idx)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500 border-dashed flex items-center justify-center text-2xl text-white/40 hover:text-indigo-400 transition-all">
            +
          </div>
        </label>
      </div>
    </div>
  );
}

function SkillSelectorField({
  label,
  selectedIds,
  allSkills,
  onChange,
  onAddNewSkill,
}: {
  label: string;
  selectedIds: string[];
  allSkills: SkillItem[];
  onChange: (ids: string[]) => void;
  onAddNewSkill: (skill: SkillItem) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    label: "",
    name: "",
    icon: "",
    shortDescription: "skibidi toilet rizz 💯🔥",
  });

  const toggleSkill = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleCreateSkill = () => {
    if (!newSkill.label || !newSkill.name) return;
    const skill: SkillItem = {
      id: `skill-${Date.now()}`,
      ...newSkill,
      order: allSkills.length,
    };
    onAddNewSkill(skill);
    onChange([...selectedIds, skill.id]);
    setNewSkill({ label: "", name: "", icon: "", shortDescription: "skibidi toilet rizz 💯🔥" });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-white/80">{label}</label>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-all"
        >
          {showAddForm ? "Cancel" : "+ Custom Skill"}
        </button>
      </div>

      {/* Selected Icons */}
      <div className="flex flex-wrap gap-2">
        {selectedIds.length > 0 ? (
          selectedIds.map((id) => {
            const skill = allSkills.find((s) => s.id === id);
            return (
              <div
                key={id}
                onClick={() => toggleSkill(id)}
                className="group relative cursor-pointer"
                title={skill?.label || id}
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center p-1.5 transition-all group-hover:border-red-500/50 group-hover:bg-red-500/5">
                  {skill?.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={skill.icon} alt={skill.label} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-white/40">{id.slice(0, 3)}</span>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  ×
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-white/20 italic py-2">No skills selected</div>
        )}
      </div>

      {/* Dropdown Selection */}
      {!showAddForm && (
        <select
          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer"
          value=""
          onChange={(e) => {
            if (e.target.value) toggleSkill(e.target.value);
          }}
        >
          <option value="" disabled className="bg-zinc-900 text-white/50">Select existing skill…</option>
          {allSkills
            .filter((s) => !selectedIds.includes(s.id))
            .map((s) => (
              <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                {s.label}
              </option>
            ))}
        </select>
      )}

      {/* Add New Skill Form */}
      {showAddForm && (
        <div className="space-y-4 pt-2 border-t border-white/5">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Label"
              value={newSkill.label}
              onChange={(v) => setNewSkill({ ...newSkill, label: v })}
            />
            <Field
              label="Spline Name"
              value={newSkill.name}
              onChange={(v) => setNewSkill({ ...newSkill, name: v })}
            />
          </div>
          <IconUploadField
            value={newSkill.icon}
            onChange={(v) => setNewSkill({ ...newSkill, icon: v })}
          />
          <button
            onClick={handleCreateSkill}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium transition-all shadow-lg"
          >
            Create & Add Skill
          </button>
        </div>
      )}
    </div>
  );
}

/** Upload an icon image OR paste a URL — shows a live preview */
function IconUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="col-span-2">
      <label className="block text-sm text-white/60 mb-2">Icon</label>
      <div className="flex items-start gap-3">
        {/* Live preview */}
        <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="icon preview" className="w-9 h-9 object-contain" />
          ) : (
            <span className="text-white/20 text-xs text-center leading-tight">No icon</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* Upload button */}
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*,.svg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-full bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/60 rounded-xl px-4 py-2.5 text-indigo-300 text-sm font-medium transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Icon (PNG / SVG)
            </div>
          </label>

          {/* URL input */}
          <input
            type="text"
            placeholder="…or paste an icon URL"
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );
}
