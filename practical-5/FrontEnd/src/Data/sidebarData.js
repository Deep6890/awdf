import {
    Compass,
    Box,
    Heart,
    Folder
} from "lucide-react";

export const navigation = [
    {
        id: 1,
        text: "Explore",
        icon: Compass,
        active: true,
        children: [
            "Designs",
            "Animations"
        ]
    },
    {
        id: 2,
        text: "Assets",
        icon: Box
    },
    {
        id: 3,
        text: "Likes",
        icon: Heart
    },
    {
        id: 4,
        text: "My Scenes",
        icon: Folder
    }
];

export const folders = [
    "New Folder",
    "Untitled Folder",
    "3D Icons"
];