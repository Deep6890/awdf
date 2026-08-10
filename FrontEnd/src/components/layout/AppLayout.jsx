import React from 'react'
import "./AppLayout.css"
export default function AppLayout(props) {
    return (
        <>
            <div className="app-wrapper">
                <div className='app-layout'>
                    <aside className='sidebar-area'>
                        {props.sidebar}
                    </aside>
                    <main className='main-area'>
                        {props.children}
                    </main>
                </div>
            </div>
        </>
    )
}
