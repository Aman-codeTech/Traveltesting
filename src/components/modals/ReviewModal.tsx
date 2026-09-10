import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'PLACE' | 'HOTEL' | 'RESTAURANT' | 'TAXI';
  entityId: number;
  entityName: string;
  onReviewSubmitted?: (newAvg: number, newCount: number) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  onReviewSubmitted,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in first to write a review.');
      return;
    }
    if (!comment.trim()) {
      setError('Please share your thoughts in the review.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createReview({
        entity_type: entityType,
        entity_id: entityId,
        rating,
        comment,
      });

      if (res.success) {
        setSuccess(true);
        if (onReviewSubmitted) {
          onReviewSubmitted(res.avgRating, res.reviewCount);
        }
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setComment('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 font-heading">Review {entityName}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900">Thank You!</h4>
              <p className="text-xs text-slate-500">Your review helps millions of fellow Indian travellers.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!user && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex justify-between items-center">
                  <span>Sign in to post a verified review</span>
                  <Link to="/login" className="font-bold underline text-[#1B5E20]">Log In</Link>
                </div>
              )}

              <div className="text-center py-2">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Select Your Rating</label>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-hidden transform hover:scale-110 transition"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1B5E20] mt-1 inline-block">
                  {rating === 5 ? 'Exceptional ⭐️⭐️⭐️⭐️⭐️' : rating === 4 ? 'Very Good ⭐️⭐️⭐️⭐️' : rating === 3 ? 'Average ⭐️⭐️⭐️' : 'Needs Improvement'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Detailed Experience</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about cleanliness, atmosphere, service, entry crowd, or tips for others..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#154a19] text-white text-sm font-bold shadow-md shadow-green-900/20 transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
