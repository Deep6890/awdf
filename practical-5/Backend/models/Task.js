const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'] },
    description: { type: String },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

// Pre-save hook that automatically trims whitespace from the title field
taskSchema.pre('save', function(next) {
    if (this.title) {
        this.title = this.title.trim();
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);