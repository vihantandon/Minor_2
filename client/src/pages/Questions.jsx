import React, { useState, useEffect } from "react";
import client from "../api/client";

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Define the async fetch function
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // Fetching from the new API route we built on the backend
        const response = await client.get("/api/questions");
        setQuestions(response.data);
      } catch (err) {
        console.error("Failed to fetch practice questions:", err);
        setError("Could not load practice questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-600 text-lg animate-pulse">
          Loading practice questions...
        </p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-red-500 font-medium bg-red-50 p-4 rounded-lg">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Practice Arena</h1>

      {questions.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No practice questions available right now. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Question Header (Topic & Difficulty) */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
                  {q.topic || "General"}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium
                  ${
                    q.difficulty === 1
                      ? "bg-green-100 text-green-700"
                      : q.difficulty === 2
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  Difficulty: {q.difficulty}
                </span>
              </div>

              {/* Question Body */}
              <h3 className="text-xl font-medium text-gray-900 mb-6">
                {q.question}
              </h3>

              {/* Action Area */}
              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-lg font-medium transition-colors duration-200">
                  Solve Question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Questions;
