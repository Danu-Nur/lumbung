"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import "./globals.css"; // Ensure Tailwind is applied

export default function RootNotFound() {
    return (
        <html lang="en">
            <body className="min-h-screen bg-background text-foreground font-sans antialiased">
                <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 p-4">
                    <div className="max-w-md w-full text-center p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">

                        <div className="inline-block bg-pink-400 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 rotate-[-6deg]">
                            <span className="text-5xl font-black text-black">404</span>
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-black">
                            Page Not Found
                        </h1>

                        <p className="text-lg font-bold mb-8 text-neutral-600">
                            The page you are looking for does not exist.
                        </p>

                        <Link href="/" className="inline-flex items-center justify-center w-full font-black text-lg h-14 border-2 border-black bg-cyan-300 text-black hover:bg-cyan-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase no-underline">
                            <FileQuestion className="mr-2 h-5 w-5" />
                            Return Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
