export interface Platform {
  id: string;
  label: string;
  icon: string; // key for icon lookup
  description: string;
}

export interface Game {
  id: string;
  name: string;
  platforms: string[]; // platform ids this game is available on
  genre: string; // 'Football' | 'FPS' | 'Fighting' | 'Basketball' | 'Racing' | 'Sports'
  modes: string[]; // ['1v1', '2v2'] — challenge formats supported
  popular?: boolean;
}

export const PLATFORMS: Platform[] = [
  { id: 'ps4', label: 'PlayStation 4', icon: 'playstation', description: 'PS4 & PS4 Pro' },
  { id: 'ps5', label: 'PlayStation 5', icon: 'playstation', description: 'PS5 & PS5 Digital' },
  { id: 'xbox_one', label: 'Xbox One', icon: 'xbox', description: 'Xbox One & One X' },
  { id: 'xbox_series', label: 'Xbox Series X|S', icon: 'xbox', description: 'Series X and Series S' },
  { id: 'pc', label: 'PC', icon: 'pc', description: 'Windows & Steam' },
  { id: 'mobile', label: 'Mobile', icon: 'mobile', description: 'iOS & Android' },
];

export const GAMES: Game[] = [
  // Football
  { id: 'ea_fc_25', name: 'EA FC 25', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc'], genre: 'Football', modes: ['1v1'], popular: true },
  { id: 'efootball', name: 'eFootball 2025', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc', 'mobile'], genre: 'Football', modes: ['1v1'], popular: true },
  // FPS
  { id: 'cod_warzone', name: 'Call of Duty: Warzone', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc'], genre: 'FPS', modes: ['1v1', '2v2'], popular: true },
  { id: 'cod_mw3', name: 'Call of Duty: MW3', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc'], genre: 'FPS', modes: ['1v1', '2v2'] },
  { id: 'fortnite', name: 'Fortnite', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc', 'mobile'], genre: 'FPS', modes: ['1v1'] },
  // Basketball
  { id: 'nba_2k25', name: 'NBA 2K25', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc'], genre: 'Basketball', modes: ['1v1'], popular: true },
  // Fighting
  { id: 'mortal_kombat', name: 'Mortal Kombat 1', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc'], genre: 'Fighting', modes: ['1v1'], popular: true },
  { id: 'street_fighter', name: 'Street Fighter 6', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc'], genre: 'Fighting', modes: ['1v1'] },
  { id: 'tekken_8', name: 'Tekken 8', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc'], genre: 'Fighting', modes: ['1v1'] },
  // Racing
  { id: 'f1_25', name: 'F1 25', platforms: ['ps4', 'ps5', 'xbox_one', 'xbox_series', 'pc'], genre: 'Racing', modes: ['1v1'] },
  { id: 'gt7', name: 'Gran Turismo 7', platforms: ['ps4', 'ps5'], genre: 'Racing', modes: ['1v1'] },
  // Mobile
  { id: 'clash_royale', name: 'Clash Royale', platforms: ['mobile'], genre: 'Strategy', modes: ['1v1'] },
  { id: 'pubg_mobile', name: 'PUBG Mobile', platforms: ['mobile'], genre: 'FPS', modes: ['1v1'], popular: true },
  { id: 'efootball_mob', name: 'eFootball 2025 Mobile', platforms: ['mobile'], genre: 'Football', modes: ['1v1'], popular: true },
  { id: 'dream_league', name: 'Dream League Soccer', platforms: ['mobile'], genre: 'Football', modes: ['1v1'] },
];

export function gamesForPlatform(platformId: string): Game[] {
  return GAMES.filter((g) => g.platforms.includes(platformId));
}

export function gamesByGenre(games: Game[]): Record<string, Game[]> {
  return games.reduce(
    (acc, g) => {
      if (!acc[g.genre]) acc[g.genre] = [];
      acc[g.genre].push(g);
      return acc;
    },
    {} as Record<string, Game[]>,
  );
}

export const GENRE_COLORS: Record<string, string> = {
  Football: '#22c55e',
  FPS: '#ef4444',
  Basketball: '#f97316',
  Fighting: '#8b5cf6',
  Racing: '#3b82f6',
  Strategy: '#f59e0b',
};
