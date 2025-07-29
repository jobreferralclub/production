import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import lottie from "lottie-web";
import {
    ChevronRight,
    User,
    Mail,
    Phone,
    MapPin,
    Globe,
    FileText,
    LucideIcon,
} from "lucide-react";
import useResumeStore from "../store/useResumeStore";

type FieldType = "text" | "email" | "tel" | "url" | "textarea";

interface Field {
    id: keyof PersonalInfo;
    placeholder: string;
    icon: LucideIcon;
    type: FieldType;
    optional?: boolean;
}

interface GroupedQuestion {
    id: string;
    fields: Field[];
    question: string;
}

interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
}

const ResumeBuilderQuestionnaire: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [currentInput, setCurrentInput] = useState<Partial<PersonalInfo>>({});
    const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({});
    const [isAnimating, setIsAnimating] = useState(false);
    const [showInput, setShowInput] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const inputRefs = useRef<Array<HTMLInputElement | HTMLTextAreaElement | null>>([]);

    const { personalInfo, updatePersonalInfo } = useResumeStore();
    const navigate = useNavigate();

    const groupedQuestions: GroupedQuestion[] = [
        {
            id: "step1",
            fields: [
                { id: "fullName", placeholder: "Enter your full name", icon: User, type: "text" },
                { id: "email", placeholder: "Enter your email", icon: Mail, type: "email" },
            ],
            question: "Let's start with your name and email",
        },
        {
            id: "step2",
            fields: [
                { id: "phone", placeholder: "Enter your phone number", icon: Phone, type: "tel" },
                { id: "location", placeholder: "City, Country", icon: MapPin, type: "text" },
            ],
            question: "How can we contact you?",
        },
        {
            id: "step3",
            fields: [
                {
                    id: "website",
                    placeholder: "https://yourwebsite.com (optional)",
                    icon: Globe,
                    type: "url",
                    optional: true,
                },
                {
                    id: "summary",
                    placeholder: "Write a brief professional summary",
                    icon: FileText,
                    type: "textarea",
                },
            ],
            question: "Add your portfolio and a quick summary",
        },
    ];

    const currentGroup = groupedQuestions[currentStep];

    useEffect(() => {
        const prefill: Partial<PersonalInfo> = {};
        currentGroup.fields.forEach((field) => {
            prefill[field.id] = personalInfo[field.id] || "";
        });
        setCurrentInput(prefill);
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);
        setErrors({});
    }, [currentStep]);

    useEffect(() => {
        if (!showSuccessMessage) return;
        const container = document.getElementById("lottie-container");
        if (!container) return;
        const animation = lottie.loadAnimation({
            container,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "/Generate Resume.json",
        });
        return () => animation.destroy();
    }, [showSuccessMessage]);

    const validateField = (id: keyof PersonalInfo, value: string): string => {
        switch (id) {
            case "email":
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format.";
            case "phone":
                return /^\+?\d{10,}$/.test(value.replace(/[\s()-]/g, ""))
                    ? ""
                    : "Invalid phone number.";
            case "website":
                if (!value.trim()) return "";
                try {
                    new URL(value);
                    return "";
                } catch {
                    return "Invalid URL format.";
                }
            case "summary":
                return value.trim().length >= 100 ? "" : "Summary must be at least 100 characters.";
            default:
                return value.trim() ? "" : "This field is required.";
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const field = currentGroup.fields[index];
            const value = currentInput[field.id] || "";
            const error = field.optional ? "" : validateField(field.id, value);
            if (error) {
                setErrors({ [field.id]: error });
                return;
            }
            setErrors((prev) => ({ ...prev, [field.id]: "" }));
            if (index < currentGroup.fields.length - 1) {
                inputRefs.current[index + 1]?.focus();
            } else {
                handleNext();
            }
        }
    };

    const handleNext = () => {
        const newErrors: Partial<Record<keyof PersonalInfo, string>> = {};
        currentGroup.fields.forEach((field) => {
            const value = currentInput[field.id] || "";
            const error = field.optional ? "" : validateField(field.id, value);
            if (error) newErrors[field.id] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsAnimating(true);
        setShowInput(false);

        currentGroup.fields.forEach((field) => {
            updatePersonalInfo(field.id, currentInput[field.id] || "");
        });

        if (currentStep === groupedQuestions.length - 1) {
            setTimeout(() => {
                setShowSuccessMessage(true);
                setIsAnimating(false);
                setShowInput(false);
                setTimeout(() => setIsFadingOut(true), 3000);
                setTimeout(() => navigate("/ai-resume-builder/preview"), 3500);
            }, 300);
        } else {
            setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
                setIsAnimating(false);
                setShowInput(true);
            }, 300);
        }
    };

    const getTotalProgress = () => {
        const allFields = groupedQuestions.flatMap((group) => group.fields);
        const total = allFields.filter((field) => !field.optional).length;
        const filled = allFields.reduce((count, field) => {
            const value = personalInfo[field.id] || currentInput[field.id] || "";
            if (field.optional) return count;
            return value.trim() ? count + 1 : count;
        }, 0);
        return (filled / total) * 100;
    };

    const progress = getTotalProgress();

    if (showSuccessMessage) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div
                    className={`flex flex-col items-center space-y-4 transition-opacity duration-500 ${isFadingOut ? "opacity-0" : "opacity-100"
                        }`}
                >
                    <div id="lottie-container" className="w-64 h-64 mx-auto" />
                    <h2 className="text-2xl font-bold text-center">
                        Building your resume 🔃
                    </h2>
                    <p className="text-gray-400 text-center max-w-md">
                        You’ve successfully filled in your basic details. We’re redirecting
                        you to the next section to complete your resume.
                    </p>
                </div>
            </div>
        );
    }
    // (No TSX changes needed in the return except for ref typing, already handled)

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            {/* Progress Bar */}
            <div className="w-full max-w-2xl mb-8">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-400">
                        Step {currentStep + 1} of {groupedQuestions.length}
                    </span>
                    <span className="text-sm text-gray-400">
                        {Math.round(progress)}% Complete
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                        className="h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: "#79e708",
                        }}
                    />
                </div>
            </div>

            {/* Grouped Questions */}
            <div className="w-full max-w-2xl">
                <div
                    className={`transition-all duration-300 ${isAnimating
                        ? "opacity-0 transform translate-y-4"
                        : "opacity-100 transform translate-y-0"
                        }`}
                >
                    <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
                        {currentGroup.question}
                    </h1>

                    <div className="grid gap-6">
                        {currentGroup.fields.map((field, index) => (
                            <div key={field.id}>
                                <div className="flex items-center mb-2">
                                    <field.icon className="w-5 h-5 mr-2 text-[#79e708]" />
                                    <span className="font-medium text-lg capitalize">
                                        {field.id.replace(/([A-Z])/g, " $1")}
                                    </span>
                                </div>
                                {field.type === "textarea" ? (
                                    <>
                                        <textarea
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            value={currentInput[field.id]}
                                            onChange={(e) =>
                                                setCurrentInput({
                                                    ...currentInput,
                                                    [field.id]: e.target.value,
                                                })
                                            }
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            placeholder={field.placeholder}
                                            className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#79e708] focus:border-transparent resize-none h-32 text-lg"
                                        />
                                        {field.id === "summary" && (
                                            <div className="text-right text-sm mt-1 text-gray-400">
                                                {currentInput[field.id]?.length || 0} / 100 characters
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <input
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type={field.type}
                                        value={currentInput[field.id]}
                                        onChange={(e) =>
                                            setCurrentInput({
                                                ...currentInput,
                                                [field.id]: e.target.value,
                                            })
                                        }
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        placeholder={field.placeholder}
                                        className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#79e708] focus:border-transparent text-lg"
                                    />
                                )}
                                {errors[field.id] && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors[field.id]}
                                    </p>
                                )}
                                {field.optional && !errors[field.id] && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        This field is optional
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8">
                        <button
                            onClick={() => {
                                if (currentStep > 0) setCurrentStep(currentStep - 1);
                            }}
                            disabled={currentStep === 0}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentStep === 0
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                : "bg-gray-800 text-white hover:bg-gray-700"
                                }`}
                        >
                            Previous
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={
                                !currentGroup.fields.every(
                                    (field) =>
                                        field.optional ||
                                        (currentInput[field.id] && currentInput[field.id].trim())
                                )
                            }
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${!currentGroup.fields.every(
                                (field) =>
                                    field.optional ||
                                    (currentInput[field.id] && currentInput[field.id].trim())
                            )
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                : "text-black hover:opacity-90 transform hover:scale-105"
                                }`}
                            style={{
                                backgroundColor: !currentGroup.fields.every(
                                    (field) =>
                                        field.optional ||
                                        (currentInput[field.id] && currentInput[field.id].trim())
                                )
                                    ? "#374151"
                                    : "#79e708",
                            }}
                        >
                            <span>
                                {currentStep === groupedQuestions.length - 1
                                    ? "Finish"
                                    : "Next"}
                            </span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Press Enter to continue or use the Next button
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilderQuestionnaire;
