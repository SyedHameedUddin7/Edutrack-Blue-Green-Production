const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const systemConfigSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: true,
    unique: true
  },
  configValue: {
    type: String,
    required: true
  },
  isEncrypted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Encrypt sensitive values before saving
systemConfigSchema.pre('save', async function() {
  if (this.isModified('configValue') && this.isEncrypted) {
    this.configValue = await bcrypt.hash(this.configValue, 10);
  }
});

// Method to verify encrypted value
systemConfigSchema.methods.verifyValue = async function(value) {
  if (this.isEncrypted) {
    return await bcrypt.compare(value, this.configValue);
  }
  return this.configValue === value;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);