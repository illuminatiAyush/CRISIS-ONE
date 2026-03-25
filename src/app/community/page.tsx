"use client";

import React, { useState, useRef } from "react";
import GovernmentHeader from "@/components/sections/header/GovernmentHeader";
import GovernmentFooter from "@/components/sections/footer/GovernmentFooter";
import { Send, Paperclip, FileText, Image as ImageIcon, X } from "lucide-react";

interface Message {
    id: number;
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
    file?: {
        name: string;
        type: "image" | "file";
    };
}

const CommunityPage = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            user: "Rajesh Kumar",
            avatar: "R",
            text: "Has anyone noticed the water logging near Sector 4 bridge? It seems to be getting worse.",
            timestamp: "10:30 AM",
        },
        {
            id: 2,
            user: "Priya Singh",
            avatar: "P",
            text: "Yes, I reported it yesterday. Here is the photo I took.",
            timestamp: "10:35 AM",
            file: { name: "waterlog_sec4.jpg", type: "image" },
        },
        {
            id: 3,
            user: "District Admin",
            avatar: "A",
            text: "Thank you for reporting. The maintenance team has been notified and will reach the site shortly.",
            timestamp: "10:45 AM",
        },
        {
            id: 4,
            user: "Amit Verma",
            avatar: "A",
            text: "Found this safety manual for flood situations. Might be useful for everyone.",
            timestamp: "11:15 AM",
            file: { name: "flood_safety_guide.pdf", type: "file" }
        }
    ]);

    const [inputText, setInputText] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSend = () => {
        if (!inputText.trim() && !selectedFile) return;

        const newMessage: Message = {
            id: messages.length + 1,
            user: "You",
            avatar: "Y",
            text: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            file: selectedFile ? {
                name: selectedFile.name,
                type: selectedFile.type.startsWith("image/") ? "image" : "file"
            } : undefined
        };

        setMessages([...messages, newMessage]);
        setInputText("");
        setSelectedFile(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <GovernmentHeader />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[80vh]">

                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Community Forum</h1>
                            <p className="text-xs text-slate-500">Connect, share, and help your local community.</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">124 Online</span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[80%] ${msg.user === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1
                    ${msg.user === 'District Admin' ? 'bg-blue-600 text-white' :
                                            msg.user === 'You' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'} 
                    ${msg.user === 'You' ? 'ml-3' : 'mr-3'}
                  `}>
                                        {msg.avatar}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`group relative rounded-2xl p-4 text-sm 
                    ${msg.user === 'You'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-slate-100 text-slate-800 rounded-tl-none'}
                  `}>
                                        {/* Username */}
                                        {msg.user !== 'You' && (
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className={`text-xs font-bold ${msg.user === 'District Admin' ? 'text-blue-600 bg-blue-50 px-1 rounded' : 'text-slate-500'}`}>
                                                    {msg.user}
                                                </span>
                                            </div>
                                        )}

                                        <p className="whitespace-pre-wrap">{msg.text}</p>

                                        {/* Attachment */}
                                        {msg.file && (
                                            <div className={`mt-3 flex items-center p-2 rounded-lg ${msg.user === 'You' ? 'bg-blue-700/50' : 'bg-white border border-slate-200'}`}>
                                                {msg.file.type === 'image' ? <ImageIcon size={20} className="mr-2 opacity-70" /> : <FileText size={20} className="mr-2 opacity-70" />}
                                                <span className="text-xs font-medium truncate max-w-[150px]">{msg.file.name}</span>
                                            </div>
                                        )}

                                        <span className={`text-[10px] absolute bottom-1 ${msg.user === 'You' ? 'left-4 text-blue-200' : 'right-4 text-slate-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                            {msg.timestamp}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100">

                        {/* File Preview */}
                        {selectedFile && (
                            <div className="flex items-center mb-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg w-fit">
                                <span className="text-xs text-slate-600 mr-2">Attached: {selectedFile.name}</span>
                                <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500">
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Attach File">
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message or report an update..."
                                className="flex-grow bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />

                            <button
                                onClick={handleSend}
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!inputText.trim() && !selectedFile}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            <GovernmentFooter />
        </div>
    );
};

export default CommunityPage;
