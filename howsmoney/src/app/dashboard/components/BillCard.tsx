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


export default function BillCard(){

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [due_date, setDueDate] = useState("");
    const [status, setStatus] = useState("Pending");
    const [description, setDescription] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);

    const [billCategory, setBillCategory] = useState<Category[]>([]);
    const [billRows, setBillRows] = useState<BillRow[]>([]);

    useEffect (() => {
        getCategories();
        getBills();
    }, []);

    

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
        <main>
            <form onSubmit = {handleSubmit}>
                <div>
                    <label htmlFor="category">Category</label>
                    <select id="category" 
                    value = {category}
                    onChange = {(e) => setCategory(e.target.value)}>
                        {billCategory.map((category) =>(
                            <option 
                            value={category.name} 
                            key = {category.name}> {category.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="Amount">Amount</label>
                    <input 
                    type="number"
                    id = "amount"
                    placeholder="Enter amount"
                    value = {amount}
                    onChange = {(e) => setAmount(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <textarea name="description" id="description"
                    value = {description}
                    onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
                <div>
                    <label htmlFor="due_date">Due Date</label>
                    <input 
                    type="date"
                    id = "date"
                    value= {due_date}
                    onChange={(e) => setDueDate(e.target.value)}
                     />
                </div>

                <div>
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>

                <button type = "submit"> {editingId ? "Update Bill" : "Add Bill"} </button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {billRows.map((row, index) => (
                        <tr key = {row.id}>
                            <td>{row.category}</td>
                            <td>{row.amount}</td>
                            <td>{row.description}</td>
                            <td>{row.due_date}</td>
                            <td>{row.status}</td>
                            <td>
                                <button type = "button" onClick={() => {editBill(row)}}>Edit</button>
                            </td>
                            <td>
                                <button type = "button" onClick={() => {deleteBill(row.id)}}>X</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div>
                {/**Total: */}
            </div>
        </main>
    );
}