import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Mail, User, BarChart, MessageSquare } from "lucide-react";
import { getTasks } from "../api/posts";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";

const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { setSelectedUser } = useChatStore();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [openTasks, setOpenTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if username is a valid MongoDB ObjectId (24 hex characters)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(username);
        
        let response;
        if (isObjectId) {
          // If it's an ObjectId, fetch by ID
          response = await axiosInstance.get(`/auth/user/id/${username}`);
        } else {
          // Otherwise fetch by username
          response = await axiosInstance.get(`/auth/user/${username}`);
        }
        
        setUser(response.data);
        
        const allTasks = await getTasks();
        const userTasks = allTasks.filter(task => task.author._id === response.data._id);
        setTasks(userTasks);

        const completed = userTasks.filter(task => task.status === 'completed').length;
        const open = userTasks.filter(task => task.status === 'open').length;

        setCompletedTasks(completed);
        setOpenTasks(open);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  const handleWriteMessage = () => {
    setSelectedUser(user);
    navigate('/messanger');
  };

  if (isLoading) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-base-content/60">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">@{username}</p>
          </div>

          {/* avatar section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
            </div>
            <button
              onClick={handleWriteMessage}
              className="btn btn-primary gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Написать сообщение
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{user.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{user.email}</p>
            </div>
          </div>

          {/* User Statistics Section */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" /> User Statistics
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Total Tasks Created</span>
                <span>{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Tasks Completed</span>
                <span>{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Tasks Open</span>
                <span>{openTasks}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{user.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage; 