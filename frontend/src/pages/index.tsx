import { useState } from "react";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescText, setJobDescText] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState(false);
const [jobDescError, setJobDescError] = useState(false);
const [resumeErrorMsg, setResumeErrorMsg] = useState("");
const [jobDescErrorMsg, setJobDescErrorMsg] = useState("");

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResumeError(false);
    setJobDescError(false);
    setResumeErrorMsg("");
    setJobDescErrorMsg("");
    
    if (!resume && !jobDescText.trim()) {
      setResumeError(true);
      setResumeErrorMsg("Please upload your resume.");
      setJobDescError(true);
      setJobDescErrorMsg("Please enter the job description.");
      return;
    }
    
    if (!resume) {
      setResumeError(true);
      setResumeErrorMsg("Please upload your resume.");
      return;
    }
    
    if (!jobDescText.trim()) {
      setJobDescError(true);
      setJobDescErrorMsg("Please enter the job description.");
      return;
    }
    
    if (jobDescText.length < 20 || !/[a-zA-Z]/.test(jobDescText)) {
      setJobDescError(true);
      setJobDescErrorMsg("Please enter a valid job description (at least 20 characters and contain letters).");
      return;
    }
    
  
    setError(null); // clear previous errors
  
    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_desc_text", jobDescText);
  
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) throw new Error("Failed to fetch");
  
      const data = await res.json();
      const generated = data.generated_questions
        .split("\n")
        .filter((line: string) => line.trim() !== "");
      setQuestions(generated);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while generating questions.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="absolute -z-10 top-1/3 left-1/2 w-[400px] h-[400px] bg-purple-600 opacity-30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">🤖 AI Interviewer</h1>
        <p className="text-center text-gray-400 mb-8">
        Preparing for your next interview? Upload your resume and paste the job description — we’ll generate smart, tailored behavioral and technical questions to help you practice with confidence.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4"
        >
        <input
  type="file"
  accept=".pdf,.txt"
  onChange={(e) => setResume(e.target.files?.[0] || null)}
  className={`w-full bg-gray-900 text-white rounded p-2 ${
    resumeError ? "border border-red-500" : ""
  }`}
/>
{resumeError && <p className="text-red-500 text-sm">{resumeErrorMsg}</p>}
<textarea
  placeholder="Paste Job Description"
  value={jobDescText}
  onChange={(e) => setJobDescText(e.target.value)}
  className={`w-full p-4 rounded bg-gray-900 text-white resize-none h-40 ${
    jobDescError ? "border border-red-500" : ""
  }`}
/>
{jobDescError && <p className="text-red-500 text-sm">{jobDescErrorMsg}</p>}




          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded font-semibold"
          >
            Generate Questions
          </button>
        </form>

        {isLoading && (
  <div className="text-center text-blue-400 animate-pulse mt-4">
    Generating questions...
  </div>
)}

{questions.length > 0 && (
  <div className="mt-10 bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
    <h2 className="text-2xl font-semibold mb-2">Generated Question:</h2>
    <p className="text-lg">{questions[currentIndex]}</p>

    {currentIndex < questions.length - 1 ? (
  <button
    onClick={() => setCurrentIndex((prev) => prev + 1)}
    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
  >
    {["Behavioral Questions:", "Technical Questions:"].includes(questions[currentIndex])
      ? "Let's Begin →"
      : "Next Question →"}
  </button>
) : (
  <p className="text-green-400 font-semibold">🎉 End of questions!</p>
)}
  </div>
)}

      </div>
    </div>
  );
}
