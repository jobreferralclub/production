import React from "react";
import useResumeStore from "../../store/useResumeStore";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Building,
  Linkedin,
  Github,
} from "lucide-react";

const LivePreview: React.FC = () => {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
  } = useResumeStore();

  console.log(experience)
  
  return (
    <div className="flex justify-center items-start w-full h-[calc(100vh-100px)] overflow-auto p-4 bg-gray-100 aspect-[0.7072]">
      <div
        className="bg-white shadow-md border border-gray-300 rounded-lg p-6 text-[12px] space-y-5 aspect-[0.7072] w-full"
        id="resume-preview"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: "24px" }}>
            {personalInfo.fullName || "Your Name"}
          </h1>
          <div className="flex flex-wrap justify-center gap-3 text-gray-600 text-[11px]">
            {personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail size={12} />
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone size={12} />
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                {personalInfo.address}
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1">
                <Globe size={12} />
                {personalInfo.website}
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin size={12} />
                {personalInfo.linkedin}
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1">
                <Github size={12} />
                {personalInfo.github}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 text-[12px] leading-tight text-justify">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-2">
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[13px] text-gray-900">
                        {exp.position}
                      </p>
                      <div className="flex items-center gap-1 text-gray-600 text-[11px]">
                        <Building size={10} />
                        {exp.company}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                      <Calendar size={10} />
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 mt-1 text-[11px] leading-tight">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-[13px]">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </p>
                      <p className="text-gray-600 text-[11px]">{edu.school}</p>
                      {edu.gpa && (
                        <p className="text-gray-500 text-[11px]">GPA: {edu.gpa}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                      <Calendar size={10} />
                      {edu.startDate} - {edu.endDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-2">
              Skills
            </h2>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-700">{skill.name}</span>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-[2px] rounded">
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-2">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-900 text-[13px]">
                      {project.name}
                    </p>
                    {project.url && (
                      <a
                        href={project.url}
                        className="text-blue-500 hover:underline text-[10px]"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    )}
                  </div>
                  <p className="text-gray-700 text-[11px]">{project.description}</p>
                  {project.technologies && (
                    <p className="text-gray-500 text-[10px]">
                      <strong>Technologies:</strong> {project.technologies}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
