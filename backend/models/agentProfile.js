import mongoose from 'mongoose';

const agentProfileSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    email: { type: String, required: true },
    jobPosting: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const AgentProfile = mongoose.model('AgentProfile', agentProfileSchema);

export default AgentProfile; // Exporting using ES Module syntax
