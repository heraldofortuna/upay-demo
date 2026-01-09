/**
 * Esquema de MongoDB para definiciones de pantallas SDUI
 */

import mongoose from 'mongoose';

const ScreenDefinitionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      default: 'screen',
    },
    layout: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    actions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    hooks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    // Metadatos
    version: {
      type: Number,
      default: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// unique: true ya crea un índice automáticamente, no necesitamos otro

export const ScreenDefinition = mongoose.model('ScreenDefinition', ScreenDefinitionSchema);