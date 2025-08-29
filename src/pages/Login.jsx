import { useState } from "react";
import { useNavigate } from "react-router";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLoginSubmit(e) {
    e.preventDefault();

    const response = await fetch(
      `http://localhost:3000/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );
    const message = await response.text();
    console.log(message);

    if (message === "Password Match!") {
      localStorage.setItem('logged-in', 'loggedIn');
      navigate('/');
    }
  }

  return (
    <>
      <div>
        <form onSubmit={handleLoginSubmit}>
          <input
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" value="login" disabled={!password} >
            Login
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
