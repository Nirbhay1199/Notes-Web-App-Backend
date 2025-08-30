const { validationResult } = require('express-validator');
const { Note } = require('../config/database');

class NotesController {
  static async getAllNotes(req, res) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId query parameter is required' });
      }

      const userNotes = await Note.find({ userId: userId })
        .sort({ updatedAt: -1 })
        .lean();

      res.json({ 
        notes: userNotes,
        userId: userId,
        count: userNotes.length
      });
    } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createNote(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content } = req.body;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId query parameter is required' });
      }

      const newNote = new Note({
        title,
        content,
        userId: userId
      });

      await newNote.save();

      res.status(201).json({
        message: 'Note created successfully',
        note: newNote.toPublicJSON()
      });
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateNote(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, content } = req.body;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId query parameter is required' });
      }

      const note = await Note.findById(id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      if (note.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Access denied - note does not belong to this user' });
      }

      note.title = title;
      note.content = content;
      note.updatedAt = new Date();

      await note.save();

      res.json({
        message: 'Note updated successfully',
        note: note.toPublicJSON()
      });
    } catch (error) {
      console.error('Update note error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteNote(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId query parameter is required' });
      }

      const note = await Note.findById(id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      if (note.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Access denied - note does not belong to this user' });
      }

      await Note.findByIdAndDelete(id);

      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = NotesController;
