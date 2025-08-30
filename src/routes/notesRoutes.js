const express = require('express');
const router = express.Router();
const NotesController = require('../controllers/notesController');
const { requireAuth } = require('../middleware/auth');
const { validateNote } = require('../middleware/validation');

// Notes routes (all require authentication)
router.use(requireAuth);

router.get('/', NotesController.getAllNotes);
router.post('/', validateNote, NotesController.createNote);
router.put('/:id', validateNote, NotesController.updateNote);
router.delete('/:id', NotesController.deleteNote);

module.exports = router;
