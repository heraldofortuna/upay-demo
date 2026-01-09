/**
 * Esquema de MongoDB para textos de la app OTA
 */

import mongoose from 'mongoose';

const TextConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    screen: {
      type: String,
      required: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Metadatos
    version: {
      type: Number,
      default: 1,
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

// Índices
TextConfigSchema.index({ screen: 1 });
TextConfigSchema.index({ key: 1 });

export const TextConfig = mongoose.model('TextConfig', TextConfigSchema);
