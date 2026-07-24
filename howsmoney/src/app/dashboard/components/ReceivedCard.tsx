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

                <div>
                    <label htmlFor="description"> Description </label>
                    <textarea name="description" 
                    id="description"
                     value = {description}
                     onChange={(e) => setDescription(e.target.value)}>
                    </textarea>
                </div>

                <button type="submit">
                    {editingId? "Update Bill" : "Add Bill"}
                </button>
            </form>
            <table>
                    <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Date Received</th>
                            <th></th>
                        </tr>

                    </thead>
                    <tbody>
                        {receivedRows.map((row, index) => (
                                <tr key={row.id}>
                                <td>{row.amount}</td>
                                <td>{row.category}</td>
                                <td>{row.date_received}</td>
                                <td>{row.description}</td>
                                <td>
                                    <button type="button" onClick = {() => {editReceived(row)} }>Edit</button>
                                </td>
                                <td>
                                    <button type = "button" onClick={() => {deleteReceived(row.id)}}> X </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
        </main>
        
    )
}