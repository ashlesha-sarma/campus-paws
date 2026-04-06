import React, { useEffect, useState } from 'react';
import API from '../../api/api';

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    API.get('/posts')
      .then((r) => setPosts(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const del = async (id) => {
    if (!confirm('Delete this post?')) return;
    await API.delete(`/posts/${id}`)
      .then(() => fetchData())
      .catch(() => alert('Failed'));
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl text-forest-950 dark:text-cream-100">Manage posts</h1>
        <p className="mt-1 text-sm text-forest-500 dark:text-forest-400">{posts.length} community posts</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-forest-400">No community posts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="card p-5 transition-shadow duration-200 hover:shadow-card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-terra-100 text-sm font-semibold text-terra-700 dark:bg-terra-900/20 dark:text-terra-300">
                    {(post.author_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-forest-900 dark:text-cream-100">{post.author_name}</span>
                      <span className="text-xs text-forest-400">
                        {new Date(post.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span className="badge badge-blue text-xs">Likes {post.like_count || 0}</span>
                    </div>
                    <h3 className="mb-1 text-sm font-medium text-forest-800 dark:text-cream-100">{post.title}</h3>
                    <p className="line-clamp-2 text-sm text-forest-500 dark:text-forest-400">{post.content}</p>
                    {post.image_path && (
                      <img
                        src={post.image_path}
                        alt="post"
                        className="mt-2 h-20 w-auto rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => del(post.id)}
                  className="flex-shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
