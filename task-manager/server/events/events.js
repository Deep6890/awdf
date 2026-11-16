const EventEmitter = require('events');

class TaskEvents extends EventEmitter {}

// Singleton event emitter instance for application events
module.exports = new TaskEvents();
