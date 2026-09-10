
import { IoPersonOutline } from "react-icons/io5";


export function Header() {

    return (
        <>
            <header className="admin-header">
                <div className="admin-welcome-box">
                    <h3><b>Welcome back, Admin</b> 👋</h3>
                    <small>Here's what's happening with your spa <b>business</b> today!</small>
                </div>

                <button className="right" onClick={e => {
                    window.open("/admin/profile", "_blank");
                }}>
                    <span>
                        <IoPersonOutline height={20} width={20} />
                    </span>
                    &nbsp;
                    &nbsp;
                    <span>
                        <small><b>Admin</b></small>
                        <small>{"Ifeanyi. A"}</small>
                    </span>
                </button>
            </header>
        </>
    )
}