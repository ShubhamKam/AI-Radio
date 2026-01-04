'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lightbulb } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Nudge {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function KnowledgeNudges() {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNudges();
  }, []);

  const fetchNudges = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/nudges`);
      setNudges(response.data.nudges || []);
    } catch (error: any) {
      toast.error('Failed to load knowledge nudges');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading knowledge nudges...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Nudges</h2>
      <div className="space-y-4">
        {nudges.map((nudge) => (
          <div
            key={nudge.id}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Lightbulb className="text-yellow-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{nudge.title}</h3>
                <p className="text-gray-700">{nudge.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(nudge.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {nudges.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Lightbulb size={48} className="mx-auto mb-4 text-gray-400" />
          <p>No knowledge nudges yet. Upload content to generate them!</p>
        </div>
      )}
    </div>
  );
}
