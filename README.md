# 🖥️ TusharOS // Interactive Web Desktop Experience

> **SYSTEM BOOT SEQUENCE INITIATED...** 🟩🟩🟩🟩🟩🟩🟩🟩 100%
> 
> Welcome to my God-Tier frontend portfolio. 

Hi, I'm **Tushar Shah**. I'm B.Tech IT student, a digital commission artist, and a Minecraft addon developer. Instead of building a boring, static website that recruiters just scroll past, I built a fully functional, glassmorphic macOS-style operating system right in the browser. 

Everything you see here—the physics, the window rendering, the 3D backgrounds, the state management—was built from scratch without bulky frameworks. Just raw DOM manipulation and pure logic.

🔗 **[Boot Up TusharOS Live Here](https://eyraee.github.io/Browser-Based-OS-UI/)**

---

## ⚙️ System Specs (The Tech Stack)

I didn't use React, Vue, or window-management libraries. I wanted to prove I understand how the browser engine actually works under the hood.

* 🟨 **JavaScript (ES6+)** — Complex array logic, State Management (`localStorage`), Asynchronous API fetching.
* 🟦 **CSS3** — Custom Grid/Flexbox layouts, heavy CSS Glassmorphism, Variables, and relative positioning.
* 🟧 **HTML5** — Native Drag-and-Drop API, `<canvas>` rendering.
* 🧊 **Three.js** — WebGL 3D rendering (Interactive particle backgrounds and isolated 3D object viewers).

---

## 📦 Installed Applications (Features)

This isn't just a UI shell; the apps actually work. 

🎨 **Art Studio**
Because I take digital art commissions, I built my own MS Paint clone. It utilizes the HTML5 `<canvas>` API with complex `mousedown/mousemove` event listeners and relative `offsetX/Y` coordinate mapping to draw in real-time.

⛅ **Live Weather**
Uses asynchronous JavaScript (`async/await` and `fetch()`) to pull live JSON data from the Open-Meteo REST API, currently hardcoded to track the temperatures in Ahmedabad.

✅ **Kanban Task Board**
A productivity tracker demonstrating mastery over the native HTML5 Drag-and-Drop API, allowing users to move tasks seamlessly between status columns.

⌨️ **Interactive Terminal**
A mock command-line interface that parses string inputs and returns specific outputs based on user commands (try typing `help` or `whoami`).

🧊 **3D Model Viewer**
An isolated secondary Three.js scene rendered *inside* a draggable window, featuring a Minecraft-style spinning block with interactive mouse-drag quaternions.

🧮 **iOS Calculator & Retro Games**
A fully functional calculator handling complex string-to-math evaluation, alongside array-based logic games like Tic Tac Toe and Connect Four.

---

## 🧠 Core OS Mechanics (The Real Flex)

Building the apps was fun, but building the *environment* was the real engineering challenge:

1.  **Z-Index Management System:** I wrote a custom global state manager that listens for `mousedown` events on any window and dynamically increments its `z-index`, ensuring the active app always comes to the absolute front.
2.  **Custom Physics Engine:** Windows aren't just absolute positioned; they use real-time mouse tracking to calculate exact cursor deltas, allowing smooth dragging across the viewport without breaking the layout.
3.  **State Persistence:** Close the tab? Refresh the page? The OS remembers exactly where you left your windows, what you typed in your notes, and which apps were open using browser `localStorage`. 

---

## 🔒 Copyright & Licensing

**Copyright (c) 2026 Tushar Shah. All Rights Reserved.**

This repository and its source code are provided strictly for portfolio viewing and educational purposes. You may not use, copy, modify, merge, publish, distribute, or create derivative works from this code without explicit written permission from the author. 

If you are interested in using elements of this architecture for your own project, or if you want to hire me to build something this aesthetic for you, please reach out directly.
