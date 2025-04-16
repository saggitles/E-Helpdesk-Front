import React, { useCallback, useRef } from 'react';
import Comment from './Comment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faImage,
  faItalic,
  faUnderline,
  faListUl,
  faLink,
  faUnlink,
  faQuoteRight,
} from '@fortawesome/free-solid-svg-icons';
import { Comment as CommentType } from '@/types/tickets.types';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import Link from '@tiptap/extension-link';
import Blockquote from '@tiptap/extension-blockquote';
import CharacterCount from '@tiptap/extension-character-count';
import ListItem from '@tiptap/extension-list-item';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

interface CommentListProps {
  comments: CommentType[];
  onAdd: (content: string) => void;
  onEdit: (commentId: number, updatedContent: string) => void;
  onDelete: (commentId: number) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [newCommentContent, setNewCommentContent] = React.useState('');
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Document,
      Paragraph,
      Text,
      Underline,
      Image,
      BulletList,
      ListItem,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Blockquote,
      CharacterCount.configure({ limit: 4000 }),
    ],
    content: newCommentContent,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddComment = () => {
    if (editor) {
      onAdd(editor.getHTML());
      editor.commands.clearContent();
    }
  };

  const addImage = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const toggleLink = useCallback(() => {
    if (!editor) return;

    const isActive = editor.isActive('link');
    if (isActive) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt('Enter URL');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file && editor) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        editor.chain().focus().setImage({ src: imageDataUrl }).run();
      };

      reader.readAsDataURL(file);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div>
      <div className='rounded-md border-solid border-2'>
        <div className='p-4'>
          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className='comment-input-section'>
            <div className='mt-1 flex items-center space-x-5 shadow-md pl-3 h-10'>
              <button onClick={addImage}>
                <FontAwesomeIcon icon={faImage} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <FontAwesomeIcon icon={faBold} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <FontAwesomeIcon icon={faItalic} />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleUnderline().run()
                }
              >
                <FontAwesomeIcon icon={faUnderline} />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleBulletList().run()
                }
              >
                <FontAwesomeIcon icon={faListUl} />
              </button>
              <button
                onClick={toggleLink}
                className={editor.isActive('link') ? 'is-active' : ''}
              >
                <FontAwesomeIcon
                  icon={editor.isActive('link') ? faUnlink : faLink}
                />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleBlockquote().run()
                }
              >
                <FontAwesomeIcon icon={faQuoteRight} />
              </button>
            </div>
            <div className='relative flex items-center h-16'>
              <div className='comment-input-container flex-1 absolute w-full h-full'>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='pt-4'>
        <button
          onClick={handleAddComment}
          className='bg-[#14b8a6] hover:bg-[#0f9488] text-white font-bold py-2 px-4 rounded transition-colors duration-200'
        >
          Add Comment
        </button>
      </div>
      <div className='pt-2 space-y-4'>
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <div>{editor?.storage.characterCount.characters()} characters</div>
    </div>
  );
};

export default CommentList;
