"use client";
import {useState} from "react";
import {supabase} from "@/app/lib/supabase";
import {useRouter} from "next/navigation";

export default function LoginForm() {
    const router = useRouter(); //for navigation

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if(error) {
            alert(error.message);
            return;
        }

        console.log(data);
        router.push("/dashboard");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="flex w-80 flex-col gap-4 rounded-lg bg-white p-6 shadow"
            >
                <h1 className="text-center text-2xl font-bold">Login</h1>

                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded border p-2 outline-none focus:border-blue-500"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded border p-2 outline-none focus:border-blue-500"
                />

                <button
                    type="submit"
                    className="rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                >
                    Log in
                </button>
            </form>
        </div>
    );
}