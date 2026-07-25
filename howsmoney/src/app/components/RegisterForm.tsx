"use client";
import {useState} from "react";
import {supabase} from "@/app/lib/supabase";

export default function RegisterForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const {data, error} = await supabase.auth.signUp({
            email,
            password
        });

        if (error){
            alert(error.message);
            return;
        }

        console.log(data);
        alert("Account created!");

        }

  return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="flex w-80 flex-col gap-4 rounded-lg bg-white p-6 shadow"
            >
                <h1 className="text-center text-2xl font-bold">
                    Create Account
                </h1>

                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="rounded border p-2 outline-none focus:border-blue-500"
                />

                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="rounded border p-2 outline-none focus:border-blue-500"
                />

                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="rounded border p-2 outline-none focus:border-blue-500"
                />

                <button
                    type="submit"
                    className="rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700"
                >
                    Create Account
                </button>
            </form>
        </main>
    );
}