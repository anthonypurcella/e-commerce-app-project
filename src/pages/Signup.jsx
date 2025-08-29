import { useState } from "react";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

async  function handleSignUp(e) {
    e.preventDefault();
    if (password !== passwordCheck) {
        alert('Passwords do not match');
    } else {
        const response = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            user_name: username,
            password_hash: password,
          }),
        });

        const data = await response.json();
        console.log(data);
    }
  }

  return (
    <>
      <h2>Sign up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="First Name"
          maxLength="30"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          maxLength="30"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          maxLength="50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          maxLength="15"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Type password again"
          value={passwordCheck}
          onChange={(e) => setPasswordCheck(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
