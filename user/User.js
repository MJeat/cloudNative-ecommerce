module.exports = function createUserModel(mongoose) {
    if (mongoose.models.User) {
        return mongoose.models.User;
    }

    const userSchema = new mongoose.Schema(
        {
            name: {
                type: String,
                required: true,
                trim: true
            },
            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
                unique: true
            },
            passwordHash: {
                type: String,
                required: true,
                select: false
            },
            role: {
                type: String,
                enum: ['admin', 'user', 'student'],
                default: 'user'
            },
            phone: {
                type: String,
                trim: true
            }
        },
        {
            timestamps: true,
            versionKey: false
        }
    );

    return mongoose.model('User', userSchema);
};