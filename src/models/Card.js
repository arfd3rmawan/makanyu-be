class Card {
  constructor({ id, title, description, status, priority, assignee, url, createdAt, updatedAt }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status || 'TODO';
    this.priority = priority || 'Medium';
    this.assignee = assignee;
    this.url = url;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  static fromAtlassianUrl(url) {
    const domainMatch = /^https:\/\/[\w-]+\.atlassian\.net\//.test(url);
    const match = url.match(/browse\/((?:[A-Z]+-)+\d+)/);
    const cardId = (domainMatch && match) ? match[1] : null;

    if (!cardId) {
      throw new Error('Invalid Atlassian URL format');
    }

    return new Card({
      id: cardId,
      title: `Card ${cardId}`,
      description: 'Card details will be fetched from Atlassian',
      status: 'TODO',
      priority: 'Medium',
      url: url
    });
  }

  updateFromAtlassianData(atlassianData) {
    this.title = atlassianData.fields.summary || this.title;
    this.description = atlassianData.fields.description || this.description;
    this.status = atlassianData.fields.status?.name || this.status;
    this.priority = atlassianData.fields.priority?.name || this.priority;
    this.assignee = atlassianData.fields.assignee?.displayName || this.assignee;
    const now = new Date().toISOString();
    this.updatedAt = now > this.updatedAt
      ? now
      : new Date(new Date(this.updatedAt).getTime() + 1).toISOString();
  }
}

module.exports = Card;
