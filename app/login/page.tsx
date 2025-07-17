"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {/* 
      <div className="mb-8">
        <Image
          src="/logo-placeholder.png"
          alt="GitMon Logo"
          width={120}
          height={120}
        />
      </div>*/}

      <h1 className="text-3xl font-bold mb-4 text-gray-800">Git Leaderboard</h1>

      <button
        onClick={() => signIn("github", { callbackUrl: "/" })}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M12 0C5.373 0 0 5.373 0 12a12 12 0 008.207 11.385c.6.111.82-.261.82-.58 0-.287-.01-1.046-.016-2.054-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.996.108-.775.42-1.304.763-1.604-2.665-.305-5.466-1.332-5.466-5.932 0-1.31.469-2.38 1.236-3.22-.124-.303-.535-1.527.117-3.182 0 0 1.008-.323 3.3 1.23A11.48 11.48 0 0112 5.8c1.022.005 2.05.138 3.012.403 2.29-1.553 3.296-1.23 3.296-1.23.654 1.655.243 2.879.12 3.182.77.84 1.235 1.91 1.235 3.22 0 4.61-2.804 5.624-5.476 5.921.431.37.816 1.102.816 2.222 0 1.604-.014 2.896-.014 3.293 0 .321.216.696.825.578A12.003 12.003 0 0024 12c0-6.627-5.373-12-12-12z"
            clipRule="evenodd"
          />
        </svg>
        Entrar com GitHub
      </button>
    </main>
  );
  
}


