const fs = require('fs').promises;
const path = require('path');

class ConfigManager {
    constructor(configPath = './config.json') {
        this.configPath = path.resolve(__dirname, configPath);
        this.config = null;
    }

    async load() {
        try {
            const data = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(data);
            console.log(this.configPath)
            return this.config;
        } catch (error) {
            console.error('Error loading config:', error);
            // Create default config if doesn't exist
            await this.createDefault();
            return this.config;
        }
    }

    async createDefault() {
        this.config = {
            prefix: "!",
            commandname: "download",
            onlyONEchannel: false,
            channelid: "",
            autoCropVideos: false,
            adminRole: "",
            logChannel: ""
        };
        await this.save();
        return this.config;
    }

    async save() {
        try {
            await fs.writeFile(
                this.configPath, 
                JSON.stringify(this.config, null, 2), 
                'utf8'
            );
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }

    async update(key, value) {
        if (!this.config) await this.load();
        
        // Handle nested keys (e.g., "settings.autoCrop")
        const keys = key.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return await this.save();
    }

    async get(key = null) {
        if (!this.config) await this.load();
        
        if (!key) return this.config;
        
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return value;
    }

    async reset() {
        await this.createDefault();
        return this.config;
    }
}

module.exports = new ConfigManager();