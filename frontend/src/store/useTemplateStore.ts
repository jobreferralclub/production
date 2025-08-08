import {create} from 'zustand';
import { TemplateName } from '../components/resume-builder/Templates';

interface TemplateStore {
    currentTemplate: TemplateName;
    setCurrentTemplate: (template: TemplateName) => void;
}

const useTemplateStore = create<TemplateStore>((set) => ({
    currentTemplate: null,
    setCurrentTemplate: (template) => set({ currentTemplate: template }),
}));

export default useTemplateStore;