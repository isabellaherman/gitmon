"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type DocType = "how-xp-works" | "system-design";

export default function DocsPage() {
  const [content, setContent] = useState("");
  const [currentDoc, setCurrentDoc] = useState<DocType>("how-xp-works");
  const router = useRouter();
  const searchParams = useSearchParams();

  const docs = {
    "how-xp-works": {
      title: "How XP Works",
      file: "/HOW_XP_WORKS.md",
      description: "Simple guide to All-Time vs Weekly XP",
      icon: <Zap className="w-4 h-4" />
    },
    "system-design": {
      title: "System Design",
      file: "/SYSTEM_DESIGN.md",
      description: "Complete economics design document",
      icon: <FileText className="w-4 h-4" />
    }
  };

  useEffect(() => {
    const docParam = searchParams.get('doc') as DocType;
    if (docParam && docs[docParam]) {
      setCurrentDoc(docParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch the markdown content
    fetch(docs[currentDoc].file)
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => console.error("Failed to load docs:", err));
  }, [currentDoc]);

  // Simple markdown to HTML converter for basic formatting
  const parseMarkdown = (markdown: string) => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-6 text-gray-900">$1</h1>')

      // Process warning blocks first (specific pattern)
      .replace(/> ⚠️ \*\*(.*?)\*\*:\n((?:> .*\n?)*)/gm, (match, title, content) => {
        const items = content.split('\n').filter((line: string) => line.trim().startsWith('>')).map((line: string) => {
          const cleanLine = line.replace(/^> /, '').trim();
          return `<p class="text-yellow-700 ml-4">• ${cleanLine}</p>`;
        }).join('');
        return `<div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4"><p class="font-bold text-yellow-800">⚠️ ${title}:</p>${items}</div>`;
      })

      // Regular blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')

      // Bold text
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>')

      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>')
      .replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')

      // Tables
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map((cell: string) => cell.trim());
        return '<tr>' + cells.map((cell: string) => `<td class="border px-4 py-2">${cell}</td>`).join('') + '</tr>';
      })

      // Lists
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')

      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')

      // Emojis and special formatting
      .replace(/🔴/g, '<span class="text-red-500">🔴</span>')
      .replace(/🟡/g, '<span class="text-yellow-500">🟡</span>')
      .replace(/✅/g, '<span class="text-green-500">✅</span>')
      .replace(/⚠️/g, '<span class="text-yellow-600">⚠️</span>')

      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-8 border-gray-300">')

      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|d|l|p|u])(.+)$/gim, '<p class="mb-4">$1</p>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GitMon Documentation</h1>
            <p className="text-gray-600">{docs[currentDoc].description}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          {Object.entries(docs).map(([key, doc]) => (
            <Button
              key={key}
              variant={currentDoc === key ? "default" : "outline"}
              onClick={() => setCurrentDoc(key as DocType)}
              className="flex items-center gap-2"
            >
              {doc.icon}
              {doc.title}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          {content ? (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(content)
              }}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documentation...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>GitMon • Open source coding gamification platform</p>
        </div>
      </div>
    </div>
  );
}