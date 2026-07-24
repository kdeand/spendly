"use client"
import "./dashboard.css";
import {supabase} from "@/app/lib/supabase";
import {useState, useEffect} from "react";
import ReceivedCard from "@/app/dashboard/components/ReceivedCard";
import OutgoingCard from "./components/OutgoingCard";
import BillCard from "./components/BillCard";
import SummaryCard from "./components/SummaryCard";

export default function DashBoard() {
    const [email, setEmail] = useState<String>("");

    useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.log(error.message);
        return;
      }

      setEmail(data.user?.email ?? "");
    }

    getUser();
  }, []);
    

    return(
        <main className="dashboard">

    <header className="dashboard-header">
        <p className="welcome-text">Welcome back!</p>
        <p className="logged-in">Logged in as: {email}</p>

        <h1>{email}'s Dashboard</h1>
    </header>

    <section className="dashboard-section">
        <SummaryCard />
    </section>

    <section className="dashboard-section">
        <h2 className="section-title income">💰 Income</h2>
        <ReceivedCard />
    </section>

    <section className="dashboard-section">
        <h2 className="section-title outgoing">💸 Outgoing</h2>
        <OutgoingCard />
    </section>

    <section className="dashboard-section">
        <h2 className="section-title bills">🧾 Bills</h2>
        <BillCard />
    </section>

</main>


    )
}