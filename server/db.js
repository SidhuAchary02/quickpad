import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://Zworking:sidhu123@cluster0.muuu2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('✅ DB connected...');
    } catch (error) {
        console.error('❌ DB connection failed:', error.message);
        process.exit(1);
    }
}

export default connectDB;
