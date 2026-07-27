import "./Sidebar.css";

import Logo from "./Logo";
import NavItem from "./NavItem";

import {
    Compass,
    ChevronDown,
    Box,
    Heart,
    Folder
} from "lucide-react";

export default function Sidebar() {
    return (
        <div className="sidebar">

            <Logo />

            <div className="sidebar-menu">

                <NavItem
                    icon={<Compass size={18} />}
                    text="Explore"
                    active
                    arrow={<ChevronDown size={16} />}
                />

                <NavItem
                    icon={<Box size={18} />}
                    text="Assets"
                />

                <NavItem
                    icon={<Heart size={18} />}
                    text="Likes"
                />

                <NavItem
                    icon={<Folder size={18} />}
                    text="My Scenes"
                />

            </div>

        </div>
    );
}