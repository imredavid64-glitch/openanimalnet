'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeciesAnnotations } from '@/lib/collaborativeAnnotations';
import { SendIcon, XIcon, CheckIcon, MessageIcon, UsersIcon, WifiOffIcon } from '@/components/icons';

interface AnnotationSidebarProps {
  speciesId: string;
  enabled?: boolean;
  position?: 'left' | 'right';
  defaultOpen?: boolean;
}

export function AnnotationSidebar({ 
  speciesId, 
  enabled = true, 
  position = 'right',
  defaultOpen = false 
}: AnnotationSidebarProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const annotationsContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    annotations,
    connected,
    synced,
    users,
    currentUser,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    toggleResolved,
    addReply,
  } = useSpeciesAnnotations(speciesId, enabled);

  // Filter annotations
  const filteredAnnotations = annotations.filter(a => {
    if (filter === 'active') return !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return true;
  });

  // Sort by timestamp (newest first)
  const sortedAnnotations = [...filteredAnnotations].sort((a, b) => b.timestamp - a.timestamp);

  const handleCreateAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim()) return;
    
    // Position in center of container
    const container = annotationsContainerRef.current;
    const position = container 
      ? { x: container.offsetWidth / 2, y: container.offsetHeight / 2 }
      : { x: 50, y: 50 };
    
    createAnnotation(newAnnotation.trim(), position, `[data-species-id="${speciesId}"]`);
    setNewAnnotation('');
  };

  const handleAddReply = (annotationId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    addReply(annotationId, replyContent.trim());
    setReplyContent('');
    setReplyingTo(null);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getUser = (userId: string) => {
    if (users instanceof Map) {
      return users.get(userId) ?? { name: 'Unknown', color: '#64748b' };
    }
    // Fallback for array case - Map values don't have id, so we can't search by id
    // Just return the first user or default
    return users[0] ?? { name: 'Unknown', color: '#64748b' };
  };

  if (!enabled) return null;

  return (
    <>
      {/* Toggle Button */}
      {!open && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setOpen(true)}
          className={`fixed z-40 ${position === 'right' ? 'right-4' : 'left-4'} bottom-4 w-12 h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105`}
          aria-label="Open annotations"
        >
          <MessageIcon className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {annotations.filter(a => !a.resolved).length}
          </span>
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: position === 'right' ? 400 : -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: position === 'right' ? 400 : -400, opacity: 0 }}
            className={`fixed z-50 top-20 ${position === 'right' ? 'right-0' : 'left-0'} bottom-20 w-96 bg-white dark:bg-secondary-800 shadow-2xl border-l border-r border-secondary-200 dark:border-secondary-700 flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <MessageIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 dark:text-white">Annotations</h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    {annotations.length} total • {annotations.filter(a => !a.resolved).length} active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-warning-500'}`} />
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                  aria-label="Close"
                >
                  <XIcon className="w-5 h-5 text-secondary-500" />
                </button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="px-4 py-2 flex items-center gap-3 text-xs text-secondary-500 dark:text-secondary-400 border-b border-secondary-100 dark:border-secondary-800">
              <span className={`flex items-center gap-1 ${connected ? 'text-success-600' : 'text-warning-600'}`}>
                {connected ? <WifiOffIcon className="w-3 h-3" /> : <WifiOffIcon className="w-3 h-3" />}
                {connected ? (synced ? 'Synced' : 'Connecting...') : 'Offline'}
              </span>
              <span className="px-2 py-0.5 rounded bg-secondary-100 dark:bg-secondary-700">
                {(users instanceof Map ? users.size : users.length)} user{(users instanceof Map ? users.size : users.length) !== 1 ? 's' : ''} online
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-secondary-100 dark:border-secondary-800">
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'resolved', label: 'Resolved' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as 'all' | 'active' | 'resolved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === f.value
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                    }`}
                  >
                    {f.label}
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-secondary-200 dark:bg-secondary-700">
                      {annotations.filter(a => f.value === 'all' || (f.value === 'active' && !a.resolved) || (f.value === 'resolved' && a.resolved)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Annotations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={annotationsContainerRef}>
              {sortedAnnotations.length === 0 ? (
                <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
                  <MessageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No annotations yet</p>
                  <p className="text-xs mt-1">Click anywhere on the page to add one</p>
                </div>
              ) : (
                <AnimatePresence>
                  {sortedAnnotations.map((annotation, index) => (
                    <motion.div
                      key={annotation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative p-4 rounded-xl border ${annotation.resolved 
                        ? 'bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-800' 
                        : 'bg-secondary-50 dark:bg-secondary-900/30 border-secondary-200 dark:border-secondary-700'
                      }`}
                    >
                      {/* Annotation Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0" 
                               style={{ backgroundColor: annotation.userColor }}>
                            {annotation.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-secondary-900 dark:text-white truncate">
                              {annotation.userName}
                            </p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">
                              {formatTime(annotation.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!annotation.resolved && (
                            <button
                              onClick={() => toggleResolved(annotation.id)}
                              className="p-1.5 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors text-secondary-500"
                              title="Mark as resolved"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          )}
                          {annotation.userId === currentUser.id && (
                            <button
                              onClick={() => deleteAnnotation(annotation.id)}
                              className="p-1.5 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors text-secondary-500"
                              title="Delete"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Annotation Content */}
                      <div className={`prose prose-sm dark:prose-invert max-w-none ${annotation.resolved ? 'line-through text-secondary-400' : ''}`}>
                        <p className="whitespace-pre-wrap text-sm">{annotation.content}</p>
                      </div>

                      {/* Target element indicator */}
                      {annotation.targetElement && (
                        <div className="mt-2 text-xs text-secondary-400 dark:text-secondary-500 flex items-center gap-1">
                          <span>Target:</span>
                          <code className="px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-secondary-700 font-mono text-[10px]">
                            {annotation.targetElement}
                          </code>
                        </div>
                      )}

                      {/* Replies */}
                      {annotation.replies.length > 0 && (
                        <div className="mt-3 space-y-2 border-l-2 border-secondary-200 dark:border-secondary-700 pl-4 ml-2">
                          {annotation.replies.map((reply, ri) => (
                            <motion.div
                              key={reply.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: ri * 0.05 }}
                              className="py-2"
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0" 
                                     style={{ backgroundColor: reply.userColor }}>
                                  {reply.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs text-secondary-900 dark:text-white">{reply.userName}</span>
                                    <span className="text-[10px] text-secondary-500 dark:text-secondary-400">{formatTime(reply.timestamp)}</span>
                                  </div>
                                  <p className="text-sm text-secondary-600 dark:text-secondary-400">{reply.content}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Add Reply */}
                      {replyingTo === annotation.id ? (
                        <form onSubmit={(e) => handleAddReply(annotation.id, e)} className="mt-3 flex gap-2">
                          <textarea
                            ref={textareaRef}
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 text-sm border border-secondary-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <button
                              type="submit"
                              className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              <SendIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                              className="px-3 py-2 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(annotation.id)}
                          className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          <MessageIcon className="w-4 h-4" />
                          Reply ({annotation.replies.length})
                        </button>
                      )}
                    </motion.div>
))}
                </AnimatePresence>
              )}

              {/* New Annotation Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-t border-secondary-100 dark:border-secondary-800"
              >
                <form onSubmit={handleCreateAnnotation} className="flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={newAnnotation}
                    onChange={e => setNewAnnotation(e.target.value)}
                    placeholder="Add an annotation..."
                    className="flex-1 px-3 py-2 text-sm border border-secondary-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                    rows={2}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newAnnotation.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <SendIcon className="w-4 h-4" />
                    Add
                  </button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}