import useChatStore from '../store/chatStore';

const Contacts = () => {
  const { contacts, selectedChat, changeChat, onlineUsers } = useChatStore();

  const handleChatChange = (contact) => {
    changeChat(contact);
  };

  return (
    <div className="h-full bg-tertiary flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Contacts</h2>
        <p className="text-sm text-gray-400 mt-1">
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </p>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {contacts.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <p className="text-gray-400 text-center">No contacts found</p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {contacts.map((contact) => {
              const isOnline = onlineUsers.includes(contact.id);
              const isActive = selectedChat?.id === contact.id;

              return (
                <div
                  key={contact.id}
                  onClick={() => handleChatChange(contact)}
                  className={`contact-item ${isActive ? 'active' : ''}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {contact.avatarImage && contact.isAvatarImageSet ? (
                      <img
                        src={contact.avatarImage}
                        alt={contact.username}
                        className="avatar"
                      />
                    ) : (
                      <div className="avatar bg-primary/30 flex items-center justify-center text-lg font-semibold">
                        {contact.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Online indicator */}
                    {isOnline && <span className="badge-online" />}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {contact.username}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
