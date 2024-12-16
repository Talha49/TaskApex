"use client"
import { useSession } from "next-auth/react";

export default function UserInfo() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Not signed in</p>;
  }

  return (
    <div>
      <p>User ID: {session.user.id}</p>
      <p>Email: {session.user.email}</p>
      <p>Full Name: {session.user.fullName}</p>
      <p>Contact: {session.user.contact}</p>
      <p>Token: {session.user.token}</p>
    </div>
  );
}
