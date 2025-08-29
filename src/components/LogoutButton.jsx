import { useNavigate } from "react-router";

export default function LogoutButton() {
  const navigate = useNavigate();

  function handleLogOut() {
    localStorage.removeItem("logged-in");
    navigate("/login");

    console.log('Successful log out!');
  }
  return (
    <>
      <button onClick={() => handleLogOut(navigate)}>Log out</button>
    </>
  );
}
