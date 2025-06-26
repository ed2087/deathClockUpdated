// First, create the SlugGenerator utility (save as utils/slugGenerator.js)
const slugify = require('slugify');

class SlugGenerator {
    /**
     * Generate clean, SEO-friendly slugs for NEW stories
     */
    static generateFromTitle(title) {
        if (!title || typeof title !== 'string') {
            return '';
        }

        // Step 1: Handle apostrophes and contractions BEFORE slugify
        let cleanTitle = title
            // Remove all apostrophe variants to prevent encoding issues
            .replace(/['''`´]/g, '')
            
            // Fix common contractions to readable forms
            .replace(/\bdon't\b/gi, 'dont')
            .replace(/\bcan't\b/gi, 'cant')
            .replace(/\bwon't\b/gi, 'wont')
            .replace(/\bI'm\b/gi, 'im')
            .replace(/\byou're\b/gi, 'youre')
            .replace(/\bit's\b/gi, 'its')
            .replace(/\bthat's\b/gi, 'thats')
            .replace(/\bhe's\b/gi, 'hes')
            .replace(/\bshe's\b/gi, 'shes')
            .replace(/\bwe're\b/gi, 'were')
            .replace(/\bthey're\b/gi, 'theyre')
            .replace(/\bhasn't\b/gi, 'hasnt')
            .replace(/\bhaven't\b/gi, 'havent')
            .replace(/\bisn't\b/gi, 'isnt')
            .replace(/\baren't\b/gi, 'arent')
            .replace(/\bdoesn't\b/gi, 'doesnt')
            .replace(/\bdidn't\b/gi, 'didnt')
            
            // Handle special characters
            .replace(/[&]/g, 'and')
            .replace(/[@]/g, 'at')
            .replace(/[%]/g, 'percent')
            
            // Remove problematic characters
            .replace(/[<>{}[\]()"""]/g, '')
            .trim();

        // Step 2: Use slugify with strict settings
        const slug = slugify(cleanTitle, {
            lower: true,
            strict: true,
            locale: 'en',
            trim: true
        });

        // Step 3: Final cleanup
        return slug
            .replace(/-+/g, '-')         // Replace multiple hyphens
            .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
            .substring(0, 100);          // Limit length
    }

    /**
     * Ensure slug is unique in database
     */
    static async ensureUnique(baseSlug, StoryModel, excludeId = null) {
        if (!baseSlug) {
            baseSlug = 'untitled-story';
        }

        let finalSlug = baseSlug;
        let counter = 1;
        
        while (counter <= 1000) { // Safety valve
            const query = { slug: finalSlug };
            if (excludeId) {
                query._id = { $ne: excludeId };
            }
            
            const existing = await StoryModel.findOne(query);
            
            if (!existing) {
                return finalSlug;
            }
            
            counter++;
            finalSlug = `${baseSlug}-${counter}`;
        }
        
        // Last resort: add timestamp
        return `${baseSlug}-${Date.now()}`;
    }

    /**
     * Generate complete unique slug from title
     */
    static async generateUniqueSlug(title, StoryModel, excludeId = null) {
        const baseSlug = this.generateFromTitle(title);
        return await this.ensureUnique(baseSlug, StoryModel, excludeId);
    }
}

module.exports = SlugGenerator;