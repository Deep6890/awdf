import "./Logo.css";
import { Brain } from "lucide-react";

export default function Logo() {
    return (
        <div className="logo">
            <Brain size={22} />
            <span>Brainwave</span>
        </div>
    );
}