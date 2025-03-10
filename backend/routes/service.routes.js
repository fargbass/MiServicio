// backend/routes/service.routes.js
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const ServiceItem = require('../models/ServiceItem');
const { protect, authorize } = require('../middleware/auth');

// Aplicar middleware de protección a todas las rutas
router.use(protect);

// @desc    Obtener todos los servicios
// @route   GET /api/services
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Filtrar por organización del usuario
    const services = await Service.find({ organization: req.user.organization })
      .sort({ date: -1 })
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Obtener un servicio específico
// @route   GET /api/services/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({
        path: 'items',
        populate: {
          path: 'positions.person',
          model: 'Person',
          select: 'firstName lastName email'
        }
      })
      .populate('createdBy', 'name');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    // Verificar que el servicio pertenece a la organización del usuario
    if (service.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para acceder a este servicio' });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Crear un nuevo servicio
// @route   POST /api/services
// @access  Private
router.post('/', async (req, res) => {
  try {
    // Agregar el usuario y la organización
    req.body.createdBy = req.user.id;
    req.body.organization = req.user.organization;

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
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

// @desc    Actualizar un servicio
// @route   PUT /api/services/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    // Verificar que el servicio pertenece a la organización del usuario
    if (service.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para actualizar este servicio' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
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

// @desc    Eliminar un servicio
// @route   DELETE /api/services/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    // Verificar que el servicio pertenece a la organización del usuario
    if (service.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este servicio' });
    }

    // Eliminar también los elementos del servicio
    await ServiceItem.deleteMany({ service: req.params.id });
    
    await service.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// @desc    Añadir un elemento al servicio
// @route   POST /api/services/:id/items
// @access  Private
router.post('/:id/items', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    // Verificar que el servicio pertenece a la organización del usuario
    if (service.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para modificar este servicio' });
    }

    // Añadir referencia al servicio y al usuario
    req.body.service = req.params.id;
    req.body.createdBy = req.user.id;

    const serviceItem = await ServiceItem.create(req.body);

    // Añadir el elemento a la lista de elementos del servicio
    service.items.push(serviceItem._id);
    await service.save();

    res.status(201).json({
      success: true,
      data: serviceItem
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

module.exports = router;
