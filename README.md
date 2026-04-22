<div align="center">
  <img src="public/favicon.ico" alt="Logo" width="80" height="80">
  <h1 align="center">LockIn</h1>
  <p align="center">
    A comprehensive health and lifestyle tracking application.
    <br />
    <a href="#features"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#demo">View Demo</a>
    ·
    <a href="#report-bug">Report Bug</a>
    ·
    <a href="#request-feature">Request Feature</a>
  </p>
</div>

---

## 📖 About The Project

**LockIn** is a modern, responsive web application designed to help users take control of their health, fitness, and daily habits. Built with an elegant dark mode aesthetic ("Lucid Vitality"), the app provides a unified ecosystem for tracking workouts, nutrition, and lifestyle habits to keep you disciplined and locked in on your goals.

### 🌟 Key Features

*   **📊 Comprehensive Dashboard**: Get a quick overview of your daily stats, caloric intake, workout summaries, and habit completion streaks at a glance.
*   **🏋️ Workouts Tracking**: Create custom workout templates, log your sessions, track weights and reps, use the built-in rest timer, and monitor your progress over time.
*   **🥗 Nutrition Logger**: Track your meals (breakfast, lunch, dinner, snacks), calculate macros (protein, carbs, fats), and seamlessly calculate your Total Daily Energy Expenditure (TDEE).
*   **✅ Habit Builder**: Form lasting habits with daily tracking, streaks, and custom color tags to visually organize your lifestyle routine.
*   **⚙️ User Preferences**: Highly customizable settings and personalized onboarding to tailor the app to your specific body metrics and fitness goals.
*   **📱 Fully Responsive**: A beautiful, glassmorphism-inspired UI designed to work seamlessly on desktops, tablets, and mobile devices.

---

## 🛠️ Built With

This project is built using a modern, scalable tech stack:

*   [![React][React.js]][React-url]
*   [![Next.js][Next.js]][Next-url]
*   [![Tailwind CSS][Tailwind.css]][Tailwind-url]
*   [![Supabase][Supabase]][Supabase-url]
*   **Recharts** (Data Visualization)
*   **Lucide React** (Iconography)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have Node.js installed on your machine.
*   npm
    ```sh
    npm install npm@latest -g
    ```

### Installation & Setup

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your_username/lockin-project.git
    cd lockin-project
    ```

2.  **Install NPM packages**
    ```sh
    npm install
    ```

3.  **Set up your environment variables**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    If you already use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, the app now supports those too.

4.  **Run the development server**
    ```sh
    npm run dev
    ```
    The app should now be running on `http://localhost:3000`.

---

## 📁 Project Structure

```text
lockin-project/
├── app/                    # Next.js App Router pages and layouts
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components (Modals, Panels, etc.)
│   ├── hooks/              # Custom React hooks (Data fetching & state)
│   ├── lib/                # Utility functions, Supabase client, config
│   ├── vite-pages/         # Page components used by App Router route wrappers
│   ├── index.css           # Global styles and Tailwind configurations
│   └── assets/             # Static media assets
├── .env.example            # Example environment variables
├── next.config.mjs         # Next.js configuration
├── postcss.config.mjs      # Tailwind PostCSS integration
└── package.json            # Project metadata and dependencies
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📫 Contact

Project Link: [https://github.com/your_username/lockin-project](https://github.com/your_username/lockin-project)


<!-- Markdowns & Links -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Supabase]: https://img.shields.io/badge/Supabase-18181A?style=for-the-badge&logo=supabase&logoColor=3ECF8E
[Supabase-url]: https://supabase.com/
