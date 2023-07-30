export interface IDbBot {
   id: number;
   userId: number;
   proxyId: number;
   isPremium: boolean;
   username: string;
   server: string;
   status: string | null;
   endDate: string;
   createdAt: Date;
   activeMacrosId: number | null;
   macroses: BotMacros[];
   whitelist: BotWhitelistUser[];
   timers: Timer[];
}

export interface BotWhitelistUser {
   id: number;
   botId: number;
   username: string;
}

export interface BotMacros {
   id: number;
   botId: number;
   title: string | null;
   blocks: MacrosBlock[];
}

export interface MacrosBlock {
   id: number;
   macrosId: number;
   blockType: string;
   event: string | null;
   action: string | null;
   value: string;
   secondValue: string | null;
}

export interface Timer {
   id: number;
   botId: number;
   message: string;
   interval: number;
   createdAt: string;
}
