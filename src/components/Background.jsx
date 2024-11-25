import React, { useEffect } from "react";

const Background = () => {
  useEffect(() => {
    const createStarsAndPlanets = () => {
      const starsContainer = document.createElement("div");
      const planetsContainer = document.createElement("div");
      starsContainer.className = "stars fixed inset-0 pointer-events-none";
      planetsContainer.className = "planets fixed inset-0 pointer-events-none";
      document.body.appendChild(starsContainer);
      document.body.appendChild(planetsContainer);

      const colors = ["#ff6b6b", "#4ecdc4", "#45d3e6", "#f9ed69"];

      for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "star absolute bg-white rounded-full animate-twinkle";
        star.style.width = star.style.height = `${Math.random() * 3}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
      }

      for (let i = 0; i < 5; i++) {
        const planet = document.createElement("div");
        planet.className = "planet absolute rounded-full animate-float";
        planet.style.width = planet.style.height = `${
          Math.random() * 50 + 20
        }px`;
        planet.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        planet.style.left = `${Math.random() * 100}%`;
        planet.style.top = `${Math.random() * 100}%`;
        planet.style.animationDuration = `${Math.random() * 10 + 10}s`;
        planetsContainer.appendChild(planet);
      }
    };

    createStarsAndPlanets();

    return () => {
      document.body.removeChild(document.querySelector(".stars"));
      document.body.removeChild(document.querySelector(".planets"));
    };
  }, []);

  return null;
};

export default Background;
