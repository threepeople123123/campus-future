import {Button} from "@heroui/react"
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

export default function Checklogin({children}) {
    const [isLogin, setIsLogin] = useState(false);
    const navigate = useNavigate();
    
    // 使用 useEffect 检查登录状态
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLogin(!!token); // 转换为布尔值
    }, []);

    // 跳转登录页
    function toLogin() {
        navigate("/login")
    }

    return (
        <>
            {!isLogin ? (
                <Button 
                    onClick={toLogin}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    {children}
                </Button>
            ) : null}
        </>
    )
}