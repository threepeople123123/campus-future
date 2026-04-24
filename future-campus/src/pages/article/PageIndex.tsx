import PageList from "./PageList.tsx"
import CheckUserLogin from "./CheckUserLogin.tsx";
export  default  function PageIndex(){

    return (
        <div className="relative min-h-screen">
            {/* 右上角登录状态组件 */}
            <div className="fixed top-4 right-4 z-50">
                <CheckUserLogin />
            </div>
            
            {/* 文章列表 */}
            <PageList />
        </div>
    )
}