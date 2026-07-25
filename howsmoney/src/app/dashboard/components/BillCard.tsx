import {useState, useEffect} from "react";
import {supabase} from "@/app/lib/supabase";

type Category = {
    name: string;
}

type BillRow = {
    id: number;
    amount: number;
    due_date: string;
    category: string;
    status: string;
    description: string;
}

type PaidAmountRow = {
    amount: number;
}

type PendingAmountRow = {
    amount:number;
}


export default function BillCard(){

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [due_date, setDueDate] = useState("");
    const [status, setStatus] = useState("Pending");
    const [description, setDescription] = useState("");

    const [totalPaid, setTotalPaid] = useState(0);
    const [totalPending, setTotalPending] = useState(0);

    const [editingId, setEditingId] = useState<number | null>(null);

    const [billCategory, setBillCategory] = useState<Category[]>([]);
    const [billRows, setBillRows] = useState<BillRow[]>([]);

    useEffect (() => {
        getCategories();
        getBills();
        getPending();
        getPaid();
    }, []);


    async function getPaid() {
        const {data: {user}, error} = await supabase.auth.getUser();
        if(!user) {
            console.log("No user found!");
            return;
        }

        if(error) {
            console.log(error.message);
            return;
        }

        const {data, error: fetchError} = await supabase
            .from("bills")
            .select("amount")
            .eq("status", "Paid")
            .eq("user_id", user?.id);

        if (fetchError) {
            console.log(fetchError.message);
            return;
        }

        const totalPaid = ((data ?? []) as PaidAmountRow[]).reduce((sum, row) => sum + row.amount, 0);
        setTotalPaid(totalPaid);
    }

    async function getPending() {
        const {data: {user}, error} = await supabase.auth.getUser();
        if(!user) {
            console.log("No user found!");
            return;
        }

        if(error) {
            console.log(error.message);
            return;
        }

        const {data, error: fetchError} = await supabase
            .from("bills")
            .select("amount")
            .eq("status", "Pending")
            .eq("user_id", user?.id);

        if (fetchError) {
            console.log(fetchError.message);
            return;
        }

        const totalPending = ((data ?? []) as PendingAmountRow[]).reduce((sum, row) => sum + row.amount, 0);
        setTotalPending(totalPending);
    }
    

    async function getCategories() {
        const { data, error} = await supabase
        .from("categories")
        .select("name")
        .eq("type", "bills");

        if(error) {
            console.log(error.message);;
            return;
        }

        setBillCategory(data ?? []);

        if(data && data.length > 0) {
            setCategory(data[0].name);
        }
    }

    async function getBills() {
         const {data: {user}, error} = await supabase.auth.getUser();
        if(!user) {
            console.log("No user found!");
            return;
        }

        if(error) {
            console.log(error.message);
            return;
        }

        const {data, error: fetchError} = await supabase
        .from("bills")
        .select("id, category, amount, description, due_date, status")
        .eq("user_id", user?.id);

        console.log("bill rows:", data);
        setBillRows(data ?? []);

        if (fetchError) {
            console.log(fetchError);
            console.log(fetchError.message);
            return;
        }
    }

    async function deleteBill(id: number) {
        if(!confirm("Delete this record?")) return;
        const {error} = await supabase
        .from("bills")
        .delete()
        .eq("id", id);

        if(error) {
            console.log(error.message);
            return;
        }

        getBills();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log(category);
        console.log(amount);
        console.log(due_date);
        console.log(description);
        console.log(status);

        const {data: {user}} = await supabase.auth.getUser();

        if(editingId !== null) {
            const {data, error} = await supabase.from("bills").update({
                user_id: user?. id,
                category,
                amount: Number(amount),
                description,
                due_date: due_date,
                status

            })
                .eq("id", editingId)
                .select();
                 console.log("UPDATE DATA:", data);
                 console.log("UPDATE ERROR:", error);
                 console.log("editingId:", editingId);

            if (error) {
                console.log(error.message, error);
                return;

            }
        } else {
            const {data, error} = await supabase.from("bills").insert({
                user_id: user?.id,
                category,
                amount: Number(amount),
                description,
                due_date: due_date,
                status
            })
            .select();
            console.log("UPDATE DATA:", data);
            console.log("UPDATE ERROR:", error);

          
            if (error) {
                console.log(error.message, error);
                return;

            }
        }

        setEditingId(null);
        setAmount("");
        setDueDate("");
        setDescription("");
        setStatus("Pending");
        getBills();
    }


    async function editBill(row: BillRow) {
        setEditingId(row.id);   
        setCategory(row.category);
        setAmount(row.amount.toString());
        setDescription(row.description);
        setDueDate(row.due_date);
        setStatus(row.status);
    }

return (
    <main className="p-6">
        <form
            onSubmit={handleSubmit}
            className="mb-8 flex max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow"
        >
            <div className="flex flex-col">
                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded border p-2"
                >
                    {billCategory.map((category) => (
                        <option key={category.name} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

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
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded border p-2"
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="due_date">Due Date</label>
                <input
                    type="date"
                    id="due_date"
                    value={due_date}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded border p-2"
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded border p-2"
                >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                </select>
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
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Amount</th>
                    <th className="border p-2">Description</th>
                    <th className="border p-2">Due Date</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Edit</th>
                    <th className="border p-2">Delete</th>
                </tr>
            </thead>

            <tbody>
                {billRows.map((row) => (
                    <tr key={row.id}>
                        <td className="border p-2">{row.category}</td>
                        <td className="border p-2">{row.amount}</td>
                        <td className="border p-2">{row.description}</td>
                        <td className="border p-2">{row.due_date}</td>
                        <td className="border p-2">{row.status}</td>
                        <td className="border p-2">
                            <button
                                type="button"
                                onClick={() => editBill(row)}
                                className="rounded bg-yellow-500 px-3 py-1 text-white"
                            >
                                Edit
                            </button>
                        </td>
                        <td className="border p-2">
                            <button
                                type="button"
                                onClick={() => deleteBill(row.id)}
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
            <p>Total Paid Bill: {totalPaid}</p>
            <p>Total Pending Bill: {totalPending}</p>
        </div>
    </main>
);
}