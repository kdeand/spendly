"use client"
import {useState, useEffect} from "react";
import {supabase} from "@/app/lib/supabase";

type Category = {
    name: string;
}

type ReceivedRow = {
    amount: number;
    date_received: string;
    category: string
}

export default function ReceivedCard() {  

    //USESTATE
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date_received, setDateReceived] = useState("");

        //fetch rows for the categories in received
    const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
    const [receivedRows, setReceivedRows] = useState<ReceivedRow[]>([]);


    //runs everything
    useEffect(() => {
        getCategories();
        getReceived();
    }, []);

    //gets the categories from the database
    async function getCategories(){
        const { data, error } = await supabase 
            .from ("categories")
            .select("name")
            .eq("type", "income"); //selects specific columns

        if(error) {
            console.log(error.message);
            return;
        }
        setIncomeCategories(data ?? []);

        if (data && data.length > 0) {
            setCategory(data[0].name);
        }
    }

    async function getReceived() {
        const {data, error} = await supabase
        .from("received")
        .select("amount, category, date_received")
        .order("date_received", {ascending: false});

        if(error) {
            alert(error.message);
            return;
        }

         console.log("received rows:", data);
        setReceivedRows(data ?? [] as ReceivedRow[]);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log(amount);
        console.log(category);
        console.log(date_received);

        const { data: { user }} = await supabase.auth.getUser();

        const { data, error } = await supabase.from("received").insert({
                    user_id: user?.id,
                    amount: Number(amount),
                    category,
                    date_received: date_received
        });

        setAmount("");
        setCategory("");
        setDateReceived("");

        getReceived();
    }

    return(
        <main>
            <form onSubmit = {handleSubmit}>
                <div>
                    <label htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        placeholder="Enter amount"
                        value = {amount}
                        onChange = {(e) => setAmount(e.target.value)}

                    />
                </div>
                <div>
                    <label htmlFor="category">Category</label>
                    <select id="category"
                    value = {category}
                    onChange = {(e) => setCategory(e.target.value)}>
                        {incomeCategories.map((category) => (
                            <option
                                key={category.name}
                                value={category.name}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="date">Date Received</label>
                    <input
                        type="date"
                        id="date"
                        value = {date_received}
                        onChange = {(e) => setDateReceived(e.target.value)}

                    />
                </div>

                <button type="submit">
                    Add Income
                </button>
            </form>
            <table>
                    <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Date Received</th>
                        </tr>

                    </thead>
                    <tbody>
                        {receivedRows.map((row, index) => (
                                <tr key={index}>
                                <td>{row.amount}</td>
                                <td>{row.category}</td>
                                <td>{row.date_received}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
        </main>
        
    )
}