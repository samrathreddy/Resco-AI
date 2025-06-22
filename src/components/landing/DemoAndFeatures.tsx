"use client";

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Brain,
    Eye,
    GitBranch,
    User,
    Edit3,
    Plus,
    FileText,
    Download,
    ChevronDown
} from 'lucide-react';

const tabs = [
    { label: 'Chatting with Resco AI', value: 'smart-categorization' },
    { label: 'Keyword Matching', value: 'ai-features' },
    { label: 'Resume Versions', value: 'feature-3' },
];

export function DemoAndFeatures() {
    return (
        <>
            <section className="relative mt-28 sm:mt-36 md:mt-52 hidden flex-col justify-center md:flex">
                <div className="bg-border absolute left-1/2 top-0 h-px w-full -translate-x-1/2 md:container xl:max-w-7xl" />
                <Tabs
                defaultValue="smart-categorization"
                className="flex w-full flex-col items-center gap-0"
                >
                <div
                    className="relative bottom-2 flex w-full justify-center md:border-t"
                    style={{ clipPath: 'inset(0 0 0 0)', height: '110%' }}
                >
                    <div className="container relative -top-1.5 md:border-x xl:max-w-7xl">
                    {tabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                        <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
                            <div className="text-center text-white">
                            <div className="text-xl sm:text-2xl font-bold mb-4">{tab.label}</div>
                            <div className="text-gray-400">Resco preview coming soon...</div>
                            </div>
                        </div>
                        </TabsContent>
                    ))}
                    </div>
                </div>
                </Tabs>
            </section>

            <div className="flex items-center justify-center px-4 md:hidden">
                <div className="mt-10 h-40 sm:h-60 w-full rounded-xl border bg-[#1A1A1A] flex items-center justify-center py-10 sm:py-20">
                    <div className="text-center text-white">
                        <div className="text-lg sm:text-xl font-bold mb-2">Resco Preview</div>
                        <div className="text-gray-400 text-sm sm:text-base">Mobile preview coming soon...</div>
                    </div>
                </div>
            </div>

            <div className="relative -top-3.5 hidden h-[1px] w-full bg-[#313135] md:block" />

            <div className="relative mt-28 sm:mt-36 md:mt-52">
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center"
                >
                <h1 className="text-base sm:text-lg font-light text-white/40 md:text-xl">
                    The game is getting past ATS first, skills second
                </h1>
                </motion.div>
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-2 flex flex-col items-center justify-center md:mt-8"
                >
                <h1 className="text-center text-3xl sm:text-4xl font-medium text-white md:text-6xl">
                    Beat the Algorithm
                </h1>
                <h1 className="text-center text-3xl sm:text-4xl font-medium text-white/40 md:text-6xl">
                    Land the Interview
                </h1>
                </motion.div>
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative bottom-3 mx-4 sm:mx-12 flex items-center justify-center bg-[#0F0F0F] md:mx-0"
                >
                <div className="bg-panelDark mx-auto inline-flex max-w-[600px] flex-col items-center justify-center overflow-hidden rounded-2xl shadow-md bg-[#202020]">
                    <div className="inline-flex h-12 items-center justify-start gap-2 self-stretch border-b-[0.50px] p-4 border-[#2B2B2B]">
                    <div className="text-base-gray-500/50 justify-start text-sm leading-none text-[#8C8C8C]">To:</div>
                    <div className="flex flex-1 items-center justify-start gap-1">
                        <div className="outline-tokens-badge-default/10 flex items-center justify-start gap-1.5 rounded-full border border-[#2B2B2B] py-1 pl-1 pr-1.5">
                        <User className="h-5 w-5 rounded-full text-indigo-400" />
                        <div className="flex items-center justify-start">
                            <div className="flex items-center justify-center gap-2.5 pr-0.5">
                            <div className="text-base-gray-950 justify-start text-sm leading-none text-white">
                                Resco
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="inline-flex h-12 items-center justify-start gap-2.5 self-stretch p-4">
                    <Edit3 className="relative h-3.5 w-3.5 overflow-hidden fill-[#9A9A9A]" />
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-3">
                        <div className="inline-flex items-center justify-start gap-1 self-stretch">
                        <div className="text-base-gray-950 flex-1 justify-start text-sm font-normal leading-none text-white">
                            Add a projects section with my GitHub repos
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-12 self-stretch rounded-2xl bg-[#202020] px-4 py-3">
                    <div className="flex flex-col items-start justify-start gap-3 self-stretch">
                        <div className="justify-start self-stretch text-sm font-normal leading-normal text-white">
                        I'll help you add a projects section to your resume.
                        </div>
                        <div className="justify-start self-stretch text-sm font-normal leading-normal text-white">
                        I'll analyze the job description and add relevant keywords to your GitHub repositories section, ensuring it passes ATS screening. I'll highlight technologies that match the job requirements and optimize keyword density.
                        </div>
                        <div className="justify-start self-stretch text-sm font-normal leading-normal text-white">
                        Remember, getting past ATS is the first step to landing an interview. Your skills matter, but only if your resume gets seen by human eyes.
                        </div>
                    </div>
                    <div className="inline-flex items-center justify-between self-stretch">
                        <div className="flex items-center justify-start gap-3">
                        <div className="flex items-center justify-start rounded-md bg-white text-black">
                            <div className="flex h-7 items-center justify-center gap-1.5 overflow-hidden rounded-bl-md rounded-tl-md bg-white pl-1.5 pr-1">
                            <div className="flex items-center justify-center gap-2.5 pl-0.5">
                                <div className="justify-start text-center text-sm leading-none text-black">
                                Apply <span className="hidden md:inline">changes</span>
                                </div>
                            </div>
                            <div className="flex h-5 items-center justify-center gap-2.5 rounded bg-[#E7E7E7] px-1 outline outline-1 outline-offset-[-1px] outline-[#D2D2D2]">
                                <div className="text-tokens-shortcut-primary-symbol justify-start text-center text-sm font-semibold leading-none">
                                ⏎
                                </div>
                            </div>
                            </div>
                            <div className="bg-base-gray-950 flex items-center justify-start gap-2.5 self-stretch px-2 pr-3">
                            <div className="relative h-3 w-px rounded-full bg-[#D0D0D0]" />
                            </div>
                            <div className="bg-base-gray-950 flex h-7 items-center justify-center gap-1.5 overflow-hidden rounded-br-md rounded-tr-md pr-2">
                            <ChevronDown className="relative h-2 w-2 overflow-hidden fill-black" />
                            </div>
                        </div>
                        <div className="flex h-7 items-center justify-center gap-0.5 overflow-hidden rounded-md bg-[#373737] px-1.5">
                            <Plus className="relative h-2.5 w-2.5 overflow-hidden fill-[#9A9A9A]" />
                            <div className="flex items-center justify-center gap-2.5 px-0.5">
                            <div className="text-base-gray-950 justify-start text-sm leading-none text-[#9A9A9A]">
                                Add <span className="hidden md:inline">more</span>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden items-start justify-start gap-3 md:flex">
                        <div className="flex h-7 items-center justify-center gap-0.5 overflow-hidden rounded-md bg-[#373737] px-1.5">
                            <FileText className="relative h-3 w-3 overflow-hidden fill-[#9A9A9A]" />
                            <div className="flex items-center justify-center gap-2.5 px-0.5">
                            <div className="text-base-gray-950 justify-start text-sm leading-none text-[#9A9A9A]">
                                Preview
                            </div>
                            </div>
                        </div>
                        <div className="flex h-7 items-center justify-center gap-0.5 overflow-hidden rounded-md bg-[#373737] px-1.5">
                            <Download className="relative mx-1 h-2.5 w-2.5 overflow-hidden fill-[#9A9A9A]" />
                            <div className="flex items-center justify-center gap-2.5 px-0.5">
                            <div className="text-base-gray-950 justify-start text-sm leading-none text-[#9A9A9A]">
                                Export PDF
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="inline-flex items-start justify-start self-stretch">
                    <div className="border-tokens-stroke-light/5 flex h-12 flex-1 items-center justify-center gap-2 border-r-[0.50px] border-[#2B2B2B]">
                        <div className="flex items-center justify-start gap-1">
                        <div className="flex h-5 w-5 items-center justify-center gap-2.5 rounded-[5px] bg-[#2B2B2B] px-1.5">
                            <div className="justify-start text-center text-sm font-semibold leading-none text-[#8C8C8C]">
                            ↓
                            </div>
                        </div>
                        <div className="flex h-5 w-5 items-center justify-center gap-2.5 rounded-[5px] bg-[#2B2B2B] px-1.5">
                            <div className="justify-start text-center text-sm font-semibold leading-none text-[#8C8C8C]">
                            ↑
                            </div>
                        </div>
                        </div>
                        <div className="justify-start text-sm leading-none text-[#8C8C8C]">to navigate</div>
                    </div>
                    <div className="flex h-12 flex-1 items-center justify-center gap-2">
                        <div className="flex h-5 items-center justify-center gap-2.5 rounded-[5px] bg-[#2B2B2B] px-1">
                        <div className="justify-start text-center text-sm font-semibold leading-none text-[#8C8C8C]">
                            ⌘Z
                        </div>
                        </div>
                        <div className="justify-start text-sm leading-none text-[#8C8C8C]">
                        undo changes
                        </div>
                    </div>
                    </div>
                </div>
                </motion.div>
            </div>

            <div className="relative mt-28 sm:mt-36 md:mt-52 flex items-center justify-center">
                <div className="mx-auto grid max-w-[1250px] gap-12 md:grid-cols-2 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col"
                >
                    <div className="relative h-96 w-full overflow-hidden rounded-2xl">
                    <div className="absolute left-0 top-0 h-96 w-96 rounded-2xl border border-[#252525] bg-neutral-800" />
                    <div className="relative flex h-full items-center justify-center">
                        <div className="text-center text-white">
                        <Brain className="mx-auto h-12 w-12 mb-4 text-indigo-400" />
                        <h3 className="text-xl font-medium mb-2">ATS Keyword Optimization</h3>
                        <p className="text-gray-400 text-sm">Beat the algorithms that filter resumes</p>
                        </div>
                    </div>
                    </div>
                    <div className="mt-4 gap-4">
                    <h1 className="mb-2 text-xl font-medium leading-loose text-white">
                        Beat the First Gatekeeper
                    </h1>
                    <p className="max-w-sm text-sm font-light text-[#979797]">
                        ATS systems reject 75% of resumes before a human ever sees them. Resco ensures your resume is optimized with the right keywords and format to pass through these digital filters.
                    </p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative h-96 w-96 overflow-hidden rounded-2xl">
                    <div className="absolute left-0 top-0 h-96 w-96 rounded-2xl bg-[#2B2B2B]" />
                    <div className="relative flex h-full items-center justify-center">
                        <div className="text-center text-white">
                        <Eye className="mx-auto h-12 w-12 mb-4 text-green-400" />
                        <h3 className="text-xl font-medium mb-2">Live Preview</h3>
                        <p className="text-gray-400 text-sm">Real-time LaTeX compilation</p>
                        </div>
                    </div>
                    </div>
                    <div>
                    <h1 className="mb-2 mt-4 text-lg font-medium leading-loose text-white">
                        AI-Powered Summaries
                    </h1>
                    <p className="max-w-sm text-sm font-light text-[#979797]">
                        Your personal resume copilot. Let our AI suggest improvements, fix formatting, and optimize for ATS systems automatically.
                    </p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative h-96 w-96 overflow-hidden rounded-2xl">
                    <div className="absolute left-0 top-0 h-96 w-96 rounded-2xl bg-[#2B2B2B]" />
                    <div className="relative flex h-full items-center justify-center">
                        <div className="text-center text-white">
                        <GitBranch className="mx-auto h-12 w-12 mb-4 text-orange-400" />
                        <h3 className="text-xl font-medium mb-2">Version Control</h3>
                        <p className="text-gray-400 text-sm">GitHub-style diff visualization</p>
                        </div>
                    </div>
                    </div>
                    <div className="mt-4">
                    <h1 className="mb-2 text-lg font-medium leading-loose text-white">Smart Search</h1>
                    <p className="max-w-sm text-sm font-light text-[#979797]">
                        Your resume, your rules. Create personalized formatting flows that match exactly how you organize, write, and present your experience.
                    </p>
                    </div>
                </motion.div>
                </div>
            </div>
        </>
    );
} 