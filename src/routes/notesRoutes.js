const express = require('express');
const router = express.Router();
const NotesController = require('../controllers/notesController');
const { validateNote } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');

// All notes routes now require JWT authentication
router.get('/', requireAuth, NotesController.getAllNotes);
router.post('/', requireAuth, validateNote, NotesController.createNote);
router.put('/:id', requireAuth, validateNote, NotesController.updateNote);
router.delete('/:id', requireAuth, NotesController.deleteNote);

module.exports = router;
