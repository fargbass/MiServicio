// backend/routes/person.routes.js
const express = require('express');
const router = express.Router();
const Person = require('../models/Person');
const { protect, authorize } = require('../middleware/auth');

// Aplicar middleware de protección a todas las rutas
router.use(protect);

// @desc    Obtener todas las personas
// @route   GET /api/people
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Filtrar por organización del usuario
    const people = await Person.find({ organization: req.user.organization })
      .sort({ lastName: 1, firstName: 1 })
      .populate('teams', 'name');

    res.status(200).json({
      success: true,
      count: people.length,
      data: people
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Obtener una persona específica
// @route   GET /api/people/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate('teams', 'name')
      .populate('positions', 'name');

    if (!person) {
      return res.status(404).json({ success: false, message: 'Persona no encontrada' });
    }

    // Verificar que la persona pertenece a la organización del usuario
    if (person.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para acceder a esta persona' });
    }

    res.status(200).json({
      success: true,
      data: person
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Crear una nueva persona
// @route   POST /api/people
// @access  Private
router.post('/', async (req, res) => {
  try {
    // Agregar el usuario y la organización
    req.body.createdBy = req.user.id;
    req.body.organization = req.user.organization;

    const person = await Person.create(req.body);

    res.status(201).json({
      success: true,
      data: person
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Actualizar una persona
// @route   PUT /api/people/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ success: false, message: 'Persona no encontrada' });
    }

    // Verificar que la persona pertenece a la organización del usuario
    if (person.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para actualizar esta persona' });
    }

    person = await Person.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: person
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Eliminar una persona
// @route   DELETE /api/people/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ success: false, message: 'Persona no encontrada' });
    }

    // Verificar que la persona pertenece a la organización del usuario
    if (person.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar esta persona' });
    }

    await person.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

module.exports = router;
