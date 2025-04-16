import React, { useState, useEffect } from 'react';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Comment } from '@/types/tickets.types';
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

const CommentComponent: React.FC<CommentProps> = ({
  comment,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');
  const [userInfo, setUserInfo] = useState<string | null>(null);

  const handleEditClick = () => {
    setEditContent(comment.content || '');
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditContent(comment.content || '');
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(comment.id);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userID = comment.id;
        if (!userID) {
          throw new Error('id is missing.');
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

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userID}`,
          config
        );
        const userData = response.data;
        const userFullName = `${userData.first_name || ''} ${
          userData.last_name || ''
        }`;
        setUserInfo(userFullName);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [comment.id]);

  return (
    <div className='border-b border-gray-200 py-3'>
      {isEditing ? (
        <div className='py-2 flex'>
          <textarea
            className='ml-4 flex-grow border rounded p-2'
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className='ml-4 flex items-start'>
            <button
              className='mr-2 px-3 py-1 bg-blue-500 text-white rounded'
              onClick={handleSaveClick}
            >
              Save
            </button>
            <button
              className='px-3 py-1 bg-gray-300 rounded'
              onClick={handleCancelClick}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className='flex'>
          {userInfo && (
            <div className='mr-2 font-semibold whitespace-nowrap'>
              {userInfo}:
            </div>
          )}
          <div className='flex-grow break-words'>{comment.content}</div>
          <div className='ml-auto flex items-start'>
            <button
              className='mr-2 text-blue-500'
              onClick={handleEditClick}
            >
              Edit
            </button>
            <button className='text-red-500' onClick={handleDeleteClick}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentComponent;
