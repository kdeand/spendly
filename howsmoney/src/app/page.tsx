import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-80 rounded-lg bg-white p-6 text-center shadow">
                <h1 className="mb-2 text-3xl font-bold">HowsMoney</h1>
                <p className="mb-6 text-gray-600">
                    Track your income, expenses, and bills.
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/login"
                        className="rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                    >
                        Log In
                    </Link>

                    <Link
                        href="/register"
                        className="rounded border border-blue-600 py-2 text-blue-600 hover:bg-blue-50"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
        </main>
    );
}