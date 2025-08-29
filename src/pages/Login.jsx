import { useState } from "react";
import { useNavigate } from "react-router";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLoginSubmit(e) {
    e.preventDefault();

    const response = await fetch(
      `http://localhost:3000/users/username/${username}`
    );
    const data = await response.json();

    if (data[0] && password === data[0].password_hash) {
      localStorage.setItem("logged-in", username);
      console.log('Successful log in!');
      navigate('/');
    } else {
        console.log('username or password is incorrect');
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
