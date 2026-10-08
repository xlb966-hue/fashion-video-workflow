export type AnalysisStatus = 'pending' | 'manual' | 'ai';
export interface Person { face: string; hair: string; skin: string; expression: string }
export interface Clothing { category: string; color: string; neckline: string; waist: string; fabric: string; accessories: string }
export interface Scene { architecture: string; light: string; photography: string; palette: string }
export interface Analysis { person: Person; clothing: Clothing; scene: Scene }
export interface Consistency { face: boolean; clothing: boolean; anatomy: boolean; light: boolean; gait: boolean; stability: boolean }
export interface Shot { id: number; name: string; duration: number; action: string; camera: string; focus: string; promptZh: string; promptEn: string; negative: string }
export interface Workflow { version: 1; name: string; aspectRatio: '9:16'; duration: 15; analysisStatus: AnalysisStatus; analysis: Analysis; consistency: Consistency; shots: Shot[] }
export type ProviderId = 'kling' | 'jimeng' | 'sora' | 'custom';
export interface VideoRequest { provider: ProviderId; workflow: Workflow; referenceImages?: { clothing?: string; person?: string } }
export interface VideoTask { source: 'real'; taskId: string; status: 'queued' | 'running' | 'succeeded' | 'failed'; videoUrl?: string; error?: string }
export interface VideoAdapter { id: ProviderId; name: string; configured: boolean; submit(input: VideoRequest): Promise<VideoTask>; getTask(taskId: string): Promise<VideoTask> }
