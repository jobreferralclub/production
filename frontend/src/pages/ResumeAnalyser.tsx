import React, { useState } from 'react';

const ResumeAnalyzer: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const apiUrl = import.meta.env.VITE_FLASK_API_URL;
    console.log(apiUrl);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileExtension = file.name.toLowerCase().split('.').pop();
            if (fileExtension === 'pdf' || fileExtension === 'docx') {
                setSelectedFile(file);
                setError('');
            } else {
                setError('Please upload a PDF or DOCX file');
                setSelectedFile(null);
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append('resume', selectedFile);

        try {
            const response = await fetch(`${apiUrl}/analyze`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setAnalysisResult(result.data);
            } else {
                setError(result.error || 'Analysis failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Analysis error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: "🧠",
            title: "AI-Powered",
            subtitle: "Analysis Engine",
            description: "Advanced machine learning algorithms evaluate your resume against industry standards"
        },
        {
            icon: "🎯",
            title: "ATS",
            subtitle: "Optimization",
            description: "Ensure your resume passes through applicant tracking systems successfully"
        },
        {
            icon: "⚡",
            title: "Instant",
            subtitle: "Insights",
            description: "Get comprehensive feedback and improvement suggestions in seconds"
        }
    ];

    const benefitCards = [
        {
            icon: "📊",
            title: "ATS Compatibility Score",
            description: "Comprehensive analysis of how well your resume performs with tracking systems"
        },
        {
            icon: "💡",
            title: "Smart Recommendations",
            description: "AI-powered suggestions to optimize content, format, and keyword usage"
        },
        {
            icon: "🎯",
            title: "Skills Analysis",
            description: "Detailed breakdown of technical and soft skills with market relevance"
        }
    ];

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Animated Neural Network Background */}
            <div className="absolute inset-0">
                {/* Main grid pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(121, 231, 8, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(121, 231, 8, 0.03) 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Floating orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#79e708]/8 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#79e708]/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#79e708]/10 rounded-full blur-3xl animate-pulse delay-500"></div>

                {/* Circuit lines */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <svg className="w-full h-full opacity-10" viewBox="0 0 1000 1000">
                        <defs>
                            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#79e708" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#79e708" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <path d="M150,200 L350,200 L350,400 L550,400 L550,250 L750,250"
                            stroke="url(#circuitGradient)" strokeWidth="2" fill="none" className="animate-pulse" />
                        <path d="M250,500 L450,500 L450,700 L650,700 L650,550 L850,550"
                            stroke="url(#circuitGradient)" strokeWidth="2" fill="none" className="animate-pulse delay-300" />
                        <circle cx="350" cy="200" r="5" fill="#79e708" className="animate-pulse" />
                        <circle cx="550" cy="400" r="5" fill="#79e708" className="animate-pulse delay-500" />
                        <circle cx="650" cy="700" r="5" fill="#79e708" className="animate-pulse delay-700" />
                    </svg>
                </div>
            </div>

            {/* Loading Screen */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-50">
                    <div className="text-center bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-2xl border-2 border-[#79e708]/30 rounded-3xl p-16 shadow-2xl max-w-lg mx-4 relative overflow-hidden">
                        {/* Animated border glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#79e708]/20 via-transparent to-[#79e708]/20 rounded-3xl opacity-50 animate-pulse blur-xl"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#79e708]/20 to-[#79e708]/10 rounded-3xl mb-8">
                                <div className="w-12 h-12 border-4 border-[#79e708]/30 border-t-[#79e708] rounded-full animate-spin"></div>
                            </div>

                            <div className="text-white text-3xl font-black mb-4">
                                AI Analysis in Progress
                            </div>
                            <div className="text-gray-400 text-lg mb-8">
                                Our advanced algorithms are evaluating your professional profile...
                            </div>

                            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#79e708] to-[#5bb406] h-3 rounded-full animate-pulse shadow-lg shadow-[#79e708]/30" style={{ width: '75%' }}></div>
                            </div>

                            <div className="mt-4 text-[#79e708] text-sm font-semibold">
                                Analyzing content structure, keywords, and ATS compatibility...
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className='flex justify-center items-center gap-2'>
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#79e708] to-[#5bb406] rounded-2xl mb-8 shadow-2xl shadow-[#79e708]/30">
                            <span className="text-3xl font-black text-black">📄</span>
                        </div>

                        <h1 className="text-6xl lg:text-7xl font-black mb-6 tracking-tight">
                            <span className="bg-gradient-to-r from-white via-[#79e708] to-white bg-clip-text text-transparent">
                                AI Resume Analyzer
                            </span>
                        </h1>
                    </div>

                    <p className="text-xl text-gray-400 mb-12 font-light max-w-3xl mx-auto leading-relaxed">
                        Transform your resume with AI-powered insights. Get
                        <span className="text-[#79e708] font-semibold"> ATS optimization</span>,
                        <span className="text-[#79e708] font-semibold"> smart recommendations</span>, and
                        <span className="text-[#79e708] font-semibold"> professional scoring</span> in seconds.
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-[#79e708]/20 rounded-3xl p-8 text-center hover:border-[#79e708]/40 hover:-translate-y-3 hover:scale-105 transition-all duration-500 overflow-hidden"
                            >
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#79e708]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#79e708]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>

                                <div className="relative z-10">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#79e708]/20 to-[#79e708]/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-2xl">{feature.icon}</span>
                                    </div>

                                    <div className="text-[#79e708] text-2xl font-black mb-2">
                                        {feature.title}
                                    </div>
                                    <div className="text-white text-lg font-bold mb-3">
                                        {feature.subtitle}
                                    </div>
                                    <div className="text-gray-400 text-sm leading-relaxed">
                                        {feature.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Analyzer Form */}
                <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl border border-[#79e708]/30 rounded-3xl p-10 shadow-2xl relative group overflow-hidden">
                    {/* Animated border glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#79e708]/20 via-transparent to-[#79e708]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-[#79e708] text-3xl font-black mb-3">
                                Upload & Analyze Your Resume
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Get instant AI-powered feedback and optimization suggestions
                            </p>
                        </div>

                        {/* File Upload Area */}
                        <div className="border-2 border-dashed border-[#79e708]/40 rounded-3xl p-12 text-center hover:border-[#79e708]/60 hover:bg-[#79e708]/5 hover:scale-[1.01] transition-all duration-300 mb-8 relative overflow-hidden group">
                            {/* Pulse animation background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#79e708]/5 via-[#79e708]/10 to-[#79e708]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#79e708]/20 to-[#79e708]/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">📄</span>
                                </div>

                                <h3 className="text-[#79e708] text-2xl font-black mb-3">
                                    Drop Your Resume Here
                                </h3>
                                <p className="text-gray-400 mb-6 text-lg">
                                    Support for PDF and DOCX formats up to 10MB
                                </p>

                                <input
                                    type="file"
                                    id="resume"
                                    name="resume"
                                    accept=".pdf,.docx"
                                    onChange={handleFileChange}
                                    className="w-full text-gray-300 file:mr-6 file:py-4 file:px-8 file:rounded-full file:border-0 file:font-bold file:bg-gradient-to-r file:from-[#79e708] file:to-[#5bb406] file:text-black hover:file:from-[#5bb406] hover:file:to-[#79e708] file:transition-all file:duration-300 file:cursor-pointer file:shadow-xl hover:file:shadow-[#79e708]/30 hover:file:-translate-y-1"
                                    required
                                />

                                {selectedFile && (
                                    <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#79e708]/20 to-[#79e708]/10 text-[#79e708] rounded-2xl font-bold border border-[#79e708]/30 shadow-lg">
                                        <span className="mr-2">✅</span>
                                        {selectedFile.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border-2 border-red-500/40 rounded-2xl p-6 text-center backdrop-blur-sm mb-8">
                                <div className="text-red-400 font-bold flex items-center justify-center gap-3 text-lg">
                                    <span className="text-2xl">⚠️</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Analyze Button */}
                        <div className="text-center">
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedFile || isLoading}
                                className="group relative bg-gradient-to-r from-[#79e708] to-[#5bb406] text-black px-12 py-5 rounded-full text-xl font-black hover:from-[#5bb406] hover:to-[#79e708] hover:-translate-y-2 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-[#79e708]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto overflow-hidden"
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                                <div className="relative z-10 flex items-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                            Analyzing Resume...
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-2xl">🚀</span>
                                            Start AI Analysis
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="max-w-6xl mx-auto mb-12">
                    <div className="text-center mb-12">
                        <h2 className="text-[#79e708] text-3xl font-black mb-4">
                            What You'll Get
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Comprehensive analysis powered by cutting-edge AI technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefitCards.map((benefit, index) => (
                            <div
                                key={index}
                                className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-[#79e708]/20 rounded-3xl p-8 hover:border-[#79e708]/40 hover:-translate-y-2 hover:scale-105 transition-all duration-500 relative overflow-hidden"
                            >
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#79e708]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                                <div className="relative z-10">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#79e708]/20 to-[#79e708]/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-2xl">{benefit.icon}</span>
                                    </div>

                                    <h3 className="text-[#79e708] text-xl font-black mb-3">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12 space-y-4">
                        <div className="flex items-center justify-center gap-3 text-gray-400">
                            <span className="text-xl">🔒</span>
                            <span>Your resume data is processed securely and not stored permanently</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-gray-400">
                            <span className="text-xl">⚡</span>
                            <span>Analysis typically takes 10-30 seconds depending on resume complexity</span>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {analysisResult && (
                    <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-2xl border border-[#79e708]/30 rounded-3xl p-10 shadow-2xl">
                        <div className="text-center mb-10">
                            <h2 className="flex items-center justify-center text-[#79e708] text-3xl font-black mb-3">
                                <span className="mr-4">📊</span>
                                AI Analysis Results
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Comprehensive evaluation of your resume's performance and optimization potential
                            </p>
                        </div>

                        {/* Score Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            <div className="bg-gradient-to-br from-[#79e708]/10 to-[#79e708]/5 border border-[#79e708]/30 rounded-2xl p-6 text-center">
                                <h3 className="text-[#79e708] text-lg font-black mb-3">Overall ATS Score</h3>
                                <div className="text-5xl font-black text-white mb-2">
                                    {analysisResult.overall_score || 'N/A'}
                                    <span className="text-2xl text-gray-400">%</span>
                                </div>
                                <p className="text-gray-400">Applicant Tracking System Compatibility</p>
                            </div>

                            <div className="bg-gradient-to-br from-[#79e708]/10 to-[#79e708]/5 border border-[#79e708]/30 rounded-2xl p-6 text-center">
                                <h3 className="text-[#79e708] text-lg font-black mb-3">Skills Identified</h3>
                                <div className="text-5xl font-black text-white mb-2">
                                    {analysisResult.skills_count || 0}
                                </div>
                                <p className="text-gray-400">Technical & Soft Skills Found</p>
                            </div>

                            <div className="bg-gradient-to-br from-[#79e708]/10 to-[#79e708]/5 border border-[#79e708]/30 rounded-2xl p-6 text-center">
                                <h3 className="text-[#79e708] text-lg font-black mb-3">Experience Level</h3>
                                <div className="text-5xl font-black text-white mb-2">
                                    {analysisResult.experience_years || 0}
                                    <span className="text-2xl text-gray-400">yrs</span>
                                </div>
                                <p className="text-gray-400">Total Professional Experience</p>
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        {Array.isArray(analysisResult?.suggestions) ? (
                            <ul>
                                {analysisResult?.suggestions && typeof analysisResult.suggestions === 'object' && !Array.isArray(analysisResult.suggestions) ? (
                                    <ul className="space-y-2 text-left text-gray-300 list-disc list-inside">
                                        {Object.entries(analysisResult.suggestions as Record<string, string>).map(([key, value]) => (
                                            <li key={key}>
                                                <strong className="text-[#79e708] capitalize">{key.replace(/_/g, ' ')}:</strong> {value}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-300">{analysisResult?.suggestions}</p>
                                )}
                            </ul>
                        ) : (
                            <p>{analysisResult?.suggestions}</p>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalyzer;