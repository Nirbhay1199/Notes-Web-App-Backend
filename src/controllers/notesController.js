const { validationResult } = require('express-validator');
const { Note } = require('../config/database');

class NotesController {
  static async getAllNotes(req, res) {
    try {
      const userNotes = await Note.find({ userId: req.session.userId })
        .sort({ updatedAt: -1 })
        .lean();

      res.json({ notes: userNotes });
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

      const newNote = new Note({
        title,
        content,
        userId: req.session.userId
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

      const note = await Note.findById(id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      if (note.userId.toString() !== req.session.userId.toString()) {
        return res.status(403).json({ error: 'Access denied' });
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

      const note = await Note.findById(id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      if (note.userId.toString() !== req.session.userId.toString()) {
        return res.status(403).json({ error: 'Access denied' });
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
