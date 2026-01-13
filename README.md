
#  CPU Scheduling Simulator

A comprehensive, interactive, and responsive web application to simulate and visualize various CPU scheduling algorithms. Built with **React**, **TypeScript**, and **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?logo=tailwindcss)

##  Overview

This simulator provides a visual interface for understanding how Operating Systems manage process scheduling. Users can input process data (Arrival Time, Burst Time, Priority, etc.) and visualize the execution flow via Gantt charts and performance metrics.

It is designed to be a learning tool for Computer Science students and enthusiasts studying Operating Systems.

##  Features

- **6 Major Algorithms Supported:**
  - First Come First Serve (**FCFS**)
  - Shortest Job First (**SJF**)
  - Shortest Remaining Time First (**SRTF/SRJF**)
  - Round Robin (**RR**) with custom Time Quantum
  - Priority Scheduling (**Non-Preemptive**)
  - Priority Scheduling (**Preemptive**)

- **Modern UI/UX:**
  - **Fully Responsive:** Mobile-first design that adapts to tablets and desktops.
  - **Dark/Light Mode:** Seamless theme switching.
  - **Interactive Forms:** Real-time validation and dynamic inputs based on the selected algorithm.

- **Analysis & Visualization:**
  - **Gantt Charts:** Visual representation of process execution timeline.
  - **Performance Metrics:** Automatic calculation of Waiting Time, Turnaround Time, and averages.
  - **Documentation:** Integrated docs explaining the theory behind each algorithm.

##  Tech Stack

- **Frontend:** React.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons & UI:** React Icons, Headless UI (optional)
- **Routing:** React Router DOM
- **Notifications:** React Toastify

##  Getting Started

Follow these steps to run the project locally.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**
   ``` bash
   git clone https://github.com/RoBiul-Hasan-Jisan/OS-Simulator
   cd cpu-scheduler-simulator
    ```
   ----

## Usage Guide

Select an Algorithm: Choose one of the 6 scheduling algorithms from the top dropdown menu.

**Add Processes:**

Enter Arrival Time and Burst Time.

If required by the algorithm, enter Priority or Time Quantum.

Click "Add Process".

**View Results:**

The Process Queue table shows the current state of processes.

The Simulation section displays the Gantt Chart and calculated time metrics.

**Read Documentation:** Click the "Docs" button in the header to learn about the logic behind the currently selected algorithm.

# Project Structure
``` bash
src/
├── components/
│   ├── FCFS.tsx            # Logic & View for FCFS
│   ├── SJF.tsx             # Logic & View for SJF
│   ├── RR.tsx              # Logic & View for Round Robin
│   ├── ProcessForm.tsx     # Input form component
│   └── ...                 # Other algorithm components
├── pages/
│   ├── Scheduler.tsx       # Main dashboard layout
│   └── Documentation.tsx   # Documentation pages
├── App.tsx                 # Main application entry
└── main.tsx                # DOM rendering

```

## Contributing

Contributions are welcome! If you have suggestions for improvements or want to add a new algorithm:

Fork the project.

- Create your feature branch (git checkout -b feature/  AmazingFeature).

- Commit your changes (git commit -m 'Add some AmazingFeature').

- Push to the branch (git push origin feature/AmazingFeature).

- Open a Pull Request.

----
## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://choosealicense.com/licenses/mit/) file for details

----
Made with ❤️ by **Robiul Hasan Jisan** 

----

