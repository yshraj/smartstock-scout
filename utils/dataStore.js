const fs = require('fs/promises');
const path = require('path');

class DataStore {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await this.ensureFiles();
    } catch (error) {
      console.error('Error initializing data store:', error);
      throw error;
    }
  }

  async ensureFiles() {
    const files = ['gainers.json', 'losers.json', 'most.json'];
    const defaultData = {
      lastUpdated: new Date().toISOString(),
      data: []
    };

    for (const file of files) {
      const filePath = path.join(this.dataDir, file);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
      }
    }
  }

  async readStockData(type) {
    try {
      const fileName = type === 'most-active' ? 'most.json' : `${type}.json`;
      const filePath = path.join(this.dataDir, fileName);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${type} data:`, error);
      throw error;
    }
  }

  async writeStockData(type, data) {
    try {
      const fileName = type === 'most-active' ? 'most.json' : `${type}.json`;
      const filePath = path.join(this.dataDir, fileName);
      const content = {
        lastUpdated: new Date().toISOString(),
        data
      };
      await fs.writeFile(filePath, JSON.stringify(content, null, 2));
    } catch (error) {
      console.error(`Error writing ${type} data:`, error);
      throw error;
    }
  }
}

module.exports = new DataStore();
