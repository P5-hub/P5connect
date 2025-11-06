"use client";

import UserInfo from "@/components/UserInfo";
import LogoutButton from "@/components/LogoutButton";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-gray-800 p-4 text-white">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">Sony Partner Dashboard</h1>
        <UserInfo />
      </div>
      <LogoutButton />
    </header>
  );
}
