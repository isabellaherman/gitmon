import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMonsterById } from "@/lib/monsters";
import fs from 'fs';
import path from 'path';

interface EmbedParams {
  params: Promise<{
    username: string;
  }>;
}

interface UserData {
  githubUsername?: string | null;
  level?: number | null;
  xp?: number | null;
  currentStreak?: number | null;
  totalCommits?: number | null;
}

interface MonsterData {
  src?: string;
  name?: string;
  type?: string;
}

function getImageAsBase64(imagePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error('Error reading image:', error);
    // Return a placeholder or empty data URI
    return 'data:image/png;base64,';
  }
}


function generateCardSVG(user: UserData, monster: MonsterData | null) {
  const username = user.githubUsername || 'Unknown';
  const level = user.level || 1;
  const xp = user.xp || 0;
  const streak = user.currentStreak || 0;
  const commits = user.totalCommits || 0;
  const monsterPath = monster?.src || '/monsters/monster-000.png';
  const monsterSrc = getImageAsBase64(monsterPath);

  return `
    <svg width="320" height="180" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#F8FAFC;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F1F5F9;stop-opacity:1" />
        </linearGradient>
        <clipPath id="cardMonsterClip">
          <circle cx="30" cy="25" r="16"/>
        </clipPath>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" rx="12" fill="url(#cardBg)" stroke="#E2E8F0" stroke-width="1"/>

      <!-- Header -->
      <rect x="0" y="0" width="100%" height="50" rx="12" fill="#3B82F6"/>
      <rect x="0" y="38" width="100%" height="12" fill="#3B82F6"/>

      <!-- Monster Background Circle -->
      <circle cx="30" cy="25" r="16" fill="rgba(255,255,255,0.2)"/>

      <!-- Monster Image -->
      <image x="14" y="9" width="32" height="32" href="${monsterSrc}" clip-path="url(#cardMonsterClip)" preserveAspectRatio="xMidYMid slice"/>

      <!-- Username -->
      <text x="55" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">${username}</text>
      <text x="55" y="38" font-family="Arial, sans-serif" font-size="11" fill="rgba(255,255,255,0.8)">GitMon Trainer</text>

      <!-- Stats Grid -->
      <!-- Level -->
      <rect x="20" y="65" width="70" height="40" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="25" y="78" font-family="Arial, sans-serif" font-size="9" fill="#64748B">Level</text>
      <text x="25" y="95" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#3B82F6">${level}</text>

      <!-- XP -->
      <rect x="100" y="65" width="70" height="40" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="105" y="78" font-family="Arial, sans-serif" font-size="9" fill="#64748B">XP</text>
      <text x="105" y="95" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#8B5CF6">${xp.toLocaleString()}</text>

      <!-- Commits -->
      <rect x="180" y="65" width="70" height="40" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="185" y="78" font-family="Arial, sans-serif" font-size="9" fill="#64748B">Commits</text>
      <text x="185" y="95" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#10B981">${commits.toLocaleString()}</text>

      <!-- Streak -->
      <rect x="260" y="65" width="40" height="40" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="265" y="78" font-family="Arial, sans-serif" font-size="9" fill="#64748B">Streak</text>
      <text x="265" y="95" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#F59E0B">${streak}</text>

      <!-- GitMon Badge -->
      <rect x="20" y="120" width="280" height="25" rx="12" fill="rgba(59, 130, 246, 0.1)" stroke="#3B82F6" stroke-width="1"/>
      <text x="160" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#3B82F6">
        Powered by GitMon 🚀
      </text>

      <!-- Subtle pattern overlay -->
      <defs>
        <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="2" cy="2" r="1" fill="rgba(59, 130, 246, 0.05)"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" rx="12" fill="url(#dots)"/>
    </svg>
  `;
}

