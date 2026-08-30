import React, { Component, useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { BlogPost } from '../types';
import { getAllBlogPosts, saveBlogPost, deleteBlogPost } from '../lib/firestoreService';
import { ImageCropModal } from '../components/ImageCropModal';
import {
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  Eye,
  ArrowLeft,
  FloppyDisk,
  Image as ImageIcon,
  Tag,
  ArrowsClockwise,
  Clock,
  UploadSimple,
  TextB,
  TextItalic,
  TextUnderline,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  Quotes,
  LinkSimple,
  Code,
  EyeSlash,
  BookOpen,
  Crop,
  X
} from '@phosphor-icons/react';

const CATEGORIES: BlogPost['category'][] = [
  'Tajweed',
  'Quran Learning',
  'Parenting',
  'Kids',
  'Hifz',
  'Duas & Salah',
  'Islamic Studies'
];

interface BlogEditorProps {
  onViewPost?: (slug: string) => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ onViewPost }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'code' | 'preview'>('visual');

  // Cropper Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string>('');

  // Form State
  const [currentId, setCurrentId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BlogPost['category']>('Quran Learning');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [author, setAuthor] = useState('Noor E Quran Institute');
  const [readTime, setReadTime] = useState('5 min read');
  const [published, setPublished] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contentEditableRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error loading blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Synchronize contentEditable div with content state
  useEffect(() => {
    if (contentEditableRef.current && editorMode === 'visual') {
      if (contentEditableRef.current.innerHTML !== content) {
        contentEditableRef.current.innerHTML = content || '<p><br></p>';
      }
    }
  }, [content, editorMode, isEditing]);

  const handleCreateNew = () => {
    setCurrentId('post-' + Date.now());
    setTitle('');
    setSlug('');
    setCategory('Quran Learning');
    setMetaDescription('');
    setFeaturedImage('');
    setContent('');
    setTagsInput('');
    setAuthor('Noor E Quran Institute');
    setReadTime('5 min read');
    setPublished(true);
    setEditorMode('visual');
    setIsEditing(true);
    setStatusMessage(null);
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setMetaDescription(post.metaDescription || '');
    setFeaturedImage(post.featuredImage || '');
    setContent(post.content || '');
    setTagsInput(post.tags ? post.tags.join(', ') : '');
    setAuthor(post.author || 'Noor E Quran Institute');
    setReadTime(post.readTime || '5 min read');
    setPublished(post.published ?? true);
    setEditorMode('visual');
    setIsEditing(true);
    setStatusMessage(null);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!currentId.startsWith('existing') && (!slug || slug === generateSlug(title))) {
      setSlug(generateSlug(val));
    }
  };

  // Image Upload -> Opens Crop Modal
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file must be under 8MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setRawImageForCrop(base64String);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropFinished = (croppedBase64: string) => {
    setFeaturedImage(croppedBase64);
    setStatusMessage({ type: 'success', text: 'Banner image framed and ready!' });
  };

  // Execute rich formatting commands
  const executeCommand = (command: string, value: string = '') => {
    if (editorMode === 'visual' && contentEditableRef.current) {
      contentEditableRef.current.focus();
      document.execCommand(command, false, value);
      setContent(contentEditableRef.current.innerHTML);
    } else if (editorMode === 'code' && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      let insertion = '';

      switch (command) {
        case 'bold':
          insertion = `<strong>${selected || 'bold text'}</strong>`;
          break;
        case 'italic':
          insertion = `<em>${selected || 'italic text'}</em>`;
          break;
        case 'underline':
          insertion = `<u>${selected || 'underlined text'}</u>`;
          break;
        case 'formatBlock':
          if (value === 'h2') insertion = `<h2>${selected || 'Heading 2'}</h2>\n`;
          else if (value === 'h3') insertion = `<h3>${selected || 'Heading 3'}</h3>\n`;
          else if (value === 'blockquote') insertion = `<blockquote>${selected || 'Quotation / Hadith'}</blockquote>\n`;
          break;
        case 'insertUnorderedList':
          insertion = `<ul>\n  <li>${selected || 'List item 1'}</li>\n  <li>List item 2</li>\n</ul>\n`;
          break;
        case 'insertOrderedList':
          insertion = `<ol>\n  <li>${selected || 'First step'}</li>\n  <li>Second step</li>\n</ol>\n`;
          break;
        case 'createLink':
          insertion = `<a href="${value || 'https://noorequraninstitute.me'}">${selected || 'link text'}</a>`;
          break;
        case 'insertImage':
          insertion = `<img src="${value || 'https://noorequraninstitute.me/images/banners/hero-banner.webp'}" alt="Article Illustration" class="rounded-sm shadow-xs my-4" />\n`;
          break;
        default:
          insertion = selected;
      }

      const newContent = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertion.length, start + insertion.length);
      }, 0);
    }
  };

  const insertLinkPrompt = () => {
    const url = prompt('Enter destination URL:', 'https://noorequraninstitute.me/courses');
    if (url) executeCommand('createLink', url);
  };

  const insertQuranBox = () => {
    const ayah = prompt('Enter Arabic Ayah / Text:', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    const translation = prompt('Enter English / Urdu Translation:', 'In the name of Allah, the Entirely Merciful, the Especially Merciful.');
    if (ayah) {
      const boxHtml = `
<div class="my-6 p-6 rounded-sm bg-[#0B332D] text-[#F8F5EE] border border-[#B79A62]/40 shadow-xs">
  <p class="font-arabic text-xl sm:text-2xl text-[#B79A62] font-bold text-center mb-3 dir-rtl">${ayah}</p>
  <p class="text-xs sm:text-sm text-[#E8E0D1]/85 text-center italic">"${translation || ''}"</p>
</div>\n`;
      if (editorMode === 'visual' && contentEditableRef.current) {
        contentEditableRef.current.focus();
        document.execCommand('insertHTML', false, boxHtml);
        setContent(contentEditableRef.current.innerHTML);
      } else {
        setContent(prev => prev + '\n' + boxHtml);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Article title is required.' });
      return;
    }
    if (!slug.trim()) {
      setStatusMessage({ type: 'error', text: 'URL slug is required.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const postPayload: BlogPost = {
      id: currentId,
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      category,
      metaDescription: metaDescription.trim(),
      featuredImage: featuredImage.trim(),
      content: content.trim(),
      tags: tagsArray,
      author: author.trim() || 'Noor E Quran Institute',
      readTime: readTime.trim() || '5 min read',
      published,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    try {
      await saveBlogPost(postPayload);
      setStatusMessage({ type: 'success', text: 'Article published & saved successfully!' });
      await fetchPosts();
      setIsEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
      setStatusMessage({ type: 'error', text: 'Failed to save blog post. Check console.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"?`)) return;
    try {
      await deleteBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setStatusMessage({ type: 'success', text: 'Blog post deleted.' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to delete blog post.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Status */}
      {statusMessage && (
        <div
          className={`p-4 rounded-sm text-xs font-sans font-semibold flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-[#F8F5EE] text-[#0B332D] border border-[#B79A62]'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Editor View */}
      {isEditing ? (
        <div className="bg-[#FCFBF8] p-6 sm:p-8 rounded-sm border border-[#E8E0D1] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E0D1] pb-4">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-[#0B332D] text-xs font-sans font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Article List</span>
            </button>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="rounded-xs text-[#0B332D] focus:ring-[#B79A62]"
                />
                <span>Publish on Website</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Simple Tajweed Rules Every Parent Should Teach"
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E0D1] rounded-sm text-xs sm:text-sm font-sans focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                  URL Slug (/blog/slug) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="5-simple-tajweed-rules"
                  value={slug}
                  onChange={e => setSlug(generateSlug(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E8E0D1] rounded-sm text-xs sm:text-sm font-mono text-gray-600 focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
                />
              </div>
            </div>

            {/* Category, Author, Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as BlogPost['category'])}
                  className="w-full px-3 py-2 border border-[#E8E0D1] rounded-sm text-xs sm:text-sm font-sans focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                  Author Name / Scholar
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E0D1] rounded-sm text-xs sm:text-sm font-sans focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                  Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={e => setReadTime(e.target.value)}
                  placeholder="e.g. 6 min read"
                  className="w-full px-3 py-2 border border-[#E8E0D1] rounded-sm text-xs sm:text-sm font-sans focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
                />
              </div>
            </div>

            {/* Meta Description (SEO) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-sans font-bold text-gray-700">
                  SEO Meta Description (Google / Social Snippet)
                </label>
                <span className={`text-[10px] font-sans ${metaDescription.length > 160 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {metaDescription.length} / 160 characters
                </span>
              </div>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                placeholder="A compelling 1-2 sentence summary of this article that will appear on search engine snippets..."
                className="w-full px-3 py-2 border border-[#E8E0D1] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
              />
            </div>

            {/* Featured Image with Live Preview + Crop Tool */}
            <div>
              <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                Featured Banner Image
              </label>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={e => setFeaturedImage(e.target.value)}
                    placeholder="https://... or upload below"
                    className="w-full px-3 py-2 border border-[#E8E0D1] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
                  />
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-[#F8F5EE] hover:bg-[#E8E0D1]/60 text-[#0B332D] border border-[#E8E0D1] rounded-sm text-xs font-sans font-bold cursor-pointer transition-colors">
                      <UploadSimple className="w-4 h-4 text-[#B79A62]" />
                      <span>Upload &amp; Frame</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        className="hidden"
                      />
                    </label>

                    {featuredImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setRawImageForCrop(featuredImage);
                          setIsCropModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-[#0B332D] text-[#F8F5EE] rounded-sm text-xs font-sans font-semibold hover:bg-[#07221E] cursor-pointer"
                      >
                        <Crop className="w-3.5 h-3.5 text-[#B79A62]" />
                        <span>Adjust Frame</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Banner Preview Box */}
                {featuredImage && (
                  <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-sm border border-[#E8E0D1] bg-[#12201D]">
                    <img
                      src={featuredImage}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRawImageForCrop(featuredImage);
                          setIsCropModalOpen(true);
                        }}
                        className="px-2 py-1 bg-[#0B332D]/90 text-[#B79A62] text-[10px] font-sans font-bold uppercase rounded-xs backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Crop className="w-3 h-3" />
                        <span>Crop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedImage('')}
                        className="p-1 bg-red-600/90 text-white rounded-xs backdrop-blur-xs hover:bg-red-700 cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Tajweed, Quran for Kids, Online Tutor, Hifz"
                className="w-full px-3 py-2 border border-[#E8E0D1] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D] bg-[#F8F5EE]"
              />
            </div>

            {/* Rich Editor Canvas with Mode Tabs */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-sans font-bold text-gray-700">
                  Article Content *
                </label>
                <div className="flex items-center gap-1 bg-[#F8F5EE] p-0.5 rounded-sm border border-[#E8E0D1]">
                  {(['visual', 'code', 'preview'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEditorMode(m)}
                      className={`px-2.5 py-1 text-xs font-sans rounded-xs transition-colors cursor-pointer ${
                        editorMode === m
                          ? 'bg-[#0B332D] text-[#F8F5EE] font-bold'
                          : 'text-gray-600 hover:text-[#0B332D]'
                      }`}
                    >
                      {m === 'visual' ? 'Visual Editor' : m === 'code' ? 'HTML / Markdown' : 'Live Preview'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toolbar */}
              {editorMode !== 'preview' && (
                <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F8F5EE] border border-[#E8E0D1] rounded-t-sm text-gray-700">
                  <button
                    type="button"
                    onClick={() => executeCommand('bold')}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Bold"
                  >
                    <TextB className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('italic')}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Italic"
                  >
                    <TextItalic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('underline')}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Underline"
                  >
                    <TextUnderline className="w-4 h-4" />
                  </button>
                  
                  <span className="w-[1px] h-4 bg-[#E8E0D1] mx-1" />

                  <button
                    type="button"
                    onClick={() => executeCommand('formatBlock', 'h2')}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Heading 2"
                  >
                    <TextHTwo className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('formatBlock', 'h3')}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Heading 3"
                  >
                    <TextHThree className="w-4 h-4" />
                  </button>

                  <span className="w-[1px] h-4 bg-[#E8E0D1] mx-1" />

                  <button
                    type="button"
                    onClick={() => executeCommand('insertUnorderedList')}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Bullet List"
                  >
                    <ListBullets className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('insertOrderedList')}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Numbered List"
                  >
                    <ListNumbers className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('formatBlock', 'blockquote')}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Quote"
                  >
                    <Quotes className="w-4 h-4" />
                  </button>

                  <span className="w-[1px] h-4 bg-[#E8E0D1] mx-1" />

                  <button
                    type="button"
                    onClick={insertLinkPrompt}
                    className="p-1.5 hover:bg-[#E8E0D1]/60 rounded-xs cursor-pointer"
                    title="Insert Link"
                  >
                    <LinkSimple className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={insertQuranBox}
                    className="px-2 py-1 bg-[#0B332D] text-[#B79A62] text-[10px] font-sans font-bold uppercase rounded-xs hover:bg-[#07221E] cursor-pointer ml-auto"
                    title="Insert Arabic Quran Verse Card"
                  >
                    + Arabic Ayah Card
                  </button>
                </div>
              )}

              {/* Visual Editable */}
              {editorMode === 'visual' && (
                <div
                  ref={contentEditableRef}
                  contentEditable
                  onInput={e => setContent(e.currentTarget.innerHTML)}
                  className="w-full min-h-[360px] p-4 bg-[#FCFBF8] border border-t-0 border-[#E8E0D1] rounded-b-sm focus:outline-none text-xs sm:text-sm font-sans leading-relaxed prose prose-sm max-w-none"
                  style={{ minHeight: '360px' }}
                />
              )}

              {/* Code / Markdown View */}
              {editorMode === 'code' && (
                <textarea
                  ref={textareaRef}
                  rows={14}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-[#12201D] text-[#E8E0D1] font-mono text-xs border border-t-0 border-[#E8E0D1] rounded-b-sm focus:outline-none"
                />
              )}

              {/* Live Preview View */}
              {editorMode === 'preview' && (
                <div className="p-6 bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm min-h-[360px] space-y-4">
                  <h2 className="font-editorial text-2xl text-[#0B332D] font-bold">{title || 'Untitled Article'}</h2>
                  <div
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) || '<p className="text-gray-400 italic">No content yet...</p>' }}
                    className="prose max-w-none text-xs sm:text-sm font-sans leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E8E0D1] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-sans font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FloppyDisk className="w-4 h-4 text-[#B79A62]" />
                <span>{saving ? 'Publishing...' : 'Save & Publish Article'}</span>
              </button>
            </div>

          </form>
        </div>
      ) : (
        /* Posts Table & Directory */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FCFBF8] p-4 rounded-sm border border-[#E8E0D1]">
            <div>
              <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Islamic Blog &amp; Articles</h3>
              <p className="text-xs text-gray-500 font-sans">Manage publications, Tajweed guides, and SEO parent articles.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchPosts}
                disabled={loading}
                className="p-2 border border-[#E8E0D1] rounded-sm hover:bg-[#F8F5EE] text-gray-600 transition-colors cursor-pointer"
                title="Refresh"
              >
                <ArrowsClockwise className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                <span>Write New Article</span>
              </button>
            </div>
          </div>

          <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs font-sans text-gray-500">Loading articles...</div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center text-xs font-sans text-gray-500 space-y-2">
                <BookOpen className="w-8 h-8 text-[#B79A62] mx-auto" />
                <p>No blog posts published yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                    <tr>
                      <th className="p-3.5">Article</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Author</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D1]/60">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                        <td className="p-3.5 max-w-sm">
                          <div className="font-bold text-[#0B332D] line-clamp-1">{post.title}</div>
                          <div className="text-[10px] text-gray-400 font-mono">/blog/{post.slug}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F8F5EE] text-[#B79A62] border border-[#E8E0D1] rounded-xs">
                            {post.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-600">{post.author}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                            post.published ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onViewPost && (
                              <button
                                onClick={() => onViewPost(post.slug)}
                                className="p-1.5 text-gray-600 hover:text-[#0B332D] cursor-pointer"
                                title="View on site"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-1.5 text-[#0B332D] hover:text-[#B79A62] cursor-pointer"
                              title="Edit"
                            >
                              <PencilSimple className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                              title="Delete"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reusable Framing & Cropping Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageForCrop}
        title="Frame Blog Banner Image"
        initialAspectRatio="16:9"
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropFinished}
      />
    </div>
  );
};
