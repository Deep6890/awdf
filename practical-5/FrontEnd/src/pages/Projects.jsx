import React, { useEffect, useState } from "react";
import {
  Star,
  GitFork,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        const response = await fetch(
          "https://api.github.com/users/Deep6890/repos"
        );

        if (!response.ok) throw new Error("Failed to fetch repositories");

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchGitHubData();
  }, []);

  return (
    <main className="page-content projects-page">
      <h1 className="section-heading">GitHub Projects</h1>
      <p className="section-subheading">
        Public repositories from my GitHub profile.
      </p>

      <div className="projects-grid">
        {projects.map((repo) => (
          <div className="repo-card" key={repo.id}>
            <div className="repo-header">
              <img
                className="repo-avatar"
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
              />

              <div className="repo-user">
                <h3 className="repo-name">{repo.name}</h3>
                <p className="repo-owner">@{repo.owner.login}</p>
              </div>

              <div className="repo-visibility">
                {repo.private ? (
                  <>
                    <Lock size={14} />
                    Private
                  </>
                ) : (
                  <>
                    <Globe size={14} />
                    Public
                  </>
                )}
              </div>
            </div>

            <div className="repo-body">
              <p className="repo-description">
                {repo.description || "No description available."}
              </p>
            </div>

            <div className="repo-footer">
              <div className="repo-meta">
                <span>
                  <Star size={15} />
                  {repo.stargazers_count}
                </span>

                <span>
                  <GitFork size={15} />
                  {repo.forks_count}
                </span>

                {repo.language && (
                  <span className="repo-language">
                    {repo.language}
                  </span>
                )}
              </div>

              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="repo-link"
              >
                <ExternalLink size={16} />
                View
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}