'use client';

import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import FloatingBackButton from '@/components/FloatingBackButton';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// react-markdown never renders raw HTML from the source (no rehype-raw), so the docs
// can't inject markup. Links are restricted to http(s)/mailto/relative URLs.
const SAFE_URL = /^(https?:|mailto:|\/|#)/i;

const mdComponents: Components = {
  h1: ({ children }) => <h1 className="text-3xl font-bold mt-6 mb-6 text-gray-900">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800">{children}</h3>,
  p: ({ children }) => <p className="mb-4 text-gray-700">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-yellow-500 bg-yellow-50 pl-4 py-2 my-4 text-gray-700">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-gray-300" />,
  pre: ({ children }) => (
    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">{children}</pre>
  ),
  code: ({ children }) => (
    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border px-4 py-2 text-left bg-gray-50">{children}</th>,
  td: ({ children }) => <td className="border px-4 py-2">{children}</td>,
  a: ({ href, children }) =>
    href && SAFE_URL.test(href) ? (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
};

type DocType = 'how-xp-works' | 'system-design';

function DocsContent() {
  const [content, setContent] = useState('');
  const [currentDoc, setCurrentDoc] = useState<DocType>('how-xp-works');
  const router = useRouter();
  const searchParams = useSearchParams();

  const docs = {
    'how-xp-works': {
      title: 'How XP Works',
      file: '/HOW_XP_WORKS.md',
      description: 'Simple guide to All-Time vs Weekly XP',
      icon: <Zap className="w-4 h-4" />,
    },
    'system-design': {
      title: 'System Design',
      file: '/SYSTEM_DESIGN.md',
      description: 'Complete economics design document',
      icon: <FileText className="w-4 h-4" />,
    },
  };

  useEffect(() => {
    const docParam = searchParams.get('doc') as DocType;
    if (docParam && docs[docParam]) {
      setCurrentDoc(docParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch(docs[currentDoc].file)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => console.error('Failed to load docs:', err));
  }, [currentDoc]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-8 docs-page">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="hidden md:flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GitMon Documentation</h1>
              <p className="text-gray-600">{docs[currentDoc].description}</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <a
              href="https://github.com/isabellaherman/gitmon"
              target="_blank"
              rel="noopener noreferrer"
            >
              ⭐ Star Project
            </a>
          </Button>
        </div>

        <div className="flex gap-4 mb-8">
          {Object.entries(docs).map(([key, doc]) => (
            <Button
              key={key}
              variant={currentDoc === key ? 'default' : 'outline'}
              onClick={() => setCurrentDoc(key as DocType)}
              className="flex items-center gap-2"
            >
              {doc.icon}
              {doc.title}
            </Button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          {content ? (
            <div className="max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documentation...</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm space-y-2">
          <p>GitMon • Open source coding gamification platform</p>
          <p>
            designed by{' '}
            <a
              href="https://x.com/IsabellaHermn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Isabella Herman
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <>
      <FloatingBackButton />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <DocsContent />
      </Suspense>
    </>
  );
}
