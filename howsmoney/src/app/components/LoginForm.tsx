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

    return(
        <form onSubmit = {handleSubmit}>
            <label htmlFor="email"></label>
            <input 
                type = "email"
                name = "email"
                value = {email}
                onChange = {(e) => setEmail(e.target.value)}
                placeholder = "Enter your email"
                className = "email-input"
            />

            <br></br>
            <label htmlFor="password"></label>
            <input 
                type="password"
                name = "password"
                placeholder = "Enter your password"
                className = "password-input"
                value = {password}
                onChange = {(e) => setPassword(e.target.value)}
            />

            <button type = "submit"> Log in </button>
        </form>
    );
}