"use client"
import {supabase} from "@/app/lib/supabase";
import {useState, useEffect} from "react";
import ReceivedCard from "@/app/dashboard/components/ReceivedCard";
import OutgoingCard from "./components/OutgoingCard";
import BillCard from "./components/BillCard";

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
        <main> Hello from dashboard! 
        Logged in as: {email} 
        <br /> <br />
        <h1> {email}'s Dashboard</h1>
        <br /> <br />
        <h1> Income </h1>

        <ReceivedCard />
        <br /><br />
        <h1>Outgoing</h1>
        <OutgoingCard />

        <h1> Bills </h1>
        <br /><br />
        <BillCard />
        </main>


    )
}