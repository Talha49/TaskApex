"use client"
import { useSession } from "next-auth/react";

export default function UserInfo() {
  const { data: session } = useSession();
console.log(session);
  if (!session) {
    return <p>Not signed in</p>;
  }
  const token = session?.user.token; // Access the token
  return (
    <div>
      <p>User ID: {session.user.id}</p>
      <p>Email: {session.user.email}</p>
      <p>Full Name: {session.user.fullName}</p>
      <p>Contact: {session.user.contact}</p>
      <p>Token: {session.user.token}</p>
      <p>:\{session.user.role}</p>
      <p>Team: {session.user.team}</p>
      <button onClick={() => console.log(token)}>Session</button>
    </div>
  );
}
