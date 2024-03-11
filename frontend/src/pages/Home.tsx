import { useNavigate } from "react-router-dom";
import { Button } from "../components/Auth";


export const Home = () => {
    const navigate = useNavigate();

    function toSignup() {
        navigate("/signup");
    }
    function toSignin() {
        navigate("/signin");
    }
    return (
        <div className=" h-screen flex flex-col  text-center justify-center ">
            <div className="flex flex-col text-5xl font-mono font-bold ">

                <div>WELCOME!
                </div>
                <div className="text-2xl font-mono font-semibold">
                    This is a simple blog app. <br /> You can sign up, sign in, publish a blog, and view blogs.
                </div>
            </div>

            <div className="flex justify-center ">
                <div className=" flex justify-center">
                    <div className="min-w-52 flex flex-row ">
                        <Button onClick={toSignup} type={"signup"}></Button>
                        <Button onClick={toSignin} type={"signin"}></Button>
                    </div>
                </div>
            </div>

        </div>
    );
};