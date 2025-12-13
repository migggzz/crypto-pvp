export type Market = {
  ticker: string;
  title: string;
  closeTime: string;
  status: string;
  lastPrice?: number;
};

export type ChallengeStatus = "OPEN" | "LIVE" | "READY_FOR_RESOLVE" | "RESOLVED" | "CANCELLED";

export type Challenge = {
  id: string;
  challengeId?: string;
  ticker: string;
  creatorPublicKey: string;
  opponentPublicKey?: string | null;
  creatorSide: number;
  opponentSide?: number | null;
  stakeLamports: number;
  status: ChallengeStatus;
  resultSide?: number | null;
};
