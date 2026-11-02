# Deadlock Lab
### An Interactive Operating Systems Learning and Simulation Platform

<p align="center">
  **Understanding Deadlocks Through Visualization, Algorithms and Interactive Experiments**
</p>

---

## 1. Introduction

Deadlock Lab is an interactive educational platform developed to demonstrate and simulate the fundamental concepts of **Deadlocks in Operating Systems**.

Deadlocks are an important problem in multiprogramming and resource-sharing environments, where multiple processes compete for limited system resources. This platform provides a structured environment for understanding how deadlocks occur, how they can be prevented, how safe states can be maintained through avoidance algorithms, and how deadlocks can be detected and recovered from.

The application combines theoretical Operating Systems concepts with interactive simulations, algorithmic demonstrations, and test cases to make complex concepts easier to understand.

## 2. Project Objectives

The primary objectives of Deadlock Lab are:

- To understand the concept and conditions necessary for a deadlock.
- To explore different strategies for handling deadlocks.
- To demonstrate deadlock prevention techniques.
- To simulate deadlock avoidance using the Banker's Algorithm.
- To understand resource allocation and process synchronization.
- To identify unsafe states and detect potential deadlocks.
- To explore resource requests and allocation scenarios.
- To provide an interactive learning environment for Operating Systems students.

## 3. Deadlock in Operating Systems

A **deadlock** is a situation in which a set of processes becomes permanently blocked because each process is waiting for a resource held by another process in the same set.

For example:

- Process P1 holds Resource R1 and requests Resource R2.
- Process P2 holds Resource R2 and requests Resource R1.
- Neither process can proceed because the resource required by each is held by the other.

As a result, both processes remain blocked indefinitely.

### Necessary Conditions for Deadlock

According to the Coffman conditions, a deadlock can occur only when all four of the following conditions hold simultaneously:

| Condition | Description |
|---|---|
| Mutual Exclusion | At least one resource must be held in a non-shareable mode. |
| Hold and Wait | A process holds resources while waiting for additional resources. |
| No Preemption | Resources cannot be forcibly taken away from a process. |
| Circular Wait | A circular chain of processes exists, where each process waits for a resource held by the next process. |

Breaking at least one of these four conditions prevents deadlock.

## 4. Deadlock Handling Strategies

Operating Systems generally use four major approaches to handle deadlocks.

### 4.1 Deadlock Prevention

Deadlock prevention ensures that at least one of the four necessary deadlock conditions never holds.

The following techniques can be used:

**1. Mutual Exclusion**

- Make resources shareable wherever possible.
- Some resources, such as printers during exclusive operations, cannot be shared.

**2. Hold and Wait**

- Require processes to request all required resources before execution.
- Alternatively, require processes to release currently held resources before requesting additional ones.

**3. No Preemption**

- Allow the operating system to take resources away from a process under specified conditions.
- Resources may be released when a process cannot obtain its additional requirements.

**4. Circular Wait**

- Assign a unique numerical ordering to resource types.
- Require processes to request resources only in increasing order.

This prevents circular resource dependencies.

### 4.2 Deadlock Avoidance

Deadlock avoidance dynamically examines resource allocation requests before granting them.

The operating system grants a request only when the resulting system state remains safe.

**Banker's Algorithm**

The Banker's Algorithm is a resource-allocation and deadlock-avoidance algorithm.

It uses the following data structures:

| Data Structure | Meaning |
|---|---|
| Available | Number of currently available instances of each resource type. |
| Max | Maximum resource requirement of each process. |
| Allocation | Resources currently allocated to each process. |
| Need | Remaining resources required by each process. |

The Need matrix is calculated as:

`Need = Max - Allocation`

**Working of the Algorithm**

1. Calculate the remaining resource requirements.
2. Initialize the Work vector using Available resources.
3. Find a process whose Need is less than or equal to Work.
4. Assume that the selected process completes execution.
5. Release its allocated resources back to Work.
6. Repeat until all processes finish or no eligible process can be found.

If all processes can complete, the system is in a safe state.

If no process can proceed before all processes finish, the state is unsafe.

**Important:** An unsafe state does not necessarily mean that a deadlock has already occurred. It means that deadlock cannot be ruled out.

### 4.3 Deadlock Detection

Deadlock detection allows the operating system to allocate resources without preventing all possible deadlock conditions and periodically checks whether a deadlock has occurred.

Common approaches include:

- Resource Allocation Graph analysis.
- Wait-for Graph analysis.
- Detection algorithms for multiple resource instances.

A cycle in a Wait-for Graph indicates a deadlock.

For a Resource Allocation Graph with single instances of each resource type, a cycle is both necessary and sufficient for deadlock.

### 4.4 Deadlock Recovery

After detecting a deadlock, the operating system must take action to restore normal execution.

Common recovery techniques include:

**1. Process Termination**
- Abort all deadlocked processes.
- Alternatively, terminate processes one at a time until the deadlock is eliminated.

