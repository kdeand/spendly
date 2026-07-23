import Link from "next/link";

export default function Home() {
  return(
    <main>
        <Link href="/register">Create</Link> an Account or{" "}
        <Link href="/login">Login</Link>
    </main>
  )
}