// LivePreview.tsx
import React from "react";
import useTemplateStore from "../../store/useTemplateStore";
import { templates } from "../../components/resume-builder/Templates";
import TemplateSelectionPopup from "./TemplateSelectionPopup";

const LivePreview: React.FC = () => {
  const currentTemplate = useTemplateStore((state) => state.currentTemplate);
  const Template = templates[currentTemplate];

  return (
    <div style={{ fontSize: '0.75rem' }}> {/* This will make everything 75% of normal size */}
      <TemplateSelectionPopup />
      <Template />
    </div>
  );
};

export default LivePreview;