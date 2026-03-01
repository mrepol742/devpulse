import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col items-center justify-center px-4">
      <div className="p-10 max-w-3xl text-center">
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
          DevPulse
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-8">
          Monitor your coding activity, create custom leaderboards, and compete
          with your team or the community. DevPulse brings WakaTime stats into a
          sleek, collaborative leaderboard experience.
        </p>

        <button className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105">
          Get Started
        </button>
      </div>

      <div className="mt-16 max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold mb-2 text-indigo-400">
            Private & Public Boards
          </h3>
          <p className="text-gray-400">
            Create private boards for your team or open public leaderboards to
            compete with the community.
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold mb-2 text-purple-400">
            Real-Time Stats
          </h3>
          <p className="text-gray-400">
            Sync your WakaTime data automatically and watch your progress climb
            the leaderboard in real time.
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold mb-2 text-pink-400">
            Team Collaboration
          </h3>
          <p className="text-gray-400">
            Invite teammates, compare coding activity, and foster a culture of
            productivity and friendly competition.
          </p>
        </div>
      </div>

      <footer className="mt-20 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DevPulse. All rights reserved.
      </footer>
    </div>
  );
}
