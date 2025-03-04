import mongoose from 'mongoose'
const { Schema, model } = mongoose;

const commissionSchema = new Schema({
    garmentType: {
      type: String,
      required: true
    },
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      length: Number,
      inseam: Number,
      shoulders: Number,
    },
    budget: String,
    timeline: String,
    details: String,
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
      },
    user_id: {type: Schema.Types.ObjectId, ref: 'User'}
})


const Commission = mongoose.models.Commission || model('Commission', commissionSchema);
export default Commission;