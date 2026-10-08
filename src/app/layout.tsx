import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Fashion Video Studio · 女装视频工作台',description:'中文女装视频策划工作台：参考素材、结构化设定、一致性与五分镜规划'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>;}
