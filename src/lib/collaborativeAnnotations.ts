/**
 * Collaborative Annotations with Yjs + WebRTC
 * Peer-to-peer real-time annotations on species pages
 * No server required - uses WebRTC for direct browser-to-browser sync
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export interface Annotation {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  position: { x: number; y: number }; // Relative to container
  targetElement?: string; // CSS selector of annotated element
  timestamp: number;
  resolved: boolean;
  replies: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: number;
}

const ANNOTATION_ROOM_PREFIX = 'oan-annotations-';
const USER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e',
];

function generateUserId(): string {
  if (typeof window === 'undefined') return 'user-0';
  let id = localStorage.getItem('oan-user-id');
  if (!id) {
    id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('oan-user-id', id);
  }
  return id;
}

function generateUserName(userId: string): string {
  const adjectives = ['Swift', 'Silent', 'Keen', 'Wild', 'Sharp', 'Bright', 'Deep', 'Calm'];
  const nouns = ['Eagle', 'Wolf', 'Fox', 'Bear', 'Hawk', 'Lynx', 'Otter', 'Deer'];
  const hash = userId.split('-').reduce((a, b) => a + b.length, 0);
  return `${adjectives[hash % adjectives.length]} ${nouns[hash % nouns.length]}`;
}

function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return USER_COLORS[hash % USER_COLORS.length];
}

export interface UseCollaborativeAnnotationsOptions {
  roomId: string; // e.g., species ID
  enabled?: boolean;
  signalingServer?: string[]; // Custom STUN/TURN servers
}

export function useCollaborativeAnnotations(options: UseCollaborativeAnnotationsOptions) {
  const { roomId, enabled = true, signalingServer } = options;

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<Map<string, { name: string; color: string }>>(new Map());
  const [synced, setSynced] = useState(false);

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const annotationsMapRef = useRef<Y.Map<any> | null>(null);
  const usersMapRef = useRef<Y.Map<any> | null>(null);
  const awarenessRef = useRef<any>(null);
  const userIdRef = useRef<string>('');
  const userNameRef = useRef<string>('');
  const userColorRef = useRef<string>('');

  // Initialize Yjs doc and WebRTC provider
  useEffect(() => {
    if (!enabled) return;

    const userId = generateUserId();
    const userName = generateUserName(userId);
    const userColor = getUserColor(userId);

    userIdRef.current = userId;
    userNameRef.current = userName;
    userColorRef.current = userColor;

    // Create Yjs doc
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Shared map for annotations
    const annotationsMap = ydoc.getMap('annotations');
    annotationsMapRef.current = annotationsMap;

    // Shared map for user presence
    const usersMap = ydoc.getMap('users');
    usersMapRef.current = usersMap;

    // Set up WebRTC provider
    const roomName = `${ANNOTATION_ROOM_PREFIX}${roomId}`;
    const provider = new WebrtcProvider(roomName, ydoc, {
      signaling: signalingServer ?? ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling.herokuapp.com'],
      maxConns: 20,
      password: roomId, // Simple room isolation
    });
    providerRef.current = provider;

    // Awareness for cursor/presence
    const awareness = provider.awareness;
    awarenessRef.current = awareness;

    awareness.setLocalStateField('user', {
      id: userId,
      name: userName,
      color: userColor,
    });

    // Sync annotations from Yjs to React state
    const syncAnnotations = () => {
      const annots: Annotation[] = [];
      annotationsMap.forEach((value: any, key) => {
        annots.push({ ...value, id: key });
      });
      setAnnotations(annots.sort((a, b) => a.timestamp - b.timestamp));
    };

    const syncUsers = () => {
      const users = new Map<string, { name: string; color: string }>();
      usersMap.forEach((value: any, key) => {
        users.set(key, value);
      });
      // Add awareness users
      awareness.getStates().forEach((state, clientId) => {
        if (state.user && clientId !== awareness.clientID) {
          users.set(state.user.id, { name: state.user.name, color: state.user.color });
        }
      });
      // Add self
      users.set(userId, { name: userName, color: userColor });
      setUsers(users);
    };

    // Observe changes
    annotationsMap.observe(syncAnnotations);
    usersMap.observe(syncUsers);
    awareness.on('change', syncUsers);

    // Initial sync
    syncAnnotations();
    syncUsers();

    // Connection status
    provider.on('status', (event: any) => {
      setConnected(event.connected);
      setSynced(event.synced);
    });

    // Register our user
    usersMap.set(userId, { name: userName, color: userColor });

    // Cleanup
    return () => {
      annotationsMap.unobserve(syncAnnotations);
      usersMap.unobserve(syncUsers);
      awareness.off('change', syncUsers);
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomId, enabled, signalingServer]);

  // Create a new annotation
  const createAnnotation = useCallback((
    content: string,
    position: { x: number; y: number },
    targetElement?: string
  ) => {
    if (!annotationsMapRef.current || !ydocRef.current) return;

    const id = `annot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const annotation: Annotation = {
      id,
      userId: userIdRef.current,
      userName: userNameRef.current,
      userColor: userColorRef.current,
      content,
      position,
      targetElement,
      timestamp: Date.now(),
      resolved: false,
      replies: [],
    };

    ydocRef.current.transact(() => {
      annotationsMapRef.current!.set(id, annotation);
    });
  }, []);

  // Update annotation content
  const updateAnnotation = useCallback((id: string, content: string) => {
    if (!annotationsMapRef.current) return;

    const existing = annotationsMapRef.current.get(id);
    if (existing) {
      annotationsMapRef.current.set(id, { ...existing, content, timestamp: Date.now() });
    }
  }, []);

  // Delete annotation
  const deleteAnnotation = useCallback((id: string) => {
    if (!annotationsMapRef.current) return;
    annotationsMapRef.current.delete(id);
  }, []);

  // Resolve/unresolve annotation
  const toggleResolved = useCallback((id: string) => {
    if (!annotationsMapRef.current) return;
    const existing = annotationsMapRef.current.get(id);
    if (existing) {
      annotationsMapRef.current.set(id, { ...existing, resolved: !existing.resolved });
    }
  }, []);

  // Add reply to annotation
  const addReply = useCallback((annotationId: string, content: string) => {
    if (!annotationsMapRef.current) return;

    const existing = annotationsMapRef.current.get(annotationId);
    if (existing) {
      const reply: AnnotationReply = {
        id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        userId: userIdRef.current,
        userName: userNameRef.current,
        userColor: userColorRef.current,
        content,
        timestamp: Date.now(),
      };
      const updated = {
        ...existing,
        replies: [...existing.replies, reply],
        timestamp: Date.now(),
      };
      annotationsMapRef.current.set(annotationId, updated);
    }
  }, []);

  // Update local cursor position (for awareness)
  const updateCursor = useCallback((x: number, y: number, targetElement?: string) => {
    if (!awarenessRef.current) return;
    awarenessRef.current.setLocalStateField('cursor', { x, y, targetElement, timestamp: Date.now() });
  }, []);

  // Get all users (including connected peers)
  const getUsers = useCallback(() => {
    return Array.from(users.values());
  }, [users]);

  return {
    annotations,
    connected,
    synced,
    users: getUsers(),
    currentUser: {
      id: userIdRef.current,
      name: userNameRef.current,
      color: userColorRef.current,
    },
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    toggleResolved,
    addReply,
    updateCursor,
  };
}

/**
 * Hook for a simple annotation sidebar on species pages
 */
export function useSpeciesAnnotations(speciesId: string, enabled = true) {
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
  } = useCollaborativeAnnotations({ roomId: speciesId, enabled });

  // Filter annotations for this species
  const speciesAnnotations = annotations.filter(a => 
    !a.targetElement || a.targetElement.includes(speciesId)
  );

  return {
    annotations: speciesAnnotations,
    connected,
    synced,
    users,
    currentUser,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    toggleResolved,
    addReply,
  };
}