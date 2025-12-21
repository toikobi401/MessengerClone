import { MessageSquare } from 'lucide-react';
import useChatStore from '../store/chatStore';

const Welcome = () => {
  const currentUser = useChatStore((state) => state.currentUser);

  return (
    <div className="h-full flex items-center justify-center bg-secondary">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/20 rounded-full mb-6">
          <MessageSquare className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome, {currentUser?.username}!
        </h1>
        <p className="text-gray-400 text-lg">
          Select a chat to start messaging
        </p>
      </div>
    </div>
  );
};

export default Welcome;
