// backend/routes/team.routes.js
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Person = require('../models/Person');
const { protect, authorize } = require('../middleware/auth');

// Aplicar middleware de protección a todas las rutas
router.use(protect);

// @desc    Obtener todos los equipos
// @route   GET /api/teams
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Filtrar por organización del usuario
    const teams = await Team.find({ organization: req.user.organization })
      .sort({ name: 1 })
      .populate('members.person', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Obtener un equipo específico
// @route   GET /api/teams/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.person', 'firstName lastName email')
      .populate('positions', 'name');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    // Verificar que el equipo pertenece a la organización del usuario
    if (team.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para acceder a este equipo' });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Crear un nuevo equipo
// @route   POST /api/teams
// @access  Private
router.post('/', async (req, res) => {
  try {
    // Agregar el usuario y la organización
    req.body.createdBy = req.user.id;
    req.body.organization = req.user.organization;

    const team = await Team.create(req.body);

    res.status(201).json({
      success: true,
      data: team
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

// @desc    Actualizar un equipo
// @route   PUT /api/teams/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    // Verificar que el equipo pertenece a la organización del usuario
    if (team.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para actualizar este equipo' });
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: team
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

// @desc    Eliminar un equipo
// @route   DELETE /api/teams/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    // Verificar que el equipo pertenece a la organización del usuario
    if (team.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este equipo' });
    }

    await team.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Añadir una persona al equipo
// @route   POST /api/teams/:id/members
// @access  Private
router.post('/:id/members', async (req, res) => {
  try {
    const { personId, role } = req.body;

    if (!personId) {
      return res.status(400).json({ success: false, message: 'Por favor proporciona el ID de la persona' });
    }

    // Verificar que la persona existe
    const person = await Person.findById(personId);
    if (!person) {
      return res.status(404).json({ success: false, message: 'Persona no encontrada' });
    }

    // Verificar que pertenece a la misma organización
    if (person.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para añadir esta persona' });
    }

    // Obtener el equipo
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    // Verificar que el equipo pertenece a la organización del usuario
    if (team.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para modificar este equipo' });
    }

    // Verificar si la persona ya está en el equipo
    const memberExists = team.members.some(member => 
      member.person.toString() === personId
    );

    if (memberExists) {
      return res.status(400).json({ success: false, message: 'La persona ya es miembro de este equipo' });
    }

    // Añadir a la persona al equipo
    team.members.push({
      person: personId,
      role: role || 'member',
      status: 'active'
    });

    await team.save();

    // Actualizar la persona para incluir el equipo
    if (!person.teams.includes(team._id)) {
      person.teams.push(team._id);
      await person.save();
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Eliminar una persona del equipo
// @route   DELETE /api/teams/:id/members/:personId
// @access  Private
router.delete('/:id/members/:personId', async (req, res) => {
  try {
    // Obtener el equipo
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    // Verificar que el equipo pertenece a la organización del usuario
    if (team.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para modificar este equipo' });
    }

    // Eliminar a la persona del equipo
    team.members = team.members.filter(member => 
      member.person.toString() !== req.params.personId
    );

    await team.save();

    // Actualizar la persona para eliminar el equipo
    const person = await Person.findById(req.params.personId);
    if (person) {
      person.teams = person.teams.filter(teamId => 
        teamId.toString() !== req.params.id
      );
      await person.save();
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

module.exports = router;
