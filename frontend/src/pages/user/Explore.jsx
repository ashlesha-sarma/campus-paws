import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { CameraIcon, HeartIcon, LogoMark } from '../../components/Icons';

function PostCard({ post, onLike, onDelete, currentUser }) {
  const canDelete = currentUser && (currentUser.role === 'admin' || currentUser.id === post.user_id);
  const [liked, setLiked] = useState(!!post.user_liked);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);

  const handleLike = async () => {
    await onLike(post.id);
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <article className="card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terra-100 text-sm font-semibold text-terra-700 dark:bg-terra-900/20 dark:text-terra-300">
            {(post.author_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-forest-900 dark:text-cream-100">{post.author_name || 'Campus community member'}</p>
            <p className="text-xs text-forest-500 dark:text-forest-400">
              {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            Remove
          </button>
        )}
      </div>

      <h3 className="text-xl text-forest-950 dark:text-cream-100">{post.title}</h3>
      <p className="mt-2 text-sm leading-7 text-forest-600 dark:text-forest-300">{post.content}</p>

      {post.image_path && (
        <img src={post.image_path} alt="Community post" className="mt-4 max-h-72 w-full rounded-xl object-cover" />
      )}

      <div className="mt-4 border-t border-cream-200 pt-3 dark:border-forest-800">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            liked
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'
              : 'text-forest-500 hover:bg-red-50 hover:text-red-600 dark:text-forest-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
          }`}
        >
          <HeartIcon className="h-4 w-4" />
          {likeCount}
        </button>
      </div>
    </article>
  );
}

export default function Explore() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', image: null });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    API.get('/posts')
      .then((r) => setPosts(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMsg('Please sign in before submitting a post.');
      return;
    }
    setMsg('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('content', form.content);
      if (form.image) fd.append('image', form.image);
      await API.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ title: '', content: '', image: null });
      setShowForm(false);
      fetchPosts();
    } catch {
      setMsg('Unable to publish the post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    await API.post(`/posts/${postId}/like`).catch(() => {});
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    await API.delete(`/posts/${postId}`)
      .then(() => fetchPosts())
      .catch(() => alert('Failed'));
  };

  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="page-container max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Community Updates</p>
            <h1 className="section-title mt-2">Campus feed</h1>
            <p className="mt-3 text-sm leading-7 text-forest-500 dark:text-forest-400">
              Share responsible updates about rescues, treatments, adoptions, and welfare activity on campus.
            </p>
          </div>
          {user && (
            <button onClick={() => setShowForm((value) => !value)} className="btn-primary btn-sm">
              {showForm ? 'Close Form' : 'Create Post'}
            </button>
          )}
        </div>

        {showForm && user && (
          <div className="card mb-6 p-5">
            <h3 className="text-xl text-forest-950 dark:text-cream-100">Publish an update</h3>
            <p className="mt-2 text-sm text-forest-500 dark:text-forest-400">
              Keep updates factual, respectful, and relevant to animal welfare activities.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label className="label">Title</label>
                <input className="input" required value={form.title} onChange={set('title')} placeholder="Add a concise headline" />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea
                  className="input resize-none"
                  rows={5}
                  required
                  value={form.content}
                  onChange={set('content')}
                  placeholder="Share verified updates, observations, or community notes."
                />
              </div>
              <div>
                <label className="label">Photo (optional)</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-forest-600 hover:border-terra-300 hover:bg-terra-50 dark:border-forest-700 dark:bg-forest-800/70 dark:text-forest-300 dark:hover:bg-forest-800">
                  <CameraIcon className="h-4 w-4 text-terra-500" />
                  <span>{form.image ? form.image.name : 'Choose an image file'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.files[0] }))}
                    className="hidden"
                  />
                </label>
              </div>
              {msg && <p className="text-sm text-red-600 dark:text-red-300">{msg}</p>}
              <button type="submit" disabled={submitting} className={`btn-primary w-full justify-center ${submitting ? 'opacity-70' : ''}`}>
                {submitting ? 'Publishing post' : 'Publish Update'}
              </button>
            </form>
          </div>
        )}

        {!user && (
          <div className="card mb-6 p-5 text-center">
            <p className="text-sm text-forest-500 dark:text-forest-400">
              Sign in to share updates and respond to community posts.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <a href="/login" className="btn-ghost btn-sm">
                Sign In
              </a>
              <a href="/register" className="btn-primary btn-sm">
                Create Account
              </a>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="mb-4 flex gap-3">
                  <div className="skeleton h-9 w-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-2 w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-terra-50 text-terra-600 dark:bg-terra-900/20 dark:text-terra-300">
              <LogoMark className="h-5 w-5" />
            </div>
            <h3 className="text-xl text-forest-950 dark:text-cream-100">No community posts yet</h3>
            <p className="mt-2 text-sm text-forest-500 dark:text-forest-400">
              Updates will appear here once members begin sharing them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} currentUser={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
