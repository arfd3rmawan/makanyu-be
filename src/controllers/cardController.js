const cardDatabase = require('../database/cardDatabase');
const atlassianService = require('../services/atlassianService');
const Card = require('../models/Card');

class CardController {
  async getAllCards(req, res) {
    try {
      const cards = await cardDatabase.getAllCards();

      res.json({
        success: true,
        data: cards,
        count: cards.length
      });
    } catch (error) {
      console.error('Error fetching cards:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch cards'
      });
    }
  }

  async getCardById(req, res) {
    try {
      const { id } = req.params;
      const card = await cardDatabase.getCardById(id);

      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found',
          message: `Card with ID ${id} does not exist`
        });
      }

      res.json({
        success: true,
        data: card
      });
    } catch (error) {
      console.error('Error fetching card:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch card'
      });
    }
  }

  async createCard(req, res) {
    try {
      const { title, description, status, priority, assignee, url } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Title is required'
        });
      }

      const cardData = {
        id: `CARD-${Date.now()}`,
        title,
        description,
        status,
        priority,
        assignee,
        url
      };

      const card = new Card(cardData);
      const createdCard = await cardDatabase.createCard(card);

      res.status(201).json({
        success: true,
        data: createdCard,
        message: 'Card created successfully'
      });
    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create card'
      });
    }
  }

  async createCardFromAtlassianUrl(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Atlassian URL is required'
        });
      }

      if (!atlassianService.validateAtlassianUrl(url)) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid Atlassian URL format'
        });
      }

      const cardId = url.match(/browse\/([A-Z]+-\d+)/)[1];
      const existingCard = await cardDatabase.getCardById(cardId);

      if (existingCard) {
        return res.status(409).json({
          success: false,
          error: 'Card already exists',
          message: `Card ${cardId} already exists in the system`,
          data: existingCard
        });
      }

      const card = await atlassianService.createCardFromUrl(url);
      const createdCard = await cardDatabase.createCard(card);

      res.status(201).json({
        success: true,
        data: createdCard,
        message: 'Card created successfully from Atlassian URL'
      });
    } catch (error) {
      console.error('Error creating card from Atlassian URL:', error);

      if (error.message.includes('Invalid Atlassian URL')) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create card from Atlassian URL'
      });
    }
  }

  async updateCard(req, res) {
    try {
      const { id } = req.params;
      const { title, description, status, priority, assignee } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Title is required'
        });
      }

      const existingCard = await cardDatabase.getCardById(id);
      if (!existingCard) {
        return res.status(404).json({
          success: false,
          error: 'Card not found',
          message: `Card with ID ${id} does not exist`
        });
      }

      const updatedCard = await cardDatabase.updateCard(id, {
        title,
        description,
        status,
        priority,
        assignee
      });

      res.json({
        success: true,
        data: updatedCard,
        message: 'Card updated successfully'
      });
    } catch (error) {
      console.error('Error updating card:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update card'
      });
    }
  }

  async deleteCard(req, res) {
    try {
      const { id } = req.params;

      const existingCard = await cardDatabase.getCardById(id);
      if (!existingCard) {
        return res.status(404).json({
          success: false,
          error: 'Card not found',
          message: `Card with ID ${id} does not exist`
        });
      }

      await cardDatabase.deleteCard(id);

      res.json({
        success: true,
        message: 'Card deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete card'
      });
    }
  }
}

module.exports = new CardController();
