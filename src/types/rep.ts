export interface RepProfile {
  guildId: string;
  userId: string;
  repsReceived: number;
  repsGiven: number;
  lastRepGivenAt: Date | null;
  rank: number | null;
}

export interface GiveRepResult {
  giverUserId: string;
  receiverUserId: string;
  guildId: string;
  receiverNewTotal: number;
  nextAvailableAt: Date;
}

export interface RepLeaderboardEntry {
  userId: string;
  repsReceived: number;
  rank: number;
}

export interface RepCooldownStatus {
  onCooldown: boolean;
  nextAvailableAt: Date | null;
  remainingMs: number;
  cooldownType: 'same-user' | 'different-user' | null;
}

export interface LatestRepTransaction {
  receiverUserId: string;
  createdAt: Date;
}
