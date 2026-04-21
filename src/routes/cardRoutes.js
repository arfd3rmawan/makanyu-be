const express = require('express');
const cardController = require('../controllers/cardController');

const router = express.Router();

router.get('/', cardController.getAllCards);
router.get('/:id', cardController.getCardById);
router.post('/', cardController.createCard);
router.post('/from-atlassian', cardController.createCardFromAtlassianUrl);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

module.exports = router;