**2. Resource Preemption**
- Temporarily take resources away from selected processes.
- Allocate the resources to other processes to break the deadlock.

**3. Rollback**
- Return a process to a previously saved safe checkpoint.
- Restart the process after resources become available.

The selection of a recovery strategy depends on system requirements, process priority, and resource availability.

## 5. Application Modules

Deadlock Lab organizes its learning environment into dedicated modules:

| Module | Description |
|---|---|
| Dashboard | Provides an overview of the Deadlock Lab learning environment. |
| Deadlock Prevention | Explores techniques for breaking the necessary conditions of deadlock. |
| Banker's Algorithm | Demonstrates safe-state evaluation and resource allocation. |
| Resource Allocation | Explores the relationship between processes and allocated resources. |
| Resource Requests | Demonstrates resource request and allocation scenarios. |
| Deadlock Detection | Explores methods for identifying deadlocks. |
| Test Cases | Provides test scenarios for evaluating algorithmic behaviour. |

## 6. Technology Stack

The project uses modern web technologies to provide an interactive and responsive learning experience.

| Technology | Purpose |
|---|---|
| React | Component-based user interface development. |
| TypeScript | Type safety and maintainable application logic. |
| Vite | Development server and build tooling. |
| TanStack Router | Application routing and navigation. |
| Tailwind CSS | Utility-first styling. |
| shadcn/ui | Reusable user interface components. |
| Recharts | Data visualization and charts. |
| Vitest | Unit testing and algorithm verification. |

## 7. Project Structure

```text
Deadlock-Lab/
│
├── public/
│   └── favicon.png
│
├── src/
│   ├── components/
│   │   ├── os/
│   │   │   ├── RAG.tsx
│   │   │   ├── Shell.tsx
│   │   │   └── ui.tsx
│   │   │
│   │   └── ui/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │   ├── os/
│   │   │   ├── algorithms.ts
│   │   │   ├── algorithms.test.ts
│   │   │   ├── store.tsx
│   │   │   ├── testCases.ts
│   │   │   └── useDerived.ts
│   │   │
│   │   └── utils.ts
│   │
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── prevention.tsx
│   │   ├── bankers.tsx
│   │   ├── allocation.tsx
│   │   ├── requests.tsx
│   │   ├── detection.tsx
│   │   └── tests.tsx
│   │
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   └── styles.css
│
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## 8. Installation and Setup

Follow these steps to run Deadlock Lab locally.

**Prerequisites**

- Node.js (recommended: Node.js 20 or later).
- npm package manager.
- Git.

**Step 1: Clone the Repository**

```bash
git clone https://github.com/sheel008/Deadlock-lab.git
```

**Step 2: Navigate to the Project Directory**

```bash
cd Deadlock-lab
```

**Step 3: Install Dependencies**

```bash
npm install
```

**Step 4: Start the Development Server**

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

**Step 5: Build for Production**

```bash
npm run build
```

## 9. Testing

Deadlock Lab includes test files for validating the application's algorithmic logic and behaviour.

The project uses Vitest for automated testing.

Run the test suite using:

```bash
npx vitest run
```

To run tests in watch mode:

```bash
npx vitest
```

Testing helps verify algorithmic correctness, resource allocation behaviour, and expected outcomes for different scenarios.

## 10. Educational Significance

Deadlock Lab bridges the gap between theoretical Operating Systems concepts and practical understanding.

Through its interactive modules, students can:

- Understand how resource contention leads to deadlocks.
- Differentiate between prevention, avoidance, detection, and recovery.
- Analyze safe and unsafe system states.
- Understand the role of the Banker's Algorithm.
- Explore process-resource relationships.
- Experiment with different resource allocation scenarios.

The platform can be used as a supplementary learning tool for Operating Systems courses, laboratory exercises, demonstrations, and academic assignments.

## 11. Future Enhancements

Potential future improvements include:

- Interactive Resource Allocation Graph construction.
- Step-by-step visualization of the Banker's Algorithm.
- Dynamic process and resource configuration.
- Animated deadlock detection and recovery simulations.
- Additional test scenarios and algorithm comparisons.
- Exportable simulation reports.
- More advanced resource allocation experiments.

## 12. References

1. Abraham Silberschatz, Peter B. Galvin, and Greg Gagne, *Operating System Concepts*.
2. William Stallings, *Operating Systems: Internals and Design Principles*.
3. Andrew S. Tanenbaum and Herbert Bos, *Modern Operating Systems*.
4. Coffman, E. G., Elphick, M. J., and Shoshani, A. (1971). *System Deadlocks*. ACM Computing Surveys, 3(2), 67–78.
5. Operating Systems course materials and laboratory references.

---

## 13. Project Information

**Project Name:** Deadlock Lab

**Domain:** Operating Systems

**Project Category:** Educational Web Application / Algorithm Simulation

**Developed By:** Sheel Gaikwad

**Repository:** https://github.com/sheel008/Deadlock-lab

---

*Deadlock Lab — Learn, Simulate, Analyze, and Understand Operating System Deadlocks.*