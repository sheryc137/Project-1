import { useState } from 'react';
import Modal from '../ui/Modal';
import StarRating from './StarRating';
import { submitRating } from '../../services/rating.service';
import toast from 'react-hot-toast';

export default function RatingModal({ open, onClose, orderId, rateeName }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars === 0) { toast.error('Please select a star rating'); return; }
    setLoading(true);
    try {
      await submitRating({ orderId, stars, comment });
      toast.success('Rating submitted! Thanks for your feedback.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Rate your experience`}>
      <p className="text-sm text-gray-500 mb-4">
        How was your delivery{rateeName ? ` with ${rateeName}` : ''}?
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <StarRating value={stars} onChange={setStars} />
        <textarea
          className="input resize-none h-24"
          placeholder="Leave a comment (optional)…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting…' : 'Submit Rating'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Skip</button>
        </div>
      </form>
    </Modal>
  );
}
