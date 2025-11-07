/**
 * 🏰 GITMON GUILDS
 *
 * Want to add your own guild? Just add it to this list and submit a PR!
 *
 * Guild Format:
 * {
 *   id: "unique-id",
 *   name: "Guild Name",
 *   color: "#hex-color",
 *   link: "https://github.com/your-repo", // Link to your repository
 * }
 */

export interface Guild {
  id: string;
  name: string;
  color: string;
  link: string;
}

export const guilds: Guild[] = [
  {
    id: "default",
    name: "Guild ???",
    color: "#9ca3af",
    link: "#"
  },
  {
    id: "kodus",
    name: "KODUS",
    color: "#3b82f6",
    link: "https://t.co/4E8Ciww11J"
  },
  {
    id: "bero-lab",
    name: "BERO LAB",
    color: "#10b981",
    link: "https://x.com/berolabx"
  },
  // 🚀 ADD YOUR GUILD HERE!
  // Just copy the format above and submit a PR
  // Example:
  // {
  //   id: "your-guild-id",
  //   name: "Your Guild Name",
  //   color: "#your-hex-color",
  //   link: "https://github.com/your-repo"
  // },
];

// Helper functions
export const getGuildById = (guildId: string | null): Guild | null => {
  if (!guildId) return getDefaultGuild();
  return guilds.find(guild => guild.id === guildId) || getDefaultGuild();
};

export const getDefaultGuild = (): Guild => {
  return guilds.find(guild => guild.id === "default") || guilds[0];
};

export const getGuildTextColor = (guildId: string | null): string => {
  const guild = getGuildById(guildId);

  // Convert hex to tailwind text color class
  const colorMap: { [key: string]: string } = {
    "#9333ea": "text-purple-600",
    "#9ca3af": "text-gray-400",
    "#3b82f6": "text-blue-500",
    "#10b981": "text-emerald-500",
  };

  return colorMap[guild?.color || "#9ca3af"] || "text-gray-400";
};