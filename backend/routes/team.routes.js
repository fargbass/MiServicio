// backend/routes/team.routes.js
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Position = require('../models/Position');
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
      .populate('members.person', 'firstName lastName email')
      .populate('positions', 'name');

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (err) {
    console.error('Error al obtener equipos:', err);
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
    console.error('Error al obtener equipo:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Crear un nuevo equipo
// @route   POST /api/teams
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, description, positions } = req.body;
    
    // Verificar datos requeridos
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'El nombre del equipo es obligatorio' 
      });
    }

    // 1. Crear las posiciones primero si existen
    const positionIds = [];
    if (positions && positions.length > 0) {
      console.log('Creando posiciones:', positions);
      
      for (const pos of positions) {
        // Asegurarse de que pos es un objeto y tiene propiedad name
        const posName = typeof pos === 'object' ? pos.name : pos;
        
        if (posName) {
          const position = await Position.create({
            name: posName,
            organization: req.user.organization,
            createdBy: req.user.id
          });
          positionIds.push(position._id);
        }
      }
    }
    
    // 2. Crear el equipo con los IDs de posiciones
    const team = await Team.create({
      name,
      description,
      positions: positionIds,
      organization: req.user.organization,
      createdBy: req.user.id,
      members: [] // Iniciar con array vacío de miembros
    });
    
    // 3. Actualizar las posiciones para referenciar al equipo creado
    if (positionIds.length > 0) {
      await Position.updateMany(
        { _id: { $in: positionIds } },
        { team: team._id }
      );
      
      console.log(`${positionIds.length} posiciones actualizadas con referencia al equipo`);
    }
    
    // 4. Obtener el equipo creado con las referencias populadas
    const populatedTeam = await Team.findById(team._id)
      .populate('positions', 'name');

    res.status(201).json({
      success: true,
      data: populatedTeam
    });
  } catch (err) {
    console.error('Error al crear equipo:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Error del servidor: ' + err.message });
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
    console.error('Error al actualizar el equipo:', err);
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

    // Eliminar también referencias a este equipo en posiciones
    await Position.deleteMany({ team: team._id });
    
    await team.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error al eliminar el equipo:', err);
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
    console.error('Error al añadir miembro al equipo:', err);
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
    console.error('Error al eliminar miembro del equipo:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

module.exports = router;