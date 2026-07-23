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
    <main>
    <form onSubmit = {handleSubmit}>
      <label htmlFor="email">Email: </label>
      <input
        id="email"
        type="email"
        value = {email}
        onChange = {(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />

      <label htmlFor="password">Password: </label>
      <input
        id="password"
        type="password"
        value = {password}
        onChange ={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />

      <label htmlFor="confirmPassword">Confirm Password: </label>
      <input
        id="confirmPassword"
        type="password"
        value= {confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm your password"
      />

      <button type="submit">Create Account</button>
    </form>
    
    </main>
  );
}