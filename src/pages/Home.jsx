import { useEffect } from "react";
import { useNavigate } from "react-router";
import LogoutButton from "../components/LogoutButton";

function Home(){
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem('logged-in');

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
    }
  }, [loggedIn]);

 return (
   <>
     <div>Hello World!</div>
     <LogoutButton />
   </>
 );
}

export default Home;