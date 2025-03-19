import React, { useEffect } from "react";

const Background = () => {
  useEffect(() => {
    const createModernBackground = () => {
      // สร้าง containers
      const bgContainer = document.createElement("div");
      const shapesContainer = document.createElement("div");
      const gridContainer = document.createElement("div");
      const particlesContainer = document.createElement("div");

      bgContainer.className =
        "background-base fixed inset-0 pointer-events-none";
      shapesContainer.className = "shapes fixed inset-0 pointer-events-none";
      gridContainer.className =
        "grid-pattern fixed inset-0 pointer-events-none";
      particlesContainer.className =
        "particles fixed inset-0 pointer-events-none";

      document.body.appendChild(bgContainer);
      document.body.appendChild(gridContainer);
      document.body.appendChild(shapesContainer);
      document.body.appendChild(particlesContainer);

      // สีที่เหมาะกับเว็บจองห้องประชุม - โทนสีน้ำเงิน/เทา/ขาว
      const colors = [
        "#3498db",
        "#2980b9",
        "#34495e",
        "#2c3e50",
        "#e94560",
        "#4a69bd",
        "#6a89cc",
        "#82ccdd",
      ];

      // สร้างพื้นหลังเกรเดียนท์
      bgContainer.style.background =
        "linear-gradient(135deg, #1a2a3a 0%, #0d1b2a 100%)";
      bgContainer.style.opacity = "0.9";

      // สร้างเส้นกริดสำหรับห้องประชุม
      gridContainer.style.background =
        "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), " +
        "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)";
      gridContainer.style.backgroundSize = "50px 50px";
      gridContainer.style.opacity = "0.5";

      // สร้างรูปทรงเรขาคณิตที่ทันสมัย
      const shapeTypes = ["square", "circle", "triangle", "rectangle"];
      for (let i = 0; i < 15; i++) {
        const shape = document.createElement("div");
        const shapeType =
          shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const size = Math.random() * 100 + 50;
        const color = colors[Math.floor(Math.random() * colors.length)];

        shape.className = `shape absolute ${shapeType}`;
        shape.style.width = `${size}px`;
        shape.style.height =
          shapeType === "rectangle" ? `${size * 0.6}px` : `${size}px`;
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        shape.style.backgroundColor = "transparent";
        shape.style.border = `2px solid ${color}`;
        shape.style.opacity = "0.15";
        shape.style.borderRadius =
          shapeType === "circle"
            ? "50%"
            : shapeType === "square" || shapeType === "rectangle"
            ? "5px"
            : "0";

        if (shapeType === "triangle") {
          shape.style.width = "0";
          shape.style.height = "0";
          shape.style.backgroundColor = "transparent";
          shape.style.borderLeft = `${size / 2}px solid transparent`;
          shape.style.borderRight = `${size / 2}px solid transparent`;
          shape.style.borderBottom = `${size}px solid ${color}`;
          shape.style.border = "none";
        }

        shape.style.transform = `rotate(${Math.random() * 360}deg)`;
        shape.style.animation = `float-subtle ${
          Math.random() * 20 + 20
        }s ease-in-out infinite`;
        shapesContainer.appendChild(shape);
      }

      // สร้างไอคอนห้องประชุมแบบเรียบง่าย
      for (let i = 0; i < 5; i++) {
        const meetingIcon = document.createElement("div");
        const size = Math.random() * 30 + 20;

        meetingIcon.className = "meeting-icon absolute";
        meetingIcon.style.width = `${size}px`;
        meetingIcon.style.height = `${size}px`;
        meetingIcon.style.left = `${Math.random() * 100}%`;
        meetingIcon.style.top = `${Math.random() * 100}%`;
        meetingIcon.style.opacity = "0.1";
        meetingIcon.style.backgroundSize = "contain";
        meetingIcon.style.backgroundRepeat = "no-repeat";
        meetingIcon.style.backgroundPosition = "center";

        // สุ่มไอคอนที่เกี่ยวข้องกับการประชุม
        const iconType = Math.floor(Math.random() * 4);
        if (iconType === 0) {
          // รูปปฏิทิน
          meetingIcon.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 24 24'%3E%3Cpath d='M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z'/%3E%3C/svg%3E")`;
        } else if (iconType === 1) {
          // รูปห้องประชุม
          meetingIcon.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 24 24'%3E%3Cpath d='M14 6v15H3v-2h2V3h9v3h5v8h1v2h-2V6h-4zm-4 5v2h2v-2h-2z'/%3E%3C/svg%3E")`;
        } else if (iconType === 2) {
          // รูปคน
          meetingIcon.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E")`;
        } else {
          // รูปนาฬิกา
          meetingIcon.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 24 24'%3E%3Cpath d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'/%3E%3C/svg%3E")`;
        }

        meetingIcon.style.animation = `float-subtle ${
          Math.random() * 30 + 30
        }s ease-in-out infinite, fade-in-out 10s ease-in-out infinite`;
        shapesContainer.appendChild(meetingIcon);
      }

      // สร้างอนุภาคลอยช้าๆ
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("div");
        const size = Math.random() * 5 + 1;

        particle.className = "particle absolute rounded-full";
        particle.style.width = particle.style.height = `${size}px`;
        particle.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = "0.3";
        particle.style.animation = `float-particle ${
          Math.random() * 60 + 30
        }s linear infinite, pulse ${
          Math.random() * 5 + 2
        }s ease-in-out infinite alternate`;
        particlesContainer.appendChild(particle);
      }

      // เพิ่ม CSS animations
      const style = document.createElement("style");
      style.textContent = `
        @keyframes float-subtle {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(2%, 2%) rotate(5deg); }
          50% { transform: translate(0%, 3%) rotate(0deg); }
          75% { transform: translate(-2%, 1%) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes float-particle {
          0% { transform: translate(0, 0); }
          100% { transform: translate(${Math.random() > 0.5 ? "" : "-"}${
        Math.random() * 200
      }px, ${Math.random() > 0.5 ? "" : "-"}${Math.random() * 200}px); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.1; }
          100% { opacity: 0.4; }
        }
        
        @keyframes fade-in-out {
          0% { opacity: 0.05; }
          50% { opacity: 0.2; }
          100% { opacity: 0.05; }
        }
        
        .shape.triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.body.removeChild(bgContainer);
        document.body.removeChild(shapesContainer);
        document.body.removeChild(gridContainer);
        document.body.removeChild(particlesContainer);
        document.head.removeChild(style);
      };
    };

    const cleanup = createModernBackground();
    return cleanup;
  }, []);

  return null;
};

export default Background;
