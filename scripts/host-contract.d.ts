export type TaskState = 'available'|'in_progress'|'verifying'|'verified'|'rejected'|'claimed'|'already_claimed'|'expired'|'retry_available'|'server_error'|'claiming';
export type Route = 'home'|'inventory'|'invite'|'leaderboard'|'rewards'|'deposit'|'cases'|'crash'|'channel'|'collection'|'upgrade'|'wheel'|'craft'|'wallet'|'weekly'|'profile'|'points';
export interface Reward { amount:string; unit:string }
export interface Task {
 id:string; title:string; description:string; icon:string;
 category:'daily'|'limited'|'social';
 progress:number; target:number; reward:Reward; state:TaskState;
 canClaim:boolean; canVerify:boolean; route?:Route;
 expiresAt?:string|null; retryAt?:string|null; featured?:boolean;
 visual?:'path'|'passport'|'reactor'|'crew';
 steps?:Array<{title:string;description:string}>;
}
export interface Snapshot { revision:number; serverNow:string; balance:Reward|null; tasks:Task[]; achievements:Array<Omit<Task,'category'>&{category?:Task['category']}> }
export interface OperationResult {status:'pending'|'succeeded'|'failed'|'not_found';snapshot:Snapshot}
export interface CaseTasksHost {
 getSnapshot(args:{signal:AbortSignal}):Promise<Snapshot>;
 verifyTask(args:{taskId:string;signal:AbortSignal}):Promise<Snapshot>;
 claimReward(args:{taskId:string;idempotencyKey:string;signal:AbortSignal}):Promise<OperationResult>;
 getOperation(args:{taskId:string;idempotencyKey:string;signal:AbortSignal}):Promise<OperationResult>;
 navigate(args:{route:Route;taskId?:string;signal:AbortSignal}):Promise<void>;
 subscribe?(onChange:()=>void):()=>void;
}
