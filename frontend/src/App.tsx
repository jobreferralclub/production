import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NotFound";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeBuilderQuestionnaire from "./pages/ResumeBuilderQuestionnaire";
import ResumeBuilderPreview from "./pages/ResumeBuilderPreview";
import ResumeEnhancer from "./pages/ResumeEnhancer";
import ResumeFromLinkedin from "./pages/ResumeFromLinkedin";
import ResumeAnalyzer from "./pages/ResumeAnalyszer";
import ResumeRanker from "./pages/ResumeRanker";
import AnalyzerResult from "./pages/AnalyzerResult";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer/>} />
               <Route path="/analyzer-result" element={<AnalyzerResult />} /> 
              <Route path="/resume-ranker" element={<ResumeRanker/>} />
              <Route path="/ai-resume-builder">
                <Route index element={<ResumeBuilder/>} />
                <Route path="enhancer" element={<ResumeEnhancer/>} />
                <Route path="resume-from-linkedin" element={<ResumeFromLinkedin/>} />
                <Route path="questionnaire" element={<ResumeBuilderQuestionnaire/>} />
                <Route path="preview" element={<ResumeBuilderPreview/>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>);

}

export default App;