import "./NavItem.css";

export default function NavItem(props) {
    return (
        <div className={`nav-item ${props.active ? "active" : ""}`}>
            <div className="nav-left">
                {props.icon}
                <span>{props.text}</span>
            </div>

            {props.arrow && (
                <span className="arrow">
                    {props.arrow}
                </span>
            )}
        </div>
    );
}