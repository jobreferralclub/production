import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  location?: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
};

export type Skill = {
  id: string;
  name: string;
  level: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
};

type ResumeState = {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];

  updatePersonalInfo: <K extends keyof PersonalInfo>(
    field: K,
    value: PersonalInfo[K]
  ) => void;


  addExperience: (exp?: Partial<Experience>) => void;
  updateExperience: (id: string, field: keyof Experience, value: any) => void;
  removeExperience: (id: string) => void;

  addEducation: (edu?: Partial<Education>) => void;
  updateEducation: (id: string, field: keyof Education, value: any) => void;
  removeEducation: (id: string) => void;

  addSkill: (skill?: Partial<Skill>) => void;
  updateSkill: (id: string, field: keyof Skill, value: any) => void;
  removeSkill: (id: string) => void;

  addProject: (project?: Partial<Project>) => void;
  updateProject: (id: string, field: keyof Project, value: any) => void;
  removeProject: (id: string) => void;
};

const useResumeStore = create<ResumeState>((set) => ({
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],

  updatePersonalInfo: (field, value) =>
    set((state) => ({
      personalInfo: { ...state.personalInfo, [field]: value },
    })),

  addExperience: (exp = {}) =>
    set((state) => ({
      experience: [
        ...state.experience,
        {
          id: exp.id ?? uuidv4(),
          company: exp.company ?? "",
          position: exp.position ?? "",
          startDate: exp.startDate ?? "",
          endDate: exp.endDate ?? "",
          description: exp.description ?? "",
          current: exp.current ?? false,
        },
      ],
    })),
  updateExperience: (id, field, value) =>
    set((state) => ({
      experience: state.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    })),
  removeExperience: (id) =>
    set((state) => ({
      experience: state.experience.filter((exp) => exp.id !== id),
    })),

  addEducation: (edu = {}) =>
    set((state) => ({
      education: [
        ...state.education,
        {
          id: edu.id ?? uuidv4(),
          school: edu.school ?? "",
          degree: edu.degree ?? "",
          field: edu.field ?? "",
          startDate: edu.startDate ?? "",
          endDate: edu.endDate ?? "",
          gpa: edu.gpa ?? "",
        },
      ],
    })),
  updateEducation: (id, field, value) =>
    set((state) => ({
      education: state.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    })),
  removeEducation: (id) =>
    set((state) => ({
      education: state.education.filter((edu) => edu.id !== id),
    })),

  addSkill: (skill = {}) =>
    set((state) => ({
      skills: [
        ...state.skills,
        {
          id: skill.id ?? uuidv4(),
          name: skill.name ?? "",
          level: skill.level ?? "Intermediate",
        },
      ],
    })),
  updateSkill: (id, field, value) =>
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    })),
  removeSkill: (id) =>
    set((state) => ({
      skills: state.skills.filter((skill) => skill.id !== id),
    })),

  addProject: (project = {}) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          id: project.id ?? uuidv4(),
          name: project.name ?? "",
          description: project.description ?? "",
          technologies: project.technologies ?? "",
          url: project.url ?? "",
        },
      ],
    })),
  updateProject: (id, field, value) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      ),
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    })),
}));

export default useResumeStore;
