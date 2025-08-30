const express = require('express');
const router = express.Router();
const NotesController = require('../controllers/notesController');
const { validateNote } = require('../middleware/validation');

// All notes routes now use userId parameter instead of session authentication
router.get('/', NotesController.getAllNotes);
router.post('/', validateNote, NotesController.createNote);
router.put('/:id', validateNote, NotesController.updateNote);
router.delete('/:id', NotesController.deleteNote);

module.exports = router;
