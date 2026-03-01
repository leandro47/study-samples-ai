import { AIService } from './services/aiService.js';
import { TranslationService } from './services/translationService.js';
import { View } from './views/view.js';
import { FormController } from './controllers/formController.js';

(async function main() {
    // Initialize services and view
    const aiService = new AIService();
    const translationService = new TranslationService();
    const view = new View();
    
    // Set current year
    view.setYear();

    // Initialize controller and setup event listeners FIRST
    const controller = new FormController(aiService, translationService, view);
    controller.setupEventListeners();

    // Check requirements
    const errors = await aiService.checkRequirements();
    if (errors) {
        view.showErrors(errors);
        // Don't return - allow download buttons to work
    }

    // Initialize translation services
    try {
        await translationService.initialize();
    } catch (error) {
        console.error('Error initializing translation:', error);
        view.showErrors([error.message]);
        // Don't return - allow download button to work
    }

    // Get and initialize AI parameters
    const params = await aiService.getParams();
    view.initializeParameters(params);

    console.log('Application initialized successfully');
})();
