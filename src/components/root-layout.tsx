import { Outlet } from "react-router-dom";

const RootLayout = () => {
    return (
        <div className="min-h-screen p-4 font-sans">
            <Outlet />
        </div>
    );
};

export default RootLayout;
