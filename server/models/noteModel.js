import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  content: { 
    type: String, 
    default: '' 
  },
  password_hash: { 
    type: String 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  expires_at: { 
    type: Date 
  }
});

// TTL index for auto-expiration
noteSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const Note = mongoose.model('Note', noteSchema);
