import Card from '../../src/models/Card';

describe('Card Model', () => {
  describe('constructor', () => {
    it('should create a card with all provided properties', () => {
      const cardData = {
        id: 'TEST-123',
        title: 'Test Card',
        description: 'Test description',
        status: 'IN_PROGRESS',
        priority: 'High',
        assignee: 'John Doe',
        url: 'https://example.atlassian.net/browse/TEST-123',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      };

      const card = new Card(cardData);

      expect(card.id).toBe('TEST-123');
      expect(card.title).toBe('Test Card');
      expect(card.description).toBe('Test description');
      expect(card.status).toBe('IN_PROGRESS');
      expect(card.priority).toBe('High');
      expect(card.assignee).toBe('John Doe');
      expect(card.url).toBe('https://example.atlassian.net/browse/TEST-123');
      expect(card.createdAt).toBe('2023-01-01T00:00:00.000Z');
      expect(card.updatedAt).toBe('2023-01-02T00:00:00.000Z');
    });

    it('should set default values for optional properties', () => {
      const cardData = {
        id: 'TEST-123',
        title: 'Test Card'
      };

      const card = new Card(cardData);

      expect(card.status).toBe('TODO');
      expect(card.priority).toBe('Medium');
      expect(card.createdAt).toBeDefined();
      expect(card.updatedAt).toBeDefined();
      expect(new Date(card.createdAt).getTime()).not.toBeNaN();
      expect(new Date(card.updatedAt).getTime()).not.toBeNaN();
    });
  });

  describe('fromAtlassianUrl', () => {
    it('should create card from valid Atlassian URL - AIAGENT format', () => {
      const url = 'https://arif-dermawan.atlassian.net/browse/AIAGENT-1';
      
      const card = Card.fromAtlassianUrl(url);
      
      expect(card.id).toBe('AIAGENT-1');
      expect(card.title).toBe('Card AIAGENT-1');
      expect(card.description).toBe('Card details will be fetched from Atlassian');
      expect(card.status).toBe('TODO');
      expect(card.priority).toBe('Medium');
      expect(card.url).toBe(url);
      expect(card.createdAt).toBeDefined();
      expect(card.updatedAt).toBeDefined();
    });

    it('should create card from valid Atlassian URL - different project format', () => {
      const url = 'https://arif-dermawan.atlassian.net/browse/PROJ-123';
      
      const card = Card.fromAtlassianUrl(url);
      
      expect(card.id).toBe('PROJ-123');
      expect(card.title).toBe('Card PROJ-123');
      expect(card.url).toBe(url);
    });

    it('should create card from URL with multiple dashes in project key', () => {
      const url = 'https://arif-dermawan.atlassian.net/browse/AI-AGENT-456';
      
      const card = Card.fromAtlassianUrl(url);
      
      expect(card.id).toBe('AI-AGENT-456');
      expect(card.title).toBe('Card AI-AGENT-456');
    });

    it('should throw error for invalid URL format - missing browse', () => {
      const url = 'https://arif-dermawan.atlassian.net/AIAGENT-1';
      
      expect(() => Card.fromAtlassianUrl(url)).toThrow('Invalid Atlassian URL format');
    });

    it('should throw error for invalid URL format - wrong domain', () => {
      const url = 'https://example.com/browse/AIAGENT-1';
      
      expect(() => Card.fromAtlassianUrl(url)).toThrow('Invalid Atlassian URL format');
    });

    it('should throw error for invalid URL format - no card ID', () => {
      const url = 'https://arif-dermawan.atlassian.net/browse/';
      
      expect(() => Card.fromAtlassianUrl(url)).toThrow('Invalid Atlassian URL format');
    });

    it('should throw error for invalid card ID format - lowercase', () => {
      const url = 'https://arif-dermawan.atlassian.net/browse/aiagent-1';
      
      expect(() => Card.fromAtlassianUrl(url)).toThrow('Invalid Atlassian URL format');
    });

    it('should throw error for invalid card ID format - no number', () => {
      const url = 'https://arif-dermawan.atlassian.net/browse/AIAGENT';
      
      expect(() => Card.fromAtlassianUrl(url)).toThrow('Invalid Atlassian URL format');
    });

    it('should throw error for completely malformed URL', () => {
      const url = 'not-a-url';
      
      expect(() => Card.fromAtlassianUrl(url)).toThrow('Invalid Atlassian URL format');
    });
  });

  describe('updateFromAtlassianData', () => {
    let card: Card;

    beforeEach(() => {
      card = new Card({
        id: 'AIAGENT-1',
        title: 'Original Title',
        description: 'Original Description',
        status: 'TODO',
        priority: 'Medium'
      });
    });

    it('should update all fields from Atlassian data', () => {
      const atlassianData = {
        fields: {
          summary: 'Updated Card Title',
          description: 'Updated card description from Atlassian',
          status: { name: 'IN_PROGRESS' },
          priority: { name: 'High' },
          assignee: { displayName: 'Jane Doe' }
        }
      };

      const originalUpdatedAt = card.updatedAt;
      
      card.updateFromAtlassianData(atlassianData);

      expect(card.title).toBe('Updated Card Title');
      expect(card.description).toBe('Updated card description from Atlassian');
      expect(card.status).toBe('IN_PROGRESS');
      expect(card.priority).toBe('High');
      expect(card.assignee).toBe('Jane Doe');
      expect(card.updatedAt).not.toBe(originalUpdatedAt);
      expect(new Date(card.updatedAt).getTime()).not.toBeNaN();
    });

    it('should handle missing fields gracefully', () => {
      const atlassianData = {
        fields: {
          summary: 'Updated Title'
        }
      };

      card.updateFromAtlassianData(atlassianData);

      expect(card.title).toBe('Updated Title');
      expect(card.description).toBe('Original Description');
      expect(card.status).toBe('TODO');
      expect(card.priority).toBe('Medium');
      expect(card.assignee).toBeUndefined();
    });

    it('should handle null values in Atlassian data', () => {
      const atlassianData = {
        fields: {
          summary: 'Updated Title',
          description: null,
          status: null,
          priority: null,
          assignee: null
        }
      };

      card.updateFromAtlassianData(atlassianData);

      expect(card.title).toBe('Updated Title');
      expect(card.description).toBe('Original Description');
      expect(card.status).toBe('TODO');
      expect(card.priority).toBe('Medium');
      expect(card.assignee).toBeUndefined();
    });

    it('should handle empty Atlassian data', () => {
      const atlassianData = {
        fields: {}
      };

      card.updateFromAtlassianData(atlassianData);

      expect(card.title).toBe('Original Title');
      expect(card.description).toBe('Original Description');
      expect(card.status).toBe('TODO');
      expect(card.priority).toBe('Medium');
    });

    it('should handle nested object values with missing properties', () => {
      const atlassianData = {
        fields: {
          summary: 'Updated Title',
          status: {},
          priority: {},
          assignee: {}
        }
      };

      card.updateFromAtlassianData(atlassianData);

      expect(card.title).toBe('Updated Title');
      expect(card.status).toBe('TODO');
      expect(card.priority).toBe('Medium');
      expect(card.assignee).toBeUndefined();
    });

    it('should update timestamp when called', (done) => {
      const originalUpdatedAt = card.updatedAt;
      
      // Wait a small amount to ensure timestamp difference
      setTimeout(() => {
        card.updateFromAtlassianData({
          fields: {
            summary: 'New Title'
          }
        });

        expect(card.updatedAt).not.toBe(originalUpdatedAt);
        expect(new Date(card.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
        done();
      }, 10);
    });
  });

  describe('Card creation for AIAGENT-1 specific case', () => {
    it('should successfully create card from the specific AIAGENT-1 URL', () => {
      const specificUrl = 'https://arif-dermawan.atlassian.net/browse/AIAGENT-1';
      
      const card = Card.fromAtlassianUrl(specificUrl);
      
      expect(card.id).toBe('AIAGENT-1');
      expect(card.title).toBe('Card AIAGENT-1');
      expect(card.description).toBe('Card details will be fetched from Atlassian');
      expect(card.status).toBe('TODO');
      expect(card.priority).toBe('Medium');
      expect(card.url).toBe(specificUrl);
      expect(card.createdAt).toBeDefined();
      expect(card.updatedAt).toBeDefined();
    });

    it('should have proper title structure replacing URL reference', () => {
      const url = 'https://arif-dermawan.atlassian.net/browse/AIAGENT-1';
      const card = Card.fromAtlassianUrl(url);
      
      // Card should have proper title that replaces the URL reference
      expect(card.title).toMatch(/^Card AIAGENT-1$/);
      expect(card.title).not.toContain('http');
      expect(card.title).not.toContain('browse');
      expect(card.title).not.toContain('atlassian.net');
    });

    it('should establish basic card structure in system', () => {
      const url = 'https://arif-dermawan.atlassian.net/browse/AIAGENT-1';
      const card = Card.fromAtlassianUrl(url);
      
      // Verify all basic card structure elements are present
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('title');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('status');
      expect(card).toHaveProperty('priority');
      expect(card).toHaveProperty('url');
      expect(card).toHaveProperty('createdAt');
      expect(card).toHaveProperty('updatedAt');
      
      // Verify proper initial values
      expect(card.id).toBe('AIAGENT-1');
      expect(card.url).toBe(url);
      expect(card.status).toBe('TODO');
      expect(card.priority).toBe('Medium');
    });
  });
});