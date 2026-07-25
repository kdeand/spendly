"use client"

import React, { useState, useEffect} from "react";
import {supabase} from "@/app/lib/supabase";

type Category = {
    name: string;
}

type OutgoingRow = {
    id: number;
    amount: number;
    description: string; 
    category: string;
    date_spent: string;

}

type AmountRow = {
    amount: number;
}

export default function OutgoingCard() {

    //useState
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date_spent, setDateSpent] = useState("");

    const [totalOutgoing, setTotalOutgoing] = useState(0);
    const [editingId, setEditingId] = useState<number | null>(null);
    //for database declarations
    const [outgoingCategories, setOutgoingCategories] = useState<Category[]>([]);
    const [outgoingRows, setOutgoingRows] = useState<OutgoingRow[]>([]);
    
    useEffect(() => {
        getCategories();
        getOutgoing();
        getTotalOutgoing();
    }, []);

    async function getTotalOutgoing() {
        const {data : {user}, error} = await supabase.auth.getUser();
        if(!user) {
            console.log("No user found!");
            return;
        }

        if(error) {
            console.log(error.message);
            return;
        }

        const {data, error:fetchError} = await supabase
            .from("outgoing")
            .select("amount")
            .eq("user_id", user?.id);

        if(fetchError) {
            console.log(fetchError.message);
            return;
        }

        const total = ((data ?? []) as AmountRow[]).reduce((sum, row)=> sum + row.amount, 0);
        setTotalOutgoing(total);
    }

    async function getOutgoing() {
        const {data : {user}, error} = await supabase.auth.getUser();

        if (!user) {
            console.log("No user found!");
            return;
        }

        if(error) {
            console.log(error.message);
            return;
        }

        const {data, error:fetchError} = await supabase
        .from("outgoing")
        .select("id, amount, category, date_spent, description")
        .eq("user_id", user?.id)
        .order("date_spent", {ascending: false});

        console.log ("outgoing rows: ", data);
        setOutgoingRows(data ?? []);


        if (fetchError) {
            console.log(fetchError);
            console.log(fetchError.message);
            return;
        }
    }

    async function deleteOutgoing(id: number) {
        if(!confirm("Delete this record?")) return;
        const {error} = await supabase
        .from("outgoing")
        .delete()
        .eq("id", id);

        if(error) {
            console.log(error.message);
            return;
        }

        getOutgoing();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log(amount);
        console.log(category);
        console.log(date_spent);
        console.log(description);

        const {data : {user}} = await supabase.auth.getUser();

        if(editingId !== null){
            const {data, error} = await supabase.from("outgoing").update({
                user_id: user?.id,
                amount: Number(amount),
                category,
                date_spent: date_spent,
                description
            })
            .eq("id", editingId)
            .select();

            if (error) {
                console.log(error.message, error);
                return;
                } 
                
            } else {
            const {data, error} = await supabase.from("outgoing").insert({
                user_id: user?.id,
                amount: Number(amount),
                category,
                date_spent: date_spent,
                description
            })
            .select();
            if (error) {
                console.log(error.message, error);
                return;
             }

            }

        setEditingId(null);
        setAmount("");
        setDateSpent("");
        setDescription("");

        getOutgoing();
    }

    async function editOutgoing(row: OutgoingRow) {
        setEditingId(row.id);
        setCategory(row.category);
        setAmount(row.amount.toString());
        setDescription(row.description);    
        setDateSpent(row.date_spent);
        }
    async function getCategories() {
        const {data, error } = await supabase
        .from("categories")
        .select("name")
        .eq("type", "outgoing");

        if (error) {
            console.log(error.message);
            return;
        }

        setOutgoingCategories(data ?? []);

        if(data && data.length > 0) {
            setCategory(data[0].name);
        }
    }

return (
    <main className="p-6">
        <form
            onSubmit={handleSubmit}
            className="mb-8 flex max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow"
        >
            <div className="flex flex-col">
                <label htmlFor="amount">Amount</label>
                <input
                    type="number"
                    id="amount"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="rounded border p-2"
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded border p-2"
                >
                    {outgoingCategories.map((category) => (
                        <option key={category.name} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col">
                <label htmlFor="date">Date Spent</label>
                <input
                    type="date"
                    id="date"
                    value={date_spent}
                    onChange={(e) => setDateSpent(e.target.value)}
                    className="rounded border p-2"
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded border p-2"
                />
            </div>

            <button
                type="submit"
                className="rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
            >
                {editingId ? "Update Bill" : "Add Bill"}
            </button>
        </form>

        <table className="w-full border-collapse border">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2">Amount</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Date Spent</th>
                    <th className="border p-2">Description</th>
                    <th className="border p-2">Edit</th>
                    <th className="border p-2">Delete</th>
                </tr>
            </thead>

            <tbody>
                {outgoingRows.map((row) => (
                    <tr key={row.id}>
                        <td className="border p-2">{row.amount}</td>
                        <td className="border p-2">{row.category}</td>
                        <td className="border p-2">{row.date_spent}</td>
                        <td className="border p-2">{row.description}</td>

                        <td className="border p-2">
                            <button
                                type="button"
                                onClick={() => editOutgoing(row)}
                                className="rounded bg-yellow-500 px-3 py-1 text-white"
                            >
                                Edit
                            </button>
                        </td>

                        <td className="border p-2">
                            <button
                                type="button"
                                onClick={() => deleteOutgoing(row.id)}
                                className="rounded bg-red-600 px-3 py-1 text-white"
                            >
                                X
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="mt-6 rounded-lg bg-white p-4 shadow">
            <h2 className="font-semibold">Summary</h2>
            <p>Total Outgoing: {totalOutgoing}</p>
        </div>
    </main>
);
}        