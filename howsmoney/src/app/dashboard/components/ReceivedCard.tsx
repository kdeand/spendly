"use client"
import {useState, useEffect} from "react";
import {supabase} from "@/app/lib/supabase";

//to set a type
type Category = {
    name: string;
}

type ReceivedRow = {
    id: number;
    amount: number;
    date_received: string;
    category: string
    description: string;
}

type AmountRow = {
    amount: number;
}

export default function ReceivedCard() {  

    //USESTATE
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date_received, setDateReceived] = useState("");
    const [description, setDescription] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);

        //fetch rows for the categories in received
    const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
    const [receivedRows, setReceivedRows] = useState<ReceivedRow[]>([]);
    const [collectedAmount, setCollectedAmount] = useState(0);

    //runs everything
    useEffect(() => {
        getCategories();
        getReceived();
        getTotal();
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
        const {data: {user}, error} = await supabase.auth.getUser();
        if(!user) {
            console.log("No user found!");
        }

        if(error) {
            console.log(error.message);
            return;
        }


        const {data, error:fetchError} = await supabase
        .from("received")
        .select("id, amount, category, date_received, description")
        .eq("user_id", user?.id)
        .order("date_received", {ascending: false});

        console.log("received rows:", data);
        setReceivedRows(data ?? []);
    }

    //get total income
//GET TOTAL INCOME ===========================

    async function getTotal() {
        const {data: {user}, error} = await supabase.auth.getUser();
        if(!user) {
            console.log("No user found!");
        }

        if(error) {
            console.log(error.message);
            return;
        }

        const {data, error: fetchError} = await supabase
            .from("received")
            .select("amount")
            .eq("user_id", user?.id);

        if(fetchError) {
            console.log(fetchError.message);
            return;
        }

        const total = ((data ?? []) as AmountRow[]).reduce((sum,row) => sum + row.amount, 0);

        setCollectedAmount(total);
    }

    async function deleteReceived(id: number) {
        if(!confirm("Delete this record?")) return;
        const { error } = await supabase
        .from("received")
        .delete()
        .eq("id", id);

        if (error) {
            console.log(error.message);
            return;
        }

        getReceived();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log(amount);
        console.log(category);
        console.log(date_received);
        console.log(description);

        const { data: { user }} = await supabase.auth.getUser();
        if(editingId !== null){
            const { data, error } = await supabase.from("received").update({
                            user_id: user?.id,
                            amount: Number(amount),
                            category,
                            date_received: date_received,
                            description
                })
                .eq("id", editingId)
                .select();

                if(error){
                    console.log(error.message, error);
                    return;
                }

        } else {
                const { data, error } = await supabase.from("received").insert({
                    user_id: user?.id,
                    amount: Number(amount),
                    category,
                    date_received: date_received,
                    description
                })
                .select();

                if(error) {
                    console.log(error.message, error);
                    return;
                }
        }


        setAmount("");
        setDateReceived("");
        setDescription("");
        getReceived();
    }

    async function editReceived(row: ReceivedRow) {
        setEditingId(row.id);
        setCategory(row.category);
        setAmount(row.amount.toString());
        setDescription(row.description);
        setDateReceived(row.date_received);
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
                    placeholder="Enter amount"
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
                    {incomeCategories.map((category) => (
                        <option key={category.name} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col">
                <label htmlFor="date">Date Received</label>
                <input
                    type="date"
                    id="date"
                    value={date_received}
                    onChange={(e) => setDateReceived(e.target.value)}
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
                {editingId ? "Update Income" : "Add Income"}
            </button>
        </form>

        <table className="w-full border-collapse border">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2">Amount</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Date Received</th>
                    <th className="border p-2">Description</th>
                    <th className="border p-2">Edit</th>
                    <th className="border p-2">Delete</th>
                </tr>
            </thead>

            <tbody>
                {receivedRows.map((row) => (
                    <tr key={row.id}>
                        <td className="border p-2">{row.amount}</td>
                        <td className="border p-2">{row.category}</td>
                        <td className="border p-2">{row.date_received}</td>
                        <td className="border p-2">{row.description}</td>

                        <td className="border p-2">
                            <button
                                type="button"
                                onClick={() => editReceived(row)}
                                className="rounded bg-yellow-500 px-3 py-1 text-white"
                            >
                                Edit
                            </button>
                        </td>

                        <td className="border p-2">
                            <button
                                type="button"
                                onClick={() => deleteReceived(row.id)}
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
            <p>Total Income: {collectedAmount}</p>
        </div>
    </main>
);
}