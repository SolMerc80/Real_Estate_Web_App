import { Metadata } from "next";
import RatesAndLeviesClient from "@/components/agent/RatesAndLeviesClient";

export const metadata: Metadata = {
  title: "25th Rates & Levies Tracker | Real Estate Agency",
  description: "Track monthly municipal rates, body corporate levies, water, and electricity due on the 25th.",
};

export default function RatesAndLeviesPage() {
  return <RatesAndLeviesClient />;
}

