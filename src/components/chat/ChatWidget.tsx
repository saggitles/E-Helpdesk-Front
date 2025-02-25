import React, { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

const ChatWidget = () => {
  const { user, isLoading } = useUser();

  useEffect(() => {

    // Only initialize chat when user data is available
    if (!isLoading && user) {
      const initChat = async () => {
        console.log(user.given_name)
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
          import Chatbox from 'https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest/dist/chatbox/index.js';
          const widget = await Chatbox.initBubble({
            agentId: 'cm5o8deyn02i0701gi4m4q99w',
            contact: {
              firstName: '${user.given_name || ''}',
              lastName: '${user.family_name || ''}',
              email: '${user.email || ''}',
              userId: '${user.sub || ''}'
            },
            initialMessages: [
              'Hello ${user.given_name || user.name || 'there'}, how can I help you today?'
            ],
            context: "The user you are talking to is ${user.given_name || user.name || ''} (${user.email}). Please greet them by name.",
          });
          window.chatWidget = widget;
        `;
        document.body.appendChild(script);
      };

      initChat();
    }

    // Cleanup
    return () => {
      const scripts = document.querySelectorAll('script[type="module"]');
      scripts.forEach(script => script.remove());
    };
  }, [user, isLoading]); // Add dependencies to useEffect

  // The component doesn't render anything visible itself
  return null;
};

export default ChatWidget;