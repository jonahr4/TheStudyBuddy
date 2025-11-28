import mongoose from "mongoose";

const versionUpdateSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: [{
    type: String,
  }],
  releaseDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

const VersionUpdateModel = mongoose.model("VersionUpdate", versionUpdateSchema);

export default VersionUpdateModel;