function generateCharacterSVG(user: UserData, monster: MonsterData | null) {
  const username = user.githubUsername || 'Unknown';
  const level = user.level || 1;
  const commits = user.totalCommits || 0;
  const monsterPath = monster?.src || '/monsters/monster-000.png';
  const monsterSrc = getImageAsBase64(monsterPath);

  return `
    <svg width="180" height="220" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;display=swap');
          .username { font-family: 'Press Start 2P', 'Minecraftia', monospace; font-size: 11px; font-weight: normal; fill: #1F2937; }
          .stats { font-family: 'Press Start 2P', 'Minecraftia', monospace; font-size: 8px; fill: #4B5563; }
        </style>
      </defs>

      <!-- White Background -->
      <rect width="180" height="220" rx="8" fill="white"/>

      <!-- Monster Image - 2x bigger -->
      <image x="42" y="15" width="96" height="96" xlink:href="${monsterSrc}" preserveAspectRatio="xMidYMid slice"/>

      <!-- Username -->
      <text x="90" y="130" text-anchor="middle" class="username">${username}</text>

      <!-- Level -->
      <text x="90" y="150" text-anchor="middle" class="stats">Lv.${level}</text>

      <!-- Commits -->
      <text x="90" y="170" text-anchor="middle" class="stats">${commits.toLocaleString()} commits</text>

      <!-- Subtle border -->
      <rect x="0" y="0" width="180" height="220" rx="8" fill="none" stroke="#E5E7EB" stroke-width="1" opacity="0.3"/>
    </svg>
  `;
}

function generateMonsterSVG(user: UserData, monster: MonsterData | null) {
  const monsterName = monster?.name || 'Unknown';
  const monsterType = monster?.type || 'normal';
  const monsterPath = monster?.src || '/monsters/monster-000.png';
  const monsterSrc = getImageAsBase64(monsterPath);

  const getTypeColor = (type: string) => {
    const colors = {
      fire: '#EF4444',
      water: '#3B82F6',
      grass: '#10B981',
      electric: '#EAB308',
      ice: '#06B6D4',
      psychic: '#8B5CF6',
      shadow: '#1F2937',
      light: '#FDE047',
      normal: '#6B7280',
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  return `
    <svg width="150" height="160" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;display=swap');
          .monster-name { font-family: 'Press Start 2P', 'Minecraftia', monospace; font-size: 11px; font-weight: normal; fill: #1F2937; }
          .type-label { font-family: 'Press Start 2P', 'Minecraftia', monospace; font-size: 8px; font-weight: normal; fill: white; text-transform: uppercase; }
        </style>
      </defs>

      <!-- White Background -->
      <rect width="150" height="160" rx="8" fill="white"/>

      <!-- Monster Image -->
      <image x="35" y="10" width="80" height="80" xlink:href="${monsterSrc}" preserveAspectRatio="xMidYMid slice"/>

      <!-- Monster Name -->
      <text x="75" y="105" text-anchor="middle" class="monster-name">${monsterName}</text>

      <!-- Type Badge Background -->
      <rect x="35" y="115" width="80" height="22" rx="11" fill="${getTypeColor(monsterType)}"/>

      <!-- Type Label -->
      <text x="75" y="127" text-anchor="middle" dominant-baseline="central" class="type-label">${monsterType}</text>

      <!-- Subtle border -->
      <rect x="0" y="0" width="150" height="160" rx="8" fill="none" stroke="#E5E7EB" stroke-width="1" opacity="0.3"/>
    </svg>
  `;
}


export async function GET(request: NextRequest, { params }: EmbedParams) {
  try {
    const resolvedParams = await params;
    const username = resolvedParams.username.replace('.svg', '');
    const url = new URL(request.url);
    const style = url.searchParams.get('style') || 'character';

    // Find user by username
    const user = await prisma.user.findFirst({
      where: {
        githubUsername: {
          equals: username,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return new NextResponse(
        `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" rx="8" fill="#EF4444"/>
          <text x="100" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">
            User not found
          </text>
        </svg>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          },
        }
      );
    }

    const monster = (user.selectedMonsterId !== null && user.selectedMonsterId !== undefined) ? getMonsterById(user.selectedMonsterId) : null;

    let svg: string;
    switch (style) {
      case 'card':
        svg = generateCardSVG(user, monster);
        break;
      case 'monster':
        svg = generateMonsterSVG(user, monster);
        break;
      case 'character':
      default:
        svg = generateCharacterSVG(user, monster);
        break;
    }

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error generating embed:', error);
    return new NextResponse(
      `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" rx="8" fill="#EF4444"/>
        <text x="100" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">
          Error generating embed
        </text>
      </svg>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      }
    );
  }
}