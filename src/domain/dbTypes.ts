// export interface LeagueMember {
//   id: LeagueMemberID;
//   leagueID: LeagueID;
//   displayName: string;
//   isOwner: boolean;
//   createdAt: Date;
// }

interface TransactionBase {
  leagueID: string;
  description: string;
  createdAt: Date;
  leagueMemberID: string;
}

export type ITransaction = TransactionBase &
  (
    | {
        type: "BUY" | "SELL";
        cardID: string;
        cardType: "NORMAL" | "FOIL";
        amount: number;
        quantity: number;
      }
    | {
        type: "CASH";
        amount: number;
      }
  );
