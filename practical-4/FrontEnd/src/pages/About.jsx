import React from 'react'
import { Link } from 'react-router-dom'
import { User, BookOpen, Award } from 'lucide-react'

/**
 * About page — kept simple.
 * Navigate here via /about if needed, though the practical
 * requires Home / Projects / Contact as the three main routes.
 */
export default function About() {
  return (
    <main className="page-content" id="about-page">
      <h1 className="section-heading">About Me</h1>
      <p className="section-subheading">A little more about who I am and what drives me.</p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
        {[
          { icon: <User size={24} />, title: 'Who I Am', text: 'A full-stack developer passionate about clean, accessible web experiences.' },
          { icon: <BookOpen size={24} />, title: 'Education', text: 'B.Tech in Information Technology — Charotar University of Science & Technology.' },
          { icon: <Award size={24} />, title: 'Achievements', text: '340+ GitHub stars, 24 shipped projects, and 18 happy clients.' },
        ].map(item => (
          <div key={item.title} className="card" style={{ padding: '24px', flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ color: 'var(--accent)' }}>{item.icon}</div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{item.title}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: 1.6 }}>{item.text}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '36px' }}>
        <Link to="/contact" className="btn-primary">Get in Touch</Link>
      </div>
    </main>
  )
}
