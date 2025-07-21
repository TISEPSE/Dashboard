"use client"

import { useState, useEffect } from "react"
import { Button } from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';
import LoaderPortal from "../../components/LoaderPortal"

export default function Paramètre() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return <LoaderPortal />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-4xl font-bold text-white mb-4">Paramètre</h1>
                    <p className="mt-4 text-lg text-gray-300 mb-6">Bienvenue sur la page des paramètres !</p>
                    <div className="flex flex-row gap-4">
                        <Button appearance="default">Default</Button>
                        <Button appearance="primary">Primary</Button>
                        <Button appearance="link">Link</Button>
                        <Button appearance="subtle">Subtle</Button>
                        <Button appearance="ghost">Ghost</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}