import React, { useState, useEffect } from 'react';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit'
import { Comment } from '../../../reducers/Comments/types';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import Link from '@tiptap/extension-link';
import Blockquote from '@tiptap/extension-blockquote';
import CharacterCount from '@tiptap/extension-character-count';
import ListItem from '@tiptap/extension-list-item';
import axios from 'axios';


interface CommentProps {
  comment: Comment;
  onEdit: (commentId: number, updatedContent: string) => void;
  onDelete: (commentId: number) => void;
}

interface UserInfo {
  name: string;
  // Add other properties from the response if needed
}

const CommentComponent: React.FC<CommentProps> = ({ comment, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit, Bold, Italic, Underline,BulletList,Blockquote,Link.configure({
      openOnClick: false,
      autolink: true,
      
    }),ListItem],
    content: comment.Content,
  });
  const [userInfo, setUserInfo] = useState<string | null>(null);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // @ts-ignore
    onEdit(comment.IDComment, editor.getHTML() || '');
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    // @ts-ignore
    editor.commands.setContent(comment.Content);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(comment.IDComment);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userID = comment.UserID; // Get the UserID from the comment
        if (!userID) {
          throw new Error('UserID is missing.');
        }
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Access token is missing.');
        }
    
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
    
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userID}`, config);
        const userData = response.data;
        // Assuming your backend API returns the user's firstName and lastName
        const userFullName = `${userData.FirstName} ${userData.LastName}`;
        setUserInfo(userFullName);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
  
    fetchUserInfo();
  }, []);

  return (
    <div>
      {isEditing ? (
        <div className="py-2 border-b-2 border-slate-100 flex">
          <EditorContent className="ml-4" editor={editor} />
          <div className="ml-4 ml-auto mr-4">
            <button className='mr-2' onClick={handleSaveClick}>Save</button>
            <button onClick={handleCancelClick}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex">
          {userInfo !== null && ( // Check if userInfo is not null
            <div className="mr-2 whitespace-nowrap">{userInfo}:</div> // Render user's full name followed by a colon
          )}
          {/* <EditorContent editor={editor} /> */}
          <div className='comment-container' dangerouslySetInnerHTML={{ __html: comment.Content }} />
          {/* Buttons for editing and deleting */}
          <div className="ml-4 ml-auto mr-4 flex items-start">
            <button className='mr-2' onClick={handleEditClick}>Edit</button>
            <button onClick={handleDeleteClick}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentComponent;