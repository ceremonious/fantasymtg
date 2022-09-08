export type LeagueID = `leg_${string}`;
export type LeagueMemberID = `lm_${string}`;
export type CardID = `crd_${string}`;

// export interface LeagueMember {
//   id: LeagueMemberID;
//   leagueID: LeagueID;
//   displayName: string;
//   isOwner: boolean;
//   createdAt: Date;
// }

interface TransactionBase {
  leagueID: LeagueID;
  description: string;
  createdAt: Date;
  leagueMemberID: LeagueMemberID;
}

export type Transaction = TransactionBase &
  (
    | {
        type: "BUY" | "SELL";
        cardID: CardID;
        amount: number;
        quantity: number;
      }
    | {
        type: "CASH";
        amount: number;
      }
  );
