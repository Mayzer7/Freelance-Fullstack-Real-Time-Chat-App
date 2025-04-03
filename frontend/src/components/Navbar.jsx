import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, MessageCircle, Trophy, PencilLine, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["FreelanceBattle"];

const TypingText = () => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentWord = words[index];
    let timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setText((prev) => prev.slice(0, -1));
        setSpeed(100);
      }, speed);
    } else {
      timeout = setTimeout(() => {
        setText((prev) => currentWord.slice(0, prev.length + 1));
        setSpeed(150);
      }, speed);
    }

    if (!isDeleting && text === currentWord) {
      setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, speed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.h1 className="text-lg font-bold">
      {text}
      <span className={`ml-1 ${showCursor ? "text-primary" : "opacity-0"}`}>|</span>
    </motion.h1>
  );
};

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <TypingText />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to={"/post-task"} className={`btn btn-sm gap-2 transition-colors`}>
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Найти Работу</span>
            </Link>

            <Link to={"/post-task"} className={`btn btn-sm gap-2 transition-colors`}>
              <PencilLine className="w-4 h-4" />
              <span className="hidden sm:inline">Разместить Задание</span>
            </Link>

            <Link to={"/messanger"} className={`btn btn-sm gap-2 transition-colors`}>
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Messanger</span>
            </Link>

            <Link to={"/settings"} className={`btn btn-sm gap-2 transition-colors`}>
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;