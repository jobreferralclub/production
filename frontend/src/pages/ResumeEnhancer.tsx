import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, UploadCloud } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import lottie from "lottie-web";
import { useNavigate } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import useResumeStore, {
    Experience,
    Education,
    Skill,
    Project,
} from "@/store/useResumeStore";
import LivePreview from "@/components/resume-builder/LivePreview";
import TemplateSelectionPopup from "@/components/resume-builder/TemplateSelectionPopup";

const ResumeEnhancer = () => {
    const [resumeText, setResumeText] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"idle" | "uploading" | "enhancing" | "done">("idle");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const lottieContainerRef = useRef<HTMLDivElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_API_URL;

    const resumeTips = [
        "Tailor your resume for each job application.",
        "Use action verbs like 'Led', 'Built', 'Achieved'.",
        "Quantify accomplishments with metrics.",
        "Keep it concise—ideally one page for < 10 years experience.",
        "Highlight ATS-friendly keywords from job descriptions.",
        "Avoid passive phrases like 'Responsible for...'",
        "Include relevant side projects or contributions.",
    ];

    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [showTips, setShowTips] = useState(false);


    const {
        updatePersonalInfo,
        addExperience,
        updateExperience,
        addEducation,
        updateEducation,
        addSkill,
        updateSkill,
        addProject,
        updateProject,
    } = useResumeStore();

    type PersonalInfo = {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        website?: string;
        linkedin?: string;
        github?: string;
    };

    useEffect(() => {
        let tipInterval: NodeJS.Timeout;

        if (step === "enhancing") {
            setShowTips(true);
            tipInterval = setInterval(() => {
                setCurrentTipIndex((prev) => (prev + 1) % resumeTips.length);
            }, 3500);
        } else {
            setShowTips(false);
            clearInterval(tipInterval);
        }

        return () => clearInterval(tipInterval);
    }, [step]);


    useEffect(() => {
        if (!showSuccessMessage || !lottieContainerRef.current) return;
        const animation = lottie.loadAnimation({
            container: lottieContainerRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "/Generate Resume.json",
        });
        return () => animation.destroy();
    }, [showSuccessMessage]);

    const handleDownloadPDF = async () => {
        try {
            const html = document.querySelector("#resume-preview")?.outerHTML;
            if (!html) {
                alert("Resume preview not found.");
                return;
            }

            const response = await fetch(`${apiUrl}/generate-pdf`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ html }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "resume.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Failed to download PDF.");
        }
    };


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file); // store file for UI display

        const formData = new FormData();
        formData.append("resume", file);
        setStep("uploading");

        try {
            const res = await axios.post(`${apiUrl}/extract-text`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResumeText(res.data.text);
        } catch (err) {
            alert("Error extracting text. Is the backend running?");
            setStep("idle");
        }
    };

    const handleEnhance = async () => {
        if (!resumeText.trim()) return;
        setLoading(true);
        setStep("enhancing");

        try {
            const res = await axios.post(`${apiUrl}/enhance-resume`, {
                resumeText,
            });

            const data = res.data;
            const { personalInfo, experience, education, skills, projects } = data;

            Object.entries(personalInfo).forEach(([key, value]) => {
                if (key in personalInfo) {
                    updatePersonalInfo(key as keyof PersonalInfo, value as string);
                }
            });

            experience?.forEach((item: Experience) => addExperience(item));
            education?.forEach((item: Education) => addEducation(item));
            skills?.forEach((item: Skill) => addSkill(item));
            projects?.forEach((item: Project) => addProject(item));

            setStep("done");
            setShowSuccessMessage(true);
            setTimeout(() => setIsFadingOut(true), 3000);
            setTimeout(() => {
                setShowSuccessMessage(false);
                setIsFadingOut(false);
            }, 3500);
        } catch (error) {
            alert("Error enhancing resume. Check if backend and API key are set.");
            setStep("idle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] text-white py-12 px-4">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 transition-all duration-500">
                {/* Left: Upload/Enhance Form */}
                <div
                    className={`backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden transition-all duration-500 ${step === "done" ? "w-full lg:w-1/2" : "w-full"
                        }`}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#79e7081a] via-transparent to-transparent rounded-3xl pointer-events-none z-0" />
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent tracking-tight">
                            AI Resume Enhancer
                        </h1>
                        <p className="text-center text-gray-400 mb-10 max-w-xl mx-auto">
                            Upload your <span className="font-semibold text-white">PDF</span> or{" "}
                            <span className="font-semibold text-white">DOCX</span> resume. Let our AI optimize it for better performance
                            with Applicant Tracking Systems (ATS).
                        </p>

                        {/* Upload Box */}
                        <div className="mb-8">
                            <label
                                htmlFor="resumeUpload"
                                className="cursor-pointer border-2 border-dashed border-lime-400/50 rounded-2xl px-6 py-10 flex flex-col items-center justify-center gap-4 text-center hover:bg-lime-400/5 transition-all"
                            >
                                <UploadCloud className="w-10 h-10 text-lime-400" />
                                <span className="text-white font-semibold text-lg">
                                    Click to upload your resume
                                </span>
                                <span className="text-sm text-gray-400">
                                    Accepted formats: <strong>PDF</strong>, <strong>DOCX</strong>
                                </span>
                                <Input
                                    id="resumeUpload"
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>

                            {selectedFile && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-white text-sm">
                                    <UploadCloud className="w-4 h-4 text-lime-400" />
                                    <span>{selectedFile.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center mb-6">
                            <Button
                                onClick={handleEnhance}
                                disabled={loading || !resumeText}
                                className="bg-gradient-to-r from-lime-400 to-green-500 hover:brightness-110 text-black font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enhancing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" /> Enhance with AI
                                    </>
                                )}
                            </Button>
                        </div>

                        {showTips && (
                            <div className="mt-6 text-center text-sm text-gray-400 min-h-[24px]">
                                <SwitchTransition>
                                    <CSSTransition
                                        key={resumeTips[currentTipIndex]}
                                        timeout={500}
                                        classNames="fade"
                                    >
                                        <div>{resumeTips[currentTipIndex]}</div>
                                    </CSSTransition>
                                </SwitchTransition>
                            </div>
                        )}


                        {step === "done" && (
                            <div className="flex justify-center mt-6">
                                <Button
                                    onClick={() => navigate("/ai-resume-builder/preview")}
                                    className="bg-white text-black font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition-all"
                                >
                                    Edit Resume
                                </Button>
                            </div>
                        )}

                        {step === "done" && (
                            <div className="flex justify-center mt-4">
                                <Button
                                    onClick={handleDownloadPDF}
                                    className="bg-gradient-to-r from-blue-400 to-purple-500 hover:brightness-110 text-white font-semibold px-6 py-2 rounded-full shadow transition-all"
                                >
                                    Download PDF
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Live Preview */}
                {step === "done" && (
                    <div className="w-full lg:w-1/2 transition-all duration-500">
                        <LivePreview />
                    </div>
                )}
            </div>
        </div>

    );
};

export default ResumeEnhancer;
