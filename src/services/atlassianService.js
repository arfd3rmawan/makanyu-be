const axios = require('axios');
const Card = require('../models/Card');

class AtlassianService {
  constructor() {
    this.baseUrl = 'https://arif-dermawan.atlassian.net/rest/api/3';
    this.auth = {
      username: process.env.ATLASSIAN_USERNAME,
      password: process.env.ATLASSIAN_API_TOKEN
    };
  }

  async fetchCardDetails(cardId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/issue/${cardId}`,
        {
          auth: this.auth,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching card from Atlassian:', error.message);
      throw new Error('Failed to fetch card details from Atlassian');
    }
  }

  async createCardFromUrl(atlassianUrl) {
    try {
      const card = Card.fromAtlassianUrl(atlassianUrl);

      if (this.auth.username && this.auth.password) {
        try {
          const atlassianData = await this.fetchCardDetails(card.id);
          card.updateFromAtlassianData(atlassianData);
        } catch (error) {
          console.warn('Could not fetch Atlassian details, using basic card info:', error.message);
        }
      } else {
        console.warn('Atlassian credentials not configured, using basic card info');
      }

      return card;
    } catch (error) {
      console.error('Error creating card from URL:', error.message);
      throw error;
    }
  }

  validateAtlassianUrl(url) {
    const atlassianUrlPattern = /^https:\/\/[\w-]+\.atlassian\.net\/browse\/[A-Z]+-\d+$/;
    return atlassianUrlPattern.test(url);
  }
}

module.exports = new AtlassianService();
