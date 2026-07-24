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

export default function OutgoingCard() {

    //useState
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date_spent, setDateSpent] = useState("");


    //for database declarations
    const [outgoingCategories, setOutgoingCategories] = useState<Category[]>([]);
    const [outgoingRows, setOutgoingRows] = useState<OutgoingRow[]>([]);
    
    useEffect(() => {
        getCategories();
        getOutgoing();
    }, []);

    async function getOutgoing() {
        const {data : {user}, error} = await supabase.auth.getUser();

        if (!user) {
            console.log("No user found!");
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

        const {data, error} = await supabase.from("outgoing").insert({
            user_id: user?.id,
            amount: Number(amount),
            category,
            date_spent: date_spent,
            description
        });

        setAmount("");
        setCategory("");
        setDateSpent("");
        setDescription("");

        getOutgoing();
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

    return(
        <main>
            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="amount"> Amount </label>
                    <input 
                        type="number"
                        id = "amount"
                        placeholder = "Enter Amount"
                        value = {amount}
                        onChange = {(e) => setAmount(e.target.value)} />
                </div>

                <div>
                    <label htmlFor="category">Category</label>
                    <select id="category"
                        value = {category}
                        onChange = {(e) => setCategory(e.target.value)}>
                            {outgoingCategories.map((category) => (
                                <option key = {category.name} 
                                        value={category.name}>
                                            {category.name}
                                        </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="date">Date Spent</label>
                    <input 
                        type="date"
                        id = "date"
                        value = {date_spent}
                        onChange = {(e) => setDateSpent(e.target.value)} />
                </div>

                <div>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id = "description"
                        value = {description}
                        onChange={(e) => setDescription(e.target.value)} />
                </div>
                <button type="submit">Add Expense</button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Date Spent</th>
                        <th>Description</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {outgoingRows.map((row, index)=> (
                        <tr key = {index}>
                            <td>{row.amount} </td>
                            <td>{row.category} </td>
                            <td>{row.date_spent}</td>
                            <td>{row.description}</td>
                            <td>
                                <button onClick={() => {deleteOutgoing(row.id)}}> X </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    )
    
}           