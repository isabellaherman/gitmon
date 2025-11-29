'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface EmbedGeneratorProps {
  userData: {
    githubUsername?: string;
    selectedMonsterId?: number;
    level?: number;
    xp?: number;
    currentStreak?: number;
    totalCommits?: number;
    totalStars?: number;
    guildId?: string;
  };
  selectedMonster: {
    src: string;
    name: string;
    type: string;
  };
}

export default function EmbedGenerator({ userData }: EmbedGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'character-markdown': false,
    'character-url': false,
    'monster-markdown': false,
    'monster-url': false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => {
      const isCurrentlyOpen = prev[key];
      // Fecha todos os accordions
      const newState: Record<string, boolean> = {
        'character-markdown': false,
        'character-url': false,
        'monster-markdown': false,
        'monster-url': false,
      };

      // Se o accordion clicado estava fechado, abre ele
      if (!isCurrentlyOpen) {
        newState[key] = true;
      }

      return newState;
    });
  };

  const AccordionLink = ({
    id,
    title,
    generateFn,
    style,
  }: {
    id: string;
    title: string;
    generateFn: (style: string) => string;
    style: string;
  }) => (
    <div>
      <button
        onClick={() => toggleAccordion(id)}
        className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <svg
          className={`w-4 h-4 transform transition-transform ${
            openAccordions[id] ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {title}
      </button>
      {openAccordions[id] && (
        <div className="mt-2">
          <button
            onClick={() => copyToClipboard(generateFn(style), id)}
            className={`flex items-center gap-2 w-full p-2 border rounded-lg transition-all duration-500 ${
              copiedItem === id
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                copiedItem === id ? 'text-green-500' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <div
              className={`text-xs font-mono flex-1 truncate text-left transition-colors ${
                copiedItem === id ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              {generateFn(style)}
            </div>
          </button>
        </div>
      )}
    </div>
  );

  const generateEmbedUrlForStyle = (style: string) => {
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const baseUrl = isLocalhost
      ? `http://localhost:${window.location.port || 3000}`
      : 'https://gitmon.xyz';
    return `${baseUrl}/api/embed/${userData.githubUsername}.svg?style=${style}`;
  };

  const generateMarkdownForStyle = (style: string) => {
    const embedUrl = generateEmbedUrlForStyle(style);
    const profileUrl = `https://gitmon.xyz/${userData.githubUsername}`;
    return `[![GitMon](${embedUrl})](${profileUrl})`;
  };

  const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const CharacterPreview = () => {
    const [realData, setRealData] = useState({ level: userData.level, commits: 0 });

    useEffect(() => {
      fetch(`https://gitmon.xyz/api/embed/${userData.githubUsername}`)
        .then(response => response.text())
        .then(svg => {
          const levelMatch = svg.match(/Lv\.(\d+)/);
          const commitsMatch = svg.match(/([\d,]+) commits/);

          if (levelMatch && commitsMatch) {
            setRealData({
              level: parseInt(levelMatch[1]),
              commits: parseInt(commitsMatch[1].replace(/,/g, '')),
            });
          }
        })
        .catch(() => {}); // Silent fail
    }, [userData.githubUsername]);

    return (
      <div className="flex flex-col items-center w-36">
        <div className="w-24 h-24 mb-3">
          <img
            src={
              userData.selectedMonsterId !== undefined
                ? `/monsters/monster-${String(userData.selectedMonsterId).padStart(3, '0')}.png`
                : '/monsters/monster-000.png'
            }
            alt="Monster"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-center space-y-0.5">
          <div className="text-xs font-semibold text-gray-900 truncate w-full">
            {userData.githubUsername}
          </div>
          <div className="text-xs text-gray-600">Lv.{realData.level}</div>
          <div className="text-xs text-gray-600">{realData.commits.toLocaleString()} commits</div>
        </div>
      </div>
    );
  };

  const MonsterPreview = () => {
    const monsters = [
      { id: 0, name: 'Shadrix', type: 'shadow' },
      { id: 1, name: 'Fairy', type: 'fire' },
      { id: 2, name: 'Crystalix', type: 'ice' },
      { id: 3, name: 'Guarana', type: 'grass' },
      { id: 4, name: 'Volterra', type: 'electric' },
      { id: 5, name: 'Aquarus', type: 'water' },
      { id: 6, name: 'Infernus', type: 'fire' },
      { id: 7, name: 'Lumenis', type: 'grass' },
      { id: 8, name: 'Spectra', type: 'psychic' },
    ];

    const monster = monsters.find(m => m.id === userData.selectedMonsterId) || monsters[0];

    const getTypeColor = (type: string) => {
      const colors = {
        fire: 'bg-red-500',
        water: 'bg-blue-500',
        grass: 'bg-green-500',
        electric: 'bg-yellow-500',
        ice: 'bg-cyan-500',
        psychic: 'bg-purple-500',
        shadow: 'bg-gray-800',
        light: 'bg-yellow-300',
        normal: 'bg-gray-500',
      };
      return colors[type as keyof typeof colors] || 'bg-gray-500';
    };

    return (
      <div className="flex flex-col items-center w-32">
        <div className="w-20 h-20 mb-3">
          <img
            src={`/monsters/monster-${String(monster.id).padStart(3, '0')}.png`}
            alt={monster.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 mb-2">{monster.name}</div>
          <span
            className={`px-2 py-1 rounded-full text-white text-xs font-medium uppercase ${getTypeColor(monster.type)}`}
          >
            {monster.type}
          </span>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="rounded-full text-xs"
      >
        📊 Share GitMon
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b"></div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6 text-center">GitMon Embeds</h3>

          <div className="space-y-8">
            {/* Character Focus Embed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Embed Preview */}
              <div className="flex justify-center">
                <CharacterPreview />
              </div>

              {/* Right Column - Copy Links */}
              <div className="space-y-3 flex flex-col justify-center">
                <AccordionLink
                  id="character-markdown"
                  title="Markdown"
                  generateFn={generateMarkdownForStyle}
                  style="character"
                />
                <AccordionLink
                  id="character-url"
                  title="Image URL"
                  generateFn={generateEmbedUrlForStyle}
                  style="character"
                />
              </div>
            </div>

            {/* Monster Card Embed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Embed Preview */}
              <div className="flex justify-center">
                <MonsterPreview />
              </div>

              {/* Right Column - Copy Links */}
              <div className="space-y-3 flex flex-col justify-center">
                <AccordionLink
                  id="monster-markdown"
                  title="Markdown"
                  generateFn={generateMarkdownForStyle}
                  style="monster"
                />
                <AccordionLink
                  id="monster-url"
                  title="Image URL"
                  generateFn={generateEmbedUrlForStyle}
                  style="monster"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Usage:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add to your GitHub profile README for maximum visibility</li>
              <li>• Use in project READMEs to show your contribution stats</li>
              <li>• Share on social media or personal website</li>
              <li>• Embeds update automatically with your latest stats!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
