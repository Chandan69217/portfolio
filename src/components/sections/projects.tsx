"use client";
import Image from "next/image";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
  useModal,
} from "../ui/animated-modal";
import { FloatingDock } from "../ui/floating-dock";
import Link from "next/link";

import { usePortfolioData, ProjectEntry } from "@/contexts/PortfolioDataContext";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";

const ProjectsSection = () => {
  const { data } = usePortfolioData();
  const projects = data?.projects || [];

  return (
    <SectionWrapper id="projects" className="max-w-7xl mx-auto min-h-screen">
      <SectionHeader id='projects' title="Projects" />
      <div className="grid grid-cols-1 md:grid-cols-3">
        {projects.map((project, index) => (
          <Modall key={project.src} project={project} />
        ))}
      </div>
    </SectionWrapper>
  );
};
const ModalCancelButton = () => {
  const { setOpen } = useModal();
  return (
    <button
      onClick={() => setOpen(false)}
      className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28"
    >
      Cancel
    </button>
  );
};

const Modall = ({ project }: { project: ProjectEntry }) => {
  return (
    <div className="flex items-center justify-center ">
      <Modal>
        <ModalTrigger className="bg-transparent flex justify-center group/modal-btn">
          <div
            className="relative w-[400px] h-auto rounded-lg overflow-hidden"
            style={{ aspectRatio: "3/2" }}
          >
            <Image
              className="absolute w-full h-full top-0 left-0 hover:scale-[1.05] transition-all"
              src={project.src}
              alt={project.title}
              width={300}
              height={300}
            />
            <div className="absolute w-full h-1/2 bottom-0 left-0 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none">
              <div className="flex flex-col h-full items-start justify-end p-6">
                <div className="text-lg text-left">{project.title}</div>
                <div className="text-xs bg-white text-black rounded-lg w-fit px-2">
                  {project.category}
                </div>
              </div>
            </div>
          </div>
        </ModalTrigger>
        <ModalBody className="md:max-w-4xl">
          <ModalContent>
            <ProjectContents project={project} />
          </ModalContent>
          <ModalFooter className="gap-4">
            <ModalCancelButton />
            <Link href={project.live} target="_blank">
              <button className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28">
                Visit
              </button>
            </Link>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
};
export default ProjectsSection;

const ProjectContents = ({ project }: { project: ProjectEntry }) => {
  const { skillsMap } = usePortfolioData();

  // Build skill for FloatingDock - show icon from skillsMap if known, else show text badge
  const buildSkill = (id: string) => {
    const skill = skillsMap[id];
    if (skill) {
      return {
        title: skill.label,
        bg: skill.color || "#333",
        fg: "white",
        icon: <img src={skill.icon} alt={skill.label} className="w-5 h-5 flex-shrink-0 object-contain" />,
      };
    }
    // Fallback: show the raw skill name as a text badge
    return {
      title: id,
      bg: "#333",
      fg: "white",
      icon: <span className="text-[10px] font-bold uppercase">{id.slice(0, 2)}</span>,
    };
  };

  const frontendSkills = (project.skills.frontend || []).map(buildSkill);
  const backendSkills = (project.skills.backend || []).map(buildSkill);

  // Screenshots: could be full URLs or base64 strings
  const screenshots = project.screenshots || [];

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-y-auto no-scrollbar">
      <h4 className="text-xl md:text-3xl text-neutral-800 dark:text-neutral-100 font-bold text-center mb-6 px-4 shrink-0">
        {project.title}
      </h4>

      {/* Tech Stack */}
      <div className="flex flex-col md:flex-row md:justify-evenly w-full mt-2 shrink-0">
        {frontendSkills.length > 0 && (
          <div className="flex flex-col justify-center items-center gap-3 mb-6 md:mb-8">
            <p className="text-xs md:text-sm font-semibold text-neutral-500 uppercase tracking-widest">
              Frontend
            </p>
            <FloatingDock items={frontendSkills} />
          </div>
        )}
        {backendSkills.length > 0 && (
          <div className="flex flex-col justify-center items-center gap-3 mb-8">
            <p className="text-xs md:text-sm font-semibold text-neutral-500 uppercase tracking-widest">
              Backend
            </p>
            <FloatingDock items={backendSkills} />
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm md:text-base font-mono mb-8 text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto break-words px-2 md:px-0 shrink-0">
          {project.description}
        </p>
      )}

      {/* Screenshots Gallery */}
      {screenshots.length > 0 && (
        <div className="mt-4 flex flex-col gap-4 shrink-0 px-2 md:px-0 pb-4">
          <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-2">Screenshots</p>
          {screenshots.map((src, idx) => (
            <div key={idx} className="w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${project.title} screenshot ${idx + 1}`}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

