"use client";

import { Building2, DollarSign, Wrench, CalendarDays, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface KpiCardProps {
    label: string
    value: string
    change?: string
    icon: "properties" | "rent" | "tickets" | "leases"
    trend?: "up" | "down" | "neutral"
    index?: number
}

const iconMap = {
    properties: Building2,
    rent: DollarSign,
    tickets: Wrench,
    leases: CalendarDays
}

const colorMap = {
    properties: "text-blue-600 bg-blue-100/50 shadow-blue-100/20",
    rent: "text-emerald-600 bg-emerald-100/50 shadow-emerald-100/20",
    tickets: "text-rose-600 bg-rose-100/50 shadow-rose-100/20",
    leases: "text-amber-600 bg-amber-100/50 shadow-amber-100/20"
}

export default function KpiCard({ label, value, change, icon, trend = "neutral", index = 0}: KpiCardProps) {
    const Icon = iconMap[icon]
    const iconColor = colorMap[icon]

    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.01, delay: index * 0.1, ease: "easeOut" }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
        >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-transparent to-black rounded-full blur-2xl group-hover:bg-blue transition-all duration-500" />
            
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
                    
                    {change && (
                        <div className={cn(
                            "flex items-center gap-1.5 mt-3 text-sm font-medium",
                            trend === "up" && "text-emerald-600",
                            trend === "down" && "text-rose-600",
                            trend === "neutral" && "text-slate-500"
                        )}>
                            <TrendIcon className="w-4 h-4" />
                            <span>{change}</span>
                        </div>
                    )}
                </div>
                
                <div className={cn(
                    "p-3 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-100",
                    iconColor
                )}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    )
}